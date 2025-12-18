import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const next = searchParams.get('next') ?? '/portal/dashboard'

  // Validate redirect URL - must be relative path
  const isValidRedirect = (url) => {
    if (!url.startsWith('/') || url.startsWith('//')) return false
    if (url.includes('://')) return false
    return true
  }

  const safeRedirect = isValidRedirect(next) ? next : '/portal/dashboard'

  const supabase = await createClient()
  let data = null
  let error = null

// Handle invite/recovery/magiclink with token_hash
if (token_hash && type) {
  const result = await supabase.auth.verifyOtp({ token_hash, type })
  data = result.data
  error = result.error
  
  // Invites need password setup before proceeding
  if (!error && type === 'invite') {
    return NextResponse.redirect(new URL('/auth/set-password', request.url))
  }
}
  // Handle OAuth/email confirmation with code
  else if (code) {
    const result = await supabase.auth.exchangeCodeForSession(code)
    data = result.data
    error = result.error
  }

  if (!error && data?.user) {
    // Admin-invited users need to set password first - respect the next param
    if (safeRedirect === '/auth/admin-invited-set-password') {
      return NextResponse.redirect(new URL(safeRedirect, request.url))
    }

    // Check if profile is complete
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, full_name, phone')
      .eq('id', data.user.id)
      .single()

    const { data: addresses } = await supabase
      .from('service_addresses')
      .select('id')
      .eq('user_id', data.user.id)
      .limit(1)

    // If profile incomplete, go to profile-setup
    if (!profile?.full_name || !profile?.phone || !addresses?.length) {
      return NextResponse.redirect(new URL('/auth/profile-setup', request.url))
    }

    // Admin goes to admin dashboard
    if (profile?.role === 'admin') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url))
    }

    // Complete profile goes to intended destination
    return NextResponse.redirect(new URL(safeRedirect, request.url))
  }

  return NextResponse.redirect(new URL('/auth/login?error=auth_callback_failed', request.url))
}