'use client';
import React, { useState } from "react";
import { track } from '@vercel/analytics';
import Link from 'next/link';
import StaggerItem from '@/components/StaggerItem';

const ShieldCheckIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" {...props}>
    <path d="M12 3l7 3v5.5c0 4.2-2.9 8-7 9-4.1-1-7-4.8-7-9V6l7-3z" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M9.5 12.5l2 2 3.5-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const HomeIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" {...props}>
    <path d="M3 10.5l9-7 9 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M5 10v9h14v-9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M9 19v-5h6v5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const Chip = ({ icon, label, detail }) => (
  <div className="relative group">
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white ring-1 ring-slate-200 px-3 py-1 text-sm text-slate-700 shadow-sm transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0">
      {icon}
      <span className="whitespace-nowrap">{label}</span>
    </span>
    {detail ? (
      <span className="pointer-events-none absolute left-0 top-[110%] z-10 hidden w-max max-w-xs rounded-xl bg-white p-3 text-xs text-slate-600 ring-1 ring-slate-200 shadow-lg group-hover:block">
        {detail}
      </span>
    ) : null}
  </div>
);

export default function ImpressCleaningSite() {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const FORM_ENDPOINT = "https://formspree.io/f/xblzwdek";

  async function handleSubmit(e) {
    e.preventDefault();
    setSending(true);
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));

    if (!FORM_ENDPOINT) {
      const body = encodeURIComponent(
        Object.entries(data).map(([k, v]) => `${k}: ${v}`).join("\n")
      );
      window.location.href = `mailto:admin@impressyoucleaning.com?subject=Quote%20Request&body=${body}`;
      track('quote_submitted', { method: 'mailto' });
      setSending(false);
      setSent(true);
      form.reset();
      return;
    }

    try {
      const res = await fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(data),
      });
      const payload = await res.json().catch(() => ({}));
      if (res.ok) {
        track('quote_submitted', { method: 'formspree' });
        setSent(true);
        form.reset();
      } else {
        track('quote_submit_failed', { status: res.status });
        console.error("Formspree JSON error", res.status, payload);
        alert(payload?.errors?.[0]?.message ?? "Submit failed. Check Allowed Domains.");
      }
    } catch (err) {
      track('quote_submit_failed', { error: 'network' });
      console.error("Network error:", err);
      alert("Network error. Please try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <main id="top" className="min-h-screen bg-white">
      <Hero />
      <WhyChoose />
      <HowItWorks />
      <SocialProof />
      <TestimonialsSection />
    </main>
  );
}

function Hero() {
  return (
    <StaggerItem>
      <section id="home" className="relative w-screen left-1/2 -ml-[50vw] overflow-hidden">
        <div className="relative min-h-[60vh] md:min-h-[70vh] 2xl:min-h-[78vh] w-full overflow-hidden">
          <img
            src="/hero-cleaners1.jpg"
            alt="Impress Cleaning pro team"
            className="absolute inset-0 h-full w-full object-cover object-[79%_59%] md:object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-black/10 to-transparent pointer-events-none" />
          <div className="relative z-10">
            <div className="mx-auto max-w-[1440px] 3xl:max-w-[1600px] px-6 md:px-8">
              <div className="grid md:grid-cols-2 items-center min-h-[60vh] md:min-h-[70vh] 2xl:min-h-[78vh]">
<div className="px-4 sm:px-6">
<div className="max-w-[90vw] md:max-w-[28ch] 2xl:max-w-[65ch]" style={{ transform: 'translateY(clamp(0px, 3vh, 60px))' }}>
                                  <h1 className="font-display font-bold text-white mb-4 sm:mb-6 leading-[1.1]" style={{ fontSize: 'clamp(1.75rem, 5vw, 4.5rem)' }}>
                  We'll Make Your Space Shine
                  <span className="block text-green-400 mt-1 sm:mt-2" style={{ fontSize: 'clamp(1.75rem, 5vw, 4.5rem)' }}>So You Can Focus On What Matters Most.</span>
              </h1>
                <div className="flex flex-col sm:flex-row gap-4">
                <a 
                    href="tel:+15122775364" 
                    className="inline-flex items-center justify-center bg-slate-800 text-white rounded-lg font-bold border-2 border-slate-700 hover:bg-slate-700 hover:border-slate-600 transition-all duration-300"
                    style={{ padding: 'clamp(0.75rem, 2vw, 1rem) clamp(1.5rem, 3vw, 2rem)', fontSize: 'clamp(0.875rem, 1.5vw, 1.125rem)' }}>
                                      
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    (512) 277-5364
                  </a>

                  <Link
                  href="/service-quote"
                  className="inline-flex items-center justify-center bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 transition-all duration-300 shadow-lg shadow-green-500/20 hover:shadow-xl hover:shadow-green-500/30 hover:scale-105"
                  style={{ padding: 'clamp(0.75rem, 2vw, 1rem) clamp(1.5rem, 3vw, 2rem)', fontSize: 'clamp(0.875rem, 1.5vw, 1.125rem)' }} >
                  Request Free Quote
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>

                  </div>
                  </div>

                  {/* Right column kept for layout balance; remove if you want text to span full width */}
                  <div className="hidden lg:block" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </StaggerItem>
  );
}

