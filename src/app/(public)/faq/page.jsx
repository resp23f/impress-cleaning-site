'use client';
import StaggerItem from '@/components/StaggerItem';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
export default function FAQPage() {
  // Add this useEffect hook right at the start of the component
  useEffect(() => {
    // Hide Tawk widget on FAQ page since users are already reading FAQs
    if (window.Tawk_API && window.Tawk_API.hideWidget) {
      window.Tawk_API.hideWidget();
    }
    
    return () => {
      // Show it again when leaving the page
      if (window.Tawk_API && window.Tawk_API.showWidget) {
        window.Tawk_API.showWidget();
      }
    };
  }, []);

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <StaggerItem>
        <section className="relative pt-32 pb-20 px-4 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#001F3F] to-[#003D7A] opacity-90" />
          <div className="absolute inset-0">
            <div className="absolute top-20 right-20 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
            <div className="absolute bottom-20 left-20 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
          </div>
          
          <div className="relative max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold text-white mb-6 leading-tight">
              Frequently Asked
              <span className="block mt-2 bg-gradient-to-r from-blue-200 to-white bg-clip-text text-transparent">
                Questions
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Everything you need to know about our cleaning services, answered clearly and simply.
            </p>
          </div>
        </section>
      </StaggerItem>

      {/* FAQ Sections */}
      <section className="py-24 px-4 bg-background">
        <div className="max-w-4xl mx-auto space-y-12">
          
          {/* General Questions */}
          <StaggerItem delay={100}>
            <FAQSection 
              title="General Questions" 
              icon="📋"
              questions={generalQuestions}
            />
          </StaggerItem>

          {/* Service Questions */}
          <StaggerItem delay={200}>
            <FAQSection 
              title="Service Questions" 
              icon="✨"
              questions={serviceQuestions}
            />
          </StaggerItem>

          {/* Billing & Payments */}
          <StaggerItem delay={300}>
            <FAQSection 
              title="Billing & Payments" 
              icon="💳"
              questions={billingQuestions}
            />
          </StaggerItem>

          {/* Other Common Questions */}
          <StaggerItem delay={400}>
            <FAQSection 
              title="Other Common Questions" 
              icon="💡"
              questions={otherQuestions}
            />
          </StaggerItem>

        </div>
      </section>

      {/* Still Have Questions CTA */}
      <StaggerItem>
        <section className="relative py-20 px-4 overflow-hidden">
          <div className="absolute inset-0 bg-[var(--softgreen)]" />
          
          <div className="relative max-w-3xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 font-display">
              Still Have Questions?
            </h2>
            <p className="text-xl text-gray-700 mb-8 leading-relaxed">
              We're here to help! Reach out and we'll get back to you as soon as possible.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="tel:+15122775364" 
                className="px-8 py-4 bg-[#001F3F] text-white rounded-lg font-semibold text-lg hover:bg-[#003D7A] transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
              >
                Call Us: (512) 277-5364
              </a>
              <a 
                href="mailto:admin@impressyoucleaning.com" 
                className="px-8 py-4 bg-white text-[#001F3F] rounded-lg font-semibold text-lg border-2 border-[#001F3F] hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
              >
                Email Us
              </a>
            </div>
          </div>
        </section>
      </StaggerItem>
    </main>
  );
}

