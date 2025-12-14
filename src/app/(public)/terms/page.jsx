'use client';
import React from 'react';
import Link from 'next/link';
import StaggerItem from '@/components/StaggerItem';

export default function TermsOfService() {
  const sections = [
    { id: 'definitions', title: 'Definitions' },
    { id: 'services', title: 'Services' },
    { id: 'accounts', title: 'Account Responsibilities' },
    { id: 'booking', title: 'Booking & Scheduling' },
    { id: 'cancellation', title: 'Cancellation & Rescheduling' },
    { id: 'pricing', title: 'Pricing & Payment' },
    { id: 'property', title: 'Property Access & Liability' },
    { id: 'satisfaction', title: 'Service Satisfaction' },
    { id: 'conduct', title: 'Customer Conduct' },
    { id: 'indemnification', title: 'Indemnification' },
    { id: 'limitation', title: 'Limitation of Liability' },
    { id: 'force-majeure', title: 'Force Majeure' },
    { id: 'termination', title: 'Termination' },
    { id: 'governing-law', title: 'Governing Law & Disputes' },
    { id: 'general', title: 'General Provisions' },
    { id: 'contact', title: 'Contact Us' },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <StaggerItem>
        <section className="bg-gradient-to-br from-[#0B2850] to-[#18335A] py-16 md:py-24">
          <div className="mx-auto max-w-4xl px-6 md:px-8 text-center">
            <div className="inline-block px-4 py-2 bg-white/10 border border-white/20 rounded-full mb-4">
              <span className="text-white/90 text-sm font-semibold uppercase tracking-wide">Legal</span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
              Terms of Service
            </h1>
            <p className="text-white/70 text-lg">
              Effective Date: December 14, 2024
            </p>
          </div>
        </section>
      </StaggerItem>

      {/* Content */}
      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-4xl px-6 md:px-8">
          {/* Table of Contents */}
          <StaggerItem>
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8 mb-10">
              <h2 className="font-display font-bold text-xl text-[#18335A] mb-4">Table of Contents</h2>
              <nav className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {sections.map((section, index) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="font-manrope text-[15px] text-[#079447] hover:text-[#08A855] hover:underline transition-colors"
                  >
                    {index + 1}. {section.title}
                  </a>
                ))}
              </nav>
            </div>
          </StaggerItem>

          {/* Intro */}
          <StaggerItem>
            <div className="prose-section mb-10">
              <p className="font-manrope text-base text-slate-700 leading-relaxed">
                These Terms of Service (&quot;Terms&quot; or &quot;Agreement&quot;) constitute a legally binding agreement between 
                you and Impress Cleaning Services, LLC, a Texas limited liability company (&quot;Company,&quot; &quot;we,&quot; 
                &quot;our,&quot; or &quot;us&quot;). By accessing our website, customer portal, or using our cleaning services 
                (collectively, the &quot;Services&quot;), you acknowledge that you have read, understood, and agree to 
                be bound by these Terms. If you do not agree to these Terms, you may not access or use our Services.
              </p>
            </div>
          </StaggerItem>

          {/* Section 1 - Definitions */}
          <StaggerItem>
            <div id="definitions" className="mb-10 scroll-mt-24">
              <h2 className="font-display font-bold text-2xl text-[#18335A] mb-4 flex items-center gap-3">
                <span className="w-8 h-8 bg-[#079447]/10 rounded-lg flex items-center justify-center text-[#079447] text-sm font-bold">1</span>
                Definitions
              </h2>
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8">
                <p className="font-manrope text-base text-slate-700 leading-relaxed mb-4">
                  For purposes of these Terms of Service, the following definitions shall apply:
                </p>
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="font-manrope text-base text-slate-700">
                      <strong className="text-[#18335A]">&quot;Services&quot;</strong> means all cleaning services provided by the Company, including but not limited to standard cleaning, deep cleaning, move-in/move-out cleaning, post-construction cleaning, and commercial cleaning, as well as access to our website and customer portal.
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="font-manrope text-base text-slate-700">
                      <strong className="text-[#18335A]">&quot;Customer,&quot; &quot;User,&quot; or &quot;You&quot;</strong> means any individual or entity that accesses our website, creates an account, or engages our cleaning services.
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="font-manrope text-base text-slate-700">
                      <strong className="text-[#18335A]">&quot;Property&quot;</strong> means any residential or commercial premises where Services are to be performed.
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="font-manrope text-base text-slate-700">
                      <strong className="text-[#18335A]">&quot;Service Fee&quot;</strong> means the agreed-upon price for cleaning services as specified in the quote or invoice provided to the Customer.
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="font-manrope text-base text-slate-700">
                      <strong className="text-[#18335A]">&quot;Appointment&quot;</strong> means a scheduled date and time for the performance of Services.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </StaggerItem>

          {/* Section 2 - Services */}
          <StaggerItem>
            <div id="services" className="mb-10 scroll-mt-24">
              <h2 className="font-display font-bold text-2xl text-[#18335A] mb-4 flex items-center gap-3">
                <span className="w-8 h-8 bg-[#079447]/10 rounded-lg flex items-center justify-center text-[#079447] text-sm font-bold">2</span>
                Services
              </h2>
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8">
                <p className="font-manrope text-base text-slate-700 leading-relaxed mb-4">
                  Impress Cleaning Services, LLC provides professional cleaning services in the Georgetown, 
                  Texas area and surrounding communities. Our service offerings include:
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-[#079447] rounded-full mt-2 flex-shrink-0" />
                    <span className="font-manrope text-base text-slate-700">
                      <strong className="text-[#18335A]">Standard Cleaning:</strong> Regular maintenance cleaning for residential properties
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-[#079447] rounded-full mt-2 flex-shrink-0" />
                    <span className="font-manrope text-base text-slate-700">
                      <strong className="text-[#18335A]">Deep Cleaning:</strong> Comprehensive, thorough cleaning from top to bottom
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-[#079447] rounded-full mt-2 flex-shrink-0" />
                    <span className="font-manrope text-base text-slate-700">
                      <strong className="text-[#18335A]">Move-In/Move-Out Cleaning:</strong> Detailed cleaning for property transitions
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-[#079447] rounded-full mt-2 flex-shrink-0" />
                    <span className="font-manrope text-base text-slate-700">
                      <strong className="text-[#18335A]">Post-Construction Cleaning:</strong> Specialized cleaning following renovation or construction
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-[#079447] rounded-full mt-2 flex-shrink-0" />
                    <span className="font-manrope text-base text-slate-700">
                      <strong className="text-[#18335A]">Commercial Cleaning:</strong> Professional cleaning for offices and business premises
                    </span>
                  </li>
                </ul>
                <p className="font-manrope text-base text-slate-700 leading-relaxed mt-4">
                  Specific services included in each cleaning type will be outlined in your quote or service agreement.
                </p>
              </div>
            </div>
          </StaggerItem>

          {/* Section 3 - Account Responsibilities */}
          <StaggerItem>
            <div id="accounts" className="mb-10 scroll-mt-24">
              <h2 className="font-display font-bold text-2xl text-[#18335A] mb-4 flex items-center gap-3">
                <span className="w-8 h-8 bg-[#079447]/10 rounded-lg flex items-center justify-center text-[#079447] text-sm font-bold">3</span>
                Account Responsibilities
              </h2>
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8">
                <p className="font-manrope text-base text-slate-700 leading-relaxed mb-4">
                  When you create an account on our customer portal, you agree to the following obligations:
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-[#079447] rounded-full mt-2 flex-shrink-0" />
                    <span className="font-manrope text-base text-slate-700">Provide accurate, current, and complete information during registration</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-[#079447] rounded-full mt-2 flex-shrink-0" />
                    <span className="font-manrope text-base text-slate-700">Maintain and promptly update your account information as necessary</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-[#079447] rounded-full mt-2 flex-shrink-0" />
                    <span className="font-manrope text-base text-slate-700">Maintain the confidentiality of your login credentials and restrict access to your account</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-[#079447] rounded-full mt-2 flex-shrink-0" />
                    <span className="font-manrope text-base text-slate-700">Notify us immediately of any unauthorized access to or use of your account</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-[#079447] rounded-full mt-2 flex-shrink-0" />
                    <span className="font-manrope text-base text-slate-700">Accept responsibility for all activities that occur under your account</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-[#079447] rounded-full mt-2 flex-shrink-0" />
                    <span className="font-manrope text-base text-slate-700">Ensure that any authorized users of your account comply with these Terms</span>
                  </li>
                </ul>
                <p className="font-manrope text-base text-slate-700 leading-relaxed mt-4">
                  We reserve the right to suspend or terminate accounts that violate these Terms or are used 
                  for fraudulent or unlawful purposes.
                </p>
              </div>
            </div>
          </StaggerItem>

          {/* Section 4 - Booking & Scheduling */}
          <StaggerItem>
            <div id="booking" className="mb-10 scroll-mt-24">
              <h2 className="font-display font-bold text-2xl text-[#18335A] mb-4 flex items-center gap-3">
                <span className="w-8 h-8 bg-[#079447]/10 rounded-lg flex items-center justify-center text-[#079447] text-sm font-bold">4</span>
                Booking & Scheduling
              </h2>
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8">
                <p className="font-manrope text-base text-slate-700 leading-relaxed mb-4">
                  The following terms govern the booking and scheduling of Services:
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-[#079447] rounded-full mt-2 flex-shrink-0" />
                    <span className="font-manrope text-base text-slate-700">All appointments are subject to availability and confirmation by the Company</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-[#079447] rounded-full mt-2 flex-shrink-0" />
                    <span className="font-manrope text-base text-slate-700">You will receive confirmation of your booking via email or text message</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-[#079447] rounded-full mt-2 flex-shrink-0" />
                    <span className="font-manrope text-base text-slate-700">Appointment reminders will be sent prior to your scheduled service</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-[#079447] rounded-full mt-2 flex-shrink-0" />
                    <span className="font-manrope text-base text-slate-700">Our team will arrive within a reasonable window of your scheduled appointment time</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-[#079447] rounded-full mt-2 flex-shrink-0" />
                    <span className="font-manrope text-base text-slate-700">An adult (18 years or older) must be available to provide property access unless alternative arrangements have been agreed upon in advance</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-[#079447] rounded-full mt-2 flex-shrink-0" />
                    <span className="font-manrope text-base text-slate-700">You are responsible for ensuring our team can access all areas to be cleaned</span>
                  </li>
                </ul>
              </div>
            </div>
          </StaggerItem>

          {/* Section 5 - Cancellation & Rescheduling */}
          <StaggerItem>
            <div id="cancellation" className="mb-10 scroll-mt-24">
              <h2 className="font-display font-bold text-2xl text-[#18335A] mb-4 flex items-center gap-3">
                <span className="w-8 h-8 bg-[#079447]/10 rounded-lg flex items-center justify-center text-[#079447] text-sm font-bold">5</span>
                Cancellation & Rescheduling Policy
              </h2>
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8">
                <p className="font-manrope text-base text-slate-700 leading-relaxed mb-6">
                  We understand that circumstances may require changes to your scheduled appointments. The 
                  following policy applies to all cancellations and schedule modifications:
                </p>

                {/* Cancellation Fees Table */}
                <div className="bg-gray-50 rounded-xl p-6 mb-6">
                  <h3 className="font-manrope font-bold text-lg text-[#18335A] mb-4">5.1 Cancellation Fees</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-3 border-b border-gray-200">
                      <span className="font-manrope text-slate-700">Notice of 48 hours or more</span>
                      <span className="font-manrope font-semibold text-[#079447]">No fee</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-gray-200">
                      <span className="font-manrope text-slate-700">Notice of 24–48 hours</span>
                      <span className="font-manrope font-semibold text-amber-600">$50.00 fee</span>
                    </div>
                    <div className="flex justify-between items-center py-3">
                      <span className="font-manrope text-slate-700">Notice of less than 24 hours</span>
                      <span className="font-manrope font-semibold text-red-600">Full Service Fee</span>
                    </div>
                  </div>
                </div>

                {/* Rescheduling Policy */}
                <div className="bg-gray-50 rounded-xl p-6 mb-6">
                  <h3 className="font-manrope font-bold text-lg text-[#18335A] mb-4">5.2 Rescheduling Policy</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <span className="w-2 h-2 bg-[#079447] rounded-full mt-2 flex-shrink-0" />
                      <span className="font-manrope text-base text-slate-700">Rescheduling requests made 48 or more hours in advance: No fee</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-2 h-2 bg-[#079447] rounded-full mt-2 flex-shrink-0" />
                      <span className="font-manrope text-base text-slate-700">Rescheduling requests made 24–48 hours in advance: $50.00 fee</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-2 h-2 bg-[#079447] rounded-full mt-2 flex-shrink-0" />
                      <span className="font-manrope text-base text-slate-700">Rescheduling requests made less than 24 hours in advance: Full Service Fee</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-2 h-2 bg-[#079447] rounded-full mt-2 flex-shrink-0" />
                      <span className="font-manrope text-base text-slate-700">Rescheduled appointments must be completed within 30 calendar days of the original date</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-2 h-2 bg-[#079447] rounded-full mt-2 flex-shrink-0" />
                      <span className="font-manrope text-base text-slate-700">After four (4) reschedules within a 12-month period, prepayment may be required for future bookings</span>
                    </li>
                  </ul>
                </div>

                {/* No-Show Policy */}
                <div className="bg-gray-50 rounded-xl p-6 mb-6">
                  <h3 className="font-manrope font-bold text-lg text-[#18335A] mb-4">5.3 No-Show Policy</h3>
                  <p className="font-manrope text-base text-slate-700 leading-relaxed">
                    If our service team arrives at the scheduled time and is unable to access the Property 
                    (including but not limited to: no one present, locked gate, no response to contact attempts, 
                    or unsafe conditions), we will wait for a period of fifteen (15) minutes and attempt to 
                    contact you. If access cannot be obtained, this shall constitute a &quot;no-show,&quot; and the
                    <strong> full Service Fee will be charged</strong>.
                  </p>
                </div>

                {/* Emergencies */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                  <h3 className="font-manrope font-bold text-lg text-blue-800 mb-2">5.4 Emergency Exceptions</h3>
                  <p className="font-manrope text-base text-blue-700 leading-relaxed">
                    We recognize that genuine emergencies occur (medical emergencies, family emergencies, natural 
                    disasters, etc.). In documented emergency situations, cancellation or rescheduling fees may 
                    be waived at the sole discretion of the Company. Please contact us as soon as reasonably 
                    possible to discuss your circumstances.
                  </p>
                </div>
              </div>
            </div>
          </StaggerItem>

          {/* Section 6 - Pricing & Payment */}
          <StaggerItem>
            <div id="pricing" className="mb-10 scroll-mt-24">
              <h2 className="font-display font-bold text-2xl text-[#18335A] mb-4 flex items-center gap-3">
                <span className="w-8 h-8 bg-[#079447]/10 rounded-lg flex items-center justify-center text-[#079447] text-sm font-bold">6</span>
                Pricing & Payment
              </h2>
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8">
                <h3 className="font-manrope font-bold text-lg text-[#18335A] mb-3">6.1 Pricing</h3>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-[#079447] rounded-full mt-2 flex-shrink-0" />
                    <span className="font-manrope text-base text-slate-700">Service pricing is provided in your quote and confirmed prior to the commencement of Services</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-[#079447] rounded-full mt-2 flex-shrink-0" />
                    <span className="font-manrope text-base text-slate-700">Quotes are valid for thirty (30) days from the date of issuance</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-[#079447] rounded-full mt-2 flex-shrink-0" />
                    <span className="font-manrope text-base text-slate-700">Additional charges may apply for services beyond the original scope of work</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-[#079447] rounded-full mt-2 flex-shrink-0" />
                    <span className="font-manrope text-base text-slate-700">All prices are quoted in United States Dollars (USD) and are inclusive of applicable taxes unless otherwise stated</span>
                  </li>
                </ul>

                <h3 className="font-manrope font-bold text-lg text-[#18335A] mb-3">6.2 Payment Terms</h3>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-[#079447] rounded-full mt-2 flex-shrink-0" />
                    <span className="font-manrope text-base text-slate-700">Payment is due upon completion of Services unless alternative arrangements have been made</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-[#079447] rounded-full mt-2 flex-shrink-0" />
                    <span className="font-manrope text-base text-slate-700">We accept payment via credit card, debit card, and other methods as indicated in our customer portal</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-[#079447] rounded-full mt-2 flex-shrink-0" />
                    <span className="font-manrope text-base text-slate-700">All payments are processed securely through our third-party payment processor, Stripe, Inc.</span>
                  </li>
                </ul>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                  <h3 className="font-manrope font-bold text-lg text-amber-800 mb-2">6.3 Late Payment Policy</h3>
                  <p className="font-manrope text-base text-amber-700 leading-relaxed">
                    Invoices are due upon receipt. A grace period of seven (7) calendar days is provided for 
                    payment. After the grace period, a late fee of <strong>five percent (5%)</strong> of the 
                    outstanding balance will be assessed. We reserve the right to suspend or terminate Services 
                    for accounts with overdue balances and may pursue collection of outstanding amounts through 
                    appropriate legal channels.
                  </p>
                </div>
              </div>
            </div>
          </StaggerItem>

          {/* Section 7 - Property Access & Liability */}
          <StaggerItem>
            <div id="property" className="mb-10 scroll-mt-24">
              <h2 className="font-display font-bold text-2xl text-[#18335A] mb-4 flex items-center gap-3">
                <span className="w-8 h-8 bg-[#079447]/10 rounded-lg flex items-center justify-center text-[#079447] text-sm font-bold">7</span>
                Property Access & Liability
              </h2>
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8">
                <p className="font-manrope text-base text-slate-700 leading-relaxed mb-4">
                  By scheduling Services, you agree to the following terms regarding property access and liability:
                </p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-[#079447] rounded-full mt-2 flex-shrink-0" />
                    <span className="font-manrope text-base text-slate-700">You authorize our service team to access your Property for the sole purpose of providing the agreed-upon cleaning Services</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-[#079447] rounded-full mt-2 flex-shrink-0" />
                    <span className="font-manrope text-base text-slate-700">You will provide safe, unobstructed access to all areas designated for cleaning</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-[#079447] rounded-full mt-2 flex-shrink-0" />
                    <span className="font-manrope text-base text-slate-700">You are responsible for securing or removing valuable, fragile, sentimental, or irreplaceable items prior to our arrival</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-[#079447] rounded-full mt-2 flex-shrink-0" />
                    <span className="font-manrope text-base text-slate-700">The Company is not responsible for damage to items not disclosed as requiring special care or attention</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-[#079447] rounded-full mt-2 flex-shrink-0" />
                    <span className="font-manrope text-base text-slate-700">The Company is not liable for pre-existing damage, defects, or conditions, including but not limited to worn surfaces, loose fixtures, or normal wear and tear</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-[#079447] rounded-full mt-2 flex-shrink-0" />
                    <span className="font-manrope text-base text-slate-700">Pets must be secured or arrangements made prior to our team&apos;s arrival to ensure the safety of our staff and your animals</span>
                  </li>
                </ul>
                <p className="font-manrope text-base text-slate-700 leading-relaxed">
                  If any damage is alleged to have occurred during the provision of Services, you must notify 
                  the Company in writing within <strong>twenty-four (24) hours</strong> of service completion. 
                  Failure to provide timely notice may affect the Company&apos;s ability to investigate and address 
                  the claim.
                </p>
              </div>
            </div>
          </StaggerItem>

          {/* Section 8 - Service Satisfaction */}
          <StaggerItem>
            <div id="satisfaction" className="mb-10 scroll-mt-24">
              <h2 className="font-display font-bold text-2xl text-[#18335A] mb-4 flex items-center gap-3">
                <span className="w-8 h-8 bg-[#079447]/10 rounded-lg flex items-center justify-center text-[#079447] text-sm font-bold">8</span>
                Service Satisfaction
              </h2>
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8">
                <p className="font-manrope text-base text-slate-700 leading-relaxed mb-4">
                  We are committed to delivering high-quality cleaning services. If you are not satisfied with 
                  any aspect of our Services:
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-[#079447] rounded-full mt-2 flex-shrink-0" />
                    <span className="font-manrope text-base text-slate-700">Please contact us within twenty-four (24) hours of service completion</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-[#079447] rounded-full mt-2 flex-shrink-0" />
                    <span className="font-manrope text-base text-slate-700">We will work with you to understand and address your specific concerns</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-[#079447] rounded-full mt-2 flex-shrink-0" />
                    <span className="font-manrope text-base text-slate-700">At our sole discretion, we may offer to re-clean specific areas at no additional charge</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-[#079447] rounded-full mt-2 flex-shrink-0" />
                    <span className="font-manrope text-base text-slate-700">Satisfaction remedies are determined on a case-by-case basis and do not constitute a guarantee of specific results</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-[#079447] rounded-full mt-2 flex-shrink-0" />
                    <span className="font-manrope text-base text-slate-700">Refunds, if any, are provided at the sole discretion of the Company</span>
                  </li>
                </ul>
              </div>
            </div>
          </StaggerItem>

          {/* Section 9 - Customer Conduct */}
          <StaggerItem>
            <div id="conduct" className="mb-10 scroll-mt-24">
              <h2 className="font-display font-bold text-2xl text-[#18335A] mb-4 flex items-center gap-3">
                <span className="w-8 h-8 bg-[#079447]/10 rounded-lg flex items-center justify-center text-[#079447] text-sm font-bold">9</span>
                Customer Conduct
              </h2>
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8">
                <p className="font-manrope text-base text-slate-700 leading-relaxed mb-4">
                  You agree to provide a safe, respectful, and professional environment for our service team. 
                  The Company reserves the right to immediately cease Services and refuse future bookings if 
                  our staff experiences any of the following:
                </p>
                <ul className="space-y-3 mb-4">
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                    <span className="font-manrope text-base text-slate-700">Harassment, verbal abuse, threats, or intimidating behavior</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                    <span className="font-manrope text-base text-slate-700">Discrimination based on race, gender, religion, national origin, or any other protected characteristic</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                    <span className="font-manrope text-base text-slate-700">Unsafe, unsanitary, or hazardous working conditions</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                    <span className="font-manrope text-base text-slate-700">Requests to perform services outside our scope of work or in violation of law</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                    <span className="font-manrope text-base text-slate-700">Any conduct that creates an uncomfortable or hostile environment for our team</span>
                  </li>
                </ul>
                <p className="font-manrope text-base text-slate-700 leading-relaxed">
                  In the event Services are terminated due to customer conduct, the full Service Fee will be 
                  charged, and no refund will be provided.
                </p>
              </div>
            </div>
          </StaggerItem>

          {/* Section 10 - Indemnification */}
          <StaggerItem>
            <div id="indemnification" className="mb-10 scroll-mt-24">
              <h2 className="font-display font-bold text-2xl text-[#18335A] mb-4 flex items-center gap-3">
                <span className="w-8 h-8 bg-[#079447]/10 rounded-lg flex items-center justify-center text-[#079447] text-sm font-bold">10</span>
                Indemnification
              </h2>
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8">
                <p className="font-manrope text-base text-slate-700 leading-relaxed">
                  You agree to indemnify, defend, and hold harmless Impress Cleaning Services, LLC, its officers, 
                  directors, employees, agents, and affiliates from and against any and all claims, damages, 
                  losses, liabilities, costs, and expenses (including reasonable attorneys&apos; fees) arising out 
                  of or relating to: (a) your use of the Services; (b) your violation of these Terms; (c) your 
                  violation of any rights of a third party; (d) any misrepresentation made by you; or (e) any 
                  claims arising from the condition of your Property, including but not limited to personal injury 
                  or property damage not caused by the gross negligence or willful misconduct of the Company.
                </p>
              </div>
            </div>
          </StaggerItem>

          {/* Section 11 - Limitation of Liability */}
          <StaggerItem>
            <div id="limitation" className="mb-10 scroll-mt-24">
              <h2 className="font-display font-bold text-2xl text-[#18335A] mb-4 flex items-center gap-3">
                <span className="w-8 h-8 bg-[#079447]/10 rounded-lg flex items-center justify-center text-[#079447] text-sm font-bold">11</span>
                Limitation of Liability
              </h2>
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8">
                <p className="font-manrope text-base text-slate-700 leading-relaxed mb-4">
                  TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW:
                </p>
                <ul className="space-y-3 mb-4">
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-[#079447] rounded-full mt-2 flex-shrink-0" />
                    <span className="font-manrope text-base text-slate-700">The Company&apos;s total liability for any claim arising from or related to these Terms or the Services shall not exceed the amount paid by you for the specific Service giving rise to the claim</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-[#079447] rounded-full mt-2 flex-shrink-0" />
                    <span className="font-manrope text-base text-slate-700">The Company shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, use, or goodwill</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-[#079447] rounded-full mt-2 flex-shrink-0" />
                    <span className="font-manrope text-base text-slate-700">The Company is not responsible for damage caused by pre-existing conditions, defects, normal wear and tear, or the inherent nature of materials</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-[#079447] rounded-full mt-2 flex-shrink-0" />
                    <span className="font-manrope text-base text-slate-700">The Company assumes no liability for loss of or damage to cash, jewelry, collectibles, art, antiques, or other irreplaceable items not secured prior to service</span>
                  </li>
                </ul>
                <p className="font-manrope text-base text-slate-700 leading-relaxed">
                  Some jurisdictions do not allow the exclusion or limitation of certain damages. In such 
                  jurisdictions, the Company&apos;s liability shall be limited to the maximum extent permitted by law.
                </p>
              </div>
            </div>
          </StaggerItem>

          {/* Section 12 - Force Majeure */}
          <StaggerItem>
            <div id="force-majeure" className="mb-10 scroll-mt-24">
              <h2 className="font-display font-bold text-2xl text-[#18335A] mb-4 flex items-center gap-3">
                <span className="w-8 h-8 bg-[#079447]/10 rounded-lg flex items-center justify-center text-[#079447] text-sm font-bold">12</span>
                Force Majeure
              </h2>
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8">
                <p className="font-manrope text-base text-slate-700 leading-relaxed">
                  The Company shall not be liable for any failure or delay in performing its obligations under 
                  these Terms due to circumstances beyond its reasonable control, including but not limited to: 
                  acts of God, natural disasters, severe weather conditions (including but not limited to 
                  hurricanes, tornadoes, floods, ice storms, or excessive heat warnings), epidemics or pandemics, 
                  government actions, civil unrest, war, terrorism, labor disputes, power outages, 
                  telecommunications failures, or any other event that could not have been reasonably anticipated 
                  or prevented. In such events, the Company will make reasonable efforts to notify you and 
                  reschedule Services at the earliest practicable date.
                </p>
              </div>
            </div>
          </StaggerItem>

          {/* Section 13 - Termination */}
          <StaggerItem>
            <div id="termination" className="mb-10 scroll-mt-24">
              <h2 className="font-display font-bold text-2xl text-[#18335A] mb-4 flex items-center gap-3">
                <span className="w-8 h-8 bg-[#079447]/10 rounded-lg flex items-center justify-center text-[#079447] text-sm font-bold">13</span>
                Termination
              </h2>
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8">
                <p className="font-manrope text-base text-slate-700 leading-relaxed mb-4">
                  Either party may terminate the service relationship at any time, subject to the cancellation 
                  policy set forth in Section 5. The Company reserves the right to refuse or discontinue 
                  Services to any Customer for any reason, including but not limited to:
                </p>
                <ul className="space-y-3 mb-4">
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-[#079447] rounded-full mt-2 flex-shrink-0" />
                    <span className="font-manrope text-base text-slate-700">Violation of these Terms</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-[#079447] rounded-full mt-2 flex-shrink-0" />
                    <span className="font-manrope text-base text-slate-700">Non-payment or repeated late payment</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-[#079447] rounded-full mt-2 flex-shrink-0" />
                    <span className="font-manrope text-base text-slate-700">Conduct that endangers our staff or creates unsafe working conditions</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-[#079447] rounded-full mt-2 flex-shrink-0" />
                    <span className="font-manrope text-base text-slate-700">Fraudulent or unlawful activity</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-[#079447] rounded-full mt-2 flex-shrink-0" />
                    <span className="font-manrope text-base text-slate-700">Repeated no-shows or excessive cancellations</span>
                  </li>
                </ul>
                <p className="font-manrope text-base text-slate-700 leading-relaxed">
                  Upon termination, any outstanding balances shall remain due and payable. Sections of these 
                  Terms that by their nature should survive termination shall remain in effect.
                </p>
              </div>
            </div>
          </StaggerItem>

          {/* Section 14 - Governing Law & Disputes */}
          <StaggerItem>
            <div id="governing-law" className="mb-10 scroll-mt-24">
              <h2 className="font-display font-bold text-2xl text-[#18335A] mb-4 flex items-center gap-3">
                <span className="w-8 h-8 bg-[#079447]/10 rounded-lg flex items-center justify-center text-[#079447] text-sm font-bold">14</span>
                Governing Law & Dispute Resolution
              </h2>
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8">
                <p className="font-manrope text-base text-slate-700 leading-relaxed mb-4">
                  These Terms of Service shall be governed by and construed in accordance with the laws of the 
                  State of Texas, without regard to its conflict of law provisions.
                </p>
                <p className="font-manrope text-base text-slate-700 leading-relaxed">
                  Any dispute, controversy, or claim arising out of or relating to these Terms or the Services 
                  shall be resolved exclusively in the state or federal courts located in Williamson County, 
                  Texas. You hereby consent to the personal jurisdiction and venue of such courts and waive any 
                  objection based on inconvenient forum.
                </p>
              </div>
            </div>
          </StaggerItem>

          {/* Section 15 - General Provisions */}
          <StaggerItem>
            <div id="general" className="mb-10 scroll-mt-24">
              <h2 className="font-display font-bold text-2xl text-[#18335A] mb-4 flex items-center gap-3">
                <span className="w-8 h-8 bg-[#079447]/10 rounded-lg flex items-center justify-center text-[#079447] text-sm font-bold">15</span>
                General Provisions
              </h2>
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8">
                <div className="space-y-6">
                  <div>
                    <h3 className="font-manrope font-bold text-lg text-[#18335A] mb-2">15.1 Entire Agreement</h3>
                    <p className="font-manrope text-base text-slate-700 leading-relaxed">
                      These Terms, together with our Privacy Policy and any service-specific agreements, 
                      constitute the entire agreement between you and the Company regarding the Services and 
                      supersede all prior agreements, representations, and understandings.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-manrope font-bold text-lg text-[#18335A] mb-2">15.2 Severability</h3>
                    <p className="font-manrope text-base text-slate-700 leading-relaxed">
                      If any provision of these Terms is found to be invalid, illegal, or unenforceable, the 
                      remaining provisions shall continue in full force and effect. The invalid provision shall 
                      be modified to the minimum extent necessary to make it valid and enforceable while preserving 
                      the parties&apos; original intent.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-manrope font-bold text-lg text-[#18335A] mb-2">15.3 Waiver</h3>
                    <p className="font-manrope text-base text-slate-700 leading-relaxed">
                      The failure of the Company to enforce any right or provision of these Terms shall not 
                      constitute a waiver of such right or provision. Any waiver must be in writing and signed 
                      by an authorized representative of the Company.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-manrope font-bold text-lg text-[#18335A] mb-2">15.4 Assignment</h3>
                    <p className="font-manrope text-base text-slate-700 leading-relaxed">
                      You may not assign or transfer these Terms or your rights hereunder without the prior 
                      written consent of the Company. The Company may assign these Terms without restriction.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-manrope font-bold text-lg text-[#18335A] mb-2">15.5 Modifications to Terms</h3>
                    <p className="font-manrope text-base text-slate-700 leading-relaxed">
                      We reserve the right to modify these Terms at any time. Material changes will be communicated 
                      by updating the &quot;Effective Date&quot; and, where appropriate, providing additional notice. Your 
                      continued use of the Services following any changes constitutes acceptance of the revised Terms.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </StaggerItem>

          {/* Section 16 - Contact */}
          <StaggerItem>
            <div id="contact" className="mb-10 scroll-mt-24">
              <h2 className="font-display font-bold text-2xl text-[#18335A] mb-4 flex items-center gap-3">
                <span className="w-8 h-8 bg-[#079447]/10 rounded-lg flex items-center justify-center text-[#079447] text-sm font-bold">16</span>
                Contact Us
              </h2>
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8">
                <p className="font-manrope text-base text-slate-700 leading-relaxed mb-4">
                  If you have any questions, concerns, or inquiries regarding these Terms of Service, please contact us:
                </p>
                <div className="bg-gray-50 rounded-xl p-6">
                  <p className="font-manrope font-bold text-[#18335A] text-lg mb-2">Impress Cleaning Services, LLC</p>
                  <p className="font-manrope text-slate-700">Georgetown, Texas</p>
                  <p className="font-manrope text-slate-700 mt-2">
                    <strong>Email:</strong>{' '}
                    <a href="mailto:admin@impressyoucleaning.com" className="text-[#079447] hover:underline">
                      admin@impressyoucleaning.com
                    </a>
                  </p>
                  <p className="font-manrope text-slate-700">
                    <strong>Phone:</strong>{' '}
                    <a href="tel:+15122775364" className="text-[#079447] hover:underline">
                      (512) 277-5364
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </StaggerItem>

          {/* Back Link */}
          <StaggerItem>
            <div className="text-center pt-8 border-t border-gray-200">
              <Link
                href="/"
                className="inline-flex items-center gap-2 font-manrope font-semibold text-[#079447] hover:text-[#08A855] transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Home
              </Link>
            </div>
          </StaggerItem>
        </div>
      </section>
    </main>
  );
}