'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import { CheckCircle, Mail, Home, Clock, MapPin, FileText, Gift } from 'lucide-react';

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
    <div className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-r from-[#079447] to-[#08A855] text-white py-16 md:py-20">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <div className="mb-6">
            <CheckCircle className="inline-block w-20 h-20 md:w-24 md:h-24" strokeWidth={1.5} />
          </div>
          <h1 className="text-3xl md:text-5xl font-display font-bold mb-4">
            Booking Request Received
          </h1>
          <p className="font-manrope text-lg md:text-xl opacity-95">
            Thank you for choosing Impress Cleaning Services
          </p>
        </div>
      </section>
    

      <section className="py-8 md:py-12 pb-16">
        <div className="container mx-auto px-4 max-w-4xl space-y-6 md:space-y-8">
          
          <div className="bg-gradient-to-br from-[#079447] to-[#08A855] text-white rounded-2xl shadow-xl p-6 md:p-8 text-center">
            <h2 className="text-xl md:text-2xl font-display font-bold mb-3">Estimated Price Range</h2>
            <div className="text-4xl md:text-5xl font-bold mb-3">{getEstimatedPrice()}</div>
            <p className="font-manrope text-sm md:text-base opacity-90">
              {bookingData.giftCertificate ? 
                'Gift certificate will be applied to your final invoice' : 
                'Final pricing will be confirmed within 24 hours'
              }
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
            <h2 className="text-2xl md:text-3xl font-display font-bold text-navy mb-6">
              What Happens Next
            </h2>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-[#079447] text-white rounded-full flex items-center justify-center font-bold text-lg">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="font-display font-bold text-lg mb-1">We Review Your Request</h3>
                  <p className="text-gray-600 font-manrope text-sm md:text-base">
                    Our team will carefully review your booking details and calculate the final pricing based on your specific needs.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-[#079447] text-white rounded-full flex items-center justify-center font-bold text-lg">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="font-display font-bold text-lg mb-1">You Receive Confirmation</h3>
                  <p className="text-gray-600 font-manrope text-sm md:text-base">
                    Within 24 hours, we will send you an email with your confirmed appointment time and final pricing.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-[#079447] text-white rounded-full flex items-center justify-center font-bold text-lg">
                  3
                </div>
                <div className="flex-1">
                  <h3 className="font-display font-bold text-lg mb-1">We Clean Your Space</h3>
                  <p className="text-gray-600 font-manrope text-sm md:text-base">
                    Our professional team will arrive on time and deliver exceptional cleaning service.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
            <h2 className="text-2xl md:text-3xl font-display font-bold text-navy mb-6">
              Your Booking Details
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h3 className="font-display font-semibold text-gray-900 text-lg flex items-center gap-2">
                  <Mail className="w-5 h-5 text-[#079447]" />
                  Contact Information
                </h3>
                <div className="space-y-2 text-gray-700 font-manrope ml-7 text-sm md:text-base">
                  <p><span className="font-semibold">Name:</span> {bookingData.name}</p>
                  <p><span className="font-semibold">Email:</span> {bookingData.email}</p>
                  <p><span className="font-semibold">Phone:</span> {bookingData.phone}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <h3 className="font-display font-semibold text-gray-900 text-lg flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[#079447]" />
                  Service Location
                </h3>
                <p className="text-gray-700 font-manrope ml-7 text-sm md:text-base">{bookingData.address}</p>
              </div>

              <div className="space-y-3">
                <h3 className="font-display font-semibold text-gray-900 text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#079447]" />
                  Service Details
                </h3>
                <div className="space-y-2 text-gray-700 font-manrope ml-7 text-sm md:text-base">
                  <p><span className="font-semibold">Type:</span> {bookingData.serviceType === 'residential' ? 'Residential' : 'Commercial'}</p>
                  <p><span className="font-semibold">Level:</span> {formatServiceLevel(bookingData.serviceLevel)}</p>
                  <p><span className="font-semibold">Size:</span> {bookingData.spaceSize}</p>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-display font-semibold text-gray-900 text-lg flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#079447]" />
                  Preferred Schedule
                </h3>
                <div className="space-y-2 text-gray-700 font-manrope ml-7 text-sm md:text-base">
                  <p><span className="font-semibold">Date:</span> {bookingData.preferredDate}</p>
                  <p><span className="font-semibold">Time:</span> {formatTime(bookingData.preferredTime)}</p>
                </div>
              </div>

              {bookingData.giftCertificate && (
                <div className="md:col-span-2 space-y-3">
                  <h3 className="font-display font-semibold text-gray-900 text-lg flex items-center gap-2">
                    <Gift className="w-5 h-5 text-[#079447]" />
                    Gift Certificate
                  </h3>
                  <p className="text-gray-700 font-manrope ml-7 text-sm md:text-base">
                    Code: <span className="font-bold bg-yellow-100 px-2 py-1 rounded">{bookingData.giftCertificate}</span>
                  </p>
                </div>
              )}

              {bookingData.specialRequests && (
                <div className="md:col-span-2 space-y-3">
                  <h3 className="font-display font-semibold text-gray-900 text-lg">Special Requests</h3>
                  <p className="text-gray-700 font-manrope text-sm md:text-base">{bookingData.specialRequests}</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-navy text-white rounded-2xl shadow-lg p-6 md:p-8 text-center">
            <h2 className="text-xl md:text-2xl font-display font-bold mb-3">Questions About Your Booking?</h2>
            <p className="font-manrope mb-6 text-sm md:text-base opacity-90">
              Our team is here to help! Feel free to reach out anytime.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              
                href="mailto:contact@impressyoucleaning.com"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#079447] hover:bg-[#08A855] rounded-lg font-manrope font-semibold transition-all hover:scale-105"
                <Mail className="w-5 h-5" />
                Email Us
              
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-navy hover:bg-gray-100 rounded-lg font-manrope font-semibold transition-all hover:scale-105"
              >
                <Home className="w-5 h-5" />
                Back to Home
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#079447] mx-auto mb-4"></div>
          <p className="text-xl font-manrope text-gray-600">Loading your confirmation...</p>
        </div>
      </div>
    }>
      <ConfirmationContent />
    </Suspense>
  );
}