'use client'
import { Suspense } from 'react'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Mail, Sparkles, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import PasswordInput from '@/components/ui/PasswordInput'
import toast from 'react-hot-toast'

function LoginPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const rawRedirect = searchParams.get('redirectTo') || '/portal/dashboard'

  // Validate redirect URL - must be relative path (no protocol/domain)
  const isValidRedirect = (url) => {
    if (!url.startsWith('/') || url.startsWith('//')) return false
    if (url.includes('://')) return false
    return true
  }

  const redirectTo = isValidRedirect(rawRedirect) ? rawRedirect : '/portal/dashboard'

  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const supabase = createClient()

  const handleEmailLogin = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      if (error) {
        if (error.message.includes('Email not confirmed')) {
          toast.error('Please verify your email before logging in.')
          router.push(`/auth/verify-email?email=${encodeURIComponent(formData.email)}`)
          return
        }
        throw error
      }

      if (data.user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role, full_name, phone')
          .eq('id', data.user.id)
          .single()

        if (profileError) {
          console.error('Profile fetch error:', profileError)
          if (profileError.code === 'PGRST116') {
            toast.error('Profile not found. Please complete your signup.')
            router.push('/auth/profile-setup')
            return
          }
        }

        if (!profile?.full_name || !profile?.phone) {
          router.push('/auth/profile-setup')
          return
        }

        if (profile?.role === 'admin') {
          router.push('/admin/dashboard')
        } else {
          router.push(redirectTo)
        }
      }
    } catch (error) {
      console.error('Error logging in:', error)
      const errorMessage = error.message || 'Invalid email or password'
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setLoading(true)
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
      setLoading(false)
    }
  }

  return (
    <>
      <style>{`html, body { background: #ffffff; }`}</style>
      <div className="min-h-screen flex">
        {/* Left Side - Softened Branding Panel */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
          {/* Soft gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-slate-50 to-white" />

          {/* Soft colored orbs */}
          <div className="absolute top-10 left-10 w-96 h-96 bg-gradient-to-br from-emerald-300/50 to-teal-300/40 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-gradient-to-br from-sky-200/60 to-indigo-200/50 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-br from-emerald-200/60 to-green-200/50 rounded-full blur-3xl" />

          {/* Subtle pattern overlay */}
          <div
            className="absolute inset-0 opacity-[0.015]"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, #1C294E 1px, transparent 0)`,
              backgroundSize: '32px 32px'
            }}
          />

          {/* Glass card overlay */}
          <div className="absolute inset-8 rounded-3xl bg-white/40 backdrop-blur-sm border border-white/60 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.08)]" />

          {/* Content */}
          <div className="relative z-10 flex flex-col justify-start p-16 w-full h-full">

            {/* Logo */}
            <div className="mb-40">
              <Image
                src="/ImpressLogoNoBackgroundBlue.png"
                alt="Impress Cleaning Services"
                width={200}
                height={70}
                className="h-25 w-auto"
                priority
              />
            </div>

            {/* Middle content */}
            <div className="max-w-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-0.5 w-8 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full" />
                <span className="text-xs font-semibold text-emerald-600/80 uppercase tracking-widest">
                  Customer Portal
                </span>
              </div>
              <h1 className="text-3xl font-bold text-slate-800 mb-4 leading-snug">
                Your Home, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
                  Sparkling Clean
                </span>
              </h1>
              <p className="text-slate-500 leading-relaxed">
                Access your personalized dashboard to manage appointments, view invoices, and keep your space looking its best.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center bg-white p-6 sm:p-12">
          <div className="w-full max-w-md">
            {/* Mobile logo */}
            <div className="lg:hidden flex justify-center mb-8">
              <Image
                src="/ImpressLogoNoBackgroundBlue.png"
                alt="Impress Cleaning Services"
                width={180}
                height={60}
                className="h-12 w-auto"
                priority
              />
            </div>

            {/* Form Container */}
            <div className="lg:px-4">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-slate-800 mb-2">
                  Welcome back
                </h2>
                <p className="text-slate-400">
                  Sign in to your customer portal
                </p>
              </div>

              {/* Google Sign In */}
<button
  onClick={handleGoogleSignIn}
  disabled={loading}
  className="w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 shadow-sm hover:shadow transition-colors duration-200 text-sm font-medium text-slate-700 mb-6 disabled:opacity-50 disabled:cursor-not-allowed"
>                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </button>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-100" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-slate-300 text-xs uppercase tracking-wide">or</span>
                </div>
              </div>

              {/* Email Form */}
              <form onSubmit={handleEmailLogin} className="space-y-5">
                <Input
                  type="email"
                  label="Email address"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  icon={<Mail className="w-5 h-5" />}
                />

                <div>
                  <PasswordInput
                    label="Password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                  <div className="text-right mt-2">
                    <Link
                      href="/auth/forgot-password"
                      className="text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  size="lg"
                  loading={loading}
className="!py-3.5 !bg-gradient-to-r !from-emerald-500 !to-teal-500 hover:!from-emerald-600 hover:!to-teal-600 shadow-lg shadow-emerald-500/20 transition-colors duration-200">
                  Sign In
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </form>

              {/* Sign up link */}
              <p className="mt-8 text-center text-slate-400">
                Don&apos;t have an account?{' '}
                <Link
                  href="/auth/signup"
                  className="text-emerald-600 font-semibold hover:text-emerald-700 transition-colors"
                >
                  Create one
                </Link>
              </p>
            </div>

            {/* Footer */}
            <p className="text-center text-xs text-slate-300 mt-10">
              © {new Date().getFullYear()} Impress Cleaning Services LLC. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-pulse">
          <div className="w-10 h-10 rounded-xl bg-emerald-100" />
        </div>
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  )
}