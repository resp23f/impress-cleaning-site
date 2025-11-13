'use client';

import { useEffect, useRef } from 'react';

export default function ResidentialPage() {
  const heroRef = useRef(null);
  const servicesRef = useRef(null);
  const processRef = useRef(null);
  const benefitsRef = useRef(null);
  const ctaRef = useRef(null);

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
        }
      });
    }, observerOptions);

    [heroRef, servicesRef, processRef, benefitsRef, ctaRef].forEach(ref => {
      if (ref.current) observer.observe(ref.current);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <main className="min-h-screen bg-background">
   {/* Hero Section */}
      <section 
        ref={heroRef}
        className="relative pt-32 pb-20 px-4 overflow-hidden opacity-0 transition-all duration-1000 ease-out translate-y-8"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#001F3F] to-[#003D7A] opacity-90" />
        <div className="absolute inset-0">
          <div className="absolute top-20 right-20 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        </div>
        
        <div className="relative max-w-7xl mx-auto text-center">
          <div className="inline-block mb-6 px-6 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
            <span className="text-blue-200 text-sm font-medium tracking-wide">RESIDENTIAL CLEANING SERVICES</span>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold text-white mb-6 leading-tight">
            Your Home Deserves
            <span className="block mt-2 bg-gradient-to-r font-display from-blue-200 to-white bg-clip-text text-transparent">
              The Impress Standard
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto mb-10 leading-relaxed">
            Professional cleaning services for Georgetown and nearby areas. We bring eco-friendly solutions and meticulous attention to detail to every home we serve. Because maintaining a clean, healthy home isn't a luxury—it's a necessity that deserves professional care.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a 
              href="/quote" 
              className="group px-8 py-4 bg-white text-[#001F3F] rounded-lg font-semibold text-lg hover:bg-blue-50 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105"
            >
              Get Your Free Quote
              <span className="inline-block ml-2 transition-transform duration-300 group-hover:translate-x-1">→</span>
            </a>
            <a 
              href="#services" 
              className="px-8 py-4 bg-transparent text-white rounded-lg font-semibold text-lg border-2 border-white/30 hover:bg-white/10 hover:border-white/50 transition-all duration-300"
            >
              Explore Services
            </a>
          </div>
        </div>
      </section>

      {/* Services Grid Section */}
      <section 
        id="services"
        ref={servicesRef}
        className="py-24 px-4 bg-background-50 transition-all duration-1000 ease-out translate-y-8"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-4">
              Flexible Cleaning Plans
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose the service frequency that fits your lifestyle. Every plan includes our thorough, eco-friendly cleaning process.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Bi-Weekly Service */}
            <div className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-blue-200 hover:-translate-y-2">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-transparent rounded-bl-full opacity-50" />
              
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-[#001F3F] to-[#003D7A] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                
                <div className="mb-4">
                  <span className="inline-block px-3 py-1 bg-blue-100 text-[#001F3F] text-xs font-semibold rounded-full mb-3">
                    MOST POPULAR
                  </span>
                  <h3 className="text-2xl font-bold text-gray-900 font-display mb-2">Bi-Weekly Cleaning</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Perfect for busy families who want to maintain a consistently clean home without the daily hassle. Every two weeks, we restore your space to pristine condition.
                  </p>
                </div>
                
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start text-gray-700">
                    <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Consistent cleaning schedule</span>
                  </li>
                  <li className="flex items-start text-gray-700">
                    <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Best value for regular maintenance</span>
                  </li>
                  <li className="flex items-start text-gray-700">
                    <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Priority scheduling</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Tri-Weekly Service */}
            <div className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-blue-200 hover:-translate-y-2">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-100 to-transparent rounded-bl-full opacity-50" />
              
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>

                <h3 className="text-2xl font-bold text-gray-900 font-display mb-2">Tri-Weekly Cleaning</h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  The sweet spot for homes that stay relatively tidy but need regular professional attention. Every three weeks keeps your space fresh and welcoming.
                </p>
                
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start text-gray-700">
                    <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Balanced cleaning frequency</span>
                  </li>
                  <li className="flex items-start text-gray-700">
                    <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Cost-effective maintenance</span>
                  </li>
                  <li className="flex items-start text-gray-700">
                    <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Flexible scheduling options</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Monthly Service */}
            <div className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-blue-200 hover:-translate-y-2">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-100 to-transparent rounded-bl-full opacity-50" />
              
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-green-800 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>

                <h3 className="text-2xl font-bold text-gray-900 font-display mb-2">Monthly Cleaning</h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  Ideal for well-maintained homes or those looking for periodic deep refreshes. We tackle the cleaning tasks that build up over time.
                </p>
                
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start text-gray-700">
                    <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Deep cleaning approach</span>
                  </li>
                  <li className="flex items-start text-gray-700">
                    <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Budget-friendly option</span>
                  </li>
                  <li className="flex items-start text-gray-700">
                    <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Perfect for light upkeep</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Move-Out Cleaning */}
            <div className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-blue-200 hover:-translate-y-2">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-100 to-transparent rounded-bl-full opacity-50" />
              
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-600 to-orange-800 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>

                <h3 className="text-2xl font-bold text-gray-900 font-display mb-2">Move-Out Cleaning</h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  Comprehensive cleaning for vacant properties. We ensure every corner is spotless, helping you leave a lasting impression or prepare your home for its next chapter.
                </p>
                
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start text-gray-700">
                    <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Thorough top-to-bottom cleaning</span>
                  </li>
                  <li className="flex items-start text-gray-700">
                    <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Inside appliances & cabinets</span>
                  </li>
                  <li className="flex items-start text-gray-700">
                    <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Sale-ready results</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Make-Ready Cleaning */}
            <div className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-blue-200 hover:-translate-y-2">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-100 to-transparent rounded-bl-full opacity-50" />
              
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-800 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>

                <h3 className="text-2xl font-bold text-gray-900 font-display mb-2">Make-Ready Cleaning</h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                Perfect for homeowners preparing to sell, realtors staging properties, or families helping older relatives transition between homes. We transform homes between owners, ensuring they're move-in ready and impressive.
                </p>
                
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start text-gray-700">
                    <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Fast turnaround times</span>
                  </li>
                  <li className="flex items-start text-gray-700">
                    <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Rental-ready standards</span>
                  </li>
                  <li className="flex items-start text-gray-700">
                    <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Realtor-recommended service</span>
                  </li>
                </ul>
              </div>
            </div>

