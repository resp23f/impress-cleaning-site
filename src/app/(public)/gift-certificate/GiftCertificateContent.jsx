'use client'
import Breadcrumbs from '@/components/Breadcrumbs'
import StaggerItem from '@/components/StaggerItem'
import Link from 'next/link'
import { useState } from 'react'
export default function GiftCertificateContent() {
 const [selectedAmount, setSelectedAmount] = useState('150')
 const [customAmount, setCustomAmount] = useState('')
 const [recipientName, setRecipientName] = useState('')
 const [recipientEmail, setRecipientEmail] = useState('')
 const [senderName, setSenderName] = useState('')
 const [senderEmail, setSenderEmail] = useState('')
 const [personalMessage, setPersonalMessage] = useState('')
 const [isProcessing, setIsProcessing] = useState(false)
 const [error, setError] = useState('')
 const handleCheckout = async () => {
  // Validate minimum amount
  const amount = parseFloat(finalAmount)
  if (isNaN(amount) || amount < 75) {
   setError('Minimum gift certificate amount is $75')
   return
  }
  setIsProcessing(true)
  setError('')
  try {
   const response = await fetch('/api/create-gift-checkout', {
    method: 'POST',
    headers: {
'Content-Type': 'application/json',
    },
    body: JSON.stringify({
     amount: finalAmount,
     recipientName: recipientName.trim(),
     recipientEmail: recipientEmail.trim().toLowerCase(),
     senderName: senderName.trim(),
     buyerEmail: senderEmail.trim().toLowerCase(),
     message: personalMessage.trim(),
    }),
   })
   const data = await response.json()
   if (!response.ok) {
    throw new Error(data.error || 'Failed to create checkout')
   }
   // Redirect to Stripe checkout
   window.location.href = data.checkoutUrl
  } catch (err) {
   console.error('Checkout error:', err)
   setError(err.message || 'Something went wrong. Please try again.')
   setIsProcessing(false)
  }
 }
 const presetAmounts = [
  { value: '100', label: '$100', description: 'A thoughtful gesture' },
  { value: '150', label: '$150', description: 'Most popular choice' },
  { value: '250', label: '$250', description: 'Make a real impact' },
  { value: '500', label: '$500', description: 'The ultimate gift' },
 ]
 const finalAmount = customAmount || selectedAmount
 const isFormValid = 
 finalAmount && 
 parseFloat(finalAmount) >= 75 &&
 recipientName.trim() && 
 recipientEmail.trim() && 
 senderName.trim() && 
 senderEmail.trim()
 return (
  <main className="min-h-screen bg-gradient-to-b from-[#fafafa] via-white to-[#f5f5f5]">
  <Breadcrumbs
  items={[{ label: 'Gift Certificates', href: '/gift-certificate' }]}
  />
  {/* Hero Section */}
  <StaggerItem>
  <section className="relative pt-8 pb-16 md:pb-20 px-4 overflow-hidden">
  {/* Subtle background patterns */}
  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-50/80 via-transparent to-transparent" />
  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-amber-50/50 via-transparent to-transparent" />
  <div className="relative max-w-7xl mx-auto text-center">
  {/* Premium badge */}
  <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200/60 rounded-full mb-8 shadow-sm">
  <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
  </svg>
  <span className="text-emerald-700 text-sm font-medium tracking-wide">The Perfect Gift</span>
  </div>
  <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold text-gray-900 mb-6 leading-tight tracking-tight">
  Give the Gift of
  <span className="block mt-2 bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 bg-clip-text text-transparent">
  More Time Together
  </span>
  </h1>
  <p className="text-lg sm:text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
  Help someone you care about reclaim their weekends and spend more time on what matters most.
  </p>
  </div>
  </section>
  </StaggerItem>
  {/* Main Content - Two Column Layout */}
  <section className="py-8 md:py-12 px-4">
  <div className="max-w-7xl mx-auto">
  <div className="grid lg:grid-cols-5 gap-8 lg:gap-12">
  {/* Left Column - Gift Certificate Builder */}
  <div className="lg:col-span-3">
  <StaggerItem>
  <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
  {/* Header */}
  <div className="bg-gradient-to-br from-emerald-600 via-green-600 to-teal-600 px-6 sm:px-8 py-8 text-white relative overflow-hidden">
  {/* Subtle pattern overlay */}
  <div className="absolute inset-0 opacity-10">
  <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
  <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
  </div>
  <div className="relative">
  <h2 className="text-2xl sm:text-3xl font-display font-bold mb-2">Create Your Gift Certificate</h2>
  <p className="text-emerald-100 text-sm sm:text-base">Thoughtful, practical, and always appreciated</p>
  </div>
  </div>
  {/* Form Content */}
  <div className="p-6 sm:p-8 space-y-8">
  {/* Amount Selection */}
  <div>
  <label className="block text-lg font-bold text-gray-900 mb-4">Select Amount</label>
  <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-5">
  {presetAmounts.map((amount) => (
   <button
   key={amount.value}
   type="button"
   onClick={() => {
    setSelectedAmount(amount.value)
    setCustomAmount('')
    setError('')
   }}
   className={`relative p-4 sm:p-5 rounded-xl border-2 transition-all duration-200 text-left group ${
    selectedAmount === amount.value && !customAmount
    ? 'border-emerald-500 bg-emerald-50/50 shadow-md shadow-emerald-100'
    : 'border-gray-200 hover:border-emerald-300 hover:shadow-sm bg-white'
   }`}
   >
   <div className="flex items-start justify-between mb-1.5">
   <span className="text-xl sm:text-2xl font-bold text-gray-900">{amount.label}</span>
   {selectedAmount === amount.value && !customAmount && (
    <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
    </div>
   )}
   </div>
   <span className="text-xs sm:text-sm text-gray-500">{amount.description}</span>
   </button>
  ))}
  </div>
  {/* Custom Amount */}
  <div className="relative">
  <label htmlFor="gift-custom-amount" className="block text-sm font-semibold text-gray-700 mb-2">Or enter a custom amount</label>
  <div className="relative">
  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg font-medium">$</span>
  <input
  id="gift-custom-amount"
  type="number"
  min="75"
  max="1000"
  step="1"
  placeholder="Enter amount"
  value={customAmount}
  onChange={(e) => {
   setCustomAmount(e.target.value)
   setSelectedAmount('')
   setError('')
  }}
  className="w-full pl-10 pr-4 py-4 border-2 border-gray-200 rounded-xl text-lg focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all outline-none"
  />
  </div>
  <p className="mt-2 text-sm text-gray-500">Minimum $75 • Maximum $1,000</p>
  </div>
  </div>
  {/* Recipient Information */}
  <div className="space-y-4 pt-6 border-t border-gray-100">
  <div className="flex items-center gap-2 mb-4">
  <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
  <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
  </div>
  <h3 className="text-lg font-bold text-gray-900">Recipient Details</h3>
  </div>
  <div>
  <label htmlFor="gift-recipient-name" className="block text-sm font-medium text-gray-700 mb-2">
  Recipient&apos;s Name <span className="text-red-500">*</span>
  </label>
  <input
  id="gift-recipient-name"
  type="text"
  placeholder="Who is this gift for?"
  value={recipientName}
  onChange={(e) => setRecipientName(e.target.value)}
  maxLength={100}
  autoComplete="off"
  className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all outline-none"
  />
  </div>
  <div>
  <label htmlFor="gift-recipient-email" className="block text-sm font-medium text-gray-700 mb-2">
  Recipient&apos;s Email <span className="text-red-500">*</span>
  </label>
  <input
  id="gift-recipient-email"
  type="email"
  placeholder="their.email@example.com"
  value={recipientEmail}
  onChange={(e) => setRecipientEmail(e.target.value)}
  maxLength={254}
  autoComplete="off"
  className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all outline-none"
  />
  <p className="mt-1.5 text-xs text-gray-500">The gift certificate will be sent to this email</p>
  </div>
  </div>
  {/* Sender Information */}
  <div className="space-y-4 pt-6 border-t border-gray-100">
  <div className="flex items-center gap-2 mb-4">
  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
  </div>
  <h3 className="text-lg font-bold text-gray-900">Your Information</h3>
  </div>
  <div>
  <label htmlFor="gift-sender-name" className="block text-sm font-medium text-gray-700 mb-2">
  Your Name <span className="text-red-500">*</span>
  </label>
  <input
  id="gift-sender-name"
  type="text"
  placeholder="How should the certificate be signed?"
  value={senderName}
  onChange={(e) => setSenderName(e.target.value)}
  maxLength={100}
  autoComplete="name"
  className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all outline-none"
  />
  </div>
  <div>
  <label htmlFor="gift-sender-email" className="block text-sm font-medium text-gray-700 mb-2">
  Your Email <span className="text-red-500">*</span>
  </label>
  <input
  id="gift-sender-email"
  type="email"
  placeholder="your.email@example.com"
  value={senderEmail}
  onChange={(e) => setSenderEmail(e.target.value)}
  maxLength={254}
  autoComplete="email"
  className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all outline-none"
  />
  <p className="mt-1.5 text-xs text-gray-500">For your purchase receipt and confirmation</p>
  </div>
  </div>
  {/* Personal Message */}
  <div className="pt-6 border-t border-gray-100">
  <div className="flex items-center gap-2 mb-4">
  <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
  <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
  </svg>
  </div>
  <label htmlFor="gift-personal-message" className="text-lg font-bold text-gray-900">Personal Message</label>
  <span className="text-xs text-gray-400 font-normal">(Optional)</span>
  </div>
  <textarea
  id="gift-personal-message"
  name="personalMessage"
  placeholder="Add a heartfelt message to make this gift even more special..."
  value={personalMessage}
  onChange={(e) => setPersonalMessage(e.target.value)}
  maxLength={500}
  rows={4}
  className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all outline-none resize-none"
  />
  <div className="mt-2 flex justify-between text-xs text-gray-500">
  <span>This will appear on the gift certificate</span>
  <span>{personalMessage.length}/500</span>
  </div>
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
  <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden mb-6">
  <div className="bg-gray-900 px-6 py-5">
  <h3 className="text-xl font-bold text-white">Order Summary</h3>
  </div>
  <div className="p-6 space-y-5">
  {/* Amount Display */}
  <div className="flex justify-between items-center py-4 border-b border-gray-100">
  <span className="text-gray-600">Gift Amount</span>
  <span className="text-3xl font-bold text-gray-900">${finalAmount || '0'}</span>
  </div>
  {/* Preview Details */}
  {(recipientName || senderName) && (
   <div className="py-4 space-y-4 border-b border-gray-100">
   {recipientName && (
    <div className="flex items-start gap-3">
    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
    <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
    </div>
    <div>
    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">To</p>
    <p className="text-gray-900 font-medium">{recipientName}</p>
    </div>
    </div>
   )}
   {senderName && (
    <div className="flex items-start gap-3">
    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
    </div>
    <div>
    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">From</p>
    <p className="text-gray-900 font-medium">{senderName}</p>
    </div>
    </div>
   )}
   </div>
  )}
  {/* Checkout Button */}
  <button
  type="button"
  onClick={handleCheckout}
  disabled={isProcessing || !isFormValid}
  className="w-full px-8 py-4 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl font-bold text-lg hover:from-emerald-700 hover:to-green-700 transition-all duration-200 shadow-lg shadow-emerald-200 hover:shadow-xl hover:shadow-emerald-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
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
   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
   </svg>
   Secure Checkout
   </>
  )}
  </span>
  </button>
  {error && (
   <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
   <p className="text-sm text-red-600 text-center">{error}</p>
   </div>
  )}
  {/* Security Trust Badge */}
  <div className="pt-4 border-t border-gray-100">
  <div className="flex flex-wrap items-center justify-center gap-4">
  <div className="flex items-center gap-2">
  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center">
  <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
  </div>
  <div className="text-left">
  <p className="text-[11px] font-semibold text-gray-700">256-bit SSL</p>
  <p className="text-[9px] text-gray-400">Encryption</p>
  </div>
  </div>
  <div className="flex items-center gap-2">
  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
  <svg className="w-3.5 h-3.5 text-indigo-600" viewBox="0 0 24 24" fill="currentColor">
  <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z"/>
  </svg>
  </div>
  <div className="text-left">
  <p className="text-[11px] font-semibold text-gray-700">Stripe Secure</p>
  <p className="text-[9px] text-gray-400">PCI Compliant</p>
  </div>
  </div>
  <div className="flex items-center gap-2">
  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
  <svg className="w-3.5 h-3.5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
  </div>
  <div className="text-left">
  <p className="text-[11px] font-semibold text-gray-700">Bank-Level</p>
  <p className="text-[9px] text-gray-400">Security</p>
  </div>
  </div>
  </div>
  </div>
  </div>
  </div>
  {/* Benefits Card */}
  <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-200 p-6">
  <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
  <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
  </svg>
  What&apos;s Included
  </h4>
  <ul className="space-y-3">
  {[
'Beautiful digital certificate',
'Instant email delivery',
'Easy redemption process',
'Never expires',
'Any cleaning service',
  ].map((item, idx) => (
   <li key={idx} className="flex items-center gap-3 text-sm text-gray-600">
   <svg className="w-4 h-4 text-emerald-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
   <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
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
  <section className="py-20 px-4 bg-gradient-to-b from-white via-gray-50/50 to-white">
  <div className="max-w-7xl mx-auto">
  <StaggerItem>
  <div className="text-center mb-14">
  <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-gray-900 mb-4">
  More Than Just a Gift
  </h2>
  <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
  You&apos;re giving someone the gift of time, relaxation, and a cleaner, healthier home
  </p>
  </div>
  </StaggerItem>
  <div className="grid md:grid-cols-3 gap-8">
  <StaggerItem delay={100}>
  <div className="text-center group">
  <div className="w-20 h-20 mx-auto bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-rose-200 group-hover:scale-110 transition-transform duration-300">
  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
  </div>
  <h3 className="text-xl font-bold text-gray-900 mb-3">Perfect for Any Occasion</h3>
  <p className="text-gray-600 leading-relaxed">
  Birthdays, holidays, new homes, new parents, or just because. It&apos;s always the right time to give someone their time back.
  </p>
  </div>
  </StaggerItem>
  <StaggerItem delay={200}>
  <div className="text-center group">
  <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform duration-300">
  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
  </div>
  <h3 className="text-xl font-bold text-gray-900 mb-3">Instant Delivery</h3>
  <p className="text-gray-600 leading-relaxed">
  Last-minute gift? No problem. Digital certificates are delivered immediately to the recipient&apos;s inbox.
  </p>
  </div>
  </StaggerItem>
  <StaggerItem delay={300}>
  <div className="text-center group">
  <div className="w-20 h-20 mx-auto bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-200 group-hover:scale-110 transition-transform duration-300">
  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
  </div>
  <h3 className="text-xl font-bold text-gray-900 mb-3">Flexible &amp; Easy</h3>
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
  <h2 className="text-3xl sm:text-4xl font-display font-bold text-gray-900 mb-4">
  Common Questions
  </h2>
  </div>
  </StaggerItem>
  <div className="space-y-4">
  {[
   {
    q: 'How is the gift certificate delivered?',
    a: "Once you complete your purchase, a beautiful digital certificate is instantly sent to the recipient's email address along with your personal message and redemption instructions.",
   },
   {
    q: 'Can the recipient choose their service?',
    a: 'Absolutely! The certificate can be redeemed for any of our services—weekly cleaning, deep cleaning, move-out service, or any custom package that fits their needs.',
   },
   {
    q: 'Does the gift certificate expire?',
    a: "No, never! Your recipient can redeem their certificate whenever they're ready, with no time pressure or expiration date.",
   },
   {
    q: 'What if they need more than the certificate amount?',
    a: 'They can easily apply the certificate value toward a larger service and pay the difference. We make it simple and flexible.',
   },
   {
    q: 'Can I purchase multiple certificates?',
    a: 'Of course! Just complete separate orders for each recipient, or contact us for bulk gift certificate options for corporate gifts or events.',
   },
  ].map((faq, idx) => (
   <StaggerItem key={idx} delay={idx * 50}>
   <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:border-emerald-300 hover:shadow-md transition-all duration-200">
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
  <section className="py-16 px-4 bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 relative overflow-hidden">
  {/* Decorative elements */}
  <div className="absolute inset-0 opacity-10">
  <div className="absolute top-0 left-1/4 w-96 h-96 bg-white rounded-full -translate-y-1/2" />
  <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-white rounded-full translate-y-1/2" />
  </div>
  <div className="relative max-w-4xl mx-auto text-center">
  <h3 className="text-2xl sm:text-3xl font-display font-bold text-white mb-4">
  Need Help Choosing?
  </h3>
  <p className="text-lg text-emerald-100 mb-8">
  Not sure which amount is right? Give us a call and we&apos;ll help you select the perfect gift.
  </p>
  <a
  href="tel:+15122775364"
  className="inline-flex items-center justify-center px-8 py-4 bg-white text-emerald-600 rounded-xl font-bold text-lg hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl"
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
 )
}