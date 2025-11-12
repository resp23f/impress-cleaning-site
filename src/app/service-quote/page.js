'use client';

import { useState } from 'react';
import { useForm } from '@formspree/react';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';

export default function ServiceQuotePage() {
  const [state, handleSubmit] = useForm("https://formspree.io/f/xblzwdek");
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    serviceType: 'residential',
    address: '',
    squareFootage: '',
    bedrooms: '',
    bathrooms: '',
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
      <main className="min-h-screen bg-gray-50">
        <Header />
        
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
              <div className="space-y-4">
                
                  href="tel:+15125550123"
                  className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                  Call Us Now: (512) 555-0123
                <br />
                
                  href="/"
                  className="inline-block text-blue-600 hover:underline"
                  Back to Home
              </div>
              </div>
          </div>
        </section>

        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      
      <section className="bg-blue-600 text-white py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Request a Free Quote</h1>
          <p className="text-xl">Fill out the form below and we will get back to you within 24 hours with a custom cleaning quote</p>
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
                <label className="block text-gray-700 font-semibold mb-2">
                  Service Type
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
                  <label className="block text-gray-700 font-semibold mb-2">
                    Full Name
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
                  <label className="block text-gray-700 font-semibold mb-2">
                    Email
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
                  <label className="block text-gray-700 font-semibold mb-2">
                    Phone Number
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
                  <label className="block text-gray-700 font-semibold mb-2">
                    Cleaning Frequency
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
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Service Address
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

              {formData.serviceType === 'residential' && (
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      Bedrooms
                    </label>
                    <input
                      type="number"
                      name="bedrooms"
                      value={formData.bedrooms}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="3"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      Bathrooms
                    </label>
                    <input
                      type="number"
                      name="bathrooms"
                      value={formData.bathrooms}
                      onChange={handleChange}
                      min="0"
                      step="0.5"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="2"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      Square Footage
                    </label>
                    <input
                      type="number"
                      name="squareFootage"
                      value={formData.squareFootage}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="2000"
                    />
                  </div>
                </div>
              )}

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
                <label className="block text-gray-700 font-semibold mb-2">
                  Additional Details or Special Requests
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="4"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Tell us about any specific cleaning needs, areas of focus, pets, move-in/move-out cleaning, etc."
                />
              </div>

              <button
                type="submit"
                disabled={state.submitting}
                className="w-full bg-blue-600 text-white font-semibold py-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-lg"
              >
                {state.submitting ? 'Submitting...' : 'Request Free Quote'}
              </button>

              <p className="text-sm text-gray-600 text-center">
                We respect your privacy. Your information will never be shared.
              </p>
            </form>
          </div>

          <div className="mt-8 grid md:grid-cols-3 gap-6 text-center">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-3xl mb-2">⚡</div>
              <h3 className="font-semibold mb-2">Fast Response</h3>
              <p className="text-gray-600 text-sm">Get your quote within 24 hours</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-3xl mb-2">💰</div>
              <h3 className="font-semibold mb-2">No Obligation</h3>
              <p className="text-gray-600 text-sm">Free quotes with no pressure</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-3xl mb-2">✓</div>
              <h3 className="font-semibold mb-2">Trusted Service</h3>
              <p className="text-gray-600 text-sm">Serving Georgetown since 2020</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
