'use client'

 
import { useRecaptcha } from '@/hooks/useRecaptcha'

import { useState } from 'react'

import { useRouter } from 'next/navigation'

import Link from 'next/link'

import Image from 'next/image'

import { Mail, Chrome } from 'lucide-react'

import { createClient } from '@/lib/supabase/client'

import Button from '@/components/ui/Button'

import Input from '@/components/ui/Input'

import PasswordInput from '@/components/ui/PasswordInput'

import Card from '@/components/ui/Card'

import toast from 'react-hot-toast'

 

export default function SignUpPage() {

  const router = useRouter()

  const [loading, setLoading] = useState(false)

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

    // Execute reCAPTCHA
    const token = await executeRecaptcha('signup')
    
    // Verify reCAPTCHA
    const verifyResponse = await fetch('/api/verify-recaptcha', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, action: 'signup' }),
    })

    const verifyData = await verifyResponse.json()
    
    if (!verifyData.success) {
      throw new Error('Security verification failed. Please try again.')
    }

    // Continue with signup
    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
emailRedirectTo: `${window.location.origin}/auth/callback?next=/auth/login`,
      },
    })

    if (error) throw error

    // No admin email here - it will be sent after profile setup
    console.log('Signup successful, redirecting to verify email...', data)
    router.push('/auth/verify-email?email=' + encodeURIComponent(formData.email))
    
  } catch (error) {
    console.error('Error signing up:', error)
    toast.error(error.message || 'Failed to sign up')
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

 

  const getStrengthColor = () => {

    if (passwordStrength === 0) return 'bg-gray-200'

    if (passwordStrength <= 2) return 'bg-red-500'

    if (passwordStrength === 3) return 'bg-yellow-500'

    if (passwordStrength === 4) return 'bg-green-500'

    return 'bg-green-600'

  }

 

  const getStrengthText = () => {

    if (passwordStrength === 0) return ''

    if (passwordStrength <= 2) return 'Weak'

    if (passwordStrength === 3) return 'Medium'

    if (passwordStrength === 4) return 'Strong'

    return 'Very Strong'

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

            Welcome to Impress Cleaning Services

          </h1>

          <p className="text-gray-600">

            Manage your cleanings, schedule services, and pay invoices - all in one place

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

 

        {/* Email Sign-Up Form */}

        <form onSubmit={handleEmailSignUp} className="space-y-4">

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

              label="Create a password"

              placeholder="Create a password"

              value={formData.password}

              onChange={handlePasswordChange}

              required

            />

            {formData.password && (

              <div className="mt-2">

                <div className="flex gap-1 mb-1">

                  {[...Array(5)].map((_, i) => (

                    <div

                      key={i}

                      className={`h-1 flex-1 rounded ${

                        i < passwordStrength ? getStrengthColor() : 'bg-gray-200'

                      } transition-all duration-200`}

                    />

                  ))}

                </div>

                {getStrengthText() && (

                  <p className="text-xs text-gray-600">

                    Password strength: {getStrengthText()}

                  </p>

                )}

              </div>

            )}

          </div>

 

          <Button

            type="submit"

            variant="primary"

            fullWidth

            size="lg"

            loading={loading}

          >

            Create Account

          </Button>

        </form>

 

        {/* Footer */}

        <div className="mt-6 text-center text-sm text-gray-600">

          Already have an account?{' '}

          <Link href="/auth/login" className="text-[#079447] font-medium hover:underline">

            Log in

          </Link>

        </div>

 

        {/* reCAPTCHA Notice */}

        <div className="mt-6 text-xs text-center text-gray-500">

          This site is protected by reCAPTCHA and the Google{' '}

          <a href="https://policies.google.com/privacy" className="underline" target="_blank" rel="noopener noreferrer">

            Privacy Policy

          </a>{' '}

          and{' '}

          <a href="https://policies.google.com/terms" className="underline" target="_blank" rel="noopener noreferrer">

            Terms of Service

          </a>{' '}

          apply.

        </div>

      </Card>

    </div>

  )

}
