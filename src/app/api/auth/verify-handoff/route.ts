import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { createHash } from 'crypto'

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { token } = body

    if (!token) {
      return NextResponse.json({ error: 'Missing token' }, { status: 400 })
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

    // Check if expired (60 seconds)
    if (new Date(handoffToken.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Link expired. Please request a new invite.' }, { status: 401 })
    }

    // Get user info for the UI
    const { data: profile, error: profileError } = await adminClient
      .from('profiles')
      .select('id, email, full_name, first_name')
      .eq('id', handoffToken.user_id)
      .single()

    if (profileError || !profile) {
      console.error('Profile lookup error:', profileError)
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Return user info (don't mark as used yet - that happens on password set)
    return NextResponse.json({
      success: true,
      user: {
        id: profile.id,
        email: profile.email,
        firstName: profile.first_name || profile.full_name?.split(' ')[0] || '',
      },
    })

  } catch (error) {
    console.error('Verify handoff error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
