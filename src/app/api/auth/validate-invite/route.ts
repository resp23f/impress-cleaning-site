import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { createHash } from 'crypto'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://impressyoucleaning.com'

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.redirect(`${SITE_URL}/auth/login?error=missing_token`)
    }

    // Hash the token to look up in DB
    const tokenHash = hashToken(token)

    // Create admin client
    const adminClient = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // Look up the token
    const { data: inviteToken, error: lookupError } = await adminClient
      .from('customer_invite_tokens')
      .select('id, user_id, expires_at, used_at')
      .eq('token_hash', tokenHash)
      .single()

    if (lookupError || !inviteToken) {
      console.error('Token lookup error:', lookupError)
      return NextResponse.redirect(`${SITE_URL}/auth/login?error=invalid_token`)
    }

    // Check if already used
    if (inviteToken.used_at) {
      return NextResponse.redirect(`${SITE_URL}/auth/login?error=token_already_used`)
    }

    // Check if expired
    if (new Date(inviteToken.expires_at) < new Date()) {
      return NextResponse.redirect(`${SITE_URL}/auth/login?error=token_expired`)
    }

    // Get user email for signing in
    const { data: profile, error: profileError } = await adminClient
      .from('profiles')
      .select('email')
      .eq('id', inviteToken.user_id)
      .single()

    if (profileError || !profile?.email) {
      console.error('Profile lookup error:', profileError)
      return NextResponse.redirect(`${SITE_URL}/auth/login?error=user_not_found`)
    }

    // Mark token as used BEFORE generating the sign-in link
    const { error: updateError } = await adminClient
      .from('customer_invite_tokens')
      .update({ used_at: new Date().toISOString() })
      .eq('id', inviteToken.id)

    if (updateError) {
      console.error('Token update error:', updateError)
      // Continue anyway - better UX to let them in
    }

    // Generate an immediate magic link for sign-in
    // This link is used within milliseconds, so expiration isn't an issue
    const { data: linkData, error: linkError } = await adminClient.auth.admin.generateLink({
      type: 'magiclink',
      email: profile.email,
      options: {
        redirectTo: `${SITE_URL}/auth/callback?next=/auth/admin-invited-set-password`,
      },
    })

    if (linkError || !linkData?.properties?.action_link) {
      console.error('Magic link generation error:', linkError)
      return NextResponse.redirect(`${SITE_URL}/auth/login?error=auth_failed`)
    }

    // Redirect to the magic link immediately
    // Since we're redirecting programmatically, there's no delay
    return NextResponse.redirect(linkData.properties.action_link)

  } catch (error) {
    console.error('Validate invite error:', error)
    return NextResponse.redirect(`${SITE_URL}/auth/login?error=server_error`)
  }
}
