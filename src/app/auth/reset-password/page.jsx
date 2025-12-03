'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Eye, EyeOff, ShieldCheck, CheckCircle, XCircle, RefreshCw, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [validSession, setValidSession] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)
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

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        setValidSession(true)
      } else {
        toast.error('Invalid or expired reset link')
        setTimeout(() => router.push('/auth/forgot-password'), 2000)
      }
      setCheckingSession(false)
    }
    checkSession()
  }, [supabase, router])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      toast.success('Password updated successfully!')
      setTimeout(() => router.push('/auth/login'), 1500)
    } catch (error) {
      console.error('Error resetting password:', error)
      toast.error(error.message || 'Failed to reset password')
    } finally {
      setLoading(false)
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

  // Loading/checking state
  if (checkingSession || !validSession) {
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
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-slate-600 font-medium">Validating reset link...</p>
              <p className="text-slate-400 text-sm mt-1">Please wait a moment</p>
            </div>
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

          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              Set new password
            </h2>
            <p className="text-slate-400">
              Create a strong, secure password
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                New password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
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
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
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
              disabled={!checks.length || (confirmPassword && !checks.match) || loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/30 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  Reset Password
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
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