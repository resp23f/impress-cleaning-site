'use client'
import { useState } from 'react'
import { useForm } from '@formspree/react'
import { useRecaptcha } from '@/hooks/useRecaptcha'
import { Phone, Mail, Clock, Shield, CheckCircle, Sparkles } from 'lucide-react'

export default function ServiceQuoteContent() {
  const [state, handleFormspree] = useForm("xblzwdek")
  const { executeRecaptcha, isLoading: recaptchaLoading } = useRecaptcha()
  const [submitting, setSubmitting] = useState(false)
  const [recaptchaError, setRecaptchaError] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    serviceType: 'residential',
    address: '',
    frequency: 'one-time',
    squareFootage: '',
    message: ''
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setRecaptchaError('')
    setSubmitting(true)

    try {
      // Verify reCAPTCHA
      const recaptchaToken = await executeRecaptcha('quote_form')
      
      if (!recaptchaToken) {
        setRecaptchaError('reCAPTCHA verification failed. Please try again.')
        setSubmitting(false)
        return
      }

      // Verify token with backend
      const verifyRes = await fetch('/api/verify-recaptcha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: recaptchaToken, action: 'quote_form' })
      })

      const verifyData = await verifyRes.json()

      if (!verifyData.success) {
        setRecaptchaError('Security verification failed. Please try again.')
        setSubmitting(false)
        return
      }

      // Submit to Formspree
      await handleFormspree(e)
    } catch (error) {
      console.error('Form submission error:', error)
      setRecaptchaError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (state.succeeded) {
    return (
      <div className="min-h-screen bg-gray-50">
        <section className="py-20">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-[#1C294E] mb-4">
                Thank You!
              </h1>
              <p className="text-xl text-gray-700 mb-2">
                We&apos;ve received your {formData.serviceType} cleaning quote request.
              </p>
              <p className="text-lg text-gray-600 mb-8">
                Our team will review your information and contact you within 24 hours with a custom quote.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/"
                  className="inline-flex items-center justify-center px-6 py-3 bg-[#079447] text-white font-semibold rounded-lg hover:bg-[#067a3b] transition-colors"
                >
                  Back to Home
                </a>
                <a
                  href="tel:+15122775364"
                  className="inline-flex items-center justify-center px-6 py-3 border-2 border-[#1C294E] text-[#1C294E] font-semibold rounded-lg hover:bg-[#1C294E] hover:text-white transition-colors"
                >
                  <Phone className="w-5 h-5 mr-2" />
                  Call Us Now
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-[#1C294E] text-white py-16 md:py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">
            Request a Free Quote
          </h1>
          <p className="text-lg md:text-xl text-gray-300">
            Fill out the form below and we&apos;ll get back to you within 24 hours with a custom cleaning quote.
          </p>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-10">
            {/* Error Messages */}
            {(state.errors && state.errors.length > 0) && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                <p className="font-semibold">Oops! Something went wrong.</p>
                <p>Please try again or call us directly at{' '}
                  <a href="tel:+15122775364" className="underline font-semibold">(512) 277-5364</a>
                </p>
              </div>
            )}

            {recaptchaError && (
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg">
                <p>{recaptchaError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Service Type */}
              <div>
                <label htmlFor="quote-service-type" className="block text-gray-700 font-semibold mb-2">
                  Service Type <span className="text-red-500">*</span>
                </label>
                <select
                  id="quote-service-type"
                  name="serviceType"
                  value={formData.serviceType}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#079447] focus:border-transparent transition-shadow"
                >
                  <option value="residential">Residential Cleaning</option>
                  <option value="commercial">Commercial Cleaning</option>
                </select>
              </div>

              {/* Name & Email */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="quote-name" className="block text-gray-700 font-semibold mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="quote-name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    maxLength={100}
                    autoComplete="name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#079447] focus:border-transparent transition-shadow"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label htmlFor="quote-email" className="block text-gray-700 font-semibold mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="quote-email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    maxLength={254}
                    autoComplete="email"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#079447] focus:border-transparent transition-shadow"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              {/* Phone & Frequency */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="quote-phone" className="block text-gray-700 font-semibold mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="quote-phone"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    maxLength={20}
                    autoComplete="tel"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#079447] focus:border-transparent transition-shadow"
                    placeholder="(512) 555-0123"
                  />
                </div>
                <div>
                  <label htmlFor="quote-frequency" className="block text-gray-700 font-semibold mb-2">
                    Cleaning Frequency <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="quote-frequency"
                    name="frequency"
                    value={formData.frequency}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#079447] focus:border-transparent transition-shadow"
                  >
                    <option value="one-time">One-Time Cleaning</option>
                    <option value="weekly">Weekly</option>
                    <option value="bi-weekly">Bi-Weekly</option>
                    <option value="tri-weekly">Tri-Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="move-in">Move-In</option>
                    <option value="move-out">Move-Out</option>
                    <option value="deep-cleaning">Deep Cleaning</option>
                  </select>
                </div>
              </div>

              {/* Address */}
              <div>
                <label htmlFor="quote-address" className="block text-gray-700 font-semibold mb-2">
                  Service Address <span className="text-red-500">*</span>
                </label>
                <input
                  id="quote-address"
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  maxLength={200}
                  autoComplete="street-address"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#079447] focus:border-transparent transition-shadow"
                  placeholder="123 Main St, Georgetown, TX 78626"
                />
              </div>

              {/* Square Footage (Commercial only) */}
              {formData.serviceType === 'commercial' && (
                <div>
                  <label htmlFor="quote-square-footage" className="block text-gray-700 font-semibold mb-2">
                    Square Footage <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="quote-square-footage"
                    type="number"
                    name="squareFootage"
                    value={formData.squareFootage}
                    onChange={handleChange}
                    required
                    min="1"
                    max="1000000"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#079447] focus:border-transparent transition-shadow"
                    placeholder="5000"
                  />
                </div>
              )}

              {/* Message */}
              <div>
                <label htmlFor="quote-message" className="block text-gray-700 font-semibold mb-2">
                  Additional Details or Special Requests
                </label>
                <textarea
                  id="quote-message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="4"
                  maxLength={2000}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#079447] focus:border-transparent transition-shadow resize-none"
                  placeholder="Tell us about any specific cleaning needs, areas of focus, pets, allergies, access instructions, etc."
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting || state.submitting || recaptchaLoading}
                className="w-full bg-[#079447] text-white font-bold py-4 rounded-lg hover:bg-[#067a3b] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-lg flex items-center justify-center gap-2"
              >
                {(submitting || state.submitting) ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Submitting...
                  </>
                ) : (
                  'Request Free Quote'
                )}
              </button>

              {/* Privacy Notice */}
              <p className="text-sm text-gray-500 text-center">
                We respect your privacy. Your information will never be shared or sold.
              </p>

              {/* reCAPTCHA Badge Notice */}
              <p className="text-xs text-gray-400 text-center">
                This site is protected by reCAPTCHA and the Google{' '}
                <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="underline">
                  Privacy Policy
                </a>{' '}
                and{' '}
                <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" className="underline">
                  Terms of Service
                </a>{' '}
                apply.
              </p>
            </form>
          </div>

          {/* Trust Badges */}
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-md text-center">
              <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="font-bold text-[#1C294E] mb-2">Fast Response</h3>
              <p className="text-gray-600 text-sm">Get your quote within 24 hours</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md text-center">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="font-bold text-[#1C294E] mb-2">No Obligation</h3>
              <p className="text-gray-600 text-sm">Free quotes with no pressure</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md text-center">
              <div className="w-14 h-14 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-7 h-7 text-yellow-600" />
              </div>
              <h3 className="font-bold text-[#1C294E] mb-2">Trusted Service</h3>
              <p className="text-gray-600 text-sm">Serving Central Texas since 1998</p>
            </div>
          </div>

          {/* Contact Info */}
          <div className="mt-12 bg-[#1C294E] rounded-2xl p-6 md:p-8 text-white text-center">
            <h2 className="text-2xl font-bold mb-4">Prefer to Talk?</h2>
            <p className="text-gray-300 mb-6">
              Call us directly and speak with a real person.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="tel:+15122775364"
                className="inline-flex items-center justify-center px-6 py-3 bg-white text-[#1C294E] font-semibold rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Phone className="w-5 h-5 mr-2" />
                (512) 277-5364
              </a>
              <a
                href="mailto:info@impressyoucleaning.com"
                className="inline-flex items-center justify-center px-6 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-[#1C294E] transition-colors"
              >
                <Mail className="w-5 h-5 mr-2" />
                Email Us
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}