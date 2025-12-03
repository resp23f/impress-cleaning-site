import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/portal/dashboard'

  // Validate redirect URL - must be relative path
  const isValidRedirect = (url) => {
    if (!url.startsWith('/') || url.startsWith('//')) return false
    if (url.includes('://')) return false
    return true
  }

  const safeRedirect = isValidRedirect(next) ? next : '/portal/dashboard'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
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
  }

  return NextResponse.redirect(new URL('/auth/login?error=auth_callback_failed', request.url))
}