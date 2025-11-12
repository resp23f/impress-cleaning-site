'use client';
import React, { useState } from "react";
import { track } from '@vercel/analytics';
import Link from 'next/link';

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
            <div>
            <div className="md:max-w-[28ch] 2xl:max-w-[65ch] transform translate-y-[40px] md:translate-y-[60px] xl:translate-y-[0px]">

<h1
                className="font-display tracking-tight text-balance text-white 
                    text-[clamp(28px,3.5vw,190px)] leading-[clamp(1.25,3vw,1.25)] max-w-[min(90vw,34ch)]"
                 > Cleaning done right, so you can enjoy what matters most.
                                        </h1>
        <div className="mt-4 sm:mt-6 flex gap-3 sm:gap-4">
            
                <a href="tel:+15122775364" className="inline-flex items-center justify-center rounded-lg font-extrabold text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 bg-[#079447] hover:bg-[#08A855] font-sans" 
                style={{ padding: 'clamp(4px, 0.8vw, 12px) clamp(12px, 1.5vw, 24px)', fontSize: 'clamp(11px, 1.3vw, 16px)' }} >Call Now</a>

                <Link 
                href="/service-quote" 
                className="inline-flex items-center justify-center rounded-lg font-bold text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 bg-[#079447] hover:bg-[#08A855] font-sans" 
                style={{ padding: 'clamp(4px, 0.8vw, 12px) clamp(12px, 1.5vw, 24px)', fontSize: 'clamp(12px, 1.3vw, 20px)' }} 
                >
                   Get a Free Estimate
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
  );
}

