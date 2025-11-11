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
      <QuoteCTA />
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

function ContactCard(){
  return (
    <aside className="rounded-[22px] bg-white text-slate-900 p-6 md:p-7 shadow-xs ring-1 ring-[#42924F]">
      <h4 className="text-xl font-extrabold text-center">Text or Chat With Us</h4>
      <p className="mt-1 text-sm text-slate-600 text-center">Real people. Fast replies.</p>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <a href="sms:+15122775364" className="rounded-2xl px-4 py-2 font-semibold bg-[#42924F] text-white text-center">Text Us</a>
        <a href="#chat" className="rounded-2xl px-4 py-2 font-semibold ring-1 ring-slate-200 bg-[#42924F] text-white text-center">Live Chat</a>
        <a href="tel:+15122775364" className="rounded-2xl px-4 py-2 font-semibold ring-1 ring-slate-200 bg-[#42924F] text-white text-center">Call Us</a>
        <a href="mailto:admin@impressyoucleaning.com" className="rounded-2xl px-4 py-2 font-semibold ring-1 ring-#42924F bg-[#42924F] text-white text-center">Email</a>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
        </div>
    </aside>
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
      <div className="mx-auto max-w-7xl px-4 md:px-6 py-6">
        <div className="grid lg:grid-cols-3 gap-6 items-center">
          <div className="lg:col-span-2">
            <h3 className="font-headline text-70px md:text-[34px] font-extrabold tracking-[-0.04em] text-center text-slate-900">WHY CHOOSE IMPRESS CLEANING SERVICES</h3>
            <ul className="mt-6 grid sm:grid-cols-2 gap-4">
              {cards.map((c) => (
                <li key={c.t} className="rounded-2xl bg-white ring-1 ring-[#42924F] py-4 px-5">
                  <div className="flex items-start gap-3">
<div className="w-20 h-20 grid place-items-center text-emerald-700 -mt-6 sm:-mt-1.5">
<img src={c.icon} alt={c.t} className={`w-50 h-30 object-contain ${c.extra || ''}`} />
</div>
                    <div>
                      <div className="font-league-gothic font-semibold text-slate-900 text-left w-full">{c.t}</div>
                      <p className="font-league-gothic text-sm text-slate-600 mt-1">{c.d}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <ContactCard />
        </div>
      </div>
    </section>
  );
}


function HowItWorks() {
  const steps = [
    ['Request Your Quote','Fill the quick form or text us for a clear price.'],
    ['Schedule Your Clean','Pick a date; we confirm and send reminders.'],
    ['We Make It Shine','Our local team uses a checklist and pro tools.'],
    ['Relax & Enjoy','We follow up to ensure you’re thrilled.'],
  ];
  return (
    <section className="bg-white py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <h3 className="font-sans text-[22px] md:text-[26px] font-extrabold tracking-tight text-slate-900">HOW IT WORKS — SIMPLE, FAST & STRESS-FREE</h3>
        <ol className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map(([t,d],i)=> (
            <li key={t} className="rounded-2xl bg-white ring-1 ring-emerald-200 p-5">
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
        <h3 className="font-sans text-[22px] md:text-[26px] font-extrabold tracking-tight">WHY TEXAS FAMILIES TRUST IMPRESS</h3>
        <div className="mt-6 grid md:grid-cols-4 gap-4">
          <div className="rounded-2xl ring-1 ring-white/20 bg-white/5 p-6 shadow-sm">
            <div className="text-4xl font-extrabold">100%</div>
            <div className="text-sm text-white/80">5-star ratings</div>
          </div>
          <div className="rounded-2xl ring-1 ring-white/20 bg-white/5 p-6 shadow-sm">
            <div className="font-semibold">100% SATISFACTION GUARANTEED</div>
            <div className="text-sm text-white/80 mt-1">We make it right, every time.</div>
          </div>
          <div className="rounded-2xl ring-1 ring-white/20 bg-white/5 p-6 shadow-sm">
            <div className="font-semibold">Cleaner Home Guarantee</div>
            <div className="text-sm text-white/80 mt-1">We communicate clearly.</div>
          </div>
          <div className="rounded-2xl ring-1 ring-white/20 bg-white/5 p-6 shadow-sm">
            <div className="font-semibold"> for Peace of Mind</div>
            <div className="text-sm text-white/80 mt-1">Fully  .</div>
          </div>
        </div>
      </div>
    </section>
  );
}

function QuoteCTA(){
  return (
    <section id="quote" className="bg-white py-12">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="rounded-3xl bg-slate-900 text-white p-6 md:p-8 grid md:grid-cols-2 gap-4 items-center">
          <div>
            <h4 className="text-2xl font-extrabold">Ready for your free quote?</h4>
            <p className="text-white/80 mt-1">Quick reply after you submit.</p>
          </div>
          <div className="flex md:justify-end gap-2">
            <a href="#quote" className="rounded-2xl px-5 py-3 font-semibold bg-white text-slate-900 shadow">Get My Quote</a>
            <a href="tel:+15122775364" className="rounded-2xl px-5 py-3 font-semibold ring-1 ring-white/30">Call Now</a>
          </div>
        </div>
      </div>
    </section>
  );
}
