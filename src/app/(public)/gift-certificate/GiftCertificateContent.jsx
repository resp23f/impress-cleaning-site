'use client';
import StaggerItem from '@/components/StaggerItem';
import Link from 'next/link';
import { useState } from 'react';
export default function GiftCertificatePage() {
  const [selectedAmount, setSelectedAmount] = useState('150');
  const [customAmount, setCustomAmount] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [senderName, setSenderName] = useState('');
  const [personalMessage, setPersonalMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const handleCheckout = async () => {
    setIsProcessing(true);
    setError('');
    try {
      const response = await fetch('/api/create-gift-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: finalAmount,
          recipientName,
          recipientEmail,
          senderName,
          buyerEmail,
          message: personalMessage,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout');
      }
      // Redirect to Stripe checkout
      window.location.href = data.checkoutUrl;
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err.message || 'Something went wrong. Please try again.');
      setIsProcessing(false);
    }
  };
  const presetAmounts = [
    { value: '100', label: '$100', description: 'A thoughtful start' },
    { value: '150', label: '$150', description: 'Perfect for any occasion' },
    { value: '250', label: '$250', description: 'Make a real impact' },
    { value: '500', label: '$500', description: 'The ultimate time gift' },
  ];
  const finalAmount = customAmount || selectedAmount;
  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white">
      {/* Hero Section */}
      <StaggerItem>
        <section className="relative pt-32 pb-16 px-4 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-green-50 via-transparent to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-blue-50 via-transparent to-transparent" />
          <div className="relative max-w-7xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-6 py-2 bg-green-50 border border-green-100 rounded-full mb-6">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
              </svg>
              <span className="text-green-700 text-sm font-semibold uppercase tracking-wide">The Perfect Gift</span>
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold text-gray-900 mb-6 leading-tight">
              Give the Gift of
              <span className="block mt-2 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                More Time Together
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Help someone you care about reclaim their weekends and spend more time on what matters most.
            </p>
          </div>
        </section>
      </StaggerItem>
      {/* Main Content - Two Column Layout */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-5 gap-8">
            {/* Left Column - Gift Certificate Builder */}
            <div className="lg:col-span-3">
              <StaggerItem>
                <div className="bg-white rounded-3xl shadow-xl border-2 border-gray-100 overflow-hidden">
                  {/* Header */}
                  <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-8 text-white">
                    <h2 className="text-3xl font-display font-bold mb-2">Create Your Gift Certificate</h2>
                    <p className="text-green-50">Thoughtful, practical, and always appreciated</p>
                  </div>
                  {/* Form Content */}
                  <div className="p-8 space-y-8">
                    {/* Amount Selection */}
                    <div>
                      <label className="block text-lg font-bold text-gray-900 mb-4">Choose Amount</label>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        {presetAmounts.map((amount) => (
                          <button
                            key={amount.value}
                            onClick={() => {
                              setSelectedAmount(amount.value);
                              setCustomAmount('');
                            }}
                            className={`relative p-5 rounded-xl border-2 transition-all duration-300 text-left ${
                              selectedAmount === amount.value && !customAmount
                                ? 'border-green-600 bg-green-50 shadow-lg'
                                : 'border-gray-200 hover:border-green-300 hover:shadow-md'
                            }`}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <span className="text-2xl font-bold text-gray-900">{amount.label}</span>
                              {selectedAmount === amount.value && !customAmount && (
                                <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                            <span className="text-sm text-gray-600">{amount.description}</span>
                          </button>
                        ))}
                      </div>
                      <div className="relative">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Or enter custom amount</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg font-semibold">$</span>
                          <input
                            type="number"
                            min="50"
                            placeholder="Enter amount"
                            value={customAmount}
                            onChange={(e) => {
                              setCustomAmount(e.target.value);
                              setSelectedAmount('');
                            }}
                            className="w-full pl-10 pr-4 py-4 border-2 border-gray-200 rounded-xl text-lg focus:border-green-600 focus:ring-4 focus:ring-green-100 transition-all"
                          />
                        </div>
                        <p className="mt-2 text-sm text-gray-500">Minimum $75</p>
                      </div>
                    </div>
                    {/* Recipient Information */}
                    <div className="space-y-4 pt-6 border-t border-gray-200">
                      <h3 className="text-lg font-bold text-gray-900">Recipient Details</h3>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Recipient Name *</label>
                        <input
                          type="text"
                          placeholder="Who is this gift for?"
                          value={recipientName}
                          onChange={(e) => setRecipientName(e.target.value)}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-600 focus:ring-4 focus:ring-green-100 transition-all"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Recipient Email *</label>
                        <input
                          type="email"
                          placeholder="their.email@example.com"
                          value={recipientEmail}
                          onChange={(e) => setRecipientEmail(e.target.value)}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-600 focus:ring-4 focus:ring-green-100 transition-all"
                          required
                        />
                      </div>
                    </div>
                    {/* Sender Information */}
                    <div className="space-y-4 pt-6 border-t border-gray-200">
                      <h3 className="text-lg font-bold text-gray-900">Your Information</h3>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Your Name *</label>
                        <input
                          type="text"
                          placeholder="From..."
                          value={senderName}
                          onChange={(e) => setSenderName(e.target.value)}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-600 focus:ring-4 focus:ring-green-100 transition-all"
                          required
                        />
                      </div>
                    </div>
                    {/* Personal Message */}
                    <div className="pt-6 border-t border-gray-200">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Personal Message (Optional)</label>
                      <textarea
                        placeholder="Add a heartfelt message to make this gift even more special..."
                        value={personalMessage}
                        onChange={(e) => setPersonalMessage(e.target.value)}
                        rows={4}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-600 focus:ring-4 focus:ring-green-100 transition-all resize-none"
                      />
                      <p className="mt-2 text-sm text-gray-500">This will be included in the gift certificate email</p>
                    </div>
                  </div>
                </div>
              </StaggerItem>
            </div>
            {/* Right Column - Summary & Checkout */}
            <div className="lg:col-span-2">
              <div className="sticky top-24">
                <StaggerItem delay={100}>
                  {/* Order Summary */}
                  <div className="bg-gradient-to-br from-gray-50 to-white rounded-3xl shadow-lg border-2 border-gray-200 overflow-hidden mb-6">
                    <div className="bg-gray-900 px-6 py-5 text-white">
                      <h3 className="text-xl font-bold">Order Summary</h3>
                    </div>
                    <div className="p-6 space-y-4">
                      <div className="flex justify-between items-center py-3 border-b border-gray-200">
                        <span className="text-gray-600">Gift Amount</span>
                        <span className="text-2xl font-bold text-gray-900">${finalAmount || '0'}</span>
                      </div>
                      {recipientName && (
                        <div className="pt-4 space-y-2">
                          <div className="flex items-start gap-3">
                            <svg className="w-5 h-5 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <div>
                              <p className="text-sm font-semibold text-gray-700">To:</p>
                              <p className="text-gray-900">{recipientName}</p>
                            </div>
                          </div>
                        </div>
                      )}
                      {senderName && (
                        <div className="flex items-start gap-3">
                          <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <div>
                            <p className="text-sm font-semibold text-gray-700">From:</p>
                            <p className="text-gray-900">{senderName}</p>
                          </div>
                        </div>
                      )}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Your Email *</label>
                        <input
                          type="email"
                          placeholder="your.email@example.com"
                          value={buyerEmail}
                          onChange={(e) => setBuyerEmail(e.target.value)}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-600 focus:ring-4 focus:ring-green-100 transition-all"
                          required
                        />
                        <p className="mt-1 text-xs text-gray-500">For your purchase receipt</p>
                      </div>
                      {/* Checkout Button */}
                      <button
                        onClick={handleCheckout}
                        disabled={isProcessing || !finalAmount || !recipientName || !recipientEmail || !senderName || !buyerEmail}
                        className="w-full mt-6 px-8 py-5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold text-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="flex items-center justify-center gap-2">
                          {isProcessing ? (
                            <>
                              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Processing...
                            </>
                          ) : (
                            <>
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                              </svg>
                              Proceed to Checkout
                            </>
                          )}
                        </span>
                      </button>
                      {error && (
                        <p className="text-sm text-red-600 mt-2 text-center">{error}</p>
                      )}
                      <p className="text-xs text-center text-gray-500 mt-4">
                        Secure payment processing • Certificate delivered via email
                      </p>
                    </div>
                  </div>
                  {/* Benefits */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <h4 className="font-bold text-gray-900 mb-4">What's Included</h4>
                    <ul className="space-y-3">
                      {[
                        'Instant digital delivery',
                        'Beautiful certificate design',
                        'Easy redemption process',
                        'Never expires',
                        'Redeemable for any service'
                      ].map((item, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-sm text-gray-600">
                          <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </StaggerItem>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Why This Makes a Great Gift */}
      <section className="py-20 px-4 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <StaggerItem>
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-4">
                More Than Just a Gift
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                You're giving someone the gift of time, relaxation, and a cleaner, healthier home
              </p>
            </div>
          </StaggerItem>
          <div className="grid md:grid-cols-3 gap-8">
            <StaggerItem delay={100}>
              <div className="text-center group">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Perfect for Any Occasion</h3>
                <p className="text-gray-600 leading-relaxed">
                  Birthdays, holidays, new homes, new parents, or just because. It's always the right time to give someone their time back.
                </p>
              </div>
            </StaggerItem>
            <StaggerItem delay={200}>
              <div className="text-center group">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Instant Delivery</h3>
                <p className="text-gray-600 leading-relaxed">
                  Last-minute gift? No problem. Digital certificates are delivered immediately to the recipient's inbox.
                </p>
              </div>
            </StaggerItem>
            <StaggerItem delay={300}>
              <div className="text-center group">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Flexible & Easy</h3>
                <p className="text-gray-600 leading-relaxed">
                  Recipients can redeem anytime for any service. No expiration dates, no restrictions, no hassle.
                </p>
              </div>
            </StaggerItem>
          </div>
        </div>
      </section>
      {/* FAQ Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <StaggerItem>
            <div className="text-center mb-12">
              <h2 className="text-4xl font-display font-bold text-gray-900 mb-4">
                Common Questions
              </h2>
            </div>
          </StaggerItem>
          <div className="space-y-4">
            {[
              {
                q: "How is the gift certificate delivered?",
                a: "Once you complete your purchase, a beautiful digital certificate is instantly sent to the recipient's email address along with your personal message and redemption instructions."
              },
              {
                q: "Can the recipient choose their service?",
                a: "Absolutely! The certificate can be redeemed for any of our services—weekly cleaning, deep cleaning, move-out service, or any custom package that fits their needs."
              },
              {
                q: "Does the gift certificate expire?",
                a: "No, never! Your recipient can redeem their certificate whenever they're ready, with no time pressure or expiration date."
              },
              {
                q: "What if they need more than the certificate amount?",
                a: "They can easily apply the certificate value toward a larger service and pay the difference. We make it simple and flexible."
              },
              {
                q: "Can I purchase multiple certificates?",
                a: "Of course! Just complete separate orders for each recipient, or contact us for bulk gift certificate options for corporate gifts or events."
              }
            ].map((faq, idx) => (
              <StaggerItem key={idx} delay={idx * 50}>
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:border-green-300 transition-all duration-300">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{faq.q}</h3>
                  <p className="text-gray-600 leading-relaxed">{faq.a}</p>
                </div>
              </StaggerItem>
            ))}
          </div>
        </div>
      </section>
      {/* Contact CTA */}
      <StaggerItem>
        <section className="py-16 px-4 bg-gradient-to-r from-green-600 to-emerald-600">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-3xl font-display font-bold text-white mb-4">
              Need Help Choosing?
            </h3>
            <p className="text-lg text-green-50 mb-8">
              Not sure which amount is right? Give us a call and we'll help you select the perfect gift package.
            </p>
            <a
              href="tel:+15122775364"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-green-600 rounded-lg font-bold text-lg hover:bg-gray-50 transition-all duration-300 shadow-lg"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Call (512) 277-5364
            </a>
          </div>
        </section>
      </StaggerItem>
    </main>
  );
}
