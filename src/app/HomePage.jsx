'use client';
import React, { useState } from "react";
import { track } from '@vercel/analytics';
import { Playfair_Display } from "next/font/google";
const playfairLocal = Playfair_Display({ subsets: ["latin"], weight: ["400"] });

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
    <main id="top" className="min-h-screen">
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
<section id="home" className="relative w-screen left-1/2 -ml-[50vw] mt-20">
<div className="relative h-[50vh] md:h-[78vh] min-h-[400px] md:min-h-[560px] w-full overflow-hidden">        <img
          src="/hero-cleaners1.jpg"
          alt="Impress Cleaning pro team"
          className="absolute inset-0 h-full w-full object-cover object-[50%_27.5%]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/10 to-transparent pointer-events-none z-10" />
        <div className="relative h-full">
          <div className="mx-auto max-w-7xl h-full px-4 md:px-6">
          <div className="md:absolute md:left-[clamp(1.5rem,6vw,5rem)] md:top-[clamp(5rem,22vh,12rem)] md:max-w-[700px] z-20">
            <div>
            <h1 className="font-headline font-normal tracking-tight text-white text-[36px] md:text-[54px] lg:text-[60px] leading-[1.05] mt-[205px] md:mt-0 max-w-[280px] md:max-w-none" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.7), 0 0 2px rgba(0,0,0,0.5)' }}>
                                                  We’ll make your space shine so you can focus on what matters.
                        </h1>
                        <div className="mt-3 md:mt-6 flex flex-wrap gap-4">                <a href="tel:+15122775364" className="inline-flex items-center rounded-lg px-15 py-3 font-semibold text-white shadow-sm hover:shadow-md transition bg-emerald-600 hover:bg-emerald-700 font-headline text-[14x] md:text-[14px] lg:text-[19px]">Call Now</a>
                        <a href="#quote" className="inline-flex items-center rounded-lg px-15 py-3 font-semibold text-white shadow-sm hover:shadow-md transition bg-emerald-600 hover:bg-emerald-700 font-headline text-[14px] md:text-[14px] lg:text-[19px]">Free Quote</a>
                        </div>
              </div>

              {/* Right column kept for layout balance; remove if you want text to span full width */}
              <div className="hidden lg:block" />
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
            <h3 className="font-heading-oswald text-70px md:text-[35px] font-extrabold tracking-[-0.04em] text-center text-slate-900">WHY CHOOSE IMPRESS CLEANING SERVICES</h3>
            <ul className="mt-6 grid sm:grid-cols-2 gap-4">
              {cards.map((c) => (
                <li key={c.t} className="rounded-2xl bg-white border-2 border-[#079447] py-4 px-5">                  <div className="flex items-start gap-3">
<div className="w-20 h-20 grid place-items-center text-emerald-700 -mt-6 sm:-mt-1.5">
<img src={c.icon} alt={c.t} className={`w-50 h-30 object-contain ${c.extra || ''}`} />
</div>
                    <div>
                      <div className="font-oswald font-semibold text-slate-900 text-left w-full">{c.t}</div>
                      <p className="font-oswald text-sm text-slate-600 mt-1">{c.d}</p>
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
  const steps = [
    ['Request Your Quote','Tell us a little about your home and the cleaning you need. We’ll send a quick, straightforward quote that’s easy to understand.'],
    ['Schedule Your Clean','Choose the day and time that fit your schedule. We’ll confirm your booking and send a quick reminder before your appointment.'],
    ['We Make It Shine','Our local team arrives on time, fully equipped, and ready to get your space spotless using our detailed checklist and eco-safe products trusted by professionals.'],
    ['Relax & Enjoy','Come home to a space that feels fresh and cared for. Your clean is complete and your satisfaction always comes first.'],
  ];
  return (
    <section className="bg-white py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <h3 className="font-heading-oswald text-70px md:text-[35px] font-extrabold tracking-tight text-center text-slate-900">HOW IT WORKS — SIMPLE, FAST & STRESS-FREE</h3>
        <ol className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map(([t,d],i)=> (
            <li key={t} className="rounded-2xl bg-white border-2 border-[#079447] py-4 px-5">
              <div className="text-[12px] font-semibold text-emerald-700">Step {i+1}</div>
              <div className="mt-1 font-semibold text-slate-900">{t}</div>
              <p className="mt-1 text-sm text-slate-600">{d}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function SocialProof() {
  return (
    <section className="bg-[#0B2850] py-12 md:py-16 text-white">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <h3 className="font-heading-oswald text-[22px] md:text-[35px] font-extrabold tracking-tight text-center">WHY TEXAS FAMILIES TRUST IMPRESS</h3>
        <div className="mt-6 grid md:grid-cols-4 gap-4">
          <div className="rounded-2xl ring-1 ring-white/20 bg-white/5 p-6 shadow-sm">
            <div className="font-semibold">Texas Homes. Texas Trust.</div>
            <div className="text-sm text-white/80">Our clients trust us because we care about their homes, communicate clearly, and always give our best with every clean.</div>
          </div>
          <div className="rounded-2xl ring-1 ring-white/20 bg-white/5 p-6 shadow-sm">
            <div className="font-semibold">Proven Reputation</div>
            <div className="text-sm text-white/80 mt-1">Our clients stay with us for years, thanks to consistent quality, reliable service, and attention to detail.</div>
          </div>
          <div className="rounded-2xl ring-1 ring-white/20 bg-white/5 p-6 shadow-sm">
            <div className="font-semibold">People Who Care</div>
            <div className="text-sm text-white/80 mt-1">We’re more than a cleaning company. We’re neighbors who take pride in helping families enjoy their homes.</div>
          </div>
          <div className="rounded-2xl ring-1 ring-white/20 bg-white/5 p-6 shadow-sm">
            <div className="font-semibold">Guaranteed Peace of Mind</div>
            <div className="text-sm text-white/80 mt-1">You can relax knowing your clean is backed by our satisfaction guarantee and handled with professionalism every time.</div>
          </div>
        </div>
      </div>
    </section>
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
    <section className="bg-white py-12 md:py-16 overflow-hidden">
      <div className="container mx-auto mb-12">
        <h2 className="font-heading-oswald text-4xl md:text-5xl font-extrabold text-center text-slate-900">
          WHAT OUR CLIENTS SAY
        </h2>
      </div>
      
      {/* Scrolling container */}
      <div className="relative">
        <div className="flex animate-scroll">
          {/* First set of testimonials */}
          {testimonials.map((testimonial, index) => (
            <div key={`original-${index}`} className="flex-shrink-0 w-[90vw] md:w-[500px] px-6 text-center inline-block">              
<p className={`text-slate-900 text-lg md:text-xl mb-3 leading-relaxed max-w-md mx-auto ${index % 2 === 0 ? 'font-bold' : 'font-normal'}`}>
                    "{testimonial.text}"
              </p>
              <p className="text-slate-600 text-base md:text-lg">– {testimonial.author}</p>
            </div>
          ))}
          {/* Duplicate set for seamless loop */}
{testimonials.map((testimonial, index) => (
  <div key={`duplicate-${index}`} className="flex-shrink-0 w-[90vw] md:w-[500px] px-6 text-center inline-block">
    <p className={`text-slate-900 text-lg md:text-xl mb-3 leading-relaxed max-w-md mx-auto ${(index + testimonials.length) % 2 === 0 ? 'font-bold' : 'font-normal'}`}>
                         "{testimonial.text}"
              </p>
              <p className="text-slate-600 text-base md:text-lg">– {testimonial.author}</p>
            </div>
          ))}
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
    animation: scroll 60s linear infinite;
  }
`}</style>
    </section>
  );
}