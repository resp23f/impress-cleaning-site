'use client';
import React from 'react';
import Link from 'next/link';
import StaggerItem from '@/components/StaggerItem';

export default function PrivacyPolicy() {
  const sections = [
    { id: 'definitions', title: 'Definitions' },
    { id: 'information-we-collect', title: 'Information We Collect' },
    { id: 'how-we-use', title: 'How We Use Your Information' },
    { id: 'third-party-services', title: 'Third-Party Services' },
    { id: 'data-security', title: 'Data Security & Retention' },
    { id: 'cookies', title: 'Cookies & Tracking Technologies' },
    { id: 'your-rights', title: 'Your Rights' },
    { id: 'children', title: "Children's Privacy" },
    { id: 'changes', title: 'Changes to This Policy' },
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
              Privacy Policy
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
                This Privacy Policy (&quot;Policy&quot;) describes how Impress Cleaning Services, LLC, a Texas limited 
                liability company (&quot;Company,&quot; &quot;we,&quot; &quot;our,&quot; or &quot;us&quot;), collects, uses, discloses, and protects 
                your personal information when you access or use our website, customer portal, mobile applications, 
                and cleaning services (collectively, the &quot;Services&quot;). By accessing or using our Services, you 
                acknowledge that you have read, understood, and agree to be bound by this Policy.
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
                  For purposes of this Privacy Policy, the following definitions shall apply:
                </p>
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="font-manrope text-base text-slate-700">
                      <strong className="text-[#18335A]">&quot;Personal Information&quot;</strong> means any information that identifies, relates to, describes, or is reasonably capable of being associated with a particular individual, including but not limited to name, address, email, phone number, and payment information.
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="font-manrope text-base text-slate-700">
                      <strong className="text-[#18335A]">&quot;Services&quot;</strong> means our website located at impressyoucleaning.com, customer portal, and all cleaning services provided by the Company.
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="font-manrope text-base text-slate-700">
                      <strong className="text-[#18335A]">&quot;User&quot; or &quot;You&quot;</strong> means any individual who accesses or uses our Services, whether as a registered customer or visitor.
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="font-manrope text-base text-slate-700">
                      <strong className="text-[#18335A]">&quot;Device&quot;</strong> means any internet-connected device such as a phone, tablet, or computer used to access the Services.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </StaggerItem>

          {/* Section 2 - Information We Collect */}
          <StaggerItem>
            <div id="information-we-collect" className="mb-10 scroll-mt-24">
              <h2 className="font-display font-bold text-2xl text-[#18335A] mb-4 flex items-center gap-3">
                <span className="w-8 h-8 bg-[#079447]/10 rounded-lg flex items-center justify-center text-[#079447] text-sm font-bold">2</span>
                Information We Collect
              </h2>
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8">
                <h3 className="font-manrope font-bold text-lg text-[#18335A] mb-3">2.1 Information You Provide Directly</h3>
                <p className="font-manrope text-base text-slate-700 leading-relaxed mb-4">
                  We collect information that you voluntarily provide when using our Services, including:
                </p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-[#079447] rounded-full mt-2 flex-shrink-0" />
                    <span className="font-manrope text-base text-slate-700">
                      <strong className="text-[#18335A]">Account Information:</strong> Name, email address, phone number, password, and home or business address
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-[#079447] rounded-full mt-2 flex-shrink-0" />
                    <span className="font-manrope text-base text-slate-700">
                      <strong className="text-[#18335A]">Payment Information:</strong> Billing address and payment card details (securely processed through our payment processor)
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-[#079447] rounded-full mt-2 flex-shrink-0" />
                    <span className="font-manrope text-base text-slate-700">
                      <strong className="text-[#18335A]">Service Information:</strong> Property details, cleaning preferences, access instructions, and service history
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-[#079447] rounded-full mt-2 flex-shrink-0" />
                    <span className="font-manrope text-base text-slate-700">
                      <strong className="text-[#18335A]">Communications:</strong> Messages, feedback, reviews, and customer support inquiries
                    </span>
                  </li>
                </ul>

                <h3 className="font-manrope font-bold text-lg text-[#18335A] mb-3">2.2 Information Collected Automatically</h3>
                <p className="font-manrope text-base text-slate-700 leading-relaxed mb-4">
                  When you access our Services, we may automatically collect certain information, including:
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-[#079447] rounded-full mt-2 flex-shrink-0" />
                    <span className="font-manrope text-base text-slate-700">
                      <strong className="text-[#18335A]">Device Information:</strong> Device type, operating system, browser type, and unique device identifiers
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-[#079447] rounded-full mt-2 flex-shrink-0" />
                    <span className="font-manrope text-base text-slate-700">
                      <strong className="text-[#18335A]">Usage Data:</strong> Pages viewed, features used, time spent on Services, and interaction data
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-[#079447] rounded-full mt-2 flex-shrink-0" />
                    <span className="font-manrope text-base text-slate-700">
                      <strong className="text-[#18335A]">Location Data:</strong> General geographic location based on IP address
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-[#079447] rounded-full mt-2 flex-shrink-0" />
                    <span className="font-manrope text-base text-slate-700">
                      <strong className="text-[#18335A]">Log Data:</strong> IP address, access times, referring URLs, and error logs
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </StaggerItem>

          {/* Section 3 - How We Use */}
          <StaggerItem>
            <div id="how-we-use" className="mb-10 scroll-mt-24">
              <h2 className="font-display font-bold text-2xl text-[#18335A] mb-4 flex items-center gap-3">
                <span className="w-8 h-8 bg-[#079447]/10 rounded-lg flex items-center justify-center text-[#079447] text-sm font-bold">3</span>
                How We Use Your Information
              </h2>
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8">
                <p className="font-manrope text-base text-slate-700 leading-relaxed mb-4">
                  We use the information we collect for the following business and commercial purposes:
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-[#079447] rounded-full mt-2 flex-shrink-0" />
                    <span className="font-manrope text-base text-slate-700">To provide, operate, maintain, and improve our Services</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-[#079447] rounded-full mt-2 flex-shrink-0" />
                    <span className="font-manrope text-base text-slate-700">To process transactions, send invoices, and manage payments</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-[#079447] rounded-full mt-2 flex-shrink-0" />
                    <span className="font-manrope text-base text-slate-700">To schedule, confirm, and manage cleaning appointments</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-[#079447] rounded-full mt-2 flex-shrink-0" />
                    <span className="font-manrope text-base text-slate-700">To communicate with you regarding services, updates, and promotional offers</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-[#079447] rounded-full mt-2 flex-shrink-0" />
                    <span className="font-manrope text-base text-slate-700">To respond to your inquiries and provide customer support</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-[#079447] rounded-full mt-2 flex-shrink-0" />
                    <span className="font-manrope text-base text-slate-700">To personalize your experience and deliver relevant content</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-[#079447] rounded-full mt-2 flex-shrink-0" />
                    <span className="font-manrope text-base text-slate-700">To detect, prevent, and address fraud, security issues, and technical problems</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-[#079447] rounded-full mt-2 flex-shrink-0" />
                    <span className="font-manrope text-base text-slate-700">To comply with legal obligations and enforce our terms</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-[#079447] rounded-full mt-2 flex-shrink-0" />
                    <span className="font-manrope text-base text-slate-700">To analyze usage patterns and improve our Services</span>
                  </li>
                </ul>
              </div>
            </div>
          </StaggerItem>

          {/* Section 4 - Third-Party Services */}
          <StaggerItem>
            <div id="third-party-services" className="mb-10 scroll-mt-24">
              <h2 className="font-display font-bold text-2xl text-[#18335A] mb-4 flex items-center gap-3">
                <span className="w-8 h-8 bg-[#079447]/10 rounded-lg flex items-center justify-center text-[#079447] text-sm font-bold">4</span>
                Third-Party Services
              </h2>
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8">
                <p className="font-manrope text-base text-slate-700 leading-relaxed mb-4">
                  We engage trusted third-party service providers to facilitate our Services. These providers 
                  have access to your Personal Information only to perform specific tasks on our behalf and 
                  are obligated not to disclose or use it for any other purpose:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="font-manrope font-semibold text-[#18335A]">Google</p>
                    <p className="font-manrope text-sm text-slate-600">Authentication services (Sign in with Google)</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="font-manrope font-semibold text-[#18335A]">Stripe, Inc.</p>
                    <p className="font-manrope text-sm text-slate-600">Payment processing and billing</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="font-manrope font-semibold text-[#18335A]">Supabase</p>
                    <p className="font-manrope text-sm text-slate-600">Database hosting and authentication infrastructure</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="font-manrope font-semibold text-[#18335A]">Resend</p>
                    <p className="font-manrope text-sm text-slate-600">Transactional email delivery</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="font-manrope font-semibold text-[#18335A]">Vercel</p>
                    <p className="font-manrope text-sm text-slate-600">Website hosting and deployment</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="font-manrope font-semibold text-[#18335A]">Cloudflare</p>
                    <p className="font-manrope text-sm text-slate-600">Security, performance, and CDN services</p>
                  </div>
                </div>
                <p className="font-manrope text-base text-slate-700 leading-relaxed">
                  We do not sell, rent, or trade your Personal Information to third parties for their 
                  marketing purposes. We may disclose your information if required by law, court order, 
                  or governmental regulation, or if such disclosure is necessary to protect our rights, 
                  property, or safety, or that of our users or the public.
                </p>
              </div>
            </div>
          </StaggerItem>

          {/* Section 5 - Data Security & Retention */}
          <StaggerItem>
            <div id="data-security" className="mb-10 scroll-mt-24">
              <h2 className="font-display font-bold text-2xl text-[#18335A] mb-4 flex items-center gap-3">
                <span className="w-8 h-8 bg-[#079447]/10 rounded-lg flex items-center justify-center text-[#079447] text-sm font-bold">5</span>
                Data Security & Retention
              </h2>
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8">
                <h3 className="font-manrope font-bold text-lg text-[#18335A] mb-3">5.1 Security Measures</h3>
                <p className="font-manrope text-base text-slate-700 leading-relaxed mb-4">
                  We implement and maintain reasonable administrative, technical, and physical security 
                  measures designed to protect your Personal Information against unauthorized access, 
                  alteration, disclosure, or destruction. These measures include:
                </p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-[#079447] rounded-full mt-2 flex-shrink-0" />
                    <span className="font-manrope text-base text-slate-700">Encryption of data in transit using TLS/SSL protocols</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-[#079447] rounded-full mt-2 flex-shrink-0" />
                    <span className="font-manrope text-base text-slate-700">Encryption of sensitive data at rest</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-[#079447] rounded-full mt-2 flex-shrink-0" />
                    <span className="font-manrope text-base text-slate-700">Regular security assessments and vulnerability testing</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-[#079447] rounded-full mt-2 flex-shrink-0" />
                    <span className="font-manrope text-base text-slate-700">Access controls limiting employee access to Personal Information</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-[#079447] rounded-full mt-2 flex-shrink-0" />
                    <span className="font-manrope text-base text-slate-700">Secure authentication mechanisms including multi-factor options</span>
                  </li>
                </ul>

                <h3 className="font-manrope font-bold text-lg text-[#18335A] mb-3">5.2 Data Retention</h3>
                <p className="font-manrope text-base text-slate-700 leading-relaxed">
                  We retain your Personal Information for as long as necessary to fulfill the purposes 
                  outlined in this Policy, unless a longer retention period is required or permitted by 
                  law. When determining the retention period, we consider the nature of the information, 
                  the purposes for processing, legal requirements, and business needs. Upon request for 
                  account deletion, we will delete or anonymize your information within 30 days, except 
                  where retention is required for legal or legitimate business purposes.
                </p>
              </div>
            </div>
          </StaggerItem>

          {/* Section 6 - Cookies */}
          <StaggerItem>
            <div id="cookies" className="mb-10 scroll-mt-24">
              <h2 className="font-display font-bold text-2xl text-[#18335A] mb-4 flex items-center gap-3">
                <span className="w-8 h-8 bg-[#079447]/10 rounded-lg flex items-center justify-center text-[#079447] text-sm font-bold">6</span>
                Cookies & Tracking Technologies
              </h2>
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8">
                <p className="font-manrope text-base text-slate-700 leading-relaxed mb-4">
                  We use cookies and similar tracking technologies to collect and track information about 
                  your use of our Services. Cookies are small data files stored on your device that help 
                  us improve our Services and your experience.
                </p>
                <h3 className="font-manrope font-bold text-lg text-[#18335A] mb-3">Types of Cookies We Use:</h3>
                <div className="space-y-4 mb-6">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="font-manrope font-semibold text-[#18335A]">Essential Cookies</p>
                    <p className="font-manrope text-sm text-slate-600">Required for the operation of our Services, including authentication and security.</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="font-manrope font-semibold text-[#18335A]">Functional Cookies</p>
                    <p className="font-manrope text-sm text-slate-600">Enable personalized features and remember your preferences.</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="font-manrope font-semibold text-[#18335A]">Analytics Cookies</p>
                    <p className="font-manrope text-sm text-slate-600">Help us understand how visitors interact with our Services to improve functionality.</p>
                  </div>
                </div>
                <p className="font-manrope text-base text-slate-700 leading-relaxed">
                  You may control cookies through your browser settings. Please note that disabling certain 
                  cookies may affect the functionality of our Services. Our Services currently do not respond 
                  to &quot;Do Not Track&quot; signals.
                </p>
              </div>
            </div>
          </StaggerItem>

          {/* Section 7 - Your Rights */}
          <StaggerItem>
            <div id="your-rights" className="mb-10 scroll-mt-24">
              <h2 className="font-display font-bold text-2xl text-[#18335A] mb-4 flex items-center gap-3">
                <span className="w-8 h-8 bg-[#079447]/10 rounded-lg flex items-center justify-center text-[#079447] text-sm font-bold">7</span>
                Your Rights
              </h2>
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8">
                <p className="font-manrope text-base text-slate-700 leading-relaxed mb-4">
                  Subject to applicable law, you may have the following rights regarding your Personal Information:
                </p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-[#079447] rounded-full mt-2 flex-shrink-0" />
                    <span className="font-manrope text-base text-slate-700">
                      <strong className="text-[#18335A]">Right to Access:</strong> Request a copy of the Personal Information we hold about you
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-[#079447] rounded-full mt-2 flex-shrink-0" />
                    <span className="font-manrope text-base text-slate-700">
                      <strong className="text-[#18335A]">Right to Rectification:</strong> Request correction of inaccurate or incomplete information
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-[#079447] rounded-full mt-2 flex-shrink-0" />
                    <span className="font-manrope text-base text-slate-700">
                      <strong className="text-[#18335A]">Right to Deletion:</strong> Request deletion of your Personal Information, subject to certain exceptions
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-[#079447] rounded-full mt-2 flex-shrink-0" />
                    <span className="font-manrope text-base text-slate-700">
                      <strong className="text-[#18335A]">Right to Portability:</strong> Request transfer of your data in a machine-readable format
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-[#079447] rounded-full mt-2 flex-shrink-0" />
                    <span className="font-manrope text-base text-slate-700">
                      <strong className="text-[#18335A]">Right to Opt-Out:</strong> Unsubscribe from marketing communications at any time
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-[#079447] rounded-full mt-2 flex-shrink-0" />
                    <span className="font-manrope text-base text-slate-700">
                      <strong className="text-[#18335A]">Right to Withdraw Consent:</strong> Withdraw previously given consent for specific processing activities
                    </span>
                  </li>
                </ul>
                <p className="font-manrope text-base text-slate-700 leading-relaxed">
                  To exercise any of these rights, please contact us at{' '}
                  <a href="mailto:admin@impressyoucleaning.com" className="text-[#079447] hover:underline">
                    admin@impressyoucleaning.com
                  </a>. We will respond to your request within 30 days. We may require verification of your 
                  identity before processing certain requests.
                </p>
              </div>
            </div>
          </StaggerItem>

          {/* Section 8 - Children's Privacy */}
          <StaggerItem>
            <div id="children" className="mb-10 scroll-mt-24">
              <h2 className="font-display font-bold text-2xl text-[#18335A] mb-4 flex items-center gap-3">
                <span className="w-8 h-8 bg-[#079447]/10 rounded-lg flex items-center justify-center text-[#079447] text-sm font-bold">8</span>
                Children&apos;s Privacy
              </h2>
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8">
                <p className="font-manrope text-base text-slate-700 leading-relaxed">
                  Our Services are not directed to individuals under the age of 18, and we do not knowingly 
                  collect Personal Information from children. If you are a parent or guardian and believe 
                  that your child has provided us with Personal Information without your consent, please 
                  contact us immediately. If we become aware that we have collected Personal Information 
                  from a child without verification of parental consent, we will take steps to remove that 
                  information from our servers.
                </p>
              </div>
            </div>
          </StaggerItem>

          {/* Section 9 - Changes */}
          <StaggerItem>
            <div id="changes" className="mb-10 scroll-mt-24">
              <h2 className="font-display font-bold text-2xl text-[#18335A] mb-4 flex items-center gap-3">
                <span className="w-8 h-8 bg-[#079447]/10 rounded-lg flex items-center justify-center text-[#079447] text-sm font-bold">9</span>
                Changes to This Policy
              </h2>
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8">
                <p className="font-manrope text-base text-slate-700 leading-relaxed">
                  We reserve the right to modify this Privacy Policy at any time. If we make material changes, 
                  we will notify you by updating the &quot;Effective Date&quot; at the top of this Policy and, where 
                  appropriate, provide additional notice (such as via email or through our Services). Your 
                  continued use of our Services following the posting of changes constitutes your acceptance 
                  of such changes. We encourage you to review this Policy periodically to stay informed about 
                  our information practices.
                </p>
              </div>
            </div>
          </StaggerItem>

          {/* Section 10 - Contact */}
          <StaggerItem>
            <div id="contact" className="mb-10 scroll-mt-24">
              <h2 className="font-display font-bold text-2xl text-[#18335A] mb-4 flex items-center gap-3">
                <span className="w-8 h-8 bg-[#079447]/10 rounded-lg flex items-center justify-center text-[#079447] text-sm font-bold">10</span>
                Contact Us
              </h2>
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8">
                <p className="font-manrope text-base text-slate-700 leading-relaxed mb-4">
                  If you have any questions, concerns, or requests regarding this Privacy Policy or our 
                  data practices, please contact us:
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