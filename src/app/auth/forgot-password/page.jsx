'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, ArrowLeft, Inbox, CheckCircle, RefreshCw } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e) => {
    e.preventDefault()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) {
        if (error.message.includes('rate limit')) {
          throw new Error('Too many requests. Please wait a moment before trying again.')
        } else {
          throw error
        }
      }

      setEmailSent(true)
      toast.success('Password reset link sent! Check your email.')
    } catch (error) {
      console.error('Error sending reset email:', error)
      const errorMessage = error.message || 'Failed to send reset email. Please try again.'
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // Success state - email sent
  if (emailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
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
                We sent a reset link to
              </p>
              <p className="text-white font-semibold text-center mt-1 break-all">
                {email}
              </p>
            </div>

            {/* Body */}
            <div className="px-8 py-6">
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
                    <p className="text-gray-500 text-sm">You'll be redirected to reset your password</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-purple-600 font-bold">3</span>
                  </div>
                  <div>
                    <p className="font-semibold text-[#1C294E] text-sm">Set new password</p>
                    <p className="text-gray-500 text-sm">Create a strong, secure password</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => router.push('/auth/login')}
                  className="w-full py-3.5 rounded-2xl bg-[#1C294E] hover:bg-[#2a3a5e] text-white font-semibold transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Login
                </button>

                <button
                  onClick={() => setEmailSent(false)}
                  className="w-full py-3.5 rounded-2xl bg-white border border-gray-200 hover:bg-gray-50 text-[#1C294E] font-semibold transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try a different email
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="px-8 py-4 bg-gray-50/50 border-t border-gray-100">
              <p className="text-xs text-gray-500 text-center">
                Link expires in 1 hour. Didn't receive it? Check your spam folder.
              </p>
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <img src="/logo_impress.png" alt="Impress Cleaning Services" className="h-8 opacity-60" />
          </div>
        </div>
      </div>
    )
  }

  // Initial state - enter email
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] border border-white/60 overflow-hidden">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-[#1C294E] to-slate-700 px-8 py-8">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white text-center">
              Forgot Password?
            </h1>
            <p className="text-slate-300 text-center mt-2 text-sm">
              No worries, we'll send you reset instructions
            </p>
          </div>

          {/* Body */}
          <div className="px-8 py-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1C294E] mb-2">
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-gray-200 focus:border-[#079447] focus:ring-2 focus:ring-[#079447]/20 outline-none transition-all duration-200 text-[#1C294E]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={!email.trim() || loading}
                className={`w-full py-3.5 rounded-2xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                  loading || !email.trim()
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-[#079447] hover:bg-[#068a40] text-white active:scale-[0.98]'
                }`}
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </button>
            </form>

            <div className="mt-6">
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
              Remember your password?{' '}
              <button
                onClick={() => router.push('/auth/login')}
                className="text-[#079447] hover:underline font-medium"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <img src="/logo_impress.png" alt="Impress Cleaning Services" className="h-8 opacity-60" />
        </div>
      </div>
    </div>
  )
}