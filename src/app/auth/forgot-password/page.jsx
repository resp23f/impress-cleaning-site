'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, ArrowLeft, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Card from '@/components/ui/Card'
import toast from 'react-hot-toast'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  const supabase = createClient()

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Basic email validation
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
        // Handle specific error cases
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

  if (emailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center py-12 px-4">
        <Card className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="w-8 h-8 text-green-600" />
          </div>

          <h1 className="text-2xl font-bold text-[#1C294E] mb-2">
            Check Your Email
          </h1>

          <p className="text-gray-600 mb-6">
            We sent a password reset link to{' '}
            <span className="font-semibold text-[#1C294E]">{email}</span>
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">What's next?</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Check your email inbox</li>
                  <li>Click the reset password link</li>
                  <li>Set your new password</li>
                </ol>
                <p className="mt-2 text-xs">
                  Link expires in 1 hour. Didn't get it? Check spam or try again.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              variant="outline"
              fullWidth
              onClick={() => router.push('/auth/login')}
            >
              Back to Login
            </Button>

            <button
              onClick={() => setEmailSent(false)}
              className="w-full text-sm text-gray-600 hover:text-[#1C294E] transition-colors"
            >
              Try a different email
            </button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center py-12 px-4">
      <Card className="max-w-md w-full">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-[#1C294E] mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <h1 className="text-2xl font-bold text-[#1C294E] mb-2">
          Forgot Password?
        </h1>

        <p className="text-gray-600 mb-6">
          Enter your email and we'll send you a link to reset your password.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            label="Email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            icon={<Mail className="w-5 h-5" />}
          />

          <Button
            type="submit"
            variant="primary"
            fullWidth
            loading={loading}
            disabled={!email.trim()}
          >
            Send Reset Link
          </Button>

          <p className="text-xs text-gray-500 text-center">
            Remember your password?{' '}
            <button
              type="button"
              onClick={() => router.push('/auth/login')}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Sign in
            </button>
          </p>
        </form>
      </Card>
    </div>
  )
}