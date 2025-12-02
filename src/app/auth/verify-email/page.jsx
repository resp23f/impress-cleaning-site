'use client'
import { Suspense } from 'react'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { Mail, CheckCircle, AlertCircle, ArrowLeft, ArrowRight, RefreshCw, Inbox } from 'lucide-react'
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
      <>
        <style>{`html, body { background: #ffffff; }`}</style>
        <div className="min-h-screen flex items-center justify-center bg-white p-6">
          <div className="w-full max-w-md">
            {/* Logo */}
            <div className="flex justify-center mb-10">
              <Image
                src="/ImpressLogoNoBackgroundBlue.png"
                alt="Impress Cleaning Services"
                width={180}
                height={60}
                className="h-12 w-auto"
                priority
              />
            </div>

            {/* Error Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center shadow-lg shadow-red-500/20">
                <AlertCircle className="w-8 h-8 text-white" />
              </div>
            </div>

            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-2">
                Email not found
              </h2>
              <p className="text-slate-400">
                We couldn't find your email address. Please try signing up again.
              </p>
            </div>

            <button
              onClick={() => router.push('/auth/signup')}
              className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/30 transition-all duration-300"
            >
              Back to Sign Up
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Footer */}
            <p className="text-center text-xs text-slate-300 mt-10">
              © {new Date().getFullYear()} Impress Cleaning Services
            </p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <style>{`html, body { background: #ffffff; }`}</style>
      <div className="min-h-screen flex items-center justify-center bg-white p-6">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex justify-center mb-10">
            <Image
              src="/ImpressLogoNoBackgroundBlue.png"
              alt="Impress Cleaning Services"
              width={180}
              height={60}
              className="h-12 w-auto"
              priority
            />
          </div>

          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Mail className="w-8 h-8 text-white" />
            </div>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              Check your email
            </h2>
            <p className="text-slate-400">
              We sent a verification link to
            </p>
            <p className="text-slate-700 font-medium mt-1">
              {email}
            </p>
          </div>

          {/* Steps */}
          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <Inbox className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="font-medium text-slate-700 text-sm">Open your inbox</p>
                <p className="text-slate-400 text-sm">Check for an email from us</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-slate-700 text-sm">Click the link</p>
                <p className="text-slate-400 text-sm">Verify your email address</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50">
              <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                <span className="text-purple-600 font-bold text-sm">3</span>
              </div>
              <div>
                <p className="font-medium text-slate-700 text-sm">Complete setup</p>
                <p className="text-slate-400 text-sm">Finish your service profile</p>
              </div>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={handleResendEmail}
              disabled={countdown > 0 || !email || resending}
              className={`w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl font-semibold transition-all duration-300 ${
                countdown > 0 || resending
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/30'
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
              className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-100/80 hover:border-slate-300 transition-all duration-200 font-medium text-slate-600"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </button>
          </div>

          {/* Footer note */}
          <p className="text-center text-xs text-slate-300 mt-8">
            Link expires in 24 hours · Check your spam folder
          </p>

          {/* Footer */}
          <p className="text-center text-xs text-slate-300 mt-6">
            © {new Date().getFullYear()} Impress Cleaning Services
          </p>
        </div>
      </div>
    </>
  )
}

function VerifyEmailSkeleton() {
  return (
    <>
      <style>{`html, body { background: #ffffff; }`}</style>
      <div className="min-h-screen flex items-center justify-center bg-white p-6">
        <div className="w-full max-w-md">
          {/* Logo skeleton */}
          <div className="flex justify-center mb-10">
            <div className="h-12 w-44 bg-slate-100 rounded-lg animate-pulse" />
          </div>

          {/* Icon skeleton */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 animate-pulse" />
          </div>

          {/* Title skeleton */}
          <div className="text-center mb-8 space-y-2">
            <div className="h-7 w-48 bg-slate-100 rounded-lg mx-auto animate-pulse" />
            <div className="h-4 w-36 bg-slate-50 rounded mx-auto animate-pulse" />
            <div className="h-5 w-52 bg-slate-100 rounded mx-auto animate-pulse" />
          </div>

          {/* Steps skeleton */}
          <div className="space-y-4 mb-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-slate-50">
                <div className="w-10 h-10 rounded-xl bg-slate-200 animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
                  <div className="h-3 w-36 bg-slate-100 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>

          {/* Buttons skeleton */}
          <div className="space-y-3">
            <div className="h-12 rounded-xl bg-slate-200 animate-pulse" />
            <div className="h-12 rounded-xl bg-slate-100 animate-pulse" />
          </div>
        </div>
      </div>
    </>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<VerifyEmailSkeleton />}>
      <VerifyEmailPageContent />
    </Suspense>
  )
}