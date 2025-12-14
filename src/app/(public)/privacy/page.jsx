'use client';
import React from 'react';
import Link from 'next/link';

export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="border-b border-gray-200 pb-6 mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-1">Privacy Policy</h1>
          <p className="text-xs text-gray-500">Effective Date: December 14, 2025</p>
        </div>

        {/* Intro */}
        <div className="mb-8">
          <p className="text-sm text-gray-600 leading-relaxed">
            This Privacy Policy (&quot;Policy&quot;) describes how Impress Cleaning Services, LLC, a Texas limited 
            liability company (&quot;Company,&quot; &quot;we,&quot; &quot;our,&quot; or &quot;us&quot;), collects, uses, discloses, and protects 
            your personal information when you access or use our website, customer portal, mobile applications, 
            and cleaning services (collectively, the &quot;Services&quot;). By accessing or using our Services, you 
            acknowledge that you have read, understood, and agree to be bound by this Policy.
          </p>
        </div>


        {/* Section 1 */}
        <div id="definitions" className="mb-6 scroll-mt-8">
          <h2 className="text-base font-semibold text-gray-900 mb-2">1. Definitions</h2>
          <p className="text-sm text-gray-600 leading-relaxed mb-2">
            For purposes of this Privacy Policy, the following definitions shall apply:
          </p>
          <p className="text-sm text-gray-600 leading-relaxed mb-2">
            <strong>&quot;Personal Information&quot;</strong> means any information that identifies, relates to, describes, or is reasonably capable of being associated with a particular individual, including but not limited to name, address, email, phone number, and payment information.
          </p>
          <p className="text-sm text-gray-600 leading-relaxed mb-2">
            <strong>&quot;Services&quot;</strong> means our website located at impressyoucleaning.com, customer portal, and all cleaning services provided by the Company.
          </p>
          <p className="text-sm text-gray-600 leading-relaxed mb-2">
            <strong>&quot;User&quot; or &quot;You&quot;</strong> means any individual who accesses or uses our Services, whether as a registered customer or visitor.
          </p>
          <p className="text-sm text-gray-600 leading-relaxed">
            <strong>&quot;Device&quot;</strong> means any internet-connected device such as a phone, tablet, or computer used to access the Services.
          </p>
        </div>

        {/* Section 2 */}
        <div id="information-we-collect" className="mb-6 scroll-mt-8">
          <h2 className="text-base font-semibold text-gray-900 mb-2">2. Information We Collect</h2>
          <p className="text-sm text-gray-600 leading-relaxed mb-2">
            <strong>2.1 Information You Provide Directly.</strong> We collect information that you voluntarily provide when using our Services, including: (a) Account Information such as name, email address, phone number, password, and home or business address; (b) Payment Information such as billing address and payment card details (securely processed through our payment processor); (c) Service Information such as property details, cleaning preferences, access instructions, and service history; and (d) Communications such as messages, feedback, reviews, and customer support inquiries.
          </p>
          <p className="text-sm text-gray-600 leading-relaxed">
            <strong>2.2 Information Collected Automatically.</strong> When you access our Services, we may automatically collect certain information, including: (a) Device Information such as device type, operating system, browser type, and unique device identifiers; (b) Usage Data such as pages viewed, features used, time spent on Services, and interaction data; (c) Location Data such as general geographic location based on IP address; and (d) Log Data such as IP address, access times, referring URLs, and error logs.
          </p>
        </div>

        {/* Section 3 */}
        <div id="how-we-use" className="mb-6 scroll-mt-8">
          <h2 className="text-base font-semibold text-gray-900 mb-2">3. How We Use Your Information</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            We use the information we collect for the following business and commercial purposes: (a) to provide, operate, maintain, and improve our Services; (b) to process transactions, send invoices, and manage payments; (c) to schedule, confirm, and manage cleaning appointments; (d) to communicate with you regarding services, updates, and promotional offers; (e) to respond to your inquiries and provide customer support; (f) to personalize your experience and deliver relevant content; (g) to detect, prevent, and address fraud, security issues, and technical problems; (h) to comply with legal obligations and enforce our terms; and (i) to analyze usage patterns and improve our Services.
          </p>
        </div>

        {/* Section 4 */}
        <div id="third-party-services" className="mb-6 scroll-mt-8">
          <h2 className="text-base font-semibold text-gray-900 mb-2">4. Third-Party Services</h2>
          <p className="text-sm text-gray-600 leading-relaxed mb-2">
            We engage trusted third-party service providers to facilitate our Services. These providers have access to your Personal Information only to perform specific tasks on our behalf and are obligated not to disclose or use it for any other purpose. Our service providers include: Google (authentication services), Stripe, Inc. (payment processing and billing), Supabase (database hosting and authentication infrastructure), Resend (transactional email delivery), Vercel (website hosting and deployment), and Cloudflare (security, performance, and CDN services).
          </p>
          <p className="text-sm text-gray-600 leading-relaxed">
            We do not sell, rent, or trade your Personal Information to third parties for their marketing purposes. We may disclose your information if required by law, court order, or governmental regulation, or if such disclosure is necessary to protect our rights, property, or safety, or that of our users or the public.
          </p>
        </div>

        {/* Section 5 */}
        <div id="data-security" className="mb-6 scroll-mt-8">
          <h2 className="text-base font-semibold text-gray-900 mb-2">5. Data Security &amp; Retention</h2>
          <p className="text-sm text-gray-600 leading-relaxed mb-2">
            <strong>5.1 Security Measures.</strong> We implement and maintain reasonable administrative, technical, and physical security measures designed to protect your Personal Information against unauthorized access, alteration, disclosure, or destruction. These measures include encryption of data in transit using TLS/SSL protocols, encryption of sensitive data at rest, regular security assessments and vulnerability testing, access controls limiting employee access to Personal Information, and secure authentication mechanisms including multi-factor options.
          </p>
          <p className="text-sm text-gray-600 leading-relaxed">
            <strong>5.2 Data Retention.</strong> We retain your Personal Information for as long as necessary to fulfill the purposes outlined in this Policy, unless a longer retention period is required or permitted by law. When determining the retention period, we consider the nature of the information, the purposes for processing, legal requirements, and business needs. Upon request for account deletion, we will delete or anonymize your information within 30 days, except where retention is required for legal or legitimate business purposes.
          </p>
        </div>

        {/* Section 6 */}
        <div id="cookies" className="mb-6 scroll-mt-8">
          <h2 className="text-base font-semibold text-gray-900 mb-2">6. Cookies &amp; Tracking Technologies</h2>
          <p className="text-sm text-gray-600 leading-relaxed mb-2">
            We use cookies and similar tracking technologies to collect and track information about your use of our Services. Cookies are small data files stored on your device that help us improve our Services and your experience. We use the following types of cookies: (a) Essential Cookies required for the operation of our Services, including authentication and security; (b) Functional Cookies that enable personalized features and remember your preferences; and (c) Analytics Cookies that help us understand how visitors interact with our Services to improve functionality.
          </p>
          <p className="text-sm text-gray-600 leading-relaxed">
            You may control cookies through your browser settings. Please note that disabling certain cookies may affect the functionality of our Services. Our Services currently do not respond to &quot;Do Not Track&quot; signals.
          </p>
        </div>

        {/* Section 7 */}
        <div id="your-rights" className="mb-6 scroll-mt-8">
          <h2 className="text-base font-semibold text-gray-900 mb-2">7. Your Rights</h2>
          <p className="text-sm text-gray-600 leading-relaxed mb-2">
            Subject to applicable law, you may have the following rights regarding your Personal Information: (a) Right to Access: request a copy of the Personal Information we hold about you; (b) Right to Rectification: request correction of inaccurate or incomplete information; (c) Right to Deletion: request deletion of your Personal Information, subject to certain exceptions; (d) Right to Portability: request transfer of your data in a machine-readable format; (e) Right to Opt-Out: unsubscribe from marketing communications at any time; and (f) Right to Withdraw Consent: withdraw previously given consent for specific processing activities.
          </p>
          <p className="text-sm text-gray-600 leading-relaxed">
            To exercise any of these rights, please contact us at <a href="mailto:admin@impressyoucleaning.com" className="text-blue-600 hover:underline">admin@impressyoucleaning.com</a>. We will respond to your request within 30 days. We may require verification of your identity before processing certain requests.
          </p>
        </div>

        {/* Section 8 */}
        <div id="children" className="mb-6 scroll-mt-8">
          <h2 className="text-base font-semibold text-gray-900 mb-2">8. Children&apos;s Privacy</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Our Services are not directed to individuals under the age of 18, and we do not knowingly collect Personal Information from children. If you are a parent or guardian and believe that your child has provided us with Personal Information without your consent, please contact us immediately. If we become aware that we have collected Personal Information from a child without verification of parental consent, we will take steps to remove that information from our servers.
          </p>
        </div>

        {/* Section 9 */}
        <div id="changes" className="mb-6 scroll-mt-8">
          <h2 className="text-base font-semibold text-gray-900 mb-2">9. Changes to This Policy</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            We reserve the right to modify this Privacy Policy at any time. If we make material changes, we will notify you by updating the &quot;Effective Date&quot; at the top of this Policy and, where appropriate, provide additional notice (such as via email or through our Services). Your continued use of our Services following the posting of changes constitutes your acceptance of such changes. We encourage you to review this Policy periodically to stay informed about our information practices.
          </p>
        </div>

        {/* Section 10 */}
        <div id="contact" className="mb-8 scroll-mt-8">
          <h2 className="text-base font-semibold text-gray-900 mb-2">10. Contact Us</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us: Impress Cleaning Services, LLC, Georgetown, Texas. Email: <a href="mailto:admin@impressyoucleaning.com" className="text-blue-600 hover:underline">admin@impressyoucleaning.com</a>. Phone: <a href="tel:+15122775364" className="text-blue-600 hover:underline">(512) 277-5364</a>.
          </p>
        </div>

        {/* Back Link */}
        <div className="pt-6 border-t border-gray-200">
          <Link href="/" className="text-sm text-blue-600 hover:underline">
            &larr; Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}