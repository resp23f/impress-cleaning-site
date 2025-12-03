import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/auth/login'

  // Validate redirect URL - must be relative path (no protocol/domain)
  const isValidRedirect = (url) => {
    // Must start with / and not start with // (protocol-relative URL)
    if (!url.startsWith('/') || url.startsWith('//')) {
      return false
    }
    // Block any attempt to include a protocol
    if (url.includes('://')) {
      return false
    }
    return true
  }

  const safeRedirect = isValidRedirect(next) ? next : '/auth/login'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      return NextResponse.redirect(new URL(safeRedirect, request.url))
    }
  }

  return NextResponse.redirect(new URL('/auth/login?error=auth_callback_failed', request.url))
}