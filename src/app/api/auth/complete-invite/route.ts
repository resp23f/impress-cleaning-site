import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { createHash } from 'crypto'

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { token, password } = body

    if (!token || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    }

    const tokenHash = hashToken(token)

    // Create admin client
    const adminClient = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // Look up the handoff token
    const { data: handoffToken, error: lookupError } = await adminClient
      .from('auth_handoff_tokens')
      .select('id, user_id, expires_at, used_at')
      .eq('token_hash', tokenHash)
      .single()

    if (lookupError || !handoffToken) {
      console.error('Handoff token lookup error:', lookupError)
      return NextResponse.json({ error: 'Invalid or expired link' }, { status: 401 })
    }

    // Check if already used
    if (handoffToken.used_at) {
      return NextResponse.json({ error: 'This link has already been used' }, { status: 401 })
    }

    // Check if expired
    if (new Date(handoffToken.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Link expired. Please request a new invite.' }, { status: 401 })
    }

    // Get user email for response
    const { data: profile, error: profileError } = await adminClient
      .from('profiles')
      .select('email')
      .eq('id', handoffToken.user_id)
      .single()

    if (profileError || !profile?.email) {
      console.error('Profile lookup error:', profileError)
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Set the user's password via admin API
    const { error: updateError } = await adminClient.auth.admin.updateUserById(
      handoffToken.user_id,
      { password }
    )

    if (updateError) {
      console.error('Password update error:', updateError)
      return NextResponse.json({ error: 'Failed to set password' }, { status: 500 })
    }

    // Mark handoff token as used
    const { error: markUsedError } = await adminClient
      .from('auth_handoff_tokens')
      .update({ used_at: new Date().toISOString() })
      .eq('id', handoffToken.id)

    if (markUsedError) {
      console.error('Mark token used error:', markUsedError)
      // Non-fatal - password was set successfully
    }

    // Return success with email for client-side sign-in
    return NextResponse.json({
      success: true,
      email: profile.email,
    })

  } catch (error) {
    console.error('Complete invite error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