{/* Premium Add-On Services Card */}
<div className="group relative bg-gradient-to-br from-[#001F3F] to-[#003D7A] rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-blue-300/20 hover:-translate-y-2 opacity-90">
  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/10 to-transparent rounded-bl-full" />
  
  <div className="relative">
    <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border border-white/20">
      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
      </svg>
    </div>

    <h3 className="text-2xl font-bold text-white font-display mb-2">Premium Add-On Services</h3>
    <p className="text-blue-100 leading-relaxed mb-6">
      Enhance your cleaning with specialized services. Each requires dedicated time, equipment, and expertise—priced separately to ensure quality results.
    </p>
    
    <ul className="space-y-3 mb-6">
      <li className="flex items-start text-blue-100">
        <svg className="w-5 h-5 text-blue-300 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        <span>Interior window cleaning</span>
      </li>
      <li className="flex items-start text-blue-100">
        <svg className="w-5 h-5 text-blue-300 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        <span>Garage cleaning & organization</span>
      </li>
      <li className="flex items-start text-blue-100">
        <svg className="w-5 h-5 text-blue-300 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        <span>Patio & outdoor space cleaning</span>
      </li>
    </ul>
    
    <div className="pt-4 border-t border-white/20">
      <p className="text-sm text-blue-200 font-medium">
        These specialized services are quoted separately based on your specific needs
      </p>
    </div>
  </div>
</div>
</div>
</div> </section>


 {/* Who We Serve Section - Add this AFTER the Services Grid and BEFORE How It Works */}
