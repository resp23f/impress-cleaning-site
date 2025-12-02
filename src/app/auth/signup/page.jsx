'use client'
import { useRecaptcha } from '@/hooks/useRecaptcha'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, RefreshCw } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import PasswordInput from '@/components/ui/PasswordInput'
import toast from 'react-hot-toast'

export default function SignUpPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [passwordStrength, setPasswordStrength] = useState(0)
  const { executeRecaptcha } = useRecaptcha()
  const supabase = createClient()

  const calculatePasswordStrength = (password) => {
    let strength = 0
    if (password.length >= 8) strength++
    if (/[a-z]/.test(password)) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[^A-Za-z0-9]/.test(password)) strength++
    return strength
  }

  const handlePasswordChange = (e) => {
    const password = e.target.value
    setFormData({ ...formData, password })
    setPasswordStrength(calculatePasswordStrength(password))
  }

  const handleEmailSignUp = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (formData.password.length < 8) {
        toast.error('Password must be at least 8 characters')
        setLoading(false)
        return
      }
      const token = await executeRecaptcha('signup')
      const verifyResponse = await fetch('/api/verify-recaptcha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, action: 'signup' }),
      })
      const verifyData = await verifyResponse.json()
      if (!verifyData.success) {
        throw new Error('Security verification failed. Please try again.')
      }
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/auth/login`,
        },
      })
      if (error) throw error
      router.push('/auth/verify-email?email=' + encodeURIComponent(formData.email))
    } catch (error) {
      console.error('Error signing up:', error)
      toast.error(error.message || 'Failed to sign up')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/portal/dashboard`,
        },
      })
      if (error) throw error
    } catch (error) {
      console.error('Error signing in with Google:', error)
      toast.error('Failed to sign in with Google')
      setGoogleLoading(false)
    }
  }

  const getStrengthColor = () => {
    if (passwordStrength === 0) return 'bg-gray-200'
    if (passwordStrength <= 2) return 'bg-red-400'
    if (passwordStrength === 3) return 'bg-amber-400'
    return 'bg-emerald-400'
  }

  const getStrengthText = () => {
    if (passwordStrength === 0) return ''
    if (passwordStrength <= 2) return 'Weak'
    if (passwordStrength === 3) return 'Medium'
    return 'Strong'
  }

  const getStrengthTextColor = () => {
    if (passwordStrength <= 2) return 'text-red-500'
    if (passwordStrength === 3) return 'text-amber-500'
    return 'text-emerald-500'
  }

  return (
    <>
      <style jsx global>{`
        html, body {
          background: #ffffff;
        }
      `}</style>
      
      <div className="min-h-screen bg-white flex flex-col justify-center px-6 py-12">
        <div className="w-full max-w-sm mx-auto">
          
          {/* Logo */}
          <div className="flex justify-center mb-10">
            <img src="/logo_impress.png" alt="Impress Cleaning" className="h-12" />
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold text-[#1C294E] mb-2">
              Create your account
            </h1>
            <p className="text-gray-500 text-sm">
              Manage cleanings, schedule services & pay invoices
            </p>
          </div>

          {/* Google Sign-In */}
          <button
            onClick={handleGoogleSignIn}
            disabled={googleLoading || loading}
            className="w-full py-3 rounded-xl bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50/50 text-[#1C294E] font-medium transition-all duration-200 flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50"
          >
            {googleLoading ? (
              <RefreshCw className="w-5 h-5 animate-spin text-gray-400" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            <span>Continue with Google</span>
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-400 uppercase tracking-wide">or</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          {/* Email Sign-Up Form */}
          <form onSubmit={handleEmailSignUp} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#1C294E] mb-1.5">
                Email
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#079447] focus:ring-2 focus:ring-[#079447]/10 outline-none transition-all duration-200 text-[#1C294E] placeholder:text-gray-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1C294E] mb-1.5">
                Password
              </label>
              <PasswordInput
                placeholder="Minimum 8 characters"
                value={formData.password}
                onChange={handlePasswordChange}
                required
              />
              {formData.password && (
                <div className="mt-2.5">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full ${
                          i < passwordStrength ? getStrengthColor() : 'bg-gray-100'
                        } transition-all duration-300`}
                      />
                    ))}
                  </div>
                  {getStrengthText() && (
                    <p className={`text-xs mt-1.5 ${getStrengthTextColor()}`}>
                      {getStrengthText()}
                    </p>
                  )}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || googleLoading}
              className={`w-full py-3 rounded-xl font-semibold transition-all duration-200 ${
                loading
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-[#079447] hover:bg-[#068a40] text-white active:scale-[0.98]'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Creating...
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Login Link */}
          <p className="text-center text-sm text-gray-500 mt-8">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-[#079447] font-medium hover:underline">
              Sign in
            </Link>
          </p>

          {/* reCAPTCHA Notice */}
          <p className="text-center text-xs text-gray-400 mt-8 leading-relaxed">
            Protected by reCAPTCHA ·{' '}
            <a href="https://policies.google.com/privacy" className="hover:text-gray-500" target="_blank" rel="noopener noreferrer">
              Privacy
            </a>
            {' · '}
            <a href="https://policies.google.com/terms" className="hover:text-gray-500" target="_blank" rel="noopener noreferrer">
              Terms
            </a>
          </p>
        </div>
      </div>
    </>
  )
}