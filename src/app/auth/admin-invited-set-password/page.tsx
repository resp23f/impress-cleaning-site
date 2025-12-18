'use client'

import { useState, useEffect, FormEvent, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { Eye, EyeOff, CheckCircle, XCircle, ArrowRight, Shield } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import TurnstileWidget from '@/components/ui/TurnstileWidget'

type PageState = 'validating' | 'ready' | 'submitting' | 'signing-in' | 'error'

interface UserInfo {
  id: string
  email: string
  firstName: string
}

function AdminInvitedSetPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [pageState, setPageState] = useState<PageState>('validating')
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [errorMessage, setErrorMessage] = useState('')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const [turnstileKey, setTurnstileKey] = useState(0)

  const supabase = createClient()

  const passwordStrength = (() => {
    let strength = 0
    if (password.length >= 8) strength++
    if (/[a-z]/.test(password)) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[^A-Za-z0-9]/.test(password)) strength++
    return strength
  })()

  const checks = {
    length: password.length >= 8,
    match: password === confirmPassword && password.length > 0,
  }

  const resetCaptcha = () => {
    setCaptchaToken(null)
    setTurnstileKey(prev => prev + 1)
  }

  // Validate handoff token on mount
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setErrorMessage('Invalid link. Please request a new invite from your administrator.')
        setPageState('error')
        return
      }

      try {
        const response = await fetch('/api/auth/verify-handoff', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        })

        const data = await response.json()

        if (!response.ok) {
          setErrorMessage(data.error || 'Invalid or expired link')
          setPageState('error')
          return
        }

        setUserInfo(data.user)
        setPageState('ready')
      } catch {
        setErrorMessage('Unable to verify your invite. Please try again.')
        setPageState('error')
      }
    }

    validateToken()
  }, [token])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    setPageState('submitting')

    try {
      // Set password via our custom API
      const response = await fetch('/api/auth/complete-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to set password')
      }

      // Password set successfully - now sign in automatically
      setPageState('signing-in')

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: password,
        options: {
          captchaToken: captchaToken || undefined,
        },
      })

      if (signInError) {
        throw new Error('Account created but sign-in failed. Please log in manually.')
      }

      // Success! Redirect to profile setup
      toast.success('Account created successfully!')
      router.push('/auth/profile-setup')

    } catch (error) {
      const err = error as Error
      
      // If token was already used, password was likely set - try signing in
      if (err.message === 'This link has already been used' && userInfo?.email) {
        setPageState('signing-in')
        try {
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email: userInfo.email,
            password: password,
            options: {
              captchaToken: captchaToken || undefined,
            },
          })
          
          if (!signInError) {
            toast.success('Account created successfully!')
            router.push('/auth/profile-setup')
            return
          }
        } catch {
          // Sign in failed, fall through to error
        }
      }
      
      toast.error(err.message || 'Something went wrong')
      resetCaptcha()
      setPageState('ready')
    }
  }

  const getStrengthColor = () => {
    if (passwordStrength === 0) return 'bg-slate-200'
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

  // Validating state - skeleton loader
  if (pageState === 'validating') {
    return (
      <>
        <style>{`html, body { background: #ffffff; }`}</style>
        <div className="min-h-screen flex items-center justify-center bg-white p-6">
          <div className="w-full max-w-md">
            {/* Logo */}
            <div className="flex justify-center mb-12">
              <Image
                src="/ImpressLogoNoBackgroundBlue.png"
                alt="Impress Cleaning Services"
                width={280}
                height={100}
                className="h-20 w-auto"
                priority
              />
            </div>

            {/* Skeleton content */}
            <div className="text-center mb-8">
              <Skeleton width={280} height={36} className="mx-auto mb-3" />
              <Skeleton width={220} height={20} className="mx-auto" />
            </div>

            <div className="space-y-5">
              <div>
                <Skeleton width={80} height={20} className="mb-2" />
                <Skeleton height={56} borderRadius={12} />
              </div>
              <div>
                <Skeleton width={130} height={20} className="mb-2" />
                <Skeleton height={56} borderRadius={12} />
              </div>
              <Skeleton height={65} borderRadius={8} className="mt-6" />
              <Skeleton height={56} borderRadius={12} />
            </div>

            <p className="text-center text-slate-400 text-sm mt-10">
              Preparing your account...
            </p>
          </div>
        </div>
      </>
    )
  }

  // Error state
  if (pageState === 'error') {
    return (
      <>
        <style>{`html, body { background: #ffffff; }`}</style>
        <div className="min-h-screen flex items-center justify-center bg-white p-6">
          <div className="w-full max-w-md text-center">
            <div className="flex justify-center mb-12">
              <Image
                src="/ImpressLogoNoBackgroundBlue.png"
                alt="Impress Cleaning Services"
                width={280}
                height={100}
                className="h-20 w-auto"
                priority
              />
            </div>

            <div className="w-14 h-14 mx-auto mb-6 rounded-full bg-red-50 flex items-center justify-center">
              <XCircle className="w-7 h-7 text-red-500" />
            </div>

            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              Something went wrong
            </h2>
            <p className="text-slate-500 mb-8 max-w-sm mx-auto">
              {errorMessage}
            </p>

            <button
              onClick={() => router.push('/auth/login')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium transition-colors"
            >
              Go to Login
              <ArrowRight className="w-4 h-4" />
            </button>

            <p className="text-center text-xs text-slate-300 mt-12">
              © {new Date().getFullYear()} Impress Cleaning Services LLC
            </p>
          </div>
        </div>
      </>
    )
  }

  // Submitting or signing-in state - polished loading
  if (pageState === 'submitting' || pageState === 'signing-in') {
    return (
      <>
        <style>{`html, body { background: #ffffff; }`}</style>
        <div className="min-h-screen flex items-center justify-center bg-white p-6">
          <div className="w-full max-w-md text-center">
            <div className="flex justify-center mb-12">
              <Image
                src="/ImpressLogoNoBackgroundBlue.png"
                alt="Impress Cleaning Services"
                width={280}
                height={100}
                className="h-20 w-auto"
                priority
              />
            </div>

            {/* Subtle loading indicator */}
            <div className="w-14 h-14 mx-auto mb-6 rounded-full bg-emerald-50 flex items-center justify-center">
              <Shield className="w-7 h-7 text-emerald-600" />
            </div>

            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              {pageState === 'submitting' ? 'Creating your account...' : 'Signing you in...'}
            </h2>
            <p className="text-slate-400">
              {pageState === 'submitting' 
                ? 'This will only take a moment' 
                : 'Almost there!'}
            </p>

            {/* Simple progress bar */}
            <div className="mt-8 h-1 w-48 mx-auto bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full animate-pulse" style={{ width: '60%' }} />
            </div>

            <p className="text-center text-xs text-slate-300 mt-12">
              © {new Date().getFullYear()} Impress Cleaning Services LLC
            </p>
          </div>
        </div>
      </>
    )
  }

  // Ready state - show form
  return (
    <>
      <style>{`html, body { background: #ffffff; }`}</style>
      <div className="min-h-screen flex items-center justify-center bg-white p-6">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex justify-center mb-12">
            <Image
              src="/ImpressLogoNoBackgroundBlue.png"
              alt="Impress Cleaning Services"
              width={280}
              height={100}
              className="h-20 w-auto"
              priority
            />
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">
              {userInfo?.firstName ? `Welcome, ${userInfo.firstName}` : 'Welcome'}
            </h1>
            <p className="text-slate-400">
              Create a password to get started
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className="w-full px-4 py-3.5 pr-12 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all duration-200 text-slate-800 placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Password strength */}
              {password && (
                <div className="mt-3">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full ${
                          i < passwordStrength ? getStrengthColor() : 'bg-slate-100'
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

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className="w-full px-4 py-3.5 pr-12 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all duration-200 text-slate-800 placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Requirements checklist - only show when typing */}
            {password && (
              <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
                <div className={`flex items-center gap-1.5 ${checks.length ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {checks.length ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-current" />
                  )}
                  8+ characters
                </div>
                {confirmPassword && (
                  <div className={`flex items-center gap-1.5 ${checks.match ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {checks.match ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-current" />
                    )}
                    Passwords match
                  </div>
                )}
              </div>
            )}

            <div className="pt-2">
              <TurnstileWidget
                key={turnstileKey}
                onVerify={(token) => setCaptchaToken(token)}
                onError={() => setCaptchaToken(null)}
                onExpire={() => setCaptchaToken(null)}
              />
            </div>

            <button
              type="submit"
              disabled={!checks.length || (confirmPassword.length > 0 && !checks.match) || pageState !== 'ready' || !captchaToken}
              className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-xs text-slate-300 mt-12">
            © {new Date().getFullYear()} Impress Cleaning Services LLC
          </p>
        </div>
      </div>
    </>
  )
}

// Loading fallback for Suspense
function LoadingFallback() {
  return (
    <>
      <style>{`html, body { background: #ffffff; }`}</style>
      <div className="min-h-screen flex items-center justify-center bg-white p-6">
        <div className="w-full max-w-md">
          <div className="flex justify-center mb-12">
            <Image
              src="/ImpressLogoNoBackgroundBlue.png"
              alt="Impress Cleaning Services"
              width={280}
              height={100}
              className="h-20 w-auto"
              priority
            />
          </div>
          <div className="text-center mb-8">
            <Skeleton width={280} height={36} className="mx-auto mb-3" />
            <Skeleton width={220} height={20} className="mx-auto" />
          </div>
          <div className="space-y-5">
            <div>
              <Skeleton width={80} height={20} className="mb-2" />
              <Skeleton height={56} borderRadius={12} />
            </div>
            <div>
              <Skeleton width={130} height={20} className="mb-2" />
              <Skeleton height={56} borderRadius={12} />
            </div>
            <Skeleton height={65} borderRadius={8} className="mt-6" />
            <Skeleton height={56} borderRadius={12} />
          </div>
        </div>
      </div>
    </>
  )
}

// Default export with Suspense boundary
export default function AdminInvitedSetPasswordPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AdminInvitedSetPasswordContent />
    </Suspense>
  )
}
