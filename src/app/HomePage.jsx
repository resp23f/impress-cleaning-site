'use client';
import React, { useState } from "react";
import { track } from '@vercel/analytics';
import Link from 'next/link';
import Image from 'next/image';
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
  <WhyFamiliesChooseUs />
  <TestimonialsSection />
  </main>
 );
}

function Hero() {
 return (
  <StaggerItem>
  <section id="home" className="relative w-screen left-1/2 -ml-[50vw] overflow-hidden">
  <div className="relative min-h-[65vh] md:min-h-[75vh] 2xl:min-h-[82vh] w-full overflow-hidden">
  <Image
  src="/hero-cleaners1.jpg"
  alt="Professional cleaning team from Impress Cleaning Services in Georgetown Texas"
  fill
  priority
className="object-cover object-[79%_45%] md:object-[center_center]"
 quality={85}
  sizes="100vw"
  />
  <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-black/15 to-transparent pointer-events-none" />              
  <div className="relative z-10">
  <div className="mx-auto max-w-[1440px] 3xl:max-w-[1600px] px-6 md:px-12 lg:px-16">
  <div className="grid md:grid-cols-2 items-center min-h-[65vh] md:min-h-[75vh] 2xl:min-h-[82vh] pt-32 pb-12 md:py-16">
  <div className="max-w-[650px]">
  <h1 className="font-display font-extrabold text-white mb-6 md:mb-8 leading-[1.15] tracking-tight" 
  style={{ 
   fontSize: 'clamp(2rem, 5vw, 4rem)', 
   textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5), 0px 0px 20px rgba(0, 0, 0, 0.3)',
   letterSpacing: '-0.02em'
  }}>
  We'll Make Your Space&nbsp;Shine
  <span className="block mt-2">
  So You Can Focus On What Matters&nbsp;Most.
  </span>
  </h1>
  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
  <a 
  href="tel:+15122775364"
  className="inline-flex items-center justify-center bg-[#079447] text-white rounded-lg font-bold hover:bg-[#068338] transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] group"
  style={{ 
   padding: 'clamp(0.85rem, 2.2vw, 1.1rem) clamp(1.75rem, 3.5vw, 2.25rem)', 
   fontSize: 'clamp(1.05rem, 2vw, 1.3rem)' 
  }}
  >
  <svg className="w-5 h-5 mr-2.5 group-hover:rotate-12 transition-transform" fill="none" stroke="white" viewBox="0 0 24 24" strokeWidth={2.5}>
  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
  Call Now
  </a>
  <Link
  href="/service-quote"
  className="inline-flex items-center justify-center bg-[#079447] text-white rounded-lg font-bold hover:bg-[#068338] transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] group"
  style={{ 
   padding: 'clamp(0.85rem, 2.2vw, 1.1rem) clamp(1.75rem, 3.5vw, 2.25rem)', 
   fontSize: 'clamp(1.05rem, 2vw, 1.3rem)' 
  }}
  >
  Request Free Quote
  <svg
  className="w-5 h-5 ml-2.5 group-hover:translate-x-1 transition-transform"
  fill="none"
  stroke="white"
  viewBox="0 0 24 24"
  strokeWidth="2.5"
  >
  <polyline points="9 5 16 12 9 19" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
  </Link>
  </div>
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
 const scrollRef = React.useRef(null);
 const [canScrollLeft, setCanScrollLeft] = React.useState(false);
 const [canScrollRight, setCanScrollRight] = React.useState(true);
 
 const cards = [
  { 
   t: 'Reliable Results', 
   d: 'Every clean follows our proven checklist system, so your space looks great no matter who\'s on the schedule.', 
   icon: "/results.png", 
   extra: 'scale-[1.15] translate-y-[7px]',
   color: 'from-green-500 to-green-700',
   bgColor: 'bg-green-50',
   iconBg: 'bg-green-100',
   alt: 'Quality checklist icon representing reliable cleaning results'
  },
  { 
   t: 'Easy Booking & Reminders', 
   d: 'Schedule cleaning online in seconds - plus text confirmations and reminders before every visit.', 
   icon: "/calendar.png",
   color: 'from-green-500 to-green-700',
   bgColor: 'bg-green-50',
   iconBg: 'bg-green-100',
   alt: 'Calendar icon for easy online booking and scheduling'
  },
  { 
   t: 'Clear Communication', 
   d: 'We keep you in the loop from booking to follow-up, so you always know what\'s happening and when.', 
   icon: "/communication.png",
   color: 'from-green-500 to-green-700',
   bgColor: 'bg-green-50',
   iconBg: 'bg-green-100',
   alt: 'Communication icon representing transparent customer service'
  },
  { 
   t: 'Locally Owned', 
   d: 'Proudly serving our community with a local touch. Every job supports local families.', 
   icon: "/local-home.png",
   color: 'from-green-500 to-green-700',
   bgColor: 'bg-green-50',
   iconBg: 'bg-green-100',
   alt: 'Local home icon representing locally owned Georgetown business'
  },
 ];
 
 const updateArrows = () => {
  const container = scrollRef.current;
  if (!container) return;
  const { scrollLeft, scrollWidth, clientWidth } = container;
  setCanScrollLeft(scrollLeft > 10);
  setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
 };
 
 React.useEffect(() => {
  const container = scrollRef.current;
  if (!container) return;
  updateArrows();
  container.addEventListener('scroll', updateArrows);
  window.addEventListener('resize', updateArrows);
  return () => {
   container.removeEventListener('scroll', updateArrows);
   window.removeEventListener('resize', updateArrows);
  };
 }, []);
 
 const scroll = (direction) => {
  const container = scrollRef.current;
  if (!container) return;
  const cardWidth = container.querySelector('[data-card]')?.offsetWidth || 300;
  const scrollAmount = cardWidth + 24;
  container.scrollBy({
   left: direction === 'left' ? -scrollAmount : scrollAmount,
   behavior: 'smooth'
  });
 };
 
 return (
  <section className="bg-gradient-to-b from-white to-gray-50 py-16 md:py-24 relative overflow-hidden">
  <div className="absolute top-20 left-10 w-72 h-72 bg-[#079447]/5 rounded-full blur-3xl" />
  <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
  <div className="mx-auto max-w-7xl px-4 md:px-6">
  <StaggerItem>
  <div className="text-center mb-12">
  <div className="inline-block px-4 py-2 bg-[#079447]/10 border border-[#079447]/20 rounded-full mb-4">
  <span className="text-[#079447] text-sm font-semibold uppercase tracking-wide">Why Choose Us</span>
  </div>
  <h2 className="font-display text-4xl md:text-5xl lg:text-5xl font-bold leading-tight tracking-tight text-[#18335A] mb-4">
  The Impress Difference
  </h2>
  <p className="text-xl text-gray-600 max-w-2xl mx-auto">
  Four reasons families choose us to care for their homes
  </p>
  </div>
  </StaggerItem>
  
  {/* Desktop: Scrollable with arrows */}
  <div className="relative hidden md:block" style={{ touchAction: 'pan-y pan-x' }}>
  {canScrollLeft && (
   <button
   onClick={() => scroll('left')}
   className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-[#079447] hover:bg-[#079447] hover:text-white transition-all duration-300 hover:scale-110"
   aria-label="Scroll left"
   >
   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
   </svg>
   </button>
  )}
  <div 
  ref={scrollRef}
  className="flex overflow-x-auto gap-8 snap-x snap-mandatory scrollbar-hide pb-4 pt-8" 
  >
  {cards.map((c, index) => (
   <div 
   key={c.t}
   data-card
   className="flex-shrink-0 w-[340px] snap-center"
   >
   <div className="group relative h-full">
   <div className={`absolute inset-0 bg-gradient-to-br ${c.color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`} />
   <div className="relative h-full rounded-2xl bg-white border border-gray-200/50 group-hover:border-[#079447]/30 shadow-[0_2px_8px_rgba(0,0,0,0.04)] group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] p-6 transition-all duration-500 group-hover:-translate-y-2">
   <div className={`w-20 h-20 ${c.iconBg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 relative`}>
   <Image 
   src={c.icon} 
   alt={c.alt} 
   width={48} 
   height={48} 
   className={`object-contain ${c.extra || ''}`} 
   />
   </div>
   <h3 className="font-manrope font-bold text-xl text-[#18335A] mb-3">
   {c.t}
   </h3>
   <p className="font-manrope text-base text-[#2C3A4B] leading-relaxed">
   {c.d}
   </p>
   </div>
   </div>
   </div>
  ))}
  </div>
  {canScrollRight && (
   <button
   onClick={() => scroll('right')}
   className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-[#079447] hover:bg-[#079447] hover:text-white transition-all duration-300 hover:scale-110"
   aria-label="Scroll right"
   >
   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
   </svg>
   </button>
  )}
  </div>
  
  {/* Mobile: Horizontal scroll carousel */}
  <div className="md:hidden">
  <div className="flex overflow-x-auto gap-4 snap-x snap-mandatory scrollbar-hide pb-4 px-4">
  {cards.map((c, index) => (
   <div 
   key={c.t}
   className="flex-shrink-0 w-[85vw] max-w-[340px] snap-center"
   >
   <div className="group relative h-full">
   <div className={`absolute inset-0 bg-gradient-to-br ${c.color} opacity-0 rounded-2xl transition-opacity duration-300`} />
   <div className="relative h-full rounded-2xl bg-white border-2 border-gray-200 shadow-sm p-6">
   <div className={`w-20 h-20 ${c.iconBg} rounded-xl flex items-center justify-center mb-4 relative`}>
   <Image 
   src={c.icon} 
   alt={c.alt} 
   width={48} 
   height={48} 
   className={`object-contain ${c.extra || ''}`} 
   />
   </div>
   <h3 className="font-manrope font-bold text-xl text-[#18335A] mb-3">
   {c.t}
   </h3>
   <p className="font-manrope text-base text-[#2C3A4B] leading-relaxed">
   {c.d}
   </p>
   </div>
   </div>
   </div>
  ))}
  </div>
  <div className="flex justify-center gap-2 mt-4">
  {cards.map((_, index) => (
   <div 
   key={index}
   className="w-2 h-2 rounded-full bg-gray-300"
   />
  ))}
  </div>
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
  <div className="absolute top-0 right-0 w-96 h-96 bg-[#079447]/5 rounded-full blur-3xl" />
  <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
  <div className="mx-auto max-w-5xl px-8 sm:px-10 md:px-12 lg:px-16 relative">
  <StaggerItem>
  <div className="text-center mb-16">
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
  
  {/* Vertical Timeline - Desktop & Mobile */}
  <div className="relative">
  {/* Timeline Line */}
  <div className="hidden md:block absolute left-[50%] top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#079447] via-[#079447] to-[#079447]/20" />
  {steps.map((step, i) => (
   <StaggerItem key={step.title} delay={i * 100}>
   <div className={`relative flex items-center gap-8 mb-12 md:mb-16 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
   {/* Content Side */}
   <div className={`flex-1 ${i % 2 === 0 ? 'md:text-right md:pr-8' : 'md:text-left md:pl-8'}`}>
   <div className="bg-white p-6 md:p-8 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgba(7,148,71,0.15)] transition-all duration-300 hover:-translate-y-1">
   <div className={`flex items-center gap-4 mb-4 ${i % 2 === 0 ? 'md:justify-end' : 'md:justify-start'} justify-start`}>
   <div className="w-12 h-12 bg-[#079447]/10 rounded-xl flex items-center justify-center text-[#079447]">
   {step.icon}
   </div>
   <h3 className="font-display font-bold text-2xl text-[#18335A]">
   {step.title}
   </h3>
   </div>
   <p className="font-manrope text-base text-[#2C3A4B] leading-relaxed">
   {step.description}
   </p>
   </div>
   </div>
   {/* Timeline Circle */}
   <div className="hidden md:flex absolute left-[50%] -translate-x-1/2 w-16 h-16 bg-gradient-to-br from-[#079447] to-[#08A855] rounded-full items-center justify-center shadow-lg shadow-green-500/30 z-10 border-4 border-white">
   <span className="text-2xl font-bold text-white">{i + 1}</span>
   </div>
   {/* Mobile Number Badge */}
   <div className="md:hidden absolute -left-2 top-6 w-10 h-10 bg-gradient-to-br from-[#079447] to-[#08A855] rounded-full flex items-center justify-center shadow-lg z-10">
   <span className="text-lg font-bold text-white">{i + 1}</span>
   </div>
   {/* Spacer for Desktop */}
   <div className="hidden md:block flex-1" />
   </div>
   </StaggerItem>
  ))}
  </div>
  
  <StaggerItem delay={500}>
  <div className="mt-12 text-center">
  <Link
  href="/residential-section"
  className="inline-flex items-center justify-center px-8 py-4 bg-[#079447] text-white rounded-lg font-bold text-lg hover:bg-[#08A855] transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
  >
  Learn More
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

// ============================================
// REPLACE your existing WhyFamiliesChooseUs and TestimonialsSection 
// functions in HomePage.jsx with these two updated versions
// ============================================

function WhyFamiliesChooseUs() {
  const proofCards = [
    {
      title: 'Principles That Matter',
      description: 'Our clients trust us because we care about their homes, communicate clearly, and always give our best with every clean.',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
      )
    },
    {
      title: 'Proven Reputation',
      description: 'Our clients stay with us for years, thanks to consistent quality, reliable service, and attention to detail.',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
        </svg>
      )
    },
    {
      title: 'People Who Care',
      description: "We're more than a cleaning company. We're neighbors who take pride in helping families enjoy their homes.",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
        </svg>
      )
    },
    {
      title: 'Peace of Mind',
      description: 'You can relax knowing your clean is backed by our satisfaction guarantee and handled with professionalism every time.',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
        </svg>
      )
    }
  ];

  return (
    <StaggerItem>
      <section className="bg-white py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-6 md:px-8">
          <div className="text-center mb-12">
            <div className="inline-block px-4 py-2 bg-[#079447]/10 border border-[#079447]/20 rounded-full mb-4">
              <span className="text-[#079447] text-sm font-semibold uppercase tracking-wide">Trusted Locally</span>
            </div>
            <h2 className="font-display text-3xl md:text-4xl lg:text-[42px] font-bold leading-tight tracking-tight text-[#0B2850]">
              Why Texas Families Trust Impress
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {proofCards.map((card, index) => (
              <div
                key={index}
                className="group relative bg-gradient-to-b from-gray-50 to-white rounded-2xl p-6 border border-gray-100 hover:border-[#079447]/30 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-12 h-12 bg-[#079447]/10 rounded-xl flex items-center justify-center text-[#079447] mb-4 group-hover:bg-[#079447] group-hover:text-white transition-all duration-300">
                  {card.icon}
                </div>
                <h3 className="font-manrope font-bold text-lg text-[#1e293b] mb-2">
                  {card.title}
                </h3>
                <p className="font-manrope text-[15px] text-slate-600 leading-relaxed">
                  {card.description}
                </p>
              </div>
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
      text: "House smelled so nice when I came home! Everything just SPARKLED. I love how they polish my granite and the care they take with the rest of the house. We have three dogs so it was very important that they got along with our babies. Team is wonderful to work with. Keep up the good work!",
      author: "Shantell R.",
      location: "Georgetown, TX",
      rating: 5
    },
    {
      text: "I love this company! I have had house cleaners for many years. At the recommendation of a friend I decided to try them. I was VERY impressed. They did a spotless job. I would recommend them to anyone; their prices are very fair. You will be very happy you called. They are awesome!",
      author: "Juli E.",
      location: "Austin, TX",
      rating: 5
    },
    {
      text: "Extremely impressed with the cleaning service I received! My house was spotless and the customer service from the employees was exceptional! Along with the great service, the price was definitely something I cannot complain about. I am extremely pleased and will definitely utilize them again.",
      author: "Omally O.",
      location: "Round Rock, TX",
      rating: 5
    }
  ];

  return (
    <StaggerItem>
      <section className="bg-gradient-to-b from-white via-gray-50/50 to-gray-100 py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-6 md:px-8">
          <div className="text-center mb-12">
            <div className="inline-block px-4 py-2 bg-[#079447]/10 border border-[#079447]/20 rounded-full mb-4">
              <span className="text-[#079447] text-sm font-semibold uppercase tracking-wide">Reviews</span>
            </div>
            <h2 className="font-display text-3xl md:text-4xl lg:text-[42px] font-bold leading-tight tracking-tight text-[#0B2850]">
              What Our Clients Are Saying
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="group relative bg-white rounded-2xl p-6 lg:p-8 shadow-sm hover:shadow-xl border border-gray-100 hover:border-[#079447]/20 transition-all duration-300 hover:-translate-y-1"
              >
                {/* Quote Icon */}
                <div className="absolute -top-3 left-6 w-10 h-10 bg-[#079447] rounded-full flex items-center justify-center shadow-lg shadow-green-500/30">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                </div>

                {/* Stars */}
                <div className="flex gap-1 mb-4 mt-2">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                {/* Quote Text */}
                <p className="font-manrope text-[15px] md:text-base text-slate-700 leading-relaxed mb-6">
                  "{testimonial.text}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#079447] to-[#08A855] rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {testimonial.author.charAt(0)}
                  </div>
                  <div>
                    <p className="font-manrope font-semibold text-[#1e293b]">
                      {testimonial.author}
                    </p>
                    <p className="font-manrope text-sm text-slate-500">
                      {testimonial.location}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </StaggerItem>
  );
}