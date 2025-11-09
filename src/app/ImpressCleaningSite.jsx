'use client';
import React, { useState } from "react";
import { track } from '@vercel/analytics';

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
    <main id="home" className="min-h-screen text-slate-800">
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
      <div className="relative h-[78vh] min-h-[560px] w-full overflow-hidden">
        <img
          src="/hero-cleaners1.jpg"
          alt="Impress Cleaning pro team"
          className="absolute inset-0 h-full w-full object-cover object-[50%_27.5%]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/70 via-slate-900/20 to-transparent" />
        <div className="relative h-full">
          <div className="mx-auto max-w-7xl h-full px-4 md:px-6">
            <div className="h-full grid lg:grid-cols-2 gap-8 md:gap-10 items-center">
              <div>
                        <h1 className="text-white font-[var(--font-playfair)] font-medium tracking-tight text-white text-[36px] md:text-[54px] lg:text-[60px] leading-[1.05]">
                      Relax. We’ll make your space shine – so you can focus on what matters.
                        </h1>
                <div className="mt-6 flex flex-wrap gap-3">
                <a href="tel:+15122775364" className="inline-flex items-center rounded-lg px-6 py-3 font-semibold text-white shadow-sm hover:shadow-md transition bg-emerald-600 hover:bg-emerald-700">Call Now</a>
<a href="#quote" className="inline-flex items-center rounded-lg px-6 py-3 font-semibold text-white shadow-sm hover:shadow-md transition bg-emerald-600 hover:bg-emerald-700">Get a Free Quote</a>
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
    <aside className="rounded-[22px] bg-white text-slate-900 p-6 md:p-7 shadow-xl ring-1 ring-slate-200">
      <h4 className="text-xl font-extrabold">Text or Chat With Us</h4>
      <p className="mt-1 text-sm text-slate-600">Real people. Fast replies.</p>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <a href="sms:+15122775364" className="rounded-2xl px-4 py-2 font-semibold bg-emerald-600 text-white text-center">Text Us</a>
        <a href="#chat" className="rounded-2xl px-4 py-2 font-semibold ring-1 ring-slate-200 text-center">Live Chat</a>
        <a href="tel:+15122775364" className="rounded-2xl px-4 py-2 font-semibold ring-1 ring-slate-200 text-center">Call Us</a>
        <a href="mailto:admin@impressyoucleaning.com" className="rounded-2xl px-4 py-2 font-semibold ring-1 ring-slate-200 text-center">Email</a>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
        <div className="rounded-xl ring-1 ring-slate-200 bg-white p-2 text-center">
          <div className="font-semibold">4.9★</div>
          <div className="text-slate-500">Google</div>
        </div>
        <div className="rounded-xl ring-1 ring-slate-200 bg-white p-2 text-center">
          <div className="font-semibold">100%</div>
          <div className="text-slate-500">Satisfaction</div>
        </div>
        <div className="rounded-xl ring-1 ring-slate-200 bg-white p-2 text-center">
          <div className="font-semibold">Bilingual</div>
          <div className="text-slate-500">English/Spanish</div>
        </div>
      </div>
    </aside>
  );
}

function WhyChoose() {
  const cards = [
    { t: 'Satisfaction Guaranteed', d: 'If anything misses, we make it right.', icon: <CheckIcon /> },
    { t: 'Locally Owned', d: 'Georgetown-based team. Dollars stay local.', icon: <HomeIcon /> },
    { t: 'Consistent Teams', d: 'Same pros, reliable schedules, reminders.', icon: <CheckIcon /> },
    { t: 'Quality Products', d: 'We use pro-grade supplies and tools.', icon: <StarIcon /> },
  ];
  return (
    <section className="bg-white py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="grid lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2">
            <h3 className="font-[var(--font-playfair)] text-[22px] md:text-[26px] font-extrabold tracking-tight text-slate-900">WHY CHOOSE IMPRESS CLEANING SERVICES</h3>
            <ul className="mt-6 grid sm:grid-cols-2 gap-4">
              {cards.map((c) => (
                <li key={c.t} className="rounded-2xl bg-white ring-1 ring-emerald-200 p-5">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 ring-1 ring-emerald-100 grid place-items-center text-emerald-700">{c.icon}</div>
                    <div>
                      <div className="font-semibold text-slate-900">{c.t}</div>
                      <p className="text-sm text-slate-600 mt-1">{c.d}</p>
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

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none">
      <path d="M20 7L9 18l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function StarIcon(){
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor"><path d="M12 3l2.7 5.6 6.2.9-4.5 4.3 1 6.1L12 17.8 6.6 20l1-6.1L3 9.5l6.2-.9L12 3z"/></svg>
  )
}
function HomeIconSvg(){
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor"><path d="M12 3 3 10v11h6v-6h6v6h6V10l-9-7z"/></svg>
  )
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
            <div className="font-semibold">Insured for Peace of Mind</div>
            <div className="text-sm text-white/80 mt-1">Fully insured & bonded.</div>
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