function WhyChoose() {
  const cards = [
    { 
      t: 'Reliable Results', 
      d: 'Every clean follows our proven checklist system, so your space looks great no matter who\'s on the schedule.', 
      icon: "/results.png", 
      extra: 'scale-[1.15] translate-y-[7px]',
      color: 'from-green-500 to-green-700',
      bgColor: 'bg-green-50',
      iconBg: 'bg-green-100'
    },
    { 
      t: 'Easy Booking & Reminders', 
      d: 'Schedule cleaning online in seconds - plus text confirmations and reminders before every visit.', 
      icon: "/calendar.png",
      color: 'from-green-500 to-green-700',
      bgColor: 'bg-green-50',
      iconBg: 'bg-green-100'
    },
    { 
      t: 'Clear Communication', 
      d: 'We keep you in the loop from booking to follow-up, so you always know what\'s happening and when.', 
      icon: "/communication.png",
      color: 'from-green-500 to-green-700',
      bgColor: 'bg-green-50',
      iconBg: 'bg-green-100'
    },
    { 
      t: 'Locally Owned', 
      d: 'Proudly serving our community with a local touch. Every job supports local families.', 
      icon: "/local-home.png",
      color: 'from-green-500 to-green-700',
      bgColor: 'bg-green-50',
      iconBg: 'bg-green-100'
    },
  ];

  return (
    <section className="bg-gradient-to-b from-white to-gray-50 py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <StaggerItem>
          <div className="text-center mb-12">
            <div className="inline-block px-4 py-2 bg-[#079447]/10 border border-[#079447]/20 rounded-full mb-4">
              <span className="text-[#079447] text-sm font-semibold uppercase tracking-wide">Why Choose Us</span>
            </div>
            <h2 className="font-display text-4xl md:text-5xl lg:text-5xl font-bold leading-tight tracking-tight text-[#18335A] mb-4">
              Why Choose Impress Cleaning Services
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Four reasons families trust us to care for their homes
            </p>
          </div>
        </StaggerItem>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((c, index) => (
            <StaggerItem key={c.t} delay={100 + (index * 100)}>
              <div className="group relative h-full">
                {/* Hover gradient background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${c.color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`} />
                
                {/* Main card */}
                <div className="relative h-full rounded-2xl bg-white border-2 border-gray-200 group-hover:border-[#079447] shadow-sm group-hover:shadow-xl p-6 transition-all duration-300 group-hover:-translate-y-2">
                  {/* Icon container */}
                  <div className={`w-20 h-20 ${c.iconBg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <img src={c.icon} alt={c.t} className={`w-12 h-12 object-contain ${c.extra || ''}`} />
                  </div>
                  
                  {/* Content */}
                  <h3 className="font-manrope font-bold text-xl text-[#18335A] mb-3">
                    {c.t}
                  </h3>
                  <p className="font-manrope text-base text-[#2C3A4B] leading-relaxed">
                    {c.d}
                  </p>
                </div>
              </div>
            </StaggerItem>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      title: 'Request Your Quote', 
      description: 'Tell us a little about your home and the cleaning you need. We\'ll send a quick, straightforward quote that\'s easy to understand.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      title: 'Schedule Your Clean', 
      description: 'Choose the day and time that fit your schedule. We\'ll confirm your booking and send a quick reminder before your appointment.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      title: 'We Make It Shine', 
      description: 'Our local team arrives on time, fully equipped, and ready to get your space spotless using our detailed checklist and eco-safe products trusted by professionals.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      )
    },
    {
      title: 'Relax & Enjoy', 
      description: 'Come home to a space that feels fresh and cared for. Your clean is complete and your satisfaction always comes first.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
  ];
  
  return (
    <section className="bg-white py-16 md:py-24 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#079447]/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
      
      <div className="mx-auto max-w-7xl px-4 md:px-6 relative">
        <StaggerItem>
          <div className="text-center mb-12">
            <div className="inline-block px-4 py-2 bg-[#079447]/10 border border-[#079447]/20 rounded-full mb-4">
              <span className="text-[#079447] text-sm font-semibold uppercase tracking-wide">Our Process</span>
            </div>
            <h2 className="font-display text-4xl md:text-5xl lg:text-5xl font-bold leading-tight tracking-tight text-[#18335A] mb-4">
              How It Works: Simple, Fast & Stress Free
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Getting your home professionally cleaned in four easy steps
            </p>
          </div>
        </StaggerItem>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {/* Connection line for desktop */}
          <div className="hidden lg:block absolute top-16 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-[#079447]/20 via-[#079447]/40 to-[#079447]/20" />
          
          {steps.map((step, i) => (
            <StaggerItem key={step.title} delay={100 + (i * 100)}>
              <div className="relative h-full group">
                {/* Step number badge */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#079447] to-[#08A855] rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl font-bold text-white">{i + 1}</span>
                  </div>
                </div>

                {/* Card */}
                <div className="relative pt-10 h-full rounded-2xl bg-white border-2 border-gray-200 group-hover:border-[#079447] shadow-sm group-hover:shadow-xl px-6 py-8 transition-all duration-300 group-hover:-translate-y-2">
                  {/* Icon */}
                  <div className="w-16 h-16 bg-[#079447]/10 rounded-xl flex items-center justify-center mx-auto mb-4 text-[#079447] group-hover:bg-[#079447] group-hover:text-white transition-colors duration-300">
                    {step.icon}
                  </div>

                  {/* Content */}
                  <h3 className="font-manrope font-bold text-xl text-[#18335A] text-center mb-3">
                    {step.title}
                  </h3>
                  <p className="font-manrope text-base text-[#2C3A4B] leading-relaxed text-center">
                    {step.description}
                  </p>
                </div>
              </div>
            </StaggerItem>
          ))}
        </div>

        {/* CTA below steps */}
        <StaggerItem delay={500}>
          <div className="mt-12 text-center">
            <Link
              href="/service-quote"
              className="inline-flex items-center justify-center px-8 py-4 bg-[#079447] text-white rounded-lg font-bold text-lg hover:bg-[#08A855] transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
            >
              Get Started Today
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </StaggerItem>
      </div>
    </section>
  );
}

function SocialProof() {
  const scrollRef = React.useRef(null);
  const [activeIndex, setActiveIndex] = React.useState(0);
  
  React.useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;
    
    const handleScroll = () => {
      const scrollLeft = scrollContainer.scrollLeft;
      
      // Calculate which card is currently visible
      const cardWidth = 300 + 16; // card width + gap
      const currentIndex = Math.round(scrollLeft / cardWidth);
      setActiveIndex(currentIndex);
    };
    
    scrollContainer.addEventListener('scroll', handleScroll);
    return () => scrollContainer.removeEventListener('scroll', handleScroll);
  }, []);

  const proofCards = [
    {
      title: 'Texas Homes. Texas Trust.',
      description: 'Our clients trust us because we care about their homes, communicate clearly, and always give our best with every clean.'
    },
    {
      title: 'Proven Reputation.',
      description: 'Our clients stay with us for years, thanks to consistent quality, reliable service, and attention to detail.'
    },
    {
      title: 'People Who Care.',
      description: 'We\'re more than a cleaning company. We\'re neighbors who take pride in helping families enjoy their homes.'
    },
    {
      title: 'Guaranteed Peace of Mind.',
      description: 'You can relax knowing your clean is backed by our satisfaction guarantee and handled with professionalism every time.'
    }
  ];
  
  return (
    <StaggerItem>
      <section className="bg-[#0B2850] py-12 md:py-16 mb-16 md:mb-24 text-white md:overflow-hidden">
        <div className="mx-auto max-w-[1600px] md:px-6 lg:px-4 w-full md:w-auto flex-1">
          <h3 className="font-display text-[22px] md:text-[35px] lg:text-[38px] font-bold leading-tight tracking-tight text-center text-white">
            Why Texas Families Trust Impress
          </h3>

          <div ref={scrollRef} className="mt-6 flex overflow-x-auto gap-4 pl-4 snap-x snap-mandatory scrollbar-hide md:grid md:grid-cols-4 md:overflow-x-visible md:px-0 md:gap-6 lg:gap-8 md:snap-none tracking-wide pb-2">
            {proofCards.map((card, index) => (
              <div 
                key={index}
                className="rounded-2xl ring-1 ring-[#4A5568] bg-white/5 p-8 shadow-sm min-w-[300px] max-w-[300px] md:min-w-0 md:max-w-none snap-center flex-shrink-0 min-h-[220px] md:min-h-0 flex flex-col"
              >
                <div className="font-manrope font-semibold text-[18px] md:text-[20px] lg:text-[22px] mb-2">
                  {card.title}
                </div>
                <div className="font-manrope font-regular text-[15px] md:text-[16px] lg:text-[17px] text-white/90 leading-relaxed tracking-normal break-words">
                  {card.description}
                </div>
              </div>
            ))}
          </div>

          {/* Scroll Indicators - Only visible on mobile/tablet */}
          <div className="flex justify-center gap-2 mt-6 md:hidden">
            {proofCards.map((_, index) => (
              <div 
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${activeIndex === index ? 'bg-white' : 'bg-white/50'}`}
              />
            ))}
          </div>
        </div> 
      </section>
    </StaggerItem>
  );
}

