'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function BookingPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

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
    specialRequests: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/booking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit booking');
      }

      // Redirect to confirmation page with booking data
      const bookingData = encodeURIComponent(JSON.stringify(formData));
      router.push(`/booking/confirmation?data=${bookingData}`);
    } catch (err) {
      setError('Something went wrong. Please try again or call us directly.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-[#1C294E] text-white py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
            Book Your Cleaning Service
          </h1>
          <p className="font-manrope text-xl">
            Fill out the form below to request your cleaning appointment. We'll confirm your booking and final pricing within 24 hours.
          </p>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
            
            {error && (
              <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                <p className="font-semibold">Oops! Something went wrong.</p>
                <p>{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Contact Information */}
              <div className="space-y-6">
                <h2 className="text-2xl font-display font-bold text-navy border-b-2 border-green pb-2">
                  Contact Information
                </h2>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block font-display text-gray-700 font-semibold mb-2">
                      Full Name <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green focus:border-transparent font-manrope"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label className="block font-display text-gray-700 font-semibold mb-2">
                      Email <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green focus:border-transparent font-manrope"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-display text-gray-700 font-semibold mb-2">
                    Phone Number <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green focus:border-transparent font-manrope"
                    placeholder="(512) 555-0123"
                  />
                </div>

                <div>
                  <label className="block font-display text-gray-700 font-semibold mb-2">
                    Service Address <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green focus:border-transparent font-manrope"
                    placeholder="123 Main St, Georgetown, TX 78626"
                  />
                </div>
              </div>

              {/* Service Details */}
              <div className="space-y-6 pt-6">
                <h2 className="text-2xl font-display font-bold text-navy border-b-2 border-green pb-2">
                  Service Details
                </h2>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block font-display text-gray-700 font-semibold mb-2">
                      Service Type <span className="text-red-600">*</span>
                    </label>
                    <select
                      name="serviceType"
                      value={formData.serviceType}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green focus:border-transparent font-manrope"
                    >
                      <option value="residential">Residential</option>
                      <option value="commercial">Commercial</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-display text-gray-700 font-semibold mb-2">
                      {formData.serviceType === 'residential' ? 'Home Size' : 'Square Footage'} <span className="text-red-600">*</span>
                    </label>
                    {formData.serviceType === 'residential' ? (
                      <select
                        name="spaceSize"
                        value={formData.spaceSize}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green focus:border-transparent font-manrope"
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
                        min="0"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green focus:border-transparent font-manrope"
                        placeholder="5000 sq ft"
                      />
                    )}
                  </div>
                </div>

                <div>
                  <label className="block font-display text-gray-700 font-semibold mb-2">
                    Service Level <span className="text-red-600">*</span>
                  </label>
                  <select
                    name="serviceLevel"
                    value={formData.serviceLevel}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green focus:border-transparent font-manrope"
                  >
                    <option value="basic">Basic Clean</option>
                    <option value="deep">Deep Clean</option>
                    <option value="move">Move-In/Move-Out Clean</option>
                  </select>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block font-display text-gray-700 font-semibold mb-2">
                      Preferred Date <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="date"
                      name="preferredDate"
                      value={formData.preferredDate}
                      onChange={handleChange}
                      required
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green focus:border-transparent font-manrope"
                    />
                  </div>

                  <div>
                    <label className="block font-display text-gray-700 font-semibold mb-2">
                      Preferred Time <span className="text-red-600">*</span>
                    </label>
                    <select
                      name="preferredTime"
                      value={formData.preferredTime}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green focus:border-transparent font-manrope"
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
              <div className="space-y-6 pt-6">
                <h2 className="text-2xl font-display font-bold text-navy border-b-2 border-green pb-2">
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green focus:border-transparent font-manrope"
                    placeholder="Enter your gift certificate code"
                  />
                  <p className="text-sm text-gray-500 mt-1 font-manrope">
                    If you have a gift certificate, we'll apply it to your final invoice
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green focus:border-transparent font-manrope"
                    placeholder="Any specific areas of focus, pets, access instructions, or special requests..."
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#079447] font-display text-white font-bold py-4 rounded-lg hover:bg-[#08A855] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-lg shadow-lg hover:shadow-xl"
              >
                {isSubmitting ? 'Submitting Your Booking...' : 'Submit Booking Request'}
              </button>

              <p className="text-sm font-manrope text-gray-600 text-center">
                By submitting this form, you agree to receive appointment confirmations and service updates. 
                We respect your privacy and will never share your information.
              </p>
            </form>
          </div>

          {/* Trust Indicators */}
          <div className="mt-12 grid md:grid-cols-3 gap-6 text-center">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-4xl mb-3">📅</div>
              <h3 className="font-semibold font-display mb-2 text-lg">Quick Confirmation</h3>
              <p className="text-gray-600 font-manrope text-sm">We'll review and confirm within 24 hours</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-4xl mb-3">💰</div>
              <h3 className="font-semibold font-display mb-2 text-lg">Transparent Pricing</h3>
              <p className="text-gray-600 font-manrope text-sm">No hidden fees, clear estimates upfront</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-4xl mb-3">⭐</div>
              <h3 className="font-semibold font-display mb-2 text-lg">Quality Guaranteed</h3>
              <p className="text-gray-600 font-manrope text-sm">Professional service you can trust</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}