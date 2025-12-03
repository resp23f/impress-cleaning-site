'use client'
import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import Link from 'next/link'
import Breadcrumbs from '@/components/Breadcrumbs'
import {
  Home,
  Users,
  Clock,
  Heart,
  MapPin,
  CheckCircle,
  Sparkles,
  Award,
  ArrowRight,
} from 'lucide-react'

// Custom animation component for this page
function FadeInWhenVisible({ children, delay = 0 }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.7, delay: delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  )
}

export default function AboutContent() {
  return (
    <main className="min-h-screen bg-background">
      <Breadcrumbs items={[{ label: 'About Us', href: '/about-us' }]} />

      {/* Hero Section */}
      <FadeInWhenVisible>
        <section className="relative pt-28 pb-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-gray-900 mb-6 leading-tight">
                  25+ Years of Creating
                  <span className="block text-[#001F3F] mt-2">Time for What Matters</span>
                </h1>
                <p className="text-xl text-gray-600 mb-8 leading-relaxed font-manrope">
                  Since 1998, we&apos;ve been more than just a cleaning service. We&apos;re time
                  givers, stress relievers, and your neighbors who understand that a clean home
                  means more moments with the people you love.
                </p>
                <div className="flex items-center gap-8">
                  <div>
                    <div className="text-3xl font-bold text-[#001F3F]">25+</div>
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
                What started as a small family operation in Austin has grown into Central
                Texas&apos;s most trusted cleaning service, not through advertising, but through the
                recommendations of neighbors who became friends.
              </p>
            </div>
          </FadeInWhenVisible>

          <div className="grid md:grid-cols-2 gap-8">
            <FadeInWhenVisible delay={0.1}>
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                <div className="w-14 h-14 bg-[#079447]/10 rounded-xl flex items-center justify-center mb-6">
                  <Home className="w-7 h-7 text-[#079447]" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">The Beginning</h3>
                <p className="text-gray-600 leading-relaxed">
                  In 1998, our family started Impress after noticing how many of our Austin
                  neighbors struggled to balance demanding careers with home maintenance. We
                  believed professional cleaning shouldn&apos;t be a luxury — it should be
                  accessible support that gives families their evenings and weekends back.
                </p>
              </div>
            </FadeInWhenVisible>

            <FadeInWhenVisible delay={0.2}>
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                <div className="w-14 h-14 bg-[#001F3F]/10 rounded-xl flex items-center justify-center mb-6">
                  <Users className="w-7 h-7 text-[#001F3F]" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Today&apos;s Mission</h3>
                <p className="text-gray-600 leading-relaxed">
                  Now serving thousands of homes across Austin, Georgetown, Round Rock, and
                  throughout Central Texas, we&apos;ve never forgotten our original vision: every
                  clean we complete gives someone more time for their kids&apos; soccer games, their
                  aging parents, their health, or simply a peaceful Sunday morning.
                </p>
              </div>
            </FadeInWhenVisible>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <FadeInWhenVisible>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">
                What Drives Us Every Day
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                These aren&apos;t just words on a wall — they&apos;re the principles that guide
                every interaction, every clean, and every relationship we build.
              </p>
            </div>
          </FadeInWhenVisible>

          <div className="grid md:grid-cols-3 gap-6">
            <FadeInWhenVisible delay={0.1}>
              <div className="text-center group">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-[#079447] to-[#08A855] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-[#079447]/20">
                  <Clock className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Time is Precious</h3>
                <p className="text-gray-600 leading-relaxed">
                  We know that every hour we save you is an hour you can spend on what truly
                  matters — whether that&apos;s your family, your health, or your dreams.
                </p>
              </div>
            </FadeInWhenVisible>

            <FadeInWhenVisible delay={0.2}>
              <div className="text-center group">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-[#001F3F] to-[#003D7A] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-[#001F3F]/20">
                  <Heart className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Care in Every Detail</h3>
                <p className="text-gray-600 leading-relaxed">
                  Your home is your sanctuary. We treat it with the same respect and attention
                  we&apos;d want for our own, because we understand what it means to you.
                </p>
              </div>
            </FadeInWhenVisible>

            <FadeInWhenVisible delay={0.3}>
              <div className="text-center group">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-purple-600/20">
                  <MapPin className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Community First</h3>
                <p className="text-gray-600 leading-relaxed">
                  We&apos;re your neighbors, not a franchise. Every dollar stays local, supporting
                  Central Texas families and contributing to the community we all call home.
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
                Our team isn&apos;t just skilled — they&apos;re caring individuals who take pride
                in making your life easier. Many have been with us for over a decade, becoming
                extended family to the homes they serve.
              </p>
            </div>
          </FadeInWhenVisible>

          <div className="bg-white rounded-3xl p-12 shadow-sm border border-gray-100">
            <FadeInWhenVisible delay={0.1}>
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    More Than a Team — A Family
                  </h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    When you welcome Impress into your home, you&apos;re not getting temporary
                    workers — you&apos;re getting dedicated professionals who&apos;ve chosen to make
                    cleaning excellence their career.
                  </p>
                  <ul className="space-y-4">
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-[#079447] mr-3 mt-1 flex-shrink-0" />
                      <span className="text-gray-700">
                        Ongoing training in the latest eco-friendly techniques
                      </span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-[#079447] mr-3 mt-1 flex-shrink-0" />
                      <span className="text-gray-700">
                        Fair wages and benefits because happy teams create happy homes
                      </span>
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

      {/* CTA Section */}
      <FadeInWhenVisible>
        <section className="py-20 px-4 bg-gray-50">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-6">
              Join the Impress Family
            </h2>
            <p className="text-xl text-gray-600 mb-10 leading-relaxed">
              Whether you need weekly support or occasional help, we&apos;re here to give you back
              your time. Let&apos;s talk about how we can help you focus on what matters most.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/service-quote"
                className="group px-8 py-4 bg-[#079447] text-white rounded-lg font-semibold text-lg hover:bg-[#08A855] transition-all duration-300 shadow-lg hover:shadow-xl inline-flex items-center"
              >
                Start Your Free Quote
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/residential-section"
                className="px-8 py-4 bg-white text-gray-900 rounded-lg font-semibold text-lg border-2 border-gray-200 hover:border-gray-300 transition-all duration-300"
              >
                Learn About Our Services
              </Link>
            </div>
          </div>
        </section>
      </FadeInWhenVisible>
    </main>
  )
}