'use client'
import { Suspense } from 'react'
import { useState, useEffect } from 'react' // FIX: Was 'use' in Claude Code version
import { useRouter, useSearchParams } from 'next/navigation'
import { Mail, CheckCircle, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import toast from 'react-hot-toast'

function VerifyEmailPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email')
  const [resending, setResending] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [error, setError] = useState('')
  
  const supabase = createClient()

  // Countdown timer effect
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  // Check if email parameter exists
  useEffect(() => {
    if (!email) {
      setError('Email address not found. Please sign up again.')
    }
  }, [email])

  const handleResendEmail = async () => {
    if (!email || countdown > 0) return

    setResending(true)
    setError('') // Clear any previous errors

    try {
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/auth/login`,
        },
      })

      if (resendError) {
        // Handle specific error cases
        if (resendError.message.includes('rate limit')) {
          throw new Error('Too many requests. Please wait a moment before trying again.')
        } else if (resendError.message.includes('already confirmed')) {
          throw new Error('Email already verified! You can log in now.')
        } else {
          throw resendError
        }
      }

      toast.success('Verification email sent! Check your inbox.')
      setCountdown(60) // 60 second cooldown
    } catch (err) {
      console.error('Error resending email:', err)
      const errorMessage = err.message || 'Failed to resend verification email. Please try again.'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setResending(false)
    }
  }

  // Show error state if no email parameter
  if (!email) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center py-12 px-4">
        <Card className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>

          <h1 className="text-2xl font-bold text-[#1C294E] mb-2">
            Email Not Found
          </h1>

          <p className="text-gray-600 mb-6">
            We couldn't find your email address. Please try signing up again.
          </p>

          <Button
            fullWidth
            onClick={() => router.push('/auth/signup')}
          >
            Back to Sign Up
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center py-12 px-4">
      <Card className="max-w-md w-full text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Mail className="w-8 h-8 text-blue-600" />
        </div>

        <h1 className="text-2xl font-bold text-[#1C294E] mb-2">
          Check Your Email
        </h1>

        <p className="text-gray-600 mb-6">
          We sent a verification link to{' '}
          <span className="font-semibold text-[#1C294E]">{email}</span>
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3 text-left">
            <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">Next Steps:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Open your email inbox</li>
                <li>Click the verification link</li>
                <li>Complete your service profile</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Error Alert - Only show if there's an error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3 text-left">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-800">
                <p className="font-semibold mb-1">Error</p>
                <p>{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <Button
            variant="outline"
            fullWidth
            onClick={handleResendEmail}
            loading={resending}
            disabled={countdown > 0 || !email}
          >
            {countdown > 0 ? `Resend in ${countdown}s` : 'Resend verification email'}
          </Button>

          <Button
            variant="outline"
            fullWidth
            onClick={() => router.push('/auth/login')}
          >
            Back to Login
          </Button>
        </div>

        <p className="text-xs text-gray-500 mt-6">
          Didn't receive the email? Check your spam folder or contact support.
        </p>
      </Card>
    </div>
  )
}
export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyEmailPageContent />
    </Suspense>
  )
}