function WhyChoose() {
  const cards = [
    { t: 'Reliable Results', d: 'Every clean follows our proven checklist system, so your space looks great no matter whos on the schedule.', icon:"/results.png", extra: 'scale-[1.15] translate-y-[7px]' },

    { t: 'Easy Booking & Reminders', d: 'Schedule cleaning online in seconds - plus text confirmations and reminders before every visit.', icon:"/calendar.png" },

    { t: 'Clear Communication', d: 'We keep you in the loop from booking to follow-up, so you always know what\'s happening and when.', icon:"/communication.png" },

    { t: 'Locally Owned', d: 'Proudly serving our community with a local touch. Every job supports local families.', icon:"/local-home.png" },

  ];
  return (
    <section className="bg-white py-12 md:py-16">
    <div className="mx-auto max-w-7xl px-4 md:px-6">
    <div className="grid md:grid-cols-2 gap-6 items-center">
                 <div className="lg:col-span-2">
            <h3 className="font-display text-24px md:text-[28px] lg:text-[32px] font-normal leading-tight[1.3] tracking-tight text-center text-[#18335A]">Why Choose Impress Cleaning Services</h3>
            <ul className="mt-6 grid sm:grid-cols-2 gap-4">
              {cards.map((c) => (
                <li key={c.t} className="rounded-2xl bg-white border-2 ring-1 ring-[#E7EBF0] rounded-2xl shadow-sm p-6">                  <div className="flex items-start gap-3">
                <div className="w-20 h-20 grid place-items-center text-emerald-700 sm:mt-0 md:-mt-[8px] lg:-mt-[19px]">
<img src={c.icon} alt={c.t} className={`w-50 h-30 object-contain ${c.extra || ''}`} />
</div>
                    <div>
                      <div className="font-manrope font-semibold leading-snug[1.45] text-[#18335A] text-left w-full text-16px md:text-[18px] lg:text-[18px]">{c.t}</div>
                      <p className="font-manrope font-regular text-15 md:text-[16px] lg:text-[17px] text-[#2C3A4B] leading-relaxed [1.7] tracking-normal">{c.d}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}


function HowItWorks() {
  const sectionRef = React.useRef(null);
  const cardsRef = React.useRef([]);
  
  React.useEffect(() => {
    const currentSection = sectionRef.current;
    const currentCards = cardsRef.current;
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Trigger all cards to animate
            currentCards.forEach((card) => {
              if (card) card.classList.add('visible');
            });
          }
        });
      },
      { threshold: 0.2 }
    );

    if (currentSection) {
      observer.observe(currentSection);
    }

    return () => {
      if (currentSection) {
        observer.unobserve(currentSection);
      }
    };
  }, []);

  const steps = [
    ['Request Your Quote', 'Tell us a little about your home and the cleaning you need. We\'ll send a quick, straightforward quote that\'s easy to understand.'],
    ['Schedule Your Clean', 'Choose the day and time that fit your schedule. We\'ll confirm your booking and send a quick reminder before your appointment.'],
    ['We Make It Shine', 'Our local team arrives on time, fully equipped, and ready to get your space spotless using our detailed checklist and eco-safe products trusted by professionals.'],
    ['Relax & Enjoy', 'Come home to a space that feels fresh and cared for. Your clean is complete and your satisfaction always comes first.'],
  ];
  
  return (
    <section ref={sectionRef} className="bg-white py-12 md:py-16">
      <div className="mx-auto max-w-[1600px] px-12 sm:px-6 lg:px-4">
        <h3 className="font-display text-[24px] md:text-[28px] lg:text-[32px] font-normal leading-tight[1.3] tracking-tight text-center text-[#18335A]">How It Works: Simple, Fast & Stress Free</h3>
        <ol className="mt-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 lg:gap-8 tracking-wide">
          {steps.map(([t,d],i)=> (
            <li 
              key={t} 
              ref={(el) => (cardsRef.current[i] = el)}
              className="rounded-2xl bg-white border-2 ring-1 ring-[#E7EBF0] rounded-2xl shadow-sm px-10 py-5 stagger-item"
            >
              <div className="text-[12px] font-inter font-semibold text-[#079447]">Step {i+1}</div>
              <div className="font-manrope font-semibold leading-snug text-[#18335A] text-left w-full text-base md:text-lg lg:text-lg">{t}</div>
              <p className="font-manrope font-regular text-sm md:text-base lg:text-base text-[#2C3A4B] leading-relaxed tracking-normal mt-2">{d}</p>
            </li>
          ))}
        </ol>
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
  
  return (
    <>
    <section className="bg-[#0B2850] py-12 md:py-16 mb-16 md:mb-24 text-white md:overflow-hidden">
<div className="mx-auto max-w-[1600px] md:px-6 lg:px-4 w-full md:w-auto flex-1">
<h3 className="font-display text-[22px] md:text-[35px] lg:text-[38px] font-bold leading-tight[1.3] tracking-tight text-center text-white">Why Texas Families Trust Impress</h3>
<div ref={scrollRef} className="mt-6 flex overflow-x-auto gap-4 pl-4 snap-x snap-mandatory scrollbar-hide md:grid md:grid-cols-4 md:overflow-x-visible md:px-0 md:gap-6 lg:gap-8 md:snap-none tracking-wide pb-2">
<div className="rounded-2xl ring-1 ring-[#4A5568] bg-white/5 p-8 shadow-sm min-w-[300px] max-w-[300px] md:min-w-0 md:max-w-none snap-center flex-shrink-0 min-h-[220px] md:min-h-0 flex flex-col">
<div className="font-manrope font-semibold text-18 md:text-[20px] lg:text-[22px] mb-2">Texas Homes. Texas Trust.</div>
<div className="font-manrope font-regular text-15 md:text-[16px] lg:text-[17px] text-white/90 leading-relaxed tracking-normal break-words">Our clients trust us because we care about their homes, communicate clearly, and always give our best with every clean.</div>
            </div>

<div className="rounded-2xl ring-1 ring-[#4A5568] bg-white/5 p-8 shadow-sm min-w-[300px] max-w-[300px] md:min-w-0 md:max-w-none snap-center flex-shrink-0 min-h-[220px] md:min-h-0 flex flex-col">
<div className="font-manrope font-semibold text-18 md:text-[20px] lg:text-[22px] mb-2">Proven Reputation.</div>
              <div className="font-manrope font-regular text-15 md:text-[16px] lg:text-[17px] text-white/90 leading-relaxed tracking-normal break-words">Our clients stay with us for years, thanks to consistent quality, reliable service, and attention to detail.</div>
            </div>

<div className="rounded-2xl ring-1 ring-[#4A5568] bg-white/5 p-8 shadow-sm min-w-[300px] max-w-[300px] md:min-w-0 md:max-w-none snap-center flex-shrink-0 min-h-[220px] md:min-h-0 flex flex-col">
<div className="font-manrope font-semibold text-18 md:text-[20px] lg:text-[22px] mb-2">People Who Care.</div>
              <div className="font-manrope font-regular text-15 md:text-[16px] lg:text-[17px] text-white/90 leading-relaxed tracking-normal break-words">We're more than a cleaning company. We're neighbors who take pride in helping families enjoy their homes.</div>
            </div>

<div className="rounded-2xl ring-1 ring-[#4A5568] bg-white/5 p-8 shadow-sm min-w-[300px] max-w-[300px] md:min-w-0 md:max-w-none snap-center flex-shrink-0 min-h-[220px] md:min-h-0 flex flex-col">
<div className="font-manrope font-semibold text-18 md:text-[20px] lg:text-[22px] mb-2">Guaranteed Peace of Mind.</div>
              <div className="font-manrope font-regular text-15 md:text-[16px] lg:text-[17px] text-white/90 leading-relaxed tracking-normal break-words">You can relax knowing your clean is backed by our satisfaction guarantee and handled with professionalism every time.</div>
            </div>
          </div>
      {/* Scroll Indicators - Only visible on mobile/tablet */}
      <div className="flex justify-center gap-2 mt-6 md:hidden">
        <div className={`w-2 h-2 rounded-full transition-colors ${activeIndex === 0 ? 'bg-white' : 'bg-white/50'}`}></div>
        <div className={`w-2 h-2 rounded-full transition-colors ${activeIndex === 1 ? 'bg-white' : 'bg-white/50'}`}></div>
        <div className={`w-2 h-2 rounded-full transition-colors ${activeIndex === 2 ? 'bg-white' : 'bg-white/50'}`}></div>
        <div className={`w-2 h-2 rounded-full transition-colors ${activeIndex === 3 ? 'bg-white' : 'bg-white/50'}`}></div>
      </div>
      </div> 
      </section>
    </>
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
{/* Render testimonials 3 times for smoother infinite scroll */}
      {[...Array(12)].map((_, setIndex) => (
        testimonials.map((testimonial, index) => (
          <div key={`set-${setIndex}-${index}`} className="flex-shrink-0 w-[90vw] md:w-[600px] px-4 text-center inline-block">
              <p className={`text-slate-900 text-lg md:text-xl font-manrope mb-3 leading-relaxed max-w-md mx-auto ${(setIndex * testimonials.length + index) % 2 === 0 ? 'font-bold' : 'font-normal'}`}>
              "{testimonial.text}"
            </p>
            <p className="text-slate-600 font-playfair text-base md:text-lg">– {testimonial.author}</p>
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
  );
}