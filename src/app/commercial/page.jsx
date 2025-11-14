'use client';
import StaggerItem from '@/components/StaggerItem';
import Link from 'next/link';
import { useState } from 'react';

export default function CommercialPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      {/* Hero Section - More Corporate/Industrial */}
      <StaggerItem>
        <section className="relative pt-20 pb-32 px-4 overflow-hidden bg-slate-900">
          {/* Grid overlay for industrial feel */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />
          
          {/* Subtle accent shapes */}
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-green-500/10 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-blue-500/10 to-transparent rounded-full blur-3xl" />
          
          <div className="relative max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full mb-6">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-green-400 text-sm font-semibold tracking-wide uppercase">Commercial Services</span>
                </div>

                <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold text-white mb-6 leading-[1.1]">
                  Commercial-Grade Cleaning
                  <span className="block text-green-400 mt-2">Built for Business</span>
                </h1>
                
                <p className="text-xl text-slate-300 mb-8 leading-relaxed max-w-xl">
                  Industrial-strength solutions for offices, warehouses, medical facilities, and retail spaces. Professional service that keeps your business running at peak performance.
                </p>

                <div className="grid grid-cols-2 gap-6 mb-10 max-w-lg">
                  <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-lg p-4">
                    <div className="text-3xl font-bold text-green-400 mb-1">15+</div>
                    <div className="text-sm text-slate-400">Years Experience</div>
                  </div>
                  <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-lg p-4">
                    <div className="text-3xl font-bold text-green-400 mb-1">24/7</div>
                    <div className="text-sm text-slate-400">Flexible Scheduling</div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/service-quote"
                    className="inline-flex items-center justify-center px-8 py-4 bg-green-500 text-white rounded-lg font-bold text-lg hover:bg-green-600 transition-all duration-300 shadow-lg shadow-green-500/20 hover:shadow-xl hover:shadow-green-500/30 hover:scale-105"
                  >
                    Request Commercial Quote
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                  <a 
                    href="tel:+15122775364" 
                    className="inline-flex items-center justify-center px-8 py-4 bg-slate-800 text-white rounded-lg font-bold text-lg border-2 border-slate-700 hover:bg-slate-700 hover:border-slate-600 transition-all duration-300"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    (512) 277-5364
                  </a>
                </div>
              </div>

              {/* Right Content - Stats/Features */}
              <div className="hidden lg:block">
                <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-8">
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                    <svg className="w-6 h-6 text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    What's Included
                  </h3>
                  <ul className="space-y-4">
                    {[
                      'Licensed & Insured Commercial Service',
                      'Industrial-Grade Equipment & Products',
                      'Flexible After-Hours Scheduling',
                      'Dedicated Account Manager',
                      'Quality Assurance Inspections',
                      'Emergency Response Available'
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-start text-slate-300">
                        <svg className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>
      </StaggerItem>

      {/* Industries Section - Card Layout */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <StaggerItem>
            <div className="text-center mb-16">
              <div className="inline-block px-4 py-2 bg-slate-100 rounded-full mb-4">
                <span className="text-slate-700 text-sm font-semibold uppercase tracking-wide">Industries We Serve</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-display font-bold text-slate-900 mb-4">
                Commercial Solutions for Every Sector
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                From high-rise offices to warehouses, we deliver professional cleaning that meets the unique demands of your industry.
              </p>
            </div>
          </StaggerItem>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Office Buildings */}
            <StaggerItem delay={100}>
              <div className="group bg-slate-50 hover:bg-white rounded-xl p-6 border-2 border-slate-200 hover:border-green-500 transition-all duration-300 hover:shadow-xl cursor-pointer">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Office Buildings</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      Executive suites, conference rooms, cubicles, and common areas maintained to corporate standards.
                    </p>
                  </div>
                </div>
              </div>
            </StaggerItem>

            {/* Medical Facilities */}
            <StaggerItem delay={150}>
              <div className="group bg-slate-50 hover:bg-white rounded-xl p-6 border-2 border-slate-200 hover:border-green-500 transition-all duration-300 hover:shadow-xl cursor-pointer">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Medical Facilities</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      Healthcare-grade disinfection protocols for clinics, dental offices, and medical practices.
                    </p>
                  </div>
                </div>
              </div>
            </StaggerItem>

            {/* Retail Spaces */}
            <StaggerItem delay={200}>
              <div className="group bg-slate-50 hover:bg-white rounded-xl p-6 border-2 border-slate-200 hover:border-green-500 transition-all duration-300 hover:shadow-xl cursor-pointer">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Retail Stores</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      Keep your store pristine and welcoming for customers with daily maintenance and deep cleaning.
                    </p>
                  </div>
                </div>
              </div>
            </StaggerItem>

            {/* Warehouses */}
            <StaggerItem delay={250}>
              <div className="group bg-slate-50 hover:bg-white rounded-xl p-6 border-2 border-slate-200 hover:border-green-500 transition-all duration-300 hover:shadow-xl cursor-pointer">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Warehouses & Industrial</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      Heavy-duty floor care, loading dock cleaning, and break area maintenance for industrial facilities.
                    </p>
                  </div>
                </div>
              </div>
            </StaggerItem>

            {/* Gyms */}
            <StaggerItem delay={300}>
              <div className="group bg-slate-50 hover:bg-white rounded-xl p-6 border-2 border-slate-200 hover:border-green-500 transition-all duration-300 hover:shadow-xl cursor-pointer">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Gyms & Fitness Centers</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      Equipment sanitization, locker room deep cleans, and high-traffic area maintenance.
                    </p>
                  </div>
                </div>
              </div>
            </StaggerItem>

            {/* Coworking Spaces */}
            <StaggerItem delay={350}>
              <div className="group bg-slate-50 hover:bg-white rounded-xl p-6 border-2 border-slate-200 hover:border-green-500 transition-all duration-300 hover:shadow-xl cursor-pointer">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Coworking Spaces</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      Flexible desk turnover, common area maintenance, and meeting room sanitization.
                    </p>
                  </div>
                </div>
              </div>
            </StaggerItem>
          </div>
        </div>
      </section>

      {/* Service Plans - More Industrial/Corporate Design */}
      <section className="py-20 px-4 bg-slate-900">
        <div className="max-w-7xl mx-auto">
          <StaggerItem>
            <div className="text-center mb-16">
              <div className="inline-block px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full mb-4">
                <span className="text-green-400 text-sm font-semibold uppercase tracking-wide">Service Options</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
                Commercial Cleaning Plans
              </h2>
              <p className="text-xl text-slate-300 max-w-3xl mx-auto">
                Choose the service frequency that keeps your business operating at peak cleanliness.
              </p>
            </div>
          </StaggerItem>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Daily Service */}
            <StaggerItem delay={100}>
              <div className="bg-slate-800 border-2 border-slate-700 rounded-xl p-8 hover:border-green-500 transition-all duration-300 hover:shadow-2xl hover:shadow-green-500/10">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-white">Daily Service</h3>
                  <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                
                <p className="text-slate-300 mb-6">
                  Consistent nightly janitorial service for high-traffic facilities that need daily attention.
                </p>

                <ul className="space-y-3 mb-8">
                  {[
                    'Complete office cleaning',
                    'Trash removal & restocking',
                    'Restroom sanitization',
                    'Floor care & vacuuming',
                    'Kitchen/break room cleaning'
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start text-slate-300 text-sm">
                      <svg className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>

                <div className="pt-6 border-t border-slate-700">
                  <span className="text-green-400 font-semibold text-sm">Best for: High-traffic offices</span>
                </div>
              </div>
            </StaggerItem>

            {/* Weekly Service */}
            <StaggerItem delay={200}>
              <div className="bg-slate-800 border-2 border-green-500 rounded-xl p-8 hover:shadow-2xl hover:shadow-green-500/20 transition-all duration-300 relative">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-green-500 text-white text-sm font-bold rounded-full">
                  Most Popular
                </div>
                
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-white">Weekly Deep Clean</h3>
                  <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                </div>
                
                <p className="text-slate-300 mb-6">
                  Thorough weekly cleaning that maintains professional standards without daily service costs.
                </p>

                <ul className="space-y-3 mb-8">
                  {[
                    'Comprehensive deep cleaning',
                    'High-touch surface disinfection',
                    'Detailed restroom service',
                    'Window & glass cleaning',
                    'Carpet vacuuming & spot clean'
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start text-slate-300 text-sm">
                      <svg className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>

                <div className="pt-6 border-t border-slate-700">
                  <span className="text-green-400 font-semibold text-sm">Best for: Small-medium offices</span>
                </div>
              </div>
            </StaggerItem>

            {/* Custom Plans */}
            <StaggerItem delay={300}>
              <div className="bg-slate-800 border-2 border-slate-700 rounded-xl p-8 hover:border-green-500 transition-all duration-300 hover:shadow-2xl hover:shadow-green-500/10">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-white">Custom Plans</h3>
                  <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                  </div>
                </div>
                
                <p className="text-slate-300 mb-6">
                  Flexible scheduling tailored to your specific business needs and operational hours.
                </p>

                <ul className="space-y-3 mb-8">
                  {[
                    'Bi-weekly or monthly options',
                    'After-hours or weekend service',
                    'Project-based cleaning',
                    'Seasonal deep cleans',
                    'Emergency response available'
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start text-slate-300 text-sm">
                      <svg className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>

                <div className="pt-6 border-t border-slate-700">
                  <span className="text-green-400 font-semibold text-sm">Best for: Flexible needs</span>
                </div>
              </div>
            </StaggerItem>
          </div>
        </div>
      </section>

      {/* Why Choose Section - Stats Focused */}
      <StaggerItem>
        <section className="py-20 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left - Stats */}
              <div>
                <h2 className="text-4xl md:text-5xl font-display font-bold text-slate-900 mb-6">
                  Trusted Commercial Partner
                </h2>
                <p className="text-xl text-slate-600 mb-8">
                  Over 15 years serving Central Texas businesses with reliable, professional cleaning services.
                </p>

                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div className="bg-slate-50 rounded-xl p-6 border-2 border-slate-200">
                    <div className="text-4xl font-bold text-green-500 mb-2">100%</div>
                    <div className="text-slate-700 font-medium">Licensed & Insured</div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-6 border-2 border-slate-200">
                    <div className="text-4xl font-bold text-green-500 mb-2">24/7</div>
                    <div className="text-slate-700 font-medium">Service Availability</div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-6 border-2 border-slate-200">
                    <div className="text-4xl font-bold text-green-500 mb-2">15+</div>
                    <div className="text-slate-700 font-medium">Years Experience</div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-6 border-2 border-slate-200">
                    <div className="text-4xl font-bold text-green-500 mb-2">∞</div>
                    <div className="text-slate-700 font-medium">Quality Guarantee</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 mr-4">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 mb-1">Industrial-Grade Equipment</h4>
                      <p className="text-slate-600 text-sm">Professional tools and commercial cleaning products for superior results.</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 mr-4">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 mb-1">Dedicated Account Manager</h4>
                      <p className="text-slate-600 text-sm">Single point of contact for all your cleaning needs and requests.</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 mr-4">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 mb-1">Quality Assurance</h4>
                      <p className="text-slate-600 text-sm">Regular inspections and detailed checklists ensure consistent excellence.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right - Image Placeholder */}
              <div className="bg-slate-100 rounded-2xl aspect-[4/3] flex items-center justify-center border-2 border-slate-200">
                <div className="text-center p-8">
                  <svg className="w-24 h-24 text-slate-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <p className="text-slate-500 text-lg font-medium">Commercial Cleaning Team</p>
                  <p className="text-slate-400 text-sm mt-2">Professional cleaners in navy uniforms</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </StaggerItem>

      {/* CTA Section */}
      <StaggerItem>
        <section className="py-24 px-4 bg-slate-900">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full mb-6">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-green-400 text-sm font-semibold tracking-wide uppercase">Get Started Today</span>
            </div>

            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 font-display">
              Ready to Upgrade Your Workspace?
            </h2>
            <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
              Get a free commercial cleaning quote tailored to your facility's specific needs. No obligation, just straightforward pricing.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/service-quote" 
                className="inline-flex items-center justify-center px-10 py-5 bg-green-500 text-white rounded-lg font-bold text-lg hover:bg-green-600 transition-all duration-300 shadow-lg shadow-green-500/20 hover:shadow-xl hover:shadow-green-500/30"
              >
                Request Commercial Quote
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <a 
                href="tel:+15122775364" 
                className="inline-flex items-center justify-center px-10 py-5 bg-slate-800 text-white rounded-lg font-bold text-lg border-2 border-slate-700 hover:bg-slate-700 transition-all duration-300"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Call Now
              </a>
            </div>

            <div className="mt-12 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-slate-500 text-sm mb-1">Licensed</div>
                <svg className="w-8 h-8 text-green-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div className="text-center">
                <div className="text-slate-500 text-sm mb-1">Insured</div>
                <svg className="w-8 h-8 text-green-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div className="text-center">
                <div className="text-slate-500 text-sm mb-1">Trusted</div>
                <svg className="w-8 h-8 text-green-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </section>
      </StaggerItem>
    </main>
  );
}