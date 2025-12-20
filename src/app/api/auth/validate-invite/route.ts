import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { createHash, randomBytes } from 'crypto'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://impressyoucleaning.com'

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

function generateHandoffToken(): string {
  return randomBytes(32).toString('hex')
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

    // Look up the invite token
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

    // Mark invite token as used
    const { error: updateError } = await adminClient
      .from('customer_invite_tokens')
      .update({ used_at: new Date().toISOString() })
      .eq('id', inviteToken.id)

    if (updateError) {
      console.error('Token update error:', updateError)
      // Continue anyway - better UX to let them proceed
    }

    // Generate a handoff token (30 minutes - enough time to fill password form)
    const handoffToken = generateHandoffToken()
    const handoffHash = hashToken(handoffToken)
    const handoffExpiry = new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutes

    // Store handoff token
    const { error: handoffError } = await adminClient
      .from('auth_handoff_tokens')
      .insert({
        user_id: inviteToken.user_id,
        token_hash: handoffHash,
        expires_at: handoffExpiry,
      })

    if (handoffError) {
      console.error('Handoff token storage error:', handoffError)
      return NextResponse.redirect(`${SITE_URL}/auth/login?error=auth_failed`)
    }

    // Redirect to set-password page with handoff token
    return NextResponse.redirect(
      `${SITE_URL}/auth/activate?token=${handoffToken}`
    )

  } catch (error) {
    console.error('Validate invite error:', error)
    return NextResponse.redirect(`${SITE_URL}/auth/login?error=server_error`)
  }
}
