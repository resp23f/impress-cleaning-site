import { createClient } from '@/lib/supabase/server'

import { NextResponse } from 'next/server'

 

export async function GET(request) {

  const { searchParams } = new URL(request.url)

  const code = searchParams.get('code')

  const next = searchParams.get('next') ?? '/auth/profile-setup'

 

  if (code) {

    const supabase = await createClient()

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

 

    if (!error && data.user) {

      // Check if user has completed profile setup

      const { data: profile } = await supabase

        .from('profiles')

        .select('full_name, phone, account_status, role')

        .eq('id', data.user.id)

        .single()

 

      // If profile is complete and approved, redirect to dashboard

      if (profile?.full_name && profile?.phone) {

        if (profile.account_status === 'active') {

          const redirectUrl = profile.role === 'admin' ? '/admin/dashboard' : '/portal/dashboard'

          return NextResponse.redirect(new URL(redirectUrl, request.url))

        } else if (profile.account_status === 'pending') {

          return NextResponse.redirect(new URL('/auth/pending-approval', request.url))

        }

      }

 

      // Otherwise, redirect to profile setup

      return NextResponse.redirect(new URL('/auth/profile-setup', request.url))

    }

  }

 

  // Return the user to an error page with some instructions

  return NextResponse.redirect(new URL('/auth/login?error=auth_callback_failed', request.url))

}