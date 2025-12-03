import { NextResponse } from 'next/server'
export async function POST(request) {
  try {
    const { token, action } = await request.json()
if (!token) {
  return NextResponse.json(
    { success: false, error: 'No token provided' },
    { status: 400 }
  )
}

if (!process.env.RECAPTCHA_SECRET_KEY) {
  console.error('RECAPTCHA_SECRET_KEY is not configured')
  return NextResponse.json(
    { success: false, error: 'reCAPTCHA not configured' },
    { status: 500 }
  )
}
    // Verify token with Google
    const verifyUrl = `https://www.google.com/recaptcha/api/siteverify`
    const response = await fetch(verifyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`,
    })
    const data = await response.json()
    // Check if verification was successful
    if (!data.success) {
      return NextResponse.json(
        { success: false, error: 'reCAPTCHA verification failed' },
        { status: 400 }
      )
    }
    // Check score (0.0 - 1.0, higher is more likely human)
    if (data.score < 0.5) {
      return NextResponse.json(
        { success: false, error: 'Low reCAPTCHA score', score: data.score },
        { status: 400 }
      )
    }
    // Optionally verify action matches
    if (action && data.action !== action) {
      return NextResponse.json(
        { success: false, error: 'Action mismatch' },
        { status: 400 }
      )
    }
    return NextResponse.json({
      success: true,
      score: data.score,
      action: data.action,
    })
  } catch (error) {
    console.error('reCAPTCHA verification error:', error)
    return NextResponse.json(
      { success: false, error: 'Verification failed' },
      { status: 500 }
    )
  }
}