// FAQ Section Component
function FAQSection({ title, icon, questions }) {
  const [openSection, setOpenSection] = useState(true);

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Section Header */}
      <button
        onClick={() => setOpenSection(!openSection)}
        className="w-full px-8 py-6 flex items-center justify-between bg-gradient-to-r from-[#001F3F] to-[#003D7A] text-white hover:from-[#003D7A] hover:to-[#001F3F] transition-all duration-300"
      >
        <div className="flex items-center gap-4">
          <span className="text-3xl">{icon}</span>
          <h2 className="text-2xl md:text-3xl font-display font-bold">{title}</h2>
        </div>
        <motion.svg 
          className="w-6 h-6 flex-shrink-0" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
          animate={{ rotate: openSection ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </motion.svg>
      </button>

      {/* Questions List */}
      <AnimatePresence initial={false}>
        {openSection && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="divide-y divide-gray-100">
              {questions.map((q, idx) => (
                <FAQItem key={idx} question={q.q} answer={q.a} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Individual FAQ Item Component
function FAQItem({ question, answer }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="px-8 py-6 hover:bg-gray-50 transition-colors duration-200">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-start justify-between gap-4 text-left group"
      >
        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-[#079447] transition-colors duration-200 flex-1">
          {question}
        </h3>
        <motion.svg 
          className="w-5 h-5 flex-shrink-0 text-[#079447] mt-1" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </motion.svg>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0, marginTop: 0 }}
            animate={{ height: "auto", opacity: 1, marginTop: 16 }}
            exit={{ height: 0, opacity: 0, marginTop: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="text-gray-600 leading-relaxed">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// FAQ Data
const generalQuestions = [
  {
    q: "What areas do you serve?",
    a: "We proudly serve Georgetown, TX and surrounding areas including Austin and Central Texas. If you're unsure whether we service your area, give us a call at (512) 277-5364 and we'll let you know!"
  },
  {
    q: "How long have you been in business?",
    a: "We've been serving the Georgetown community for over 15 years! Our experience means you get reliable, professional service every single time."
  },
  {
    q: "Do I need to be home during the cleaning?",
    a: "Nope! Many of our clients prefer to be out while we clean. We're happy to work with whatever arrangement makes you most comfortable—whether you're home, at work, or running errands."
  },
  {
    q: "How do I schedule my first cleaning?",
    a: "It's easy! Just fill out our online quote form, give us a call at (512) 277-5364, or send us an email. We'll discuss your needs, provide a transparent quote, and find a time that works for you."
  },
  {
    q: "What if I need to reschedule?",
    a: "Life happens—we get it! Just give us a call or send us a message as soon as you can, and we'll work with you to find a new time that fits your schedule."
  }
];

const serviceQuestions = [
  {
    q: "What's included in a standard cleaning?",
    a: "Our standard cleaning covers all the essentials: dusting, vacuuming, mopping, kitchen cleaning (counters, sinks, appliances), bathroom cleaning (toilets, showers, sinks, mirrors), and tidying common areas. We follow a detailed checklist to make sure nothing gets missed!"
  },
  {
    q: "Do you offer deep cleaning services?",
    a: "Absolutely! Our move-out and make-ready cleanings are comprehensive deep cleans that cover everything top-to-bottom, including inside appliances, cabinets, and all those hard-to-reach spots."
  },
  {
    q: "Can I customize my cleaning service?",
    a: "Yes! We're flexible and happy to work with you. Just let us know what you need—whether it's focusing on specific rooms, skipping certain areas, or adding special requests. We're here to make your life easier."
  },
  {
    q: "What cleaning products do you use?",
    a: "We use professional-grade, eco-friendly cleaning products that are safe for your family and pets. They're tough on dirt and grime but gentle on your home and the environment."
  },
  {
    q: "Do I need to provide cleaning supplies?",
    a: "Nope! We bring everything we need, including all cleaning products and equipment. You don't have to worry about a thing."
  },
  {
    q: "How long does a cleaning take?",
    a: "It depends on the size of your home and the type of service. A standard clean for an average home usually takes 2-4 hours. We'll give you a better estimate when we discuss your specific needs."
  },
  {
    q: "What's the difference between move-out and make-ready cleaning?",
    a: "Great question! Move-out cleaning is for when you're leaving a property and want it spotless for the next occupant. Make-ready cleaning prepares a vacant property for new residents—perfect for realtors, homeowners selling, or families helping older relatives transition. Both are thorough, top-to-bottom cleans."
  },
  {
    q: "Do you clean windows?",
    a: "We do interior window cleaning as a premium add-on service! It requires specialized time and equipment, so it's priced separately. Just let us know if you'd like to add it to your service."
  },
  {
    q: "Can you clean my garage or patio?",
    a: "Yes! Both garage cleaning and patio cleaning are available as premium add-ons. These spaces need special attention and equipment, so we quote them separately based on your specific needs."
  },
  {
    q: "What if I'm not satisfied with the cleaning?",
    a: "Your satisfaction is our priority! If something isn't right, just let us know within 24 hours and we'll come back to make it right. We stand behind our work 100%."
  }
];

const billingQuestions = [
  {
    q: "How much does cleaning cost?",
    a: "Pricing varies based on your home's size, the type of cleaning, and how often you'd like service. We provide transparent, no-obligation quotes—just reach out and we'll give you an accurate estimate tailored to your needs."
  },
  {
    q: "Do you offer discounts for recurring services?",
    a: "Yes! Our bi-weekly and tri-weekly cleaning plans offer the best value for regular maintenance. The more frequently we clean, the better rate you get."
  },
  {
    q: "What forms of payment do you accept?",
    a: "We accept all major credit cards, debit cards, checks, and cash. Whatever works best for you!"
  },
  {
    q: "When do I pay for the service?",
    a: "Payment is due at the time of service. We'll send you an invoice that you can pay easily online, or you can pay our team directly when they complete the cleaning."
  },
  {
    q: "Is there a cancellation fee?",
    a: "We don't charge cancellation fees, but we do ask for at least 24 hours notice if you need to reschedule. This helps us serve all our clients better and keep our schedule running smoothly."
  },
  {
    q: "Do you require a contract?",
    a: "No long-term contracts required! While we love our recurring clients, we work on a service-by-service basis. You're free to adjust or pause your service whenever you need to."
  }
];

const otherQuestions = [
  {
    q: "What if something gets damaged during cleaning?",
    a: "While we take every precaution to protect your belongings, accidents can happen. That's why we're fully insured. If something is damaged, just let us know and we'll work with you to make it right."
  },
  {
    q: "Do you bring your own vacuum and mop?",
    a: "Yes! We bring all our own professional-grade equipment, including vacuums, mops, and cleaning tools. You don't need to provide anything."
  },
  {
    q: "Can the same team clean my home each time?",
    a: "We do our best to send the same team to your home for consistency. While schedules can vary, we always ensure whoever cleans your home is trained to our high standards."
  },
  {
    q: "Do you offer gift certificates?",
    a: "Yes! Cleaning services make a wonderful gift for new parents, busy friends, or anyone who deserves a break. Contact us to purchase a gift certificate."
  },
  {
    q: "Are you hiring?",
    a: "We're always looking for hardworking, reliable team members! Check out our Careers page or email us to learn about current opportunities."
  },
  {
    q: "What makes Impress Cleaning different from other services?",
    a: "We're locally owned, we've been serving Georgetown for over 15 years, and we genuinely care about our clients. We use eco-friendly products, follow detailed checklists, and treat your home with the same respect we'd give our own. Plus, we're building a customer portal to make scheduling even easier!"
  },
  {
    q: "How soon can you start?",
    a: "Often within a few days! We'll work with you to find a time that fits your schedule. During busy seasons, booking a week or two ahead is helpful, but we'll always do our best to accommodate your needs."
  }
];