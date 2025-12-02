'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Mail, ArrowLeft, ArrowRight, RefreshCw, Inbox, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Input from '@/components/ui/Input'
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
      toast.success('Password reset link sent!')
    } catch (error) {
      console.error('Error sending reset email:', error)
      toast.error(error.message || 'Failed to send reset email')
    } finally {
      setLoading(false)
    }
  }

  // Success state - email sent
  if (emailSent) {
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
                We sent a reset link to
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
                  <p className="text-slate-400 text-sm">You'll be redirected to set a new password</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Link
                href="/auth/login"
                className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/30 transition-all duration-300"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Login
              </Link>

              <button
                onClick={() => setEmailSent(false)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-100/80 hover:border-slate-300 transition-all duration-200 font-medium text-slate-600"
              >
                <RefreshCw className="w-4 h-4" />
                Try a different email
              </button>
            </div>

            {/* Footer note */}
            <p className="text-center text-xs text-slate-300 mt-8">
              Link expires in 1 hour · Check your spam folder
            </p>
          </div>
        </div>
      </>
    )
  }

  // Initial state - enter email
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

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              Forgot your password?
            </h2>
            <p className="text-slate-400">
              No worries, we'll send you reset instructions
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              type="email"
              label="Email address"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              icon={<Mail className="w-5 h-5" />}
            />

            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  Send Reset Link
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Back to login */}
          <Link
            href="/auth/login"
            className="mt-6 w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-100/80 hover:border-slate-300 transition-all duration-200 font-medium text-slate-600"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </Link>

          {/* Footer */}
          <p className="text-center text-xs text-slate-300 mt-10">
            © {new Date().getFullYear()} Impress Cleaning Services
          </p>
        </div>
      </div>
    </>
  )
}