'use client';
import React from 'react';
import Link from 'next/link';

export default function TermsOfService() {
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="border-b border-gray-200 pb-6 mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-1">Terms of Service</h1>
          <p className="text-xs text-gray-500">Effective Date: December 14, 2024</p>
        </div>

        {/* Intro */}
        <div className="mb-8">
          <p className="text-sm text-gray-600 leading-relaxed">
            These Terms of Service (&quot;Terms&quot; or &quot;Agreement&quot;) constitute a legally binding agreement between 
            you and Impress Cleaning Services, LLC, a Texas limited liability company (&quot;Company,&quot; &quot;we,&quot; 
            &quot;our,&quot; or &quot;us&quot;). By accessing our website, customer portal, or using our cleaning services 
            (collectively, the &quot;Services&quot;), you acknowledge that you have read, understood, and agree to 
            be bound by these Terms. If you do not agree to these Terms, you may not access or use our Services.
          </p>
        </div>

        {/* Table of Contents */}
        <div className="mb-8 text-sm">
          <p className="font-medium text-gray-700 mb-2">Contents:</p>
          <div className="text-blue-600 space-y-1">
            <a href="#definitions" className="block hover:underline">1. Definitions</a>
            <a href="#services" className="block hover:underline">2. Services</a>
            <a href="#accounts" className="block hover:underline">3. Account Responsibilities</a>
            <a href="#booking" className="block hover:underline">4. Booking &amp; Scheduling</a>
            <a href="#cancellation" className="block hover:underline">5. Cancellation &amp; Rescheduling Policy</a>
            <a href="#pricing" className="block hover:underline">6. Pricing &amp; Payment</a>
            <a href="#property" className="block hover:underline">7. Property Access &amp; Liability</a>
            <a href="#satisfaction" className="block hover:underline">8. Service Satisfaction</a>
            <a href="#conduct" className="block hover:underline">9. Customer Conduct</a>
            <a href="#indemnification" className="block hover:underline">10. Indemnification</a>
            <a href="#limitation" className="block hover:underline">11. Limitation of Liability</a>
            <a href="#force-majeure" className="block hover:underline">12. Force Majeure</a>
            <a href="#termination" className="block hover:underline">13. Termination</a>
            <a href="#governing-law" className="block hover:underline">14. Governing Law &amp; Dispute Resolution</a>
            <a href="#general" className="block hover:underline">15. General Provisions</a>
            <a href="#contact" className="block hover:underline">16. Contact Us</a>
          </div>
        </div>

        {/* Section 1 */}
        <div id="definitions" className="mb-6 scroll-mt-8">
          <h2 className="text-base font-semibold text-gray-900 mb-2">1. Definitions</h2>
          <p className="text-sm text-gray-600 leading-relaxed mb-2">
            For purposes of these Terms of Service, the following definitions shall apply:
          </p>
          <p className="text-sm text-gray-600 leading-relaxed mb-2">
            <strong>&quot;Services&quot;</strong> means all cleaning services provided by the Company, including but not limited to standard cleaning, deep cleaning, move-in/move-out cleaning, post-construction cleaning, and commercial cleaning, as well as access to our website and customer portal.
          </p>
          <p className="text-sm text-gray-600 leading-relaxed mb-2">
            <strong>&quot;Customer,&quot; &quot;User,&quot; or &quot;You&quot;</strong> means any individual or entity that accesses our website, creates an account, or engages our cleaning services.
          </p>
          <p className="text-sm text-gray-600 leading-relaxed mb-2">
            <strong>&quot;Property&quot;</strong> means any residential or commercial premises where Services are to be performed.
          </p>
          <p className="text-sm text-gray-600 leading-relaxed mb-2">
            <strong>&quot;Service Fee&quot;</strong> means the agreed-upon price for cleaning services as specified in the quote or invoice provided to the Customer.
          </p>
          <p className="text-sm text-gray-600 leading-relaxed">
            <strong>&quot;Appointment&quot;</strong> means a scheduled date and time for the performance of Services.
          </p>
        </div>

        {/* Section 2 */}
        <div id="services" className="mb-6 scroll-mt-8">
          <h2 className="text-base font-semibold text-gray-900 mb-2">2. Services</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Impress Cleaning Services, LLC provides professional cleaning services in the Georgetown, Texas area and surrounding communities. Our service offerings include: (a) Standard Cleaning for regular maintenance cleaning of residential properties; (b) Deep Cleaning for comprehensive, thorough cleaning from top to bottom; (c) Move-In/Move-Out Cleaning for detailed cleaning during property transitions; (d) Post-Construction Cleaning for specialized cleaning following renovation or construction; and (e) Commercial Cleaning for professional cleaning of offices and business premises. Specific services included in each cleaning type will be outlined in your quote or service agreement.
          </p>
        </div>

        {/* Section 3 */}
        <div id="accounts" className="mb-6 scroll-mt-8">
          <h2 className="text-base font-semibold text-gray-900 mb-2">3. Account Responsibilities</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            When you create an account on our customer portal, you agree to: (a) provide accurate, current, and complete information during registration; (b) maintain and promptly update your account information as necessary; (c) maintain the confidentiality of your login credentials and restrict access to your account; (d) notify us immediately of any unauthorized access to or use of your account; (e) accept responsibility for all activities that occur under your account; and (f) ensure that any authorized users of your account comply with these Terms. We reserve the right to suspend or terminate accounts that violate these Terms or are used for fraudulent or unlawful purposes.
          </p>
        </div>

        {/* Section 4 */}
        <div id="booking" className="mb-6 scroll-mt-8">
          <h2 className="text-base font-semibold text-gray-900 mb-2">4. Booking &amp; Scheduling</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            The following terms govern the booking and scheduling of Services: (a) all appointments are subject to availability and confirmation by the Company; (b) you will receive confirmation of your booking via email or text message; (c) appointment reminders will be sent prior to your scheduled service; (d) our team will arrive within a reasonable window of your scheduled appointment time; (e) an adult (18 years or older) must be available to provide property access unless alternative arrangements have been agreed upon in advance; and (f) you are responsible for ensuring our team can access all areas to be cleaned.
          </p>
        </div>

        {/* Section 5 */}
        <div id="cancellation" className="mb-6 scroll-mt-8">
          <h2 className="text-base font-semibold text-gray-900 mb-2">5. Cancellation &amp; Rescheduling Policy</h2>
          <p className="text-sm text-gray-600 leading-relaxed mb-2">
            We understand that circumstances may require changes to your scheduled appointments. The following policy applies to all cancellations and schedule modifications:
          </p>
          <p className="text-sm text-gray-600 leading-relaxed mb-2">
            <strong>5.1 Cancellation Fees.</strong> Notice of 48 hours or more: No fee. Notice of 24–48 hours: $50.00 fee. Notice of less than 24 hours: Full Service Fee.
          </p>
          <p className="text-sm text-gray-600 leading-relaxed mb-2">
            <strong>5.2 Rescheduling Policy.</strong> Rescheduling requests made 48 or more hours in advance incur no fee. Rescheduling requests made 24–48 hours in advance incur a $50.00 fee. Rescheduling requests made less than 24 hours in advance incur the full Service Fee. Rescheduled appointments must be completed within 30 calendar days of the original date. After four (4) reschedules within a 12-month period, prepayment may be required for future bookings.
          </p>
          <p className="text-sm text-gray-600 leading-relaxed mb-2">
            <strong>5.3 No-Show Policy.</strong> If our service team arrives at the scheduled time and is unable to access the Property (including but not limited to: no one present, locked gate, no response to contact attempts, or unsafe conditions), we will wait for a period of fifteen (15) minutes and attempt to contact you. If access cannot be obtained, this shall constitute a &quot;no-show,&quot; and the full Service Fee will be charged.
          </p>
          <p className="text-sm text-gray-600 leading-relaxed">
            <strong>5.4 Emergency Exceptions.</strong> We recognize that genuine emergencies occur (medical emergencies, family emergencies, natural disasters, etc.). In documented emergency situations, cancellation or rescheduling fees may be waived at the sole discretion of the Company. Please contact us as soon as reasonably possible to discuss your circumstances.
          </p>
        </div>

        {/* Section 6 */}
        <div id="pricing" className="mb-6 scroll-mt-8">
          <h2 className="text-base font-semibold text-gray-900 mb-2">6. Pricing &amp; Payment</h2>
          <p className="text-sm text-gray-600 leading-relaxed mb-2">
            <strong>6.1 Pricing.</strong> Service pricing is provided in your quote and confirmed prior to the commencement of Services. Quotes are valid for thirty (30) days from the date of issuance. Additional charges may apply for services beyond the original scope of work. All prices are quoted in United States Dollars (USD) and are inclusive of applicable taxes unless otherwise stated.
          </p>
          <p className="text-sm text-gray-600 leading-relaxed mb-2">
            <strong>6.2 Payment Terms.</strong> Payment is due upon completion of Services unless alternative arrangements have been made. We accept payment via credit card, debit card, and other methods as indicated in our customer portal. All payments are processed securely through our third-party payment processor, Stripe, Inc.
          </p>
          <p className="text-sm text-gray-600 leading-relaxed">
            <strong>6.3 Late Payment Policy.</strong> Invoices are due upon receipt. A grace period of seven (7) calendar days is provided for payment. After the grace period, a late fee of five percent (5%) of the outstanding balance will be assessed. We reserve the right to suspend or terminate Services for accounts with overdue balances and may pursue collection of outstanding amounts through appropriate legal channels.
          </p>
        </div>

        {/* Section 7 */}
        <div id="property" className="mb-6 scroll-mt-8">
          <h2 className="text-base font-semibold text-gray-900 mb-2">7. Property Access &amp; Liability</h2>
          <p className="text-sm text-gray-600 leading-relaxed mb-2">
            By scheduling Services, you agree to the following terms regarding property access and liability: (a) you authorize our service team to access your Property for the sole purpose of providing the agreed-upon cleaning Services; (b) you will provide safe, unobstructed access to all areas designated for cleaning; (c) you are responsible for securing or removing valuable, fragile, sentimental, or irreplaceable items prior to our arrival; (d) the Company is not responsible for damage to items not disclosed as requiring special care or attention; (e) the Company is not liable for pre-existing damage, defects, or conditions, including but not limited to worn surfaces, loose fixtures, or normal wear and tear; and (f) pets must be secured or arrangements made prior to our team&apos;s arrival to ensure the safety of our staff and your animals.
          </p>
          <p className="text-sm text-gray-600 leading-relaxed">
            If any damage is alleged to have occurred during the provision of Services, you must notify the Company in writing within twenty-four (24) hours of service completion. Failure to provide timely notice may affect the Company&apos;s ability to investigate and address the claim.
          </p>
        </div>

        {/* Section 8 */}
        <div id="satisfaction" className="mb-6 scroll-mt-8">
          <h2 className="text-base font-semibold text-gray-900 mb-2">8. Service Satisfaction</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            We are committed to delivering high-quality cleaning services. If you are not satisfied with any aspect of our Services: (a) please contact us within twenty-four (24) hours of service completion; (b) we will work with you to understand and address your specific concerns; (c) at our sole discretion, we may offer to re-clean specific areas at no additional charge; (d) satisfaction remedies are determined on a case-by-case basis and do not constitute a guarantee of specific results; and (e) refunds, if any, are provided at the sole discretion of the Company.
          </p>
        </div>

        {/* Section 9 */}
        <div id="conduct" className="mb-6 scroll-mt-8">
          <h2 className="text-base font-semibold text-gray-900 mb-2">9. Customer Conduct</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            You agree to provide a safe, respectful, and professional environment for our service team. The Company reserves the right to immediately cease Services and refuse future bookings if our staff experiences any of the following: (a) harassment, verbal abuse, threats, or intimidating behavior; (b) discrimination based on race, gender, religion, national origin, or any other protected characteristic; (c) unsafe, unsanitary, or hazardous working conditions; (d) requests to perform services outside our scope of work or in violation of law; or (e) any conduct that creates an uncomfortable or hostile environment for our team. In the event Services are terminated due to customer conduct, the full Service Fee will be charged, and no refund will be provided.
          </p>
        </div>

        {/* Section 10 */}
        <div id="indemnification" className="mb-6 scroll-mt-8">
          <h2 className="text-base font-semibold text-gray-900 mb-2">10. Indemnification</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            You agree to indemnify, defend, and hold harmless Impress Cleaning Services, LLC, its officers, directors, employees, agents, and affiliates from and against any and all claims, damages, losses, liabilities, costs, and expenses (including reasonable attorneys&apos; fees) arising out of or relating to: (a) your use of the Services; (b) your violation of these Terms; (c) your violation of any rights of a third party; (d) any misrepresentation made by you; or (e) any claims arising from the condition of your Property, including but not limited to personal injury or property damage not caused by the gross negligence or willful misconduct of the Company.
          </p>
        </div>

        {/* Section 11 */}
        <div id="limitation" className="mb-6 scroll-mt-8">
          <h2 className="text-base font-semibold text-gray-900 mb-2">11. Limitation of Liability</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW: (a) the Company&apos;s total liability for any claim arising from or related to these Terms or the Services shall not exceed the amount paid by you for the specific Service giving rise to the claim; (b) the Company shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, use, or goodwill; (c) the Company is not responsible for damage caused by pre-existing conditions, defects, normal wear and tear, or the inherent nature of materials; and (d) the Company assumes no liability for loss of or damage to cash, jewelry, collectibles, art, antiques, or other irreplaceable items not secured prior to service. Some jurisdictions do not allow the exclusion or limitation of certain damages. In such jurisdictions, the Company&apos;s liability shall be limited to the maximum extent permitted by law.
          </p>
        </div>

        {/* Section 12 */}
        <div id="force-majeure" className="mb-6 scroll-mt-8">
          <h2 className="text-base font-semibold text-gray-900 mb-2">12. Force Majeure</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            The Company shall not be liable for any failure or delay in performing its obligations under these Terms due to circumstances beyond its reasonable control, including but not limited to: acts of God, natural disasters, severe weather conditions (including but not limited to hurricanes, tornadoes, floods, ice storms, or excessive heat warnings), epidemics or pandemics, government actions, civil unrest, war, terrorism, labor disputes, power outages, telecommunications failures, or any other event that could not have been reasonably anticipated or prevented. In such events, the Company will make reasonable efforts to notify you and reschedule Services at the earliest practicable date.
          </p>
        </div>

        {/* Section 13 */}
        <div id="termination" className="mb-6 scroll-mt-8">
          <h2 className="text-base font-semibold text-gray-900 mb-2">13. Termination</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Either party may terminate the service relationship at any time, subject to the cancellation policy set forth in Section 5. The Company reserves the right to refuse or discontinue Services to any Customer for any reason, including but not limited to: (a) violation of these Terms; (b) non-payment or repeated late payment; (c) conduct that endangers our staff or creates unsafe working conditions; (d) fraudulent or unlawful activity; or (e) repeated no-shows or excessive cancellations. Upon termination, any outstanding balances shall remain due and payable. Sections of these Terms that by their nature should survive termination shall remain in effect.
          </p>
        </div>

        {/* Section 14 */}
        <div id="governing-law" className="mb-6 scroll-mt-8">
          <h2 className="text-base font-semibold text-gray-900 mb-2">14. Governing Law &amp; Dispute Resolution</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            These Terms of Service shall be governed by and construed in accordance with the laws of the State of Texas, without regard to its conflict of law provisions. Any dispute, controversy, or claim arising out of or relating to these Terms or the Services shall be resolved exclusively in the state or federal courts located in Williamson County, Texas. You hereby consent to the personal jurisdiction and venue of such courts and waive any objection based on inconvenient forum.
          </p>
        </div>

        {/* Section 15 */}
        <div id="general" className="mb-6 scroll-mt-8">
          <h2 className="text-base font-semibold text-gray-900 mb-2">15. General Provisions</h2>
          <p className="text-sm text-gray-600 leading-relaxed mb-2">
            <strong>15.1 Entire Agreement.</strong> These Terms, together with our Privacy Policy and any service-specific agreements, constitute the entire agreement between you and the Company regarding the Services and supersede all prior agreements, representations, and understandings.
          </p>
          <p className="text-sm text-gray-600 leading-relaxed mb-2">
            <strong>15.2 Severability.</strong> If any provision of these Terms is found to be invalid, illegal, or unenforceable, the remaining provisions shall continue in full force and effect. The invalid provision shall be modified to the minimum extent necessary to make it valid and enforceable while preserving the parties&apos; original intent.
          </p>
          <p className="text-sm text-gray-600 leading-relaxed mb-2">
            <strong>15.3 Waiver.</strong> The failure of the Company to enforce any right or provision of these Terms shall not constitute a waiver of such right or provision. Any waiver must be in writing and signed by an authorized representative of the Company.
          </p>
          <p className="text-sm text-gray-600 leading-relaxed mb-2">
            <strong>15.4 Assignment.</strong> You may not assign or transfer these Terms or your rights hereunder without the prior written consent of the Company. The Company may assign these Terms without restriction.
          </p>
          <p className="text-sm text-gray-600 leading-relaxed">
            <strong>15.5 Modifications to Terms.</strong> We reserve the right to modify these Terms at any time. Material changes will be communicated by updating the &quot;Effective Date&quot; and, where appropriate, providing additional notice. Your continued use of the Services following any changes constitutes acceptance of the revised Terms.
          </p>
        </div>

        {/* Section 16 */}
        <div id="contact" className="mb-8 scroll-mt-8">
          <h2 className="text-base font-semibold text-gray-900 mb-2">16. Contact Us</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            If you have any questions, concerns, or inquiries regarding these Terms of Service, please contact us: Impress Cleaning Services, LLC, Georgetown, Texas. Email: <a href="mailto:admin@impressyoucleaning.com" className="text-blue-600 hover:underline">admin@impressyoucleaning.com</a>. Phone: <a href="tel:+15122775364" className="text-blue-600 hover:underline">(512) 277-5364</a>.
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