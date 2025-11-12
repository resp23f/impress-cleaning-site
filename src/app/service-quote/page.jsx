'use client';

import { useState } from 'react';
import { useForm } from '@formspree/react';

export default function ServiceQuotePage() {
  const [state, handleSubmit] = useForm("https://formspree.io/f/xblzwdek");
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    serviceType: 'residential',
    address: '',
    frequency: 'one-time',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (state.succeeded) {
    return (
      <div className="min-h-screen bg-gray-50">
        <section className="py-20">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <div className="bg-white rounded-lg shadow-lg p-12">
              <div className="text-6xl mb-6">✓</div>
              <h1 className="text-4xl font-bold text-green-600 mb-4">
                Thank You!
              </h1>
              <p className="text-xl text-gray-700 mb-6">
                We have received your quote request for {formData.serviceType} cleaning services.
              </p>
              <p className="text-lg text-gray-600 mb-8">
                Our team will review your information and contact you within 24 hours with a custom quote.
              </p>
                  <a
              
                href="/"
                className="inline-block text-blue-600 hover:underline"
              >
                Back to Home
              </a>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">

      <section className="bg-[#1C294E]/90 text-white py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">Request a Free Quote</h1>
          <p className="font-manrope text-xl">Fill out the form below and we will get back to you within 24 hours with a custom cleaning quote</p>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
            
            {state.errors && state.errors.length > 0 && (
              <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                <p className="font-semibold">Oops! Something went wrong.</p>
                <p>Please try again or call us directly at (512) 555-0123</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div>
                <label className="block font-display text-gray-700 font-semibold mb-2">
                  Service Type <span className="text-red-600">*</span>
                </label>
                <select
                  name="serviceType"
                  value={formData.serviceType}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="residential">Residential Cleaning</option>
                  <option value="commercial">Commercial Cleaning</option>
                </select>
              </div>

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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="(512) 555-0123"
                  />
                </div>

                <div>
                  <label className="block font-display text-gray-700 font-semibold mb-2">
                    Cleaning Frequency <span className="text-red-600">*</span>
                  </label>
                  <select
                    name="frequency"
                    value={formData.frequency}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="one-time">One-Time Cleaning</option>
                    <option value="weekly">Weekly</option>
                    <option value="bi-weekly">Bi-Weekly</option>
                    <option value="monthly">Tri-weekly</option>
                    <option value="move-in">Move-in</option>
                    <option value="move-out">Move-out</option>
                    <option value="post-renovation">Deep-Cleaning</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="123 Main St, Georgetown, TX 78626"
                />
              </div>

              {formData.serviceType === 'commercial' && (
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Square Footage
                  </label>
                  <input
                    type="number"
                    name="squareFootage"
                    value={formData.squareFootage}
                    onChange={handleChange}
                    required
                    min="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="5000"
                  />
                </div>
              )}

              <div>
                <label className="block font-display text-gray-700 font-semibold mb-2">
                  Additional Details or Special Requests
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="4"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Tell us about any specific cleaning needs, areas of focus, pets, etc."
                />
              </div>

              <button
                type="submit"
                disabled={state.submitting}
                className="w-full bg-[#079447] font-display text-white font-bold py-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-lg"
              >
                {state.submitting ? 'Submitting...' : 'Request Free Quote'}
              </button>

              <p className="text-sm font-manrope text-gray-600 text-center">
                We respect your privacy. Your information will never be shared. No Spam. Ever.
              </p>
            </form>
          </div>

          <div className="mt-8 grid md:grid-cols-3 gap-6 text-center">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-3xl mb-2">⚡</div>
              <h3 className="font-semibold font-display mb-2">Fast Response</h3>
              <p className="text-gray-600 font-manrope text-sm">Get your quote within 24 hours or less</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-3xl mb-2">💰</div>
              <h3 className="font-semibold font-display mb-2">No Obligation.</h3>
              <p className="text-gray-600 font-manrope text-sm">Free quotes with no pressure</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-3xl mb-2">✓</div>
              <h3 className="font-semibold font-display mb-2">Trusted Service</h3>
              <p className="text-gray-600 font-manrope text-sm">Serving Georgetown since 2010</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}