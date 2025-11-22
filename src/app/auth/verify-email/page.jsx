'use client'

 

import { useEffect, useState } from 'react'

import { useSearchParams } from 'next/navigation'

import { Mail, CheckCircle } from 'lucide-react'

import { createClient } from '@/lib/supabase/client'

import Card from '@/components/ui/Card'

import Button from '@/components/ui/Button'

import toast from 'react-hot-toast'

 

export default function VerifyEmailPage() {

  const searchParams = useSearchParams()

  const email = searchParams.get('email')

  const [resending, setResending] = useState(false)

  const [resent, setResent] = useState(false)

 

  const supabase = createClient()

 

  const handleResendEmail = async () => {

    if (!email) return

 

    setResending(true)

    try {

      const { error } = await supabase.auth.resend({

        type: 'signup',

        email,

      })

 

      if (error) throw error

 

      setResent(true)

      toast.success('Verification email resent!')

    } catch (error) {

      console.error('Error resending email:', error)

      toast.error('Failed to resend email')

    } finally {

      setResending(false)

    }

  }

 

  return (

    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">

      <Card className="w-full max-w-md text-center">

        {/* Icon */}

        <div className="flex justify-center mb-6">

          <div className="w-20 h-20 bg-[#079447]/10 rounded-full flex items-center justify-center">

            <Mail className="w-10 h-10 text-[#079447]" />

          </div>

        </div>

 

        {/* Content */}

        <h1 className="text-2xl font-bold text-[#1C294E] mb-3">

          Check your email

        </h1>

 

        <p className="text-gray-600 mb-2">

          We sent a verification link to

        </p>

        <p className="text-[#1C294E] font-medium mb-6">

          {email || 'your email address'}

        </p>

 

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">

          <p className="text-sm text-blue-900">

            <strong>Next steps:</strong>

          </p>

          <ol className="text-sm text-blue-800 mt-2 space-y-1 list-decimal list-inside">

            <li>Open the email from Impress Cleaning Services</li>

            <li>Click the verification link</li>

            <li>Complete your service profile setup</li>

          </ol>

        </div>

 

        {/* Resend Email */}

        <div className="space-y-3">

          {!resent ? (

            <Button

              variant="text"

              onClick={handleResendEmail}

              loading={resending}

              disabled={!email}

            >

              Didn&apos;t receive the email? Resend

            </Button>

          ) : (

            <div className="flex items-center justify-center gap-2 text-green-600">

              <CheckCircle className="w-5 h-5" />

              <span className="text-sm font-medium">Email resent successfully!</span>

            </div>

          )}

 

          <p className="text-xs text-gray-500">

            Tip: Check your spam folder if you don&apos;t see the email

          </p>

        </div>

      </Card>

    </div>

  )

}