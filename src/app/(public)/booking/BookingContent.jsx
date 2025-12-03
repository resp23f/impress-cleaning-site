'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, Clock, Sparkles, Shield, Phone, CheckCircle } from 'lucide-react'

export default function BookingContent() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    serviceType: 'residential',
    spaceSize: '',
    serviceLevel: 'basic',
    preferredDate: '',
    preferredTime: '',
    giftCertificate: '',
    specialRequests: '',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    // Clear error when user starts typing
    if (error) setError(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/booking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit booking')
      }

      // Redirect to confirmation page with just the booking ID (secure!)
      router.push(`/booking/confirmation?id=${data.bookingId}`)
    } catch (err) {
      console.error('Booking submission error:', err)
      setError(err.message || 'Something went wrong. Please try again or call us directly.')
      setIsSubmitting(false)
    }
  }

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#1C294E] via-[#253761] to-[#1C294E] text-white py-16 md:py-20 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
        </div>

        <div className="container mx-auto px-4 max-w-4xl relative">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold mb-4">
            Book Your Cleaning Service
          </h1>
          <p className="font-manrope text-lg md:text-xl text-gray-300">
            Fill out the form below to request your cleaning appointment. We&apos;ll confirm your booking and pricing within 24 hours.
          </p>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-10 md:py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-6 md:p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
                <p className="font-semibold">Oops! Something went wrong.</p>
                <p className="text-sm mt-1">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Contact Information */}
              <div className="space-y-6">
                <h2 className="text-xl md:text-2xl font-display font-bold text-gray-900 border-b-2 border-[#079447] pb-2">
                  Contact Information
                </h2>
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block font-display text-gray-700 font-semibold mb-2">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      maxLength={100}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#079447] focus:ring-4 focus:ring-green-100 transition-all outline-none font-manrope"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block font-display text-gray-700 font-semibold mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      maxLength={254}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#079447] focus:ring-4 focus:ring-green-100 transition-all outline-none font-manrope"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-display text-gray-700 font-semibold mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    maxLength={20}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#079447] focus:ring-4 focus:ring-green-100 transition-all outline-none font-manrope"
                    placeholder="(512) 555-0123"
                  />
                </div>
                <div>
                  <label className="block font-display text-gray-700 font-semibold mb-2">
                    Service Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    maxLength={300}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#079447] focus:ring-4 focus:ring-green-100 transition-all outline-none font-manrope"
                    placeholder="123 Main St, Georgetown, TX 78626"
                  />
                </div>
              </div>

              {/* Service Details */}
              <div className="space-y-6 pt-4">
                <h2 className="text-xl md:text-2xl font-display font-bold text-gray-900 border-b-2 border-[#079447] pb-2">
                  Service Details
                </h2>
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block font-display text-gray-700 font-semibold mb-2">
                      Service Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="serviceType"
                      value={formData.serviceType}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#079447] focus:ring-4 focus:ring-green-100 transition-all outline-none font-manrope bg-white"
                    >
                      <option value="residential">Residential</option>
                      <option value="commercial">Commercial</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-display text-gray-700 font-semibold mb-2">
                      {formData.serviceType === 'residential' ? 'Home Size' : 'Square Footage'}{' '}
                      <span className="text-red-500">*</span>
                    </label>
                    {formData.serviceType === 'residential' ? (
                      <select
                        name="spaceSize"
                        value={formData.spaceSize}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#079447] focus:ring-4 focus:ring-green-100 transition-all outline-none font-manrope bg-white"
                      >
                        <option value="">Select home size</option>
                        <option value="1-bed">1 Bedroom, 1 Bathroom</option>
                        <option value="2-bed">2 Bedrooms, 1-2 Bathrooms</option>
                        <option value="3-bed">3 Bedrooms, 2 Bathrooms</option>
                        <option value="4-bed">4 Bedrooms, 2-3 Bathrooms</option>
                        <option value="5-bed">5+ Bedrooms, 3+ Bathrooms</option>
                      </select>
                    ) : (
                      <input
                        type="number"
                        name="spaceSize"
                        value={formData.spaceSize}
                        onChange={handleChange}
                        required
                        min="1"
                        max="1000000"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#079447] focus:ring-4 focus:ring-green-100 transition-all outline-none font-manrope"
                        placeholder="5000 sq ft"
                      />
                    )}
                  </div>
                </div>
                <div>
                  <label className="block font-display text-gray-700 font-semibold mb-2">
                    Service Level <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="serviceLevel"
                    value={formData.serviceLevel}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#079447] focus:ring-4 focus:ring-green-100 transition-all outline-none font-manrope bg-white"
                  >
                    <option value="basic">Standard Clean</option>
                    <option value="deep">Deep Clean</option>
                    <option value="move">Move-In/Move-Out Clean</option>
                  </select>
                </div>
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block font-display text-gray-700 font-semibold mb-2">
                      Preferred Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="preferredDate"
                      value={formData.preferredDate}
                      onChange={handleChange}
                      required
                      min={today}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#079447] focus:ring-4 focus:ring-green-100 transition-all outline-none font-manrope"
                    />
                  </div>
                  <div>
                    <label className="block font-display text-gray-700 font-semibold mb-2">
                      Preferred Time <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="preferredTime"
                      value={formData.preferredTime}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#079447] focus:ring-4 focus:ring-green-100 transition-all outline-none font-manrope bg-white"
                    >
                      <option value="">Select time</option>
                      <option value="morning">Morning (8am - 12pm)</option>
                      <option value="afternoon">Afternoon (12pm - 4pm)</option>
                      <option value="evening">Evening (4pm - 7pm)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Optional Information */}
              <div className="space-y-6 pt-4">
                <h2 className="text-xl md:text-2xl font-display font-bold text-gray-900 border-b-2 border-[#079447] pb-2">
                  Optional Information
                </h2>
                <div>
                  <label className="block font-display text-gray-700 font-semibold mb-2">
                    Gift Certificate Code
                  </label>
                  <input
                    type="text"
                    name="giftCertificate"
                    value={formData.giftCertificate}
                    onChange={handleChange}
                    maxLength={50}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#079447] focus:ring-4 focus:ring-green-100 transition-all outline-none font-manrope"
                    placeholder="GIFT-XXXXXX-XXXX"
                  />
                  <p className="text-sm text-gray-500 mt-1.5 font-manrope">
                    Have a gift certificate? We&apos;ll apply it to your final invoice.
                  </p>
                </div>
                <div>
                  <label className="block font-display text-gray-700 font-semibold mb-2">
                    Special Requests or Notes
                  </label>
                  <textarea
                    name="specialRequests"
                    value={formData.specialRequests}
                    onChange={handleChange}
                    rows="4"
                    maxLength={1000}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#079447] focus:ring-4 focus:ring-green-100 transition-all outline-none font-manrope resize-none"
                    placeholder="Any specific areas of focus, pets, access instructions, or special requests..."
                  />
                  <p className="text-xs text-gray-400 mt-1 text-right">
                    {formData.specialRequests.length}/1000
                  </p>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-[#079447] to-[#08A855] font-display text-white font-bold py-4 rounded-xl hover:from-[#068a40] hover:to-[#079447] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-lg shadow-lg shadow-green-200 hover:shadow-xl hover:shadow-green-300"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Submitting Your Booking...
                  </span>
                ) : (
                  'Submit Booking Request'
                )}
              </button>

              <p className="text-sm font-manrope text-gray-500 text-center">
                By submitting this form, you agree to receive appointment confirmations and service
                updates. We respect your privacy and will never share your information.
              </p>
            </form>
          </div>

          {/* Trust Indicators */}
          <div className="mt-10 grid sm:grid-cols-3 gap-5">
            <div className="bg-white p-6 rounded-xl shadow-md shadow-gray-200/50 border border-gray-100 text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-green-100 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-[#079447]" />
              </div>
              <h3 className="font-semibold font-display mb-1 text-gray-900">Quick Confirmation</h3>
              <p className="text-gray-600 font-manrope text-sm">
                We&apos;ll review and confirm within 24 hours
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md shadow-gray-200/50 border border-gray-100 text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-green-100 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-[#079447]" />
              </div>
              <h3 className="font-semibold font-display mb-1 text-gray-900">Transparent Pricing</h3>
              <p className="text-gray-600 font-manrope text-sm">No hidden fees, clear quotes upfront</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md shadow-gray-200/50 border border-gray-100 text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-green-100 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-[#079447]" />
              </div>
              <h3 className="font-semibold font-display mb-1 text-gray-900">Quality Guaranteed</h3>
              <p className="text-gray-600 font-manrope text-sm">Professional service you can trust</p>
            </div>
          </div>

          {/* Prefer to call? */}
          <div className="mt-8 text-center">
            <p className="text-gray-600 font-manrope mb-2">Prefer to book over the phone?</p>
            <a
              href="tel:+15122775364"
              className="inline-flex items-center gap-2 text-[#079447] font-semibold hover:text-[#068a40] transition-colors"
            >
              <Phone className="w-5 h-5" />
              Call (512) 277-5364
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}