function TestimonialsSection() {
  const testimonials = [
    {
      text: "House smelled so nice when I came home! Everything just SPARKLED. I love how they polish my granite and the care they take with the rest of the house. We have three dogs so it was very important that they got along with our babies. Team is wonderful to work with. The whole team with her are such hard workers. Keep up the good work!",
      author: "Shantell R, Verified Customer"
    },
    {
      text: "I love this company! I have had house cleaners for many years. At the recommendation of a friend I decided to try them. I was VERY impressed. They did a spotless job. I would recommend them to anyone; their prices are very fair. You can reach them at admin@impressyoucleaning.com. You will be very happy you called. They are awesome!",
      author: "Juli E, Verified Customer"
    },
    {
      text: "Extremely impressed with the cleaning service I received! My house was spotless and the customer service from the employees was exceptional! Along with the great service, the price was definitely something I cannot complain about. I am extremely pleased and will definitely utilize them again.",
      author: "Omally O, Verified Customer"
    }
  ];

  return (
    <StaggerItem>
      <section className="bg-white py-12 md:py-16">
        <div className="container mx-auto mb-12 md:max-w-[1800px]">
          <h2 className="font-display text-4xl md:text-5xl font-extrabold text-center text-slate-900">
            What Our Clients Are Saying
          </h2>
        </div>
        
        {/* Scrolling container */}
        <div className="relative max-w-full mx-auto">
          <div className="overflow-hidden">
            <div className="flex animate-scroll -translate-x-[10%]">
              {/* Render testimonials 12 times for smoother infinite scroll */}
              {[...Array(12)].map((_, setIndex) => (
                testimonials.map((testimonial, index) => (
                  <div 
                    key={`set-${setIndex}-${index}`} 
                    className="flex-shrink-0 w-[90vw] md:w-[600px] px-4 text-center inline-block"
                  >
                    <p className={`text-slate-900 text-lg md:text-xl font-manrope mb-3 leading-relaxed max-w-md mx-auto ${(setIndex * testimonials.length + index) % 2 === 0 ? 'font-bold' : 'font-normal'}`}>
                      "{testimonial.text}"
                    </p>
                    <p className="text-slate-600 font-playfair text-base md:text-lg">
                      – {testimonial.author}
                    </p>
                  </div>
                ))
              ))}
            </div>
          </div>
        </div>    

        {/* Custom CSS for animation */}
        <style jsx>{`
          @keyframes scroll {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-50%);
            }
          }
          .animate-scroll {
            animation: scroll 30s linear infinite;
            will-change: transform;
          }
        `}</style>
      </section>
    </StaggerItem>
  );
}