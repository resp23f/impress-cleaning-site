'use client'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import StaggerItem from '@/components/StaggerItem'

function SuccessContent() {
  const searchParams = useSearchParams()
  const [status, setStatus] = useState('loading') // 'loading' | 'success' | 'canceled' | 'invalid'

  useEffect(() => {
    // Check for canceled payment
    if (searchParams.get('canceled') === 'true') {
      setStatus('canceled')
      return
    }

    // Check for session_id (indicates successful payment)
    const sessionId = searchParams.get('session_id')
    
    if (sessionId && sessionId.startsWith('cs_')) {
      // Valid session ID - payment was successful
      // Email is sent via webhook, no need to call API here
      setStatus('success')
    } else {
      // No valid session ID
      setStatus('invalid')
    }
  }, [searchParams])

  // Loading state
  if (status === 'loading') {
    return (
      <main className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </main>
    )
  }

  // Canceled state
  if (status === 'canceled') {
    return (
      <main className="min-h-screen bg-gradient-to-b from-yellow-50 to-white flex items-center justify-center px-4">
        <StaggerItem>
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-8">
              <svg className="w-12 h-12 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">
              Payment Canceled
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              No worries! Your payment was canceled and you haven&apos;t been charged.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/gift-certificate"
                className="px-8 py-4 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all duration-300"
              >
                Try Again
              </Link>
              <Link
                href="/"
                className="px-8 py-4 bg-white text-gray-900 rounded-lg font-semibold border-2 border-gray-200 hover:border-gray-300 transition-all duration-300"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </StaggerItem>
      </main>
    )
  }

  // Invalid state (no session ID)
  if (status === 'invalid') {
    return (
      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center px-4">
        <StaggerItem>
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-8">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">
              Page Not Found
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              This page is only accessible after completing a gift certificate purchase.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/gift-certificate"
                className="px-8 py-4 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all duration-300"
              >
                Purchase Gift Certificate
              </Link>
              <Link
                href="/"
                className="px-8 py-4 bg-white text-gray-900 rounded-lg font-semibold border-2 border-gray-200 hover:border-gray-300 transition-all duration-300"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </StaggerItem>
      </main>
    )
  }

  // Success state
  return (
    <main className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center px-4">
      <StaggerItem>
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
            <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">
            Gift Certificate Sent! 🎉
          </h1>
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            Your thoughtful gift has been delivered! The recipient will receive their digital certificate via email shortly.
          </p>

          <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">What Happens Next?</h2>
            <ul className="space-y-4 text-left">
              <li className="flex items-start gap-3">
                <svg className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="font-semibold text-gray-900">Email Delivery</p>
                  <p className="text-gray-600 text-sm">
                    The recipient will receive a beautiful digital certificate with your personal message
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="font-semibold text-gray-900">Easy Redemption</p>
                  <p className="text-gray-600 text-sm">
                    They can contact us anytime to schedule their cleaning service
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="font-semibold text-gray-900">Never Expires</p>
                  <p className="text-gray-600 text-sm">
                    No rush – the certificate can be used whenever they&apos;re ready
                  </p>
                </div>
              </li>
            </ul>
          </div>

          <div className="bg-blue-50 rounded-xl p-6 mb-8 border border-blue-100">
            <p className="text-sm text-blue-800">
              <strong>Receipt:</strong> A purchase confirmation has been sent to your email address.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/gift-certificate"
              className="px-8 py-4 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all duration-300"
            >
              Send Another Gift
            </Link>
            <Link
              href="/"
              className="px-8 py-4 bg-white text-gray-900 rounded-lg font-semibold border-2 border-gray-200 hover:border-gray-300 transition-all duration-300"
            >
              Back to Home
            </Link>
          </div>

          {/* Support footer */}
          <p className="mt-8 text-sm text-gray-500">
            Didn&apos;t receive the email? Check spam folder or contact{' '}
            <a href="mailto:gifts@impressyoucleaning.com" className="text-green-600 hover:underline">
              gifts@impressyoucleaning.com
            </a>
          </p>
        </div>
      </StaggerItem>
    </main>
  )
}

export default function GiftCertificateSuccess() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </main>
    }>
      <SuccessContent />
    </Suspense>
  )
}