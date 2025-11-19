'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const dataParam = searchParams.get('data');
  
  let bookingData = {};
  if (dataParam) {
    try {
      bookingData = JSON.parse(decodeURIComponent(dataParam));
    } catch (e) {
      console.error('Error parsing booking data:', e);
    }
  }

  // Calculate estimated price
  const getEstimatedPrice = () => {
    const { serviceType, serviceLevel } = bookingData;

    if (serviceType === 'commercial') {
      return 'Starting at $300';
    }

    if (serviceType === 'residential') {
      if (serviceLevel === 'basic') {
        return 'Starting at $150';
      } else if (serviceLevel === 'deep') {
        return 'Starting at $325';
      } else if (serviceLevel === 'move') {
        return 'Starting at $400';
      }
    }

    return 'Price will be confirmed by email';
  };

  const formatServiceLevel = (level) => {
    const levels = {
      'basic': 'Basic Clean',
      'deep': 'Deep Clean',
      'move': 'Move-In/Move-Out Clean'
    };
    return levels[level] || level;
  };

  const formatTime = (time) => {
    const times = {
      'morning': 'Morning (8am - 12pm)',
      'afternoon': 'Afternoon (12pm - 4pm)',
      'evening': 'Evening (4pm - 7pm)'
    };
    return times[time] || time;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Success Header */}
      <section className="bg-gradient-to-r from-[#079447] to-[#08A855] text-white py-16">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full text-green text-5xl">
              ✓
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
            Booking Request Received!
          </h1>
          <p className="font-manrope text-xl">
            Thank you for choosing Impress Cleaning Services
          </p>
        </div>
      </section>

      {/* Confirmation Details */}
      <section className="py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          
          {/* Estimated Price Card */}
          <div className="bg-gradient-to-br from-green to-[#08A855] text-white rounded-lg shadow-xl p-8 mb-8 text-center">
            <h2 className="text-2xl font-display font-bold mb-3">Estimated Price Range</h2>
            <div className="text-5xl font-bold mb-3">{getEstimatedPrice()}</div>
            <p className="font-manrope text-lg opacity-90">
              {bookingData.giftCertificate ? 
                '* Gift certificate will be applied to your final invoice' : 
                '* Final pricing will be confirmed within 24 hours'
              }
            </p>
          </div>

          {/* What Happens Next */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-3xl font-display font-bold text-navy mb-6 border-b-2 border-green pb-3">
              What Happens Next?
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-green text-white rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg mb-1">We Review Your Request</h3>
                  <p className="text-gray-600 font-manrope">
                    Our team will carefully review your booking details and calculate the final pricing based on your specific needs.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-green text-white rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg mb-1">You Receive Confirmation</h3>
                  <p className="text-gray-600 font-manrope">
                    Within 24 hours, we'll send you an email with your confirmed appointment time and final pricing.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-green text-white rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg mb-1">We Clean Your Space</h3>
                  <p className="text-gray-600 font-manrope">
                    Our professional team will arrive on time and deliver exceptional cleaning service.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Details Summary */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-3xl font-display font-bold text-navy mb-6 border-b-2 border-green pb-3">
              Your Booking Details
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-display font-semibold text-gray-700 mb-2">Contact Information</h3>
                <div className="space-y-1 text-gray-600 font-manrope">
                  <p><strong>Name:</strong> {bookingData.name}</p>
                  <p><strong>Email:</strong> {bookingData.email}</p>
                  <p><strong>Phone:</strong> {bookingData.phone}</p>
                </div>
              </div>
              
              <div>
                <h3 className="font-display font-semibold text-gray-700 mb-2">Service Location</h3>
                <p className="text-gray-600 font-manrope">{bookingData.address}</p>
              </div>

              <div>
                <h3 className="font-display font-semibold text-gray-700 mb-2">Service Details</h3>
                <div className="space-y-1 text-gray-600 font-manrope">
                  <p><strong>Type:</strong> {bookingData.serviceType === 'residential' ? 'Residential' : 'Commercial'}</p>
                  <p><strong>Level:</strong> {formatServiceLevel(bookingData.serviceLevel)}</p>
                  <p><strong>Size:</strong> {bookingData.spaceSize}</p>
                </div>
              </div>

              <div>
                <h3 className="font-display font-semibold text-gray-700 mb-2">Preferred Schedule</h3>
                <div className="space-y-1 text-gray-600 font-manrope">
                  <p><strong>Date:</strong> {bookingData.preferredDate}</p>
                  <p><strong>Time:</strong> {formatTime(bookingData.preferredTime)}</p>
                </div>
              </div>

              {bookingData.giftCertificate && (
                <div className="md:col-span-2">
                  <h3 className="font-display font-semibold text-gray-700 mb-2">Gift Certificate</h3>
                  <p className="text-gray-600 font-manrope">
                    Code: <span className="font-bold">{bookingData.giftCertificate}</span>
                  </p>
                </div>
              )}

              {bookingData.specialRequests && (
                <div className="md:col-span-2">
                  <h3 className="font-display font-semibold text-gray-700 mb-2">Special Requests</h3>
                  <p className="text-gray-600 font-manrope">{bookingData.specialRequests}</p>
                </div>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-navy text-white rounded-lg shadow-lg p-8 text-center">
            <h2 className="text-2xl font-display font-bold mb-4">Questions About Your Booking?</h2>
            <p className="font-manrope mb-6">
              Our team is here to help! Feel free to reach out anytime.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:booking@impressyoucleaning.com"
                className="inline-flex items-center justify-center px-6 py-3 bg-green hover:bg-[#08A855] rounded-lg font-manrope font-semibold transition-colors"
              >
                📧 Email Us
              </a>
              <Link
                href="/"
                className="inline-flex items-center justify-center px-6 py-3 bg-white text-navy hover:bg-gray-100 rounded-lg font-manrope font-semibold transition-colors"
              >
                🏠 Back to Home
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-xl font-manrope">Loading your confirmation...</p>
        </div>
      </div>
    }>
      <ConfirmationContent />
    </Suspense>
  );
}