'use client'

import { useState, useEffect, FormEvent, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { Eye, EyeOff, KeyRound, CheckCircle, XCircle, ArrowRight, Sparkles, Shield } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

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
      })

      if (signInError) {
        throw new Error('Account created but sign-in failed. Please log in manually.')
      }

      // Success! Redirect to profile setup
      toast.success('Account created successfully!')
      router.push('/auth/profile-setup')

    } catch (error) {
      const err = error as Error
      toast.error(err.message || 'Something went wrong')
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

            {/* Skeleton content */}
            <div className="flex justify-center mb-6">
              <Skeleton width={180} height={36} borderRadius={20} />
            </div>

            <div className="flex justify-center mb-6">
              <Skeleton width={64} height={64} borderRadius={16} />
            </div>

            <div className="text-center mb-8">
              <Skeleton width={100} height={28} borderRadius={20} className="mx-auto mb-4" />
              <Skeleton width={280} height={32} className="mx-auto mb-2" />
              <Skeleton width={240} height={20} className="mx-auto" />
            </div>

            <div className="space-y-5">
              <div>
                <Skeleton width={80} height={20} className="mb-1.5" />
                <Skeleton height={52} borderRadius={12} />
              </div>
              <div>
                <Skeleton width={120} height={20} className="mb-1.5" />
                <Skeleton height={52} borderRadius={12} />
              </div>
              <Skeleton height={52} borderRadius={12} />
            </div>

            <p className="text-center text-slate-400 text-sm mt-8">
              Validating your invite...
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

            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center shadow-lg shadow-red-500/20">
              <XCircle className="w-8 h-8 text-white" />
            </div>

            <h2 className="text-2xl font-bold text-slate-800 mb-3">
              Unable to Continue
            </h2>
            <p className="text-slate-500 mb-8">
              {errorMessage}
            </p>

            <button
              onClick={() => router.push('/auth/login')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
            >
              Go to Login
              <ArrowRight className="w-4 h-4" />
            </button>

            <p className="text-center text-xs text-slate-300 mt-10">
              © {new Date().getFullYear()} Impress Cleaning Services LLC. All rights reserved.
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

            {/* Animated icon */}
            <div className="relative w-20 h-20 mx-auto mb-8">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 animate-pulse" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Shield className="w-10 h-10 text-white" />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-slate-800 mb-3">
              {pageState === 'submitting' ? 'Setting up your account…' : 'Signing you in…'}
            </h2>
            <p className="text-slate-400">
              {pageState === 'submitting' 
                ? 'Creating your secure password' 
                : 'Almost there! Preparing your portal'}
            </p>

            {/* Progress dots */}
            <div className="flex justify-center gap-2 mt-8">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>

            <p className="text-center text-xs text-slate-300 mt-10">
              © {new Date().getFullYear()} Impress Cleaning Services LLC. All rights reserved.
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

          {/* Welcome Badge */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              <span className="text-sm font-medium text-emerald-700">Welcome to Impress</span>
            </div>
          </div>

          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <KeyRound className="w-8 h-8 text-white" />
            </div>
          </div>

          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-sm font-medium mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Step 1 of 2
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              {userInfo?.firstName ? `Hi ${userInfo.firstName}, create your password` : 'Create your password'}
            </h2>
            <p className="text-slate-400">
              Secure your account to access your customer portal
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a password"
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

              {password && (
                <div className="mt-2.5">
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
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Confirm password
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

            {/* Password requirements */}
            {password && (
              <div className="p-4 rounded-xl bg-slate-50 space-y-2">
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ${checks.length ? 'bg-emerald-100' : 'bg-slate-200'}`}>
                    {checks.length ? (
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-slate-400" />
                    )}
                  </div>
                  <span className={`text-sm ${checks.length ? 'text-emerald-600' : 'text-slate-500'}`}>
                    At least 8 characters
                  </span>
                </div>

                {confirmPassword && (
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${checks.match ? 'bg-emerald-100' : 'bg-slate-200'}`}>
                      {checks.match ? (
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-slate-400" />
                      )}
                    </div>
                    <span className={`text-sm ${checks.match ? 'text-emerald-600' : 'text-slate-500'}`}>
                      Passwords match
                    </span>
                  </div>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={!checks.length || (confirmPassword.length > 0 && !checks.match)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-xs text-slate-300 mt-10">
            © {new Date().getFullYear()} Impress Cleaning Services LLC. All rights reserved.
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
          <div className="flex justify-center mb-6">
            <Skeleton width={180} height={36} borderRadius={20} />
          </div>
          <div className="flex justify-center mb-6">
            <Skeleton width={64} height={64} borderRadius={16} />
          </div>
          <div className="text-center mb-8">
            <Skeleton width={100} height={28} borderRadius={20} className="mx-auto mb-4" />
            <Skeleton width={280} height={32} className="mx-auto mb-2" />
            <Skeleton width={240} height={20} className="mx-auto" />
          </div>
          <div className="space-y-5">
            <div>
              <Skeleton width={80} height={20} className="mb-1.5" />
              <Skeleton height={52} borderRadius={12} />
            </div>
            <div>
              <Skeleton width={120} height={20} className="mb-1.5" />
              <Skeleton height={52} borderRadius={12} />
            </div>
            <Skeleton height={52} borderRadius={12} />
          </div>
          <p className="text-center text-slate-400 text-sm mt-8">
            Loading...
          </p>
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
