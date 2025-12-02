'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, Eye, EyeOff, CheckCircle, XCircle, ShieldCheck, RefreshCw } from 'lucide-react'
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
      const { error } = await supabase.auth.updateUser({
        password: password,
      })
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

  // Loading/checking state
  if (checkingSession || !validSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] border border-white/60 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-200 to-gray-300 px-8 py-8 animate-pulse">
              <div className="w-16 h-16 bg-white/30 rounded-2xl mx-auto mb-4" />
              <div className="h-6 bg-white/30 rounded-lg w-48 mx-auto mb-2" />
              <div className="h-4 bg-white/30 rounded-lg w-32 mx-auto" />
            </div>
            <div className="px-8 py-8">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 border-2 border-[#079447] border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-gray-600 font-medium">Validating reset link...</p>
                <p className="text-gray-400 text-sm mt-1">Please wait a moment</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] border border-white/60 overflow-hidden">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-[#079447] to-emerald-500 px-8 py-8">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white text-center">
              Reset Your Password
            </h1>
            <p className="text-emerald-100 text-center mt-2 text-sm">
              Create a new secure password
            </p>
          </div>

          {/* Body */}
          <div className="px-8 py-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-[#1C294E] mb-2">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    className="w-full pl-12 pr-12 py-3.5 rounded-2xl border border-gray-200 focus:border-[#079447] focus:ring-2 focus:ring-[#079447]/20 outline-none transition-all duration-200 text-[#1C294E]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-[#1C294E] mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={8}
                    className="w-full pl-12 pr-12 py-3.5 rounded-2xl border border-gray-200 focus:border-[#079447] focus:ring-2 focus:ring-[#079447]/20 outline-none transition-all duration-200 text-[#1C294E]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Password requirements */}
              {password && (
                <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
                  <p className="text-sm font-semibold text-[#1C294E]">Password requirements</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${checks.length ? 'bg-emerald-100' : 'bg-gray-200'}`}>
                        {checks.length ? (
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <XCircle className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                      <span className={`text-sm ${checks.length ? 'text-emerald-700 font-medium' : 'text-gray-500'}`}>
                        At least 8 characters
                      </span>
                    </div>
                    {confirmPassword && (
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${checks.match ? 'bg-emerald-100' : 'bg-gray-200'}`}>
                          {checks.match ? (
                            <CheckCircle className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <XCircle className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                        <span className={`text-sm ${checks.match ? 'text-emerald-700 font-medium' : 'text-gray-500'}`}>
                          Passwords match
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={!checks.length || (confirmPassword && !checks.match) || loading}
                className={`w-full py-3.5 rounded-2xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                  !checks.length || (confirmPassword && !checks.match) || loading
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-[#079447] hover:bg-[#068a40] text-white active:scale-[0.98]'
                }`}
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    Reset Password
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Footer */}
          <div className="px-8 py-4 bg-gray-50/50 border-t border-gray-100">
            <p className="text-xs text-gray-500 text-center">
              Need help?{' '}
              <a href="mailto:notifications@impressyoucleaning.com" className="text-[#079447] hover:underline font-medium">
                Contact support
              </a>
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