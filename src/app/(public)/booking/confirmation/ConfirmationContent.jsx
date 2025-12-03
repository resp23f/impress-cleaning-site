'use client'
import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { CheckCircle, Mail, Home, Clock, MapPin, FileText, Gift, Phone, AlertCircle } from 'lucide-react'

function ConfirmationContent() {
  const searchParams = useSearchParams()
  const bookingId = searchParams.get('id')
  
  const [bookingData, setBookingData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchBooking() {
      // Check for legacy URL format (redirect from old system)
      const legacyData = searchParams.get('data')
      if (legacyData) {
        setError('invalid_link')
        setLoading(false)
        return
      }

      if (!bookingId) {
        setError('missing_id')
        setLoading(false)
        return
      }

      // Validate UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      if (!uuidRegex.test(bookingId)) {
        setError('invalid_id')
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/booking/${bookingId}`)
        const data = await response.json()

        if (!response.ok) {
          setError(data.error === 'Booking not found' ? 'not_found' : 'fetch_error')
          setLoading(false)
          return
        }

        setBookingData(data.booking)
      } catch (err) {
        console.error('Error fetching booking:', err)
        setError('fetch_error')
      } finally {
        setLoading(false)
      }
    }

    fetchBooking()
  }, [bookingId, searchParams])

  const formatServiceLevel = (level) => {
    const levels = {
      basic: 'Standard Clean',
      deep: 'Deep Clean',
      move: 'Move-In/Move-Out Clean',
    }
    return levels[level] || level || 'Not specified'
  }

  const formatTime = (time) => {
    const times = {
      morning: 'Morning (8am - 12pm)',
      afternoon: 'Afternoon (12pm - 4pm)',
      evening: 'Evening (4pm - 7pm)',
    }
    return times[time] || time || 'Not specified'
  }

  const formatServiceType = (type) => {
    const types = {
      residential: 'Residential',
      commercial: 'Commercial',
    }
    return types[type] || type || 'Not specified'
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-[#079447] mx-auto mb-4"></div>
          <p className="text-lg font-manrope text-gray-600">Loading your confirmation...</p>
        </div>
      </div>
    )
  }

  // Error states
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-display font-bold text-gray-900 mb-3">
            {error === 'not_found' ? 'Booking Not Found' : 'Invalid Link'}
          </h1>
          <p className="text-gray-600 font-manrope mb-6">
            {error === 'not_found'
              ? "We couldn't find a booking with this ID. It may have been removed or the link is incorrect."
              : error === 'invalid_link'
              ? 'This confirmation link is outdated. Please check your email for an updated link.'
              : "The booking ID is invalid or missing. Please check your email for the correct link."}
          </p>
          <div className="space-y-3">
            <Link
              href="/booking"
              className="block w-full px-6 py-3 bg-[#079447] text-white rounded-xl font-semibold hover:bg-[#068a40] transition-colors"
            >
              Book a New Cleaning
            </Link>
            <Link
              href="/"
              className="block w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
            >
              Back to Home
            </Link>
          </div>
          <p className="text-sm text-gray-500 mt-6">
            Need help?{' '}
            <a href="tel:+15122775364" className="text-[#079447] font-medium">
              Call (512) 277-5364
            </a>
          </p>
        </div>
      </div>
    )
  }

  // Success state - show booking details
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#079447] via-[#08A855] to-[#06803d] text-white py-16 md:py-20 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
        </div>

        <div className="container mx-auto px-4 max-w-4xl text-center relative">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 md:w-24 md:h-24 bg-white/20 rounded-full backdrop-blur-sm">
              <CheckCircle className="w-12 h-12 md:w-14 md:h-14 text-white" strokeWidth={1.5} />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold mb-4">
            Booking Request Received!
          </h1>
          <p className="font-manrope text-lg md:text-xl text-green-50">
            Thank you for choosing Impress Cleaning Services
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8 md:py-12 pb-16">
        <div className="container mx-auto px-4 max-w-4xl space-y-6 md:space-y-8">
          {/* What Happens Next */}
          <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 p-6 md:p-8">
            <h2 className="text-2xl md:text-3xl font-display font-bold text-gray-900 mb-6">
              What Happens Next
            </h2>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-[#079447] to-[#08A855] text-white rounded-full flex items-center justify-center font-bold text-lg shadow-md">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="font-display font-bold text-lg text-gray-900 mb-1">
                    We Review Your Request
                  </h3>
                  <p className="text-gray-600 font-manrope text-sm md:text-base">
                    Our team will carefully review your booking details and prepare a personalized
                    quote based on your specific needs.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-[#079447] to-[#08A855] text-white rounded-full flex items-center justify-center font-bold text-lg shadow-md">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="font-display font-bold text-lg text-gray-900 mb-1">
                    You Receive Confirmation
                  </h3>
                  <p className="text-gray-600 font-manrope text-sm md:text-base">
                    Within 24 hours, we&apos;ll send you an email with your confirmed appointment
                    time and detailed pricing.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-[#079447] to-[#08A855] text-white rounded-full flex items-center justify-center font-bold text-lg shadow-md">
                  3
                </div>
                <div className="flex-1">
                  <h3 className="font-display font-bold text-lg text-gray-900 mb-1">
                    We Clean Your Space
                  </h3>
                  <p className="text-gray-600 font-manrope text-sm md:text-base">
                    Our professional team will arrive on time and deliver exceptional cleaning
                    service you can count on.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Details */}
          <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 p-6 md:p-8">
            <h2 className="text-2xl md:text-3xl font-display font-bold text-gray-900 mb-6">
              Your Booking Details
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Contact Information */}
              <div className="space-y-3">
                <h3 className="font-display font-semibold text-gray-900 text-lg flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                    <Mail className="w-4 h-4 text-[#079447]" />
                  </div>
                  Contact Information
                </h3>
                <div className="space-y-2 text-gray-700 font-manrope ml-10 text-sm md:text-base">
                  <p>
                    <span className="font-medium text-gray-500">Name:</span>{' '}
                    <span className="text-gray-900">{bookingData?.name || 'Not provided'}</span>
                  </p>
                  <p>
                    <span className="font-medium text-gray-500">Email:</span>{' '}
                    <span className="text-gray-900">{bookingData?.email || 'Not provided'}</span>
                  </p>
                  <p>
                    <span className="font-medium text-gray-500">Phone:</span>{' '}
                    <span className="text-gray-900">{bookingData?.phone || 'Not provided'}</span>
                  </p>
                </div>
              </div>

              {/* Service Location */}
              <div className="space-y-3">
                <h3 className="font-display font-semibold text-gray-900 text-lg flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-[#079447]" />
                  </div>
                  Service Location
                </h3>
                <p className="text-gray-700 font-manrope ml-10 text-sm md:text-base">
                  {bookingData?.address || 'Not provided'}
                </p>
              </div>

              {/* Service Details */}
              <div className="space-y-3">
                <h3 className="font-display font-semibold text-gray-900 text-lg flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-[#079447]" />
                  </div>
                  Service Details
                </h3>
                <div className="space-y-2 text-gray-700 font-manrope ml-10 text-sm md:text-base">
                  <p>
                    <span className="font-medium text-gray-500">Type:</span>{' '}
                    <span className="text-gray-900">
                      {formatServiceType(bookingData?.serviceType)}
                    </span>
                  </p>
                  <p>
                    <span className="font-medium text-gray-500">Level:</span>{' '}
                    <span className="text-gray-900">
                      {formatServiceLevel(bookingData?.serviceLevel)}
                    </span>
                  </p>
                  <p>
                    <span className="font-medium text-gray-500">Size:</span>{' '}
                    <span className="text-gray-900">
                      {bookingData?.spaceSize || 'Not specified'}
                    </span>
                  </p>
                </div>
              </div>

              {/* Preferred Schedule */}
              <div className="space-y-3">
                <h3 className="font-display font-semibold text-gray-900 text-lg flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-[#079447]" />
                  </div>
                  Preferred Schedule
                </h3>
                <div className="space-y-2 text-gray-700 font-manrope ml-10 text-sm md:text-base">
                  <p>
                    <span className="font-medium text-gray-500">Date:</span>{' '}
                    <span className="text-gray-900">
                      {bookingData?.preferredDate || 'Flexible'}
                    </span>
                  </p>
                  <p>
                    <span className="font-medium text-gray-500">Time:</span>{' '}
                    <span className="text-gray-900">
                      {formatTime(bookingData?.preferredTime)}
                    </span>
                  </p>
                </div>
              </div>

              {/* Gift Certificate */}
              {bookingData?.giftCertificate && (
                <div className="md:col-span-2 space-y-3">
                  <h3 className="font-display font-semibold text-gray-900 text-lg flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                      <Gift className="w-4 h-4 text-amber-600" />
                    </div>
                    Gift Certificate Applied
                  </h3>
                  <p className="text-gray-700 font-manrope ml-10 text-sm md:text-base">
                    Code:{' '}
                    <span className="font-mono font-bold bg-amber-50 text-amber-700 px-3 py-1 rounded-lg border border-amber-200">
                      {bookingData.giftCertificate}
                    </span>
                  </p>
                </div>
              )}

              {/* Special Requests */}
              {bookingData?.specialRequests && (
                <div className="md:col-span-2 space-y-3">
                  <h3 className="font-display font-semibold text-gray-900 text-lg flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                      <FileText className="w-4 h-4 text-blue-600" />
                    </div>
                    Special Requests
                  </h3>
                  <p className="text-gray-700 font-manrope ml-10 text-sm md:text-base bg-gray-50 p-4 rounded-lg">
                    {bookingData.specialRequests}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Contact CTA */}
          <div className="bg-gradient-to-br from-[#1C294E] to-[#2a3a6e] text-white rounded-2xl shadow-xl p-6 md:p-8 text-center relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
            </div>

            <div className="relative">
              <h2 className="text-xl md:text-2xl font-display font-bold mb-3">
                Questions About Your Booking?
              </h2>
              <p className="font-manrope mb-6 text-sm md:text-base text-gray-300">
                Our team is here to help! Feel free to reach out anytime.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="tel:+15122775364"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#079447] hover:bg-[#08A855] rounded-xl font-manrope font-semibold transition-all duration-200 hover:scale-105 shadow-lg"
                >
                  <Phone className="w-5 h-5" />
                  (512) 277-5364
                </a>
                <a
                  href="mailto:info@impressyoucleaning.com"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl font-manrope font-semibold transition-all duration-200 hover:scale-105"
                >
                  <Mail className="w-5 h-5" />
                  Email Us
                </a>
              </div>
              <div className="mt-6 pt-6 border-t border-white/10">
                <Link
                  href="/"
                  className="inline-flex items-center justify-center gap-2 text-gray-300 hover:text-white font-manrope font-medium transition-colors"
                >
                  <Home className="w-4 h-4" />
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default function ConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-[#079447] mx-auto mb-4"></div>
            <p className="text-lg font-manrope text-gray-600">Loading your confirmation...</p>
          </div>
        </div>
      }
    >
      <ConfirmationContent />
    </Suspense>
  )
}