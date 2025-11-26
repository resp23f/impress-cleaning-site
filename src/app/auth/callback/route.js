import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/auth/login'
  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error && data.user) {
      return NextResponse.redirect(new URL(next, request.url))
    }
  }
  return NextResponse.redirect(new URL('/auth/login?error=auth_callback_failed', request.url))
}
