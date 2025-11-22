'use client'

 

import { useState } from 'react'

import { useRouter, useSearchParams } from 'next/navigation'

import Link from 'next/link'

import { Mail, Chrome } from 'lucide-react'

import { createClient } from '@/lib/supabase/client'

import Button from '@/components/ui/Button'

import Input from '@/components/ui/Input'

import PasswordInput from '@/components/ui/PasswordInput'

import Card from '@/components/ui/Card'

import toast from 'react-hot-toast'

 

export default function LoginPage() {

  const router = useRouter()

  const searchParams = useSearchParams()

  const redirectTo = searchParams.get('redirectTo') || '/portal/dashboard'

 

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

 

      if (error) throw error

 

      if (data.user) {

        // Check if user profile is approved

        const { data: profile } = await supabase

          .from('profiles')

          .select('account_status, role')

          .eq('id', data.user.id)

          .single()

 

        if (profile?.account_status === 'pending') {

          toast.error('Your account is pending approval. You\'ll receive an email once approved.')

          await supabase.auth.signOut()

          return

        }

 

        if (profile?.account_status === 'suspended') {

          toast.error('Your account has been suspended. Please contact support.')

          await supabase.auth.signOut()

          return

        }

 

        // Redirect based on role

        if (profile?.role === 'admin') {

          router.push('/admin/dashboard')

        } else {

          router.push(redirectTo)

        }

      }

    } catch (error) {

      console.error('Error logging in:', error)

      toast.error(error.message || 'Invalid email or password')

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

          redirectTo: `${window.location.origin}/auth/callback`,

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

    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">

      <Card className="w-full max-w-md">

        {/* Logo */}

        <div className="text-center mb-8">

          <div className="flex justify-center mb-4">

            <div className="w-16 h-16 bg-[#079447] rounded-full flex items-center justify-center">

              <span className="text-2xl font-bold text-white">IC</span>

            </div>

          </div>

          <h1 className="text-2xl font-bold text-[#1C294E] mb-2">

            Welcome back

          </h1>

          <p className="text-gray-600">

            Sign in to access your customer portal

          </p>

        </div>

 

        {/* Social Sign-In */}

        <div className="space-y-3 mb-6">

          <Button

            variant="secondary"

            fullWidth

            size="lg"

            onClick={handleGoogleSignIn}

            disabled={loading}

          >

            <Chrome className="w-5 h-5" />

            Continue with Google

          </Button>

        </div>

 

        {/* Divider */}

        <div className="relative my-6">

          <div className="absolute inset-0 flex items-center">

            <div className="w-full border-t border-gray-300" />

          </div>

          <div className="relative flex justify-center text-sm">

            <span className="px-4 bg-white text-gray-500">or</span>

          </div>

        </div>

 

        {/* Email Login Form */}

        <form onSubmit={handleEmailLogin} className="space-y-4">

          <Input

            type="email"

            label="Email address"

            placeholder="your@email.com"

            value={formData.email}

            onChange={(e) => setFormData({ ...formData, email: e.target.value })}

            required

            icon={<Mail className="w-5 h-5" />}

          />

 

          <PasswordInput

            label="Password"

            placeholder="Enter your password"

            value={formData.password}

            onChange={(e) => setFormData({ ...formData, password: e.target.value })}

            required

          />

 

          <div className="text-right">

            <Link

              href="/auth/forgot-password"

              className="text-sm text-[#079447] hover:underline"

            >

              Forgot password?

            </Link>

          </div>

 

          <Button

            type="submit"

            variant="primary"

            fullWidth

            size="lg"

            loading={loading}

          >

            Log In

          </Button>

        </form>

 

        {/* Footer */}

        <div className="mt-6 text-center text-sm text-gray-600">

          Don&apos;t have an account?{' '}

          <Link href="/auth/signup" className="text-[#079447] font-medium hover:underline">

            Sign up

          </Link>

        </div>

      </Card>

    </div>

  )

}