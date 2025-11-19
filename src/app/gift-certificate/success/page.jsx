'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import StaggerItem from '@/components/StaggerItem';

function SuccessContent() {
  const searchParams = useSearchParams();
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    const sendGiftCertificate = async () => {
      try {
        const encodedData = searchParams.get('data');
        if (!encodedData) return;

        const decodedData = JSON.parse(atob(decodeURIComponent(encodedData)));

        // Send the email
        await fetch('/api/send-gift-certificate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(decodedData),
        });

        setEmailSent(true);
      } catch (err) {
        console.error('Error sending gift certificate:', err);
        setEmailSent(true); // Still show success page
      }
    };

    sendGiftCertificate();
  }, [searchParams]);

  if (!emailSent) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center px-4">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600"></div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center px-4">
      <StaggerItem>
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
            <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-4">
            Gift Certificate Sent! 🎉
          </h1>

          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
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
                  <p className="text-gray-600 text-sm">The recipient will receive a beautiful digital certificate with your personal message</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="font-semibold text-gray-900">Easy Redemption</p>
                  <p className="text-gray-600 text-sm">They can contact us anytime to schedule their cleaning service</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="font-semibold text-gray-900">Never Expires</p>
                  <p className="text-gray-600 text-sm">No rush - the certificate can be used whenever they're ready</p>
                </div>
              </li>
            </ul>
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
        </div>
      </StaggerItem>
    </main>
  );
}

export default function GiftCertificateSuccess() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center px-4">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600"></div>
      </main>
    }>
      <SuccessContent />
    </Suspense>
  );
}