'use client'
import { Suspense } from 'react'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Mail, CheckCircle, AlertCircle, ArrowLeft, RefreshCw, Inbox } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

function VerifyEmailPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email')
  const [resending, setResending] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [error, setError] = useState('')
  const supabase = createClient()

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  useEffect(() => {
    if (!email) {
      setError('Email address not found. Please sign up again.')
    }
  }, [email])

  const handleResendEmail = async () => {
    if (!email || countdown > 0) return
    setResending(true)
    setError('')

    try {
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/auth/login`,
        },
      })

      if (resendError) {
        if (resendError.message.includes('rate limit')) {
          throw new Error('Too many requests. Please wait a moment before trying again.')
        } else if (resendError.message.includes('already confirmed')) {
          throw new Error('Email already verified! You can log in now.')
        } else {
          throw resendError
        }
      }

      toast.success('Verification email sent! Check your inbox.')
      setCountdown(60)
    } catch (err) {
      console.error('Error resending email:', err)
      const errorMessage = err.message || 'Failed to resend verification email. Please try again.'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setResending(false)
    }
  }

  // Error state - no email
  if (!email) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] border border-white/60 overflow-hidden">
            <div className="bg-gradient-to-r from-red-500 to-rose-500 px-8 py-6">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto">
                <AlertCircle className="w-7 h-7 text-white" />
              </div>
            </div>
            
            <div className="px-8 py-8 text-center">
              <h1 className="text-2xl font-bold text-[#1C294E] mb-2">
                Email Not Found
              </h1>
              <p className="text-gray-500 mb-8">
                We couldn't find your email address. Please try signing up again.
              </p>
              
              <button
                onClick={() => router.push('/auth/signup')}
                className="w-full py-3.5 rounded-2xl bg-[#1C294E] hover:bg-[#2a3a5e] text-white font-semibold transition-all duration-200 active:scale-[0.98]"
              >
                Back to Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Main Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] border border-white/60 overflow-hidden">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-[#079447] to-emerald-500 px-8 py-8">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white text-center">
              Check Your Email
            </h1>
            <p className="text-emerald-100 text-center mt-2 text-sm">
              We sent a verification link to
            </p>
            <p className="text-white font-semibold text-center mt-1 break-all">
              {email}
            </p>
          </div>

          {/* Body */}
          <div className="px-8 py-6">
            
            {/* Steps */}
            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <Inbox className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="font-semibold text-[#1C294E] text-sm">Open your inbox</p>
                  <p className="text-gray-500 text-sm">Check for an email from Impress Cleaning</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-[#1C294E] text-sm">Click the link</p>
                  <p className="text-gray-500 text-sm">Verify your email address</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-purple-600 font-bold">3</span>
                </div>
                <div>
                  <p className="font-semibold text-[#1C294E] text-sm">Complete setup</p>
                  <p className="text-gray-500 text-sm">Finish your service profile</p>
                </div>
              </div>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleResendEmail}
                disabled={countdown > 0 || !email || resending}
                className={`w-full py-3.5 rounded-2xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                  countdown > 0 || resending
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-[#079447] hover:bg-[#068a40] text-white active:scale-[0.98]'
                }`}
              >
                {resending ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Sending...
                  </>
                ) : countdown > 0 ? (
                  `Resend in ${countdown}s`
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    Resend verification email
                  </>
                )}
              </button>

              <button
                onClick={() => router.push('/auth/login')}
                className="w-full py-3.5 rounded-2xl bg-white border border-gray-200 hover:bg-gray-50 text-[#1C294E] font-semibold transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Login
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 py-4 bg-gray-50/50 border-t border-gray-100">
            <p className="text-xs text-gray-500 text-center">
              Didn't receive the email? Check your spam folder or{' '}
              <a href="mailto:notifications@impressyoucleaning.com" className="text-[#079447] hover:underline">
                contact support
              </a>
            </p>
          </div>
        </div>

        {/* Logo below card */}
        <div className="mt-8 flex justify-center">
          <img 
            src="/logo_impress.png" 
            alt="Impress Cleaning Services" 
            className="h-8 opacity-60"
          />
        </div>
      </div>
    </div>
  )
}

function VerifyEmailSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] border border-white/60 overflow-hidden">
          {/* Header skeleton */}
          <div className="bg-gradient-to-r from-gray-200 to-gray-300 px-8 py-8 animate-pulse">
            <div className="w-16 h-16 bg-white/30 rounded-2xl mx-auto mb-4" />
            <div className="h-6 bg-white/30 rounded-lg w-48 mx-auto mb-2" />
            <div className="h-4 bg-white/30 rounded-lg w-32 mx-auto" />
          </div>
          
          {/* Body skeleton */}
          <div className="px-8 py-6 space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-gray-200 animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
                <div className="h-3 bg-gray-100 rounded w-40 animate-pulse" />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-gray-200 animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-20 animate-pulse" />
                <div className="h-3 bg-gray-100 rounded w-36 animate-pulse" />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-gray-200 animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-28 animate-pulse" />
                <div className="h-3 bg-gray-100 rounded w-32 animate-pulse" />
              </div>
            </div>
            
            <div className="pt-4 space-y-3">
              <div className="h-12 bg-gray-200 rounded-2xl animate-pulse" />
              <div className="h-12 bg-gray-100 rounded-2xl animate-pulse" />
            </div>
          </div>
          
          {/* Footer skeleton */}
          <div className="px-8 py-4 bg-gray-50/50 border-t border-gray-100">
            <div className="h-3 bg-gray-200 rounded w-48 mx-auto animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<VerifyEmailSkeleton />}>
      <VerifyEmailPageContent />
    </Suspense>
  )
}