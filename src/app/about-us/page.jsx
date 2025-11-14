'use client';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import Link from 'next/link';

// Custom animation component for this page
function FadeInWhenVisible({ children, delay = 0 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.7, delay: delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section - Different layout from Residential */}
      <FadeInWhenVisible>
        <section className="relative pt-28 pb-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 mb-6">
                  <div className="w-12 h-0.5 bg-[#079447]"></div>
                  <span className="text-[#079447] font-medium tracking-wide uppercase text-sm">About Impress</span>
                </div>
                
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-gray-900 mb-6 leading-tight">
                  15 Years of Creating
                  <span className="block text-[#001F3F] mt-2">Time for What Matters</span>
                </h1>
                
                <p className="text-xl text-gray-600 mb-8 leading-relaxed font-manrope">
                  Since 2009, we've been more than just a cleaning service. We're time-givers, stress-relievers, and your neighbors who understand that a clean home means more moments with the people you love.
                </p>

                <div className="flex items-center gap-8">
                  <div>
                    <div className="text-3xl font-bold text-[#001F3F]">15+</div>
                    <div className="text-sm text-gray-600">Years Serving Central Texas</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-[#001F3F]">5,000+</div>
                    <div className="text-sm text-gray-600">Homes Cleaned</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-[#001F3F]">98%</div>
                    <div className="text-sm text-gray-600">Client Retention</div>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="aspect-square bg-gradient-to-br from-[#079447]/10 to-[#001F3F]/10 rounded-3xl flex items-center justify-center">
                  <div className="text-center p-8">
                    <svg className="w-32 h-32 text-[#001F3F]/30 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <p className="text-gray-500">Team Photo Coming Soon</p>
                  </div>
                </div>
                {/* Decorative elements */}
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-[#079447]/20 rounded-full blur-2xl"></div>
                <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-[#001F3F]/20 rounded-full blur-2xl"></div>
              </div>
            </div>
          </div>
        </section>
      </FadeInWhenVisible>

      {/* Our Story Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <FadeInWhenVisible>
            <div className="max-w-3xl mx-auto text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-6">
                Built on Trust, Grown Through Service
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                What started as a small family operation in Austin has grown into Central Texas's most trusted cleaning service—not through advertising, but through the recommendations of neighbors who became friends.
              </p>
            </div>
          </FadeInWhenVisible>

          <div className="grid md:grid-cols-2 gap-8">
            <FadeInWhenVisible delay={0.1}>
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                <div className="w-14 h-14 bg-[#079447]/10 rounded-xl flex items-center justify-center mb-6">
                  <svg className="w-7 h-7 text-[#079447]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">The Beginning</h3>
                <p className="text-gray-600 leading-relaxed">
                  In 2009, Maria Rodriguez started Impress after noticing how many of her Austin neighbors struggled to balance demanding careers with home maintenance. She believed professional cleaning shouldn't be a luxury—it should be accessible support that gives families their weekends back.
                </p>
              </div>
            </FadeInWhenVisible>

            <FadeInWhenVisible delay={0.2}>
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                <div className="w-14 h-14 bg-[#001F3F]/10 rounded-xl flex items-center justify-center mb-6">
                  <svg className="w-7 h-7 text-[#001F3F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Today's Mission</h3>
                <p className="text-gray-600 leading-relaxed">
                  Now serving thousands of homes across Austin, Georgetown, Round Rock, and throughout Central Texas, we've never forgotten Maria's original vision: every clean we complete gives someone more time for their kids' soccer games, their aging parents, their health, or simply a peaceful Sunday morning.
                </p>
              </div>
            </FadeInWhenVisible>
          </div>
        </div>
      </section>

      {/* Values Section - Cards layout different from Residential */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <FadeInWhenVisible>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">
                What Drives Us Every Day
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                These aren't just words on a wall—they're the principles that guide every interaction, every clean, and every relationship we build.
              </p>
            </div>
          </FadeInWhenVisible>

          <div className="grid md:grid-cols-3 gap-6">
            <FadeInWhenVisible delay={0.1}>
              <div className="text-center group">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-[#079447] to-[#08A855] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Time is Precious</h3>
                <p className="text-gray-600 leading-relaxed">
                  We know that every hour we save you is an hour you can spend on what truly matters—whether that's your family, your health, or your dreams.
                </p>
              </div>
            </FadeInWhenVisible>

            <FadeInWhenVisible delay={0.2}>
              <div className="text-center group">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-[#001F3F] to-[#003D7A] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Care in Every Detail</h3>
                <p className="text-gray-600 leading-relaxed">
                  Your home is your sanctuary. We treat it with the same respect and attention we'd want for our own, because we understand what it means to you.
                </p>
              </div>
            </FadeInWhenVisible>

            <FadeInWhenVisible delay={0.3}>
              <div className="text-center group">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Community First</h3>
                <p className="text-gray-600 leading-relaxed">
                  We're your neighbors, not a franchise. Every dollar stays local, supporting Central Texas families and contributing to the community we all call home.
                </p>
              </div>
            </FadeInWhenVisible>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 px-4 bg-[#F8FAF7]">
        <div className="max-w-6xl mx-auto">
          <FadeInWhenVisible>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">
                The Hearts Behind the Homes
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Our team isn't just skilled—they're caring individuals who take pride in making your life easier. Many have been with us for over a decade, becoming extended family to the homes they serve.
              </p>
            </div>
          </FadeInWhenVisible>

          <div className="bg-white rounded-3xl p-12 shadow-sm border border-gray-100">
            <FadeInWhenVisible delay={0.1}>
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">More Than a Team—A Family</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    When you welcome Impress into your home, you're not getting temporary workers—you're getting dedicated professionals who've chosen to make cleaning excellence their career.
                  </p>
                  <ul className="space-y-4">
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-[#079447] mr-3 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">Background-checked and fully insured professionals</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-[#079447] mr-3 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">Ongoing training in the latest eco-friendly techniques</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-[#079447] mr-3 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">Fair wages and benefits because happy teams create happy homes</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-gradient-to-br from-[#079447]/5 to-[#001F3F]/5 rounded-2xl p-12 text-center">
                  <div className="text-5xl font-bold text-[#001F3F] mb-2">23</div>
                  <div className="text-gray-600">Average team members</div>
                  <div className="mt-6">
                    <div className="text-5xl font-bold text-[#079447] mb-2">7+ years</div>
                    <div className="text-gray-600">Average team tenure</div>
                  </div>
                </div>
              </div>
            </FadeInWhenVisible>
          </div>
        </div>
      </section>

      {/* Community Impact */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <FadeInWhenVisible>
            <div className="bg-gradient-to-br from-[#001F3F] to-[#003D7A] rounded-3xl p-12 md:p-16 text-white">
              <div className="max-w-3xl">
                <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">
                  Giving Back to Central Texas
                </h2>
                <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                  A cleaner community starts with caring. That's why we donate free cleaning services to families facing medical crises, partner with local shelters, and support Georgetown and Austin area schools.
                </p>
                <div className="grid sm:grid-cols-3 gap-8 mt-12">
                  <div>
                    <div className="text-3xl font-bold text-white mb-2">500+</div>
                    <div className="text-blue-200">Free hours donated annually</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-white mb-2">12</div>
                    <div className="text-blue-200">Local charities supported</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-white mb-2">$25K+</div>
                    <div className="text-blue-200">Invested in community programs</div>
                  </div>
                </div>
              </div>
            </div>
          </FadeInWhenVisible>
        </div>
      </section>

      {/* CTA Section */}
      <FadeInWhenVisible>
        <section className="py-20 px-4 bg-gray-50">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-6">
              Join the Impress Family
            </h2>
            <p className="text-xl text-gray-600 mb-10 leading-relaxed">
              Whether you need weekly support or occasional help, we're here to give you back your time. Let's talk about how we can help you focus on what matters most.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/service-quote" 
                className="group px-8 py-4 bg-[#079447] text-white rounded-lg font-semibold text-lg hover:bg-[#08A855] transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Start Your Free Quote
                <span className="inline-block ml-2 transition-transform duration-300 group-hover:translate-x-1">→</span>
              </Link>
              <a 
                href="/residential" 
                className="px-8 py-4 bg-white text-gray-900 rounded-lg font-semibold text-lg border-2 border-gray-200 hover:border-gray-300 transition-all duration-300"
              >
                Learn About Our Services
              </a>
            </div>
          </div>
        </section>
      </FadeInWhenVisible>
    </main>
  );
}