<section className="py-20 px-4 bg-background-100">
  <div className="max-w-7xl mx-auto">
    <div className="text-center mb-12">
      <h2 className="text-4xl md:text-5xl font-bold font-display text-gray-900 mb-4">
        Who Relies on Impress
      </h2>
      <p className="text-xl text-gray-600 max-w-2xl mx-auto">
        Professional cleaning isn't a luxury—it's essential care for your home and family. We're trusted by those who understand the value of dependable service.
      </p>
    </div>

    <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
      {/* Busy Families */}
      <div className="group relative bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 border border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300">
        <div className="flex items-start">
          <div className="flex-shrink-0 w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <svg className="w-7 h-7 text-[#001F3F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div className="ml-5">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Busy Families & Professionals</h3>
            <p className="text-gray-600 leading-relaxed">
              Between work, kids, and everything in between, maintaining a clean home shouldn't add stress. We provide the consistent, dependable care your family needs to thrive.
            </p>
          </div>
        </div>
      </div>

      {/* Retired Homeowners */}
<div className="group relative bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 border border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300">
  <div className="flex items-start">
    <div className="flex-shrink-0 w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
      <svg className="w-7 h-7 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    </div>
    <div className="ml-5">
      <h3 className="text-xl font-bold text-gray-900 mb-2">Retired Homeowners</h3>
      <p className="text-gray-600 leading-relaxed">
        Your home deserves the care you've always given it. We provide trustworthy, respectful service so you can continue enjoying your cherished space with peace of mind.
      </p>
    </div>
  </div>
</div>

      {/* Realtors */}
      <div className="group relative bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 border border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300">
        <div className="flex items-start">
          <div className="flex-shrink-0 w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <svg className="w-7 h-7 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <div className="ml-5">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Real Estate Professionals</h3>
            <p className="text-gray-600 leading-relaxed">
              First impressions matter. We prepare homes to showcase their true potential, helping properties make the lasting impact that leads to successful sales.
            </p>
          </div>
        </div>
      </div>

      {/* Life Transitions */}
      <div className="group relative bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 border border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300">
        <div className="flex items-start">
          <div className="flex-shrink-0 w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <svg className="w-7 h-7 text-orange-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </div>
          <div className="ml-5">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Families in Transition</h3>
            <p className="text-gray-600 leading-relaxed">
              Moving, downsizing, or helping loved ones transition? We handle the cleaning details with care and professionalism during life's important moments.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

      {/* Process Section */}
<section
ref={processRef}
className="py-24 px-4 bg-[var(--background)] opacity-100 transition-all duration-1000 ease-out translate-y-8"
>
<div className="max-w-7xl mx-auto">
  <div className="bg-[var(--softgreen)] rounded-3xl p-12 md:p-16 shadow-2xl border border-green-200/30">
    <div className="text-center mb-16">
      <h2 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-4">
        How It Works
      </h2>
      <p className="text-xl text-gray-600 font-manrope max-w-2xl mx-auto">
                          Getting professional cleaning services has never been easier. We've streamlined every step.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 md:gap-4">
            {/* Step 1 */}
            <div className="relative">
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-[#001F3F] to-[#003D7A] rounded-2xl flex items-center justify-center shadow-xl transform hover:scale-110 transition-transform duration-300">
                    <span className="text-3xl font-bold text-white">1</span>
                  </div>
                  {/* Connector Line */}
                  <div className="hidden md:block absolute top-10 left-20 w-full h-0.5 bg-gradient-to-r from-[#001F3F] to-gray-200" />
                </div>
                <h3 className="text-xl font-bold font-display text-gray-900 mb-3">Request a Quote</h3>
                <p className="text-gray-600 leading-relaxed font-manrope">
                  Fill out our simple form or call us directly. We'll discuss your needs and provide a transparent, no-obligation quote.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-[#001F3F] to-[#003D7A] rounded-2xl flex items-center justify-center shadow-xl transform hover:scale-110 transition-transform duration-300">
                    <span className="text-3xl font-bold text-white">2</span>
                  </div>
                  <div className="hidden md:block absolute top-10 left-20 w-full h-0.5 bg-gradient-to-r from-gray-200 to-gray-200" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 font-display mb-3">Schedule Service</h3>
                <p className="text-gray-600 leading-relaxed font-manrope">
                  Choose a time that works for you. We're flexible and send reminders so you never miss an appointment. Self-booking coming soon!
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-[#001F3F] to-[#003D7A] rounded-2xl flex items-center justify-center shadow-xl transform hover:scale-110 transition-transform duration-300">
                    <span className="text-3xl font-bold text-white">3</span>
                  </div>
                  <div className="hidden md:block absolute top-10 left-20 w-full h-0.5 bg-gradient-to-r from-gray-200 to-gray-200" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 font-display mb-3">We Clean</h3>
                <p className="text-gray-600 leading-relaxed font-manrope">
                  Our professional team arrives with eco-friendly products that truly remove dirt and grime. We handle every detail with care.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="relative">
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-[#001F3F] to-[#003D7A] rounded-2xl flex items-center justify-center shadow-xl transform hover:scale-110 transition-transform duration-300">
                    <span className="text-3xl font-bold text-white">4</span>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 font-display">Enjoy Your Home</h3>
                <p className="text-gray-600 leading-relaxed font-manrope">
                  Relax in your spotless space. Manage future appointments easily through our upcoming customer portal.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      </section>

      {/* Benefits Section */}
      <section 
        ref={benefitsRef}
        className="py-24 px-4 bg-gradient-to-b from-gray-50 to-background opacity-100 transition-all duration-1000 ease-out translate-y-8"
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div>              
              <h2 className="text-4xl md:text-5xl font-bold font-display text-gray-900 mb-6 leading-tight">
                The Impress Difference
              </h2>
              
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                We're not just another cleaning service. We're your partner in maintaining a home that reflects your standards and values.
              </p>

              <div className="space-y-6">
                <div className="flex items-start group">
                  <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">Eco-Friendly Products</h3>
                    <p className="text-gray-600 leading-relaxed">
                      We use professional-grade, environmentally safe cleaning solutions that effectively remove dirt and grime without harsh chemicals that could harm your family or pets.
                    </p>
                  </div>
                </div>

                <div className="flex items-start group">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">Flexible & Reliable</h3>
                    <p className="text-gray-600 leading-relaxed">
                      We work around your schedule with convenient appointment times. Automated reminders keep you informed, and our upcoming self-booking system makes scheduling effortless.
                    </p>
                  </div>
                </div>

                <div className="flex items-start group">
                  <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">Essential, Not Optional</h3>
                    <p className="text-gray-600 leading-relaxed">
                    Just like you trust a plumber for critical repairs, your home's cleanliness requires professional expertise. For busy families managing demanding schedules and older homeowners who deserve reliable support, we provide the essential service that keeps your home healthy and welcoming.
                    </p>
                  </div>
                </div>

                <div className="flex items-start group">
                  <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">Customer Portal Coming Soon</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Manage your cleaning schedule, view service history, and communicate with our team—all from one convenient online portal designed with you in mind.
                    </p>
                  </div>
                </div>

      
                <div className="flex items-start group">
                  <div className="flex-shrink-0 w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">Locally Trusted</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Proudly serving Georgetown and nearby communities. We understand local homes and take pride in being your neighborhood cleaning experts.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Content - Image Placeholder */}
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <div className="aspect-[4/5] bg-gradient-to-br from-[#001F3F] to-[#003D7A] flex items-center justify-center">
                  <div className="text-center p-8">
                    <svg className="w-24 h-24 text-white/50 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    <p className="text-white/70 text-lg">TBD</p>
                  </div>
                </div>
                
                {/* Decorative Elements */}
                <div className="absolute -top-6 -right-6 w-32 h-32 bg-blue-400 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-blob" />
                <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-purple-400 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-blob animation-delay-2000" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section 
        ref={ctaRef}
        className="relative py-24 px-4 overflow-hidden opacity-0 transition-all duration-1000 ease-out translate-y-5"
      >
        <div className="absolute inset-0 bg-[var(--softgreen)]" />
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-[var(--background)] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[var(--background)] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />

        </div>
        
        <div className="relative max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 font-display leading-tight">
            Ready to Experience the Impress Difference?
          </h2>
          <p className="text-xl text-[#1C294E] mb-10 font-semibold font-manrope leading-relaxed">
          Join hundreds of families and homeowners who rely on us for essential home maintenance. Get your free quote today and ensure your home receives the professional care it deserves.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a 
              href="/quote" 
              className="group px-10 py-5 bg-[#FAFAF8] text-[#1C294E] rounded-lg font-bold text-lg hover:bg-white transition-all duration-300 shadow-2xl hover:shadow-3xl hover:scale-105"
            >
              Get Your Free Quote
              <span className="inline-block ml-2 transition-transform duration-300 group-hover:translate-x-1">→</span>
            </a>
            <a 
              href="tel:+15121234567" 
              className="group px-10 py-5 bg-[#FAFAF8] text-[#1C294E] rounded-lg font-bold text-lg hover:bg-white transition-all duration-300 shadow-2xl hover:shadow-3xl hover:scale-105"
                          >
              Call (512) 123-4567
              <span className="inline-block ml-2 transition-transform duration-300 group-hover:translate-x-1"></span>
            </a>
          </div>

          <p className="mt-8 text-[#2C3A4B] font-manrope text-md">
          Professional service • Trusted locally • Dependable results
          </p>
        </div>
      </section>
      <section className="py-9 bg-background"></section>

    </main>
  );
}