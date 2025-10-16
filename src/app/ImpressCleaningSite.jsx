'use client';
import React, { useState } from "react";
import Link from "next/link";



// Impress Cleaning Services — Starter Site (React + Tailwind)
// Fixed: restored full file; added working DropdownMenu component; desktop dropdowns for Residential/Commercial
// Sections: Hero, Credibility, Services, Why, Industries, CTA, Process, Reviews, FAQ, Service Area, About, Quote, Footer

// Inline SVG icons (no extra packages)
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

// Reusable chip with 3D hover + tooltip
const Chip = ({ icon, label, detail }) => (
  <div className="relative group">
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white ring-1 ring-slate-200 px-3 py-1 text-sm text-slate-700 shadow-sm transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0">
      {icon}
      <span className="whitespace-nowrap">{label}</span>
    </span>

    {/* Tooltip */}
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
  const FORM_ENDPOINT = ""; // e.g., https://formspree.io/f/xxxxxxx

  async function handleSubmit(e) {
    e.preventDefault();
    setSending(true);
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));

    if (!FORM_ENDPOINT) {
      // graceful fallback if no endpoint is set
      const body = encodeURIComponent(
        Object.entries(data)
          .map(([k, v]) => `${k}: ${v}`)
          .join("\n")
      );
      window.location.href = `mailto:admin@impressyoucleaning.com?subject=Quote%20Request&body=${body}`;
      setSending(false);
      setSent(true);
      form.reset();
      return;
    }

    try {
      const res = await fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setSent(true);
        form.reset();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  }

  return (
    <main id="home" className="min-h-screen text-slate-800">
      
{/* Header */}
<header className="sticky top-0 pt-[env(safe-area-inset-top)] z-40 bg-white/90 backdrop-blur border-b border-slate-100">
  <div className="mx-auto max-w-7xl px-4 md:px-8">
  </div>
    {/* Row 1: Brand + utility links */}
    <div className="flex items-center justify-between py-4 px-2 md:px-4">
      {/* Brand */}
      <a href="/" className="shrink-0 flex items-center gap-4" aria-label="Impress Cleaning Services LLC">
        <div className="ml-4 md:ml-0">
          <div className="flex items-baseline gap-2">
            <span className="font-brand uppercase tracking-[0.05em] text-[25px] md:text-[35px] font-black text-[#0B2850]">Impress</span>
            <span className="font-brand uppercase tracking-[0.05em] text-[25px] md:text-[35px] font-black text-[#0B2850]">Cleaning Services</span>
            <span className="font-brand uppercase tracking-[0.14em] text-[10px] text-[#0B2850] align-super -ml-0.5">LLC</span>
          </div>
          <p className="text-slate-900 text-md md:text-md">A clean home is an impressive home.</p>
           {/* swoosh */}
        </div>
      </a>

      {/* Utility links (right) */}
      <ul className="hidden md:flex items-center text-sm text-slate-600">
        <li><a href="/careers" className="hover:text-slate-900">Apply</a></li>
        <li className="mx-6 h-4 w-px bg-slate-200" aria-hidden="true" />
        <li><Link href="/aplicar" className="hover:text-slate-900">Aplicar</Link></li>
        <li className="mx-6 h-4 w-px bg-slate-200" aria-hidden="true" />
        <li><a href="/gift-cards" className="hover:text-slate-900">Gift Cards</a></li>
      </ul>
    </div>

{/* Row 2: Tabs + CTAs */}
<div className="flex items-center justify-between pb-3">
  {/* Tabs (left) */}
  <nav className="flex-1 min-w-0">
    <ul
      className="hide-scrollbar flex gap-8 md:gap-10 overflow-x-auto whitespace-nowrap
             text-[16px] md:text-[18px] font-medium text-slate-900
             pl-4 pr-20 md:pr-0 py-3 -mx-4 md:mx-0
             [mask-image:linear-gradient(to_right,transparent,black_16px,black_calc(100%-32px),transparent)]"
      aria-label="Primary"
    >
      {[
        ["Residential", "#home"],
        ["Commercial", "#commercial"],
        ["Why Hire Us", "#why"],
        ["About Us", "#about"],
        ["FAQ", "#faq"],
      ].map(([label, href]) => (
        <li key={label}>
          <a
            href={href}
            className="px-3 py-2 text-[16px] md:text-[18px] font-semibold text-slate-800 hover:text-emerald-700 tracking-[0.02em] transition-colors"
          >
            {label}
          </a>
        </li>
      ))}
    </ul>
  </nav>

  {/* CTAs (right) */}
  <div className="ml-auto flex items-center gap-2 shrink-0">
    {/* Desktop ≥1280px */}
    <div className="hidden xl:flex items-center gap-3 shrink-0">
      <a href="#quote" className="px-4 py-2 text-sm font-semibold text-[#0B2850] whitespace-nowrap">
        Get a Free Quote
      </a>
      <a href="tel:15122775364" className="px-4 py-2 text-sm font-semibold text-[#0B2850] whitespace-nowrap">
        Call (512) 277-5364
      </a>
    </div>

    {/* Tablet ≥768px & <1280px */}
    <div className="hidden md:flex xl:hidden items-center gap-2 shrink-0">
      <a href="#quote" className="px-3 py-1.5 text-sm font-semibold text-[#0B2850] whitespace-nowrap">
        Free Quote
      </a>
      <a href="tel:15122775364" className="px-3 py-1.5 text-sm font-semibold text-[#0B2850] whitespace-nowrap">
        (512) 277-5364
      </a>
    </div>

    {/* Mobile <768px */}
    <div className="flex md:hidden items-center gap-2 shrink-0">
      <a
        href="#quote"
        aria-label="Get a Free Quote"
        className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-slate-300 text-[#0B2850]"
      >
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 7h16v10H4zM8 7v10M16 7v10M4 11h4M16 11h4" />
        </svg>
      </a>
      <a
        href="tel:15122775364"
        aria-label="Call (512) 277-5364"
        className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-slate-300 text-[#0B2850]" >
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.86 19.86 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.86 19.86 0 0 1 2.08 4.18 2 2 0 0 1 4.06 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.77.62 2.6a2 2 0 0 1-.45 2.11L8.1 9.9a16 16 0 0 0 6 6l1.47-1.13a2 2 0 0 1 2.11-.45c.83.29 1.7.5 2.6.62A2 2 0 0 1 22 16.92z" />
        </svg>
      </a>
     </div>
    </div>
   </div>
</header> 


{/* Hero */}
<section id="home" className="relative bg-slate-900 text-white">
  {/* Background image */}
  <img
    src="/hero-cleaners.jpg"
    alt="Professional cleaners from Impress Cleaning"
    className="absolute inset-0 h-full w-full object-cover object-[90%_40%]"
  />

  {/* Subtle dark overlay */}
  <div className="absolute inset-0 bg-black/40" />

  {/* Text content */}
  <div className="relative z-10 mx-auto max-w-6xl px-6 py-32 md:py-40">
    <div className="max-w-2xl">
      <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight">
        Sparkling homes, zero hassle.
      </h1>
      <p className="mt-4 text-lg text-white/90 max-w-prose">
        Reliable, insured, and detail-obsessed cleaning for residential homes, offices, and commercial spaces.
      </p>
      <div className="mt-8 flex flex-wrap gap-4">
        <a
          href="#quote"
          className="rounded-2xl px-6 py-3 font-semibold bg-white text-slate-900 shadow hover:shadow-md"
        >
          Get a Fast Quote
        </a>
        <a
          href="#services"
          className="rounded-2xl px-6 py-3 font-semibold border border-white/30 text-white hover:bg-white/10"
        >
          Explore Services
        </a>
      </div>
    </div>
  </div>
</section>


      {/* Services */}
<section id="services" className="py-20 bg-[#FFFDF8]">
  <div className="w-full px-4 md:px-8 lg:px-12">
    <h2 className="text-3xl font-bold text-slate-900 mb-2">How Impress Cleaning can serve you</h2>
    <p className="text-slate-600 mb-12">
      A clean space makes a lasting impression. Choose the plan that fits your schedule.
    </p>

    {/* GRID OPEN */}
    <div className="grid md:grid-cols-3 gap-8 text-left">

      {/* Service 1 – Weekly / Bi-Weekly */}
      <div className="bg-white rounded-2xl shadow-sm hover:shadow-md border-t-4 border-green-500 transition-all duration-300 hover:-translate-y-1 p-8">
        <svg aria-hidden="true" viewBox="0 0 24 24" className="w-8 h-8 mb-4 text-green-600">
          <path fill="currentColor" d="M12 2c.4 2.7 1.8 4.1 4.5 4.5C13.8 7 12.4 8.4 12 11.1 11.6 8.4 10.2 7 7.5 6.5 10.2 6.1 11.6 4.7 12 2zM12 12.9c.3 1.9 1.4 3 3.3 3.3-1.9.3-3 1.4-3.3 3.3-.3-1.9-1.4-3-3.3-3.3 1.9-.3 3-1.4 3.3-3.3z"/>
        </svg>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Weekly / Bi-Weekly</h3>
        <p className="text-slate-600 text-sm leading-relaxed">
          Keep your home fresh and spotless with our recurring cleaning plans.
          Our team handles the details so you can enjoy the comfort.
        </p>
      </div>

      {/* Service 2 – Move-In / Move-Out */}
      <div className="bg-white rounded-2xl shadow-sm hover:shadow-md border-t-4 border-green-500 transition-all duration-300 hover:-translate-y-1 p-8">
        <svg aria-hidden="true" viewBox="0 0 24 24" className="w-8 h-8 mb-4 text-green-600">
          <path fill="currentColor" d="M12 3 3 10v11h6v-6h6v6h6V10l-9-7z"/>
        </svg>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Move-In / Move-Out</h3>
        <p className="text-slate-600 text-sm leading-relaxed">
          Whether you’re settling in or saying goodbye, we’ll leave the space sparkling clean and move-in ready.
        </p>
      </div>

      {/* Service 3 – Commercial */}
      <div className="bg-white rounded-2xl shadow-sm hover:shadow-md border-t-4 border-green-500 transition-all duration-300 hover:-translate-y-1 p-8">
        <svg aria-hidden="true" viewBox="0 0 24 24" className="w-8 h-8 mb-4 text-green-600">
          <path fill="currentColor" d="M3 21V7l9-4 9 4v14h-7v-5H10v5H3zM5 19h3v-3H5v3zm11 0h3v-9h-3v9zM8 9h3V7H8v2z"/>
        </svg>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Commercial Cleaning</h3>
        <p className="text-slate-600 text-sm leading-relaxed">
          Impress your clients and create a spotless workspace that boosts morale and productivity.
        </p>
      </div>

    </div>
    {/* GRID CLOSE */}
  </div>
</section>

{/* Why Choose Impress Cleaning Services */}
<section className="py-16" id="why">
  <div className="w-full px-4 md:px-8 lg:px-12">
    <h2 className="text-2xl font-bold text-slate-900">Why Choose Impress Cleaning Services</h2>
    <p className="text-slate-600 mt-2">
      Franchise-level reliability with a local, detail-first approach.
    </p>

    {/* Why Choose Impress Grid */}
<div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  {[
    {
      title: "Satisfaction Guarantee",
      desc:  "If anything misses the mark, we’ll get it taken care of.",
      icon: (
        <svg aria-hidden="true" viewBox="0 0 24 24" className="w-6 h-6 text-emerald-600">
          <path fill="currentColor" d="M12 2l3.09 6.26L22 9.27l-5 4.88L18.18 22 12 18.56 5.82 22 7 14.15l-5-4.88 6.91-1.01L12 2z"/>
        </svg>
      ),
    },
    {
      title: "Locally Owned",
      desc:  "Georgetown-based team—your dollars stay in the community.",
      icon: (
        <svg aria-hidden="true" viewBox="0 0 24 24" className="w-6 h-6 text-emerald-600">
          <path fill="currentColor" d="M12 3l9 8h-3v9h-5v-6H11v6H6v-9H3l9-8z"/>
        </svg>
      ),
    },
    {
      title: "Reliable Results",
      desc:  "Every clean follows our proven checklist system—so your space looks great no matter who’s on the schedule.",
      icon: (
        <svg aria-hidden="true" viewBox="0 0 24 24" className="w-6 h-6 text-emerald-600">
          <path fill="currentColor" d="M12 2l3.09 6.26L22 9.27l-5 4.88L18.18 22 12 18.56 5.82 22 7 14.15l-5-4.88 6.91-1.01L12 2z"/>
        </svg>
      ),
    },
    {
      title: "Clear Communication",
      desc:  "We keep you in the loop from booking to follow-up, so you always know what’s happening and when.",
      icon: (
        <svg aria-hidden="true" viewBox="0 0 24 24" className="w-6 h-6 text-emerald-600">
          <path fill="currentColor" d="M12 2l3.09 6.26L22 9.27l-5 4.88L18.18 22 12 18.56 5.82 22 7 14.15l-5-4.88 6.91-1.01L12 2z"/>
        </svg>
      ),
    },
    {
      title: "Quality-Driven Service",
      desc:  "Supervisors review each job and feedback is built into our process, keeping standards high and details consistent.",
      icon: (
        <svg aria-hidden="true" viewBox="0 0 24 24" className="w-6 h-6 text-emerald-600">
          <path fill="currentColor" d="M12 2l3.09 6.26L22 9.27l-5 4.88L18.18 22 12 18.56 5.82 22 7 14.15l-5-4.88 6.91-1.01L12 2z"/>
        </svg>
      ),
    },      ].map(({ title, desc, icon }) => (
    <div
      key={title}
      className="bg-white rounded-2xl shadow-sm hover:shadow-md ring-1 ring-slate-200
                 border-t-[3px] border-emerald-500 transition p-5 md:p-6 flex gap-3 h-full"
    >
      <div className="shrink-0 mt-0.5">{icon}</div>
      <div className="space-y-1.5">
        <h4 className="font-semibold text-slate-900">{title}</h4>
        <p className="text-slate-600 text-sm leading-relaxed">{desc}</p>
      </div>
    </div>
  ))}
</div>
  </div>
</section>

{/* Who we clean for */}
<section className="py-12" id="who-we-clean">
  <div className="w-full px-4 md:px-8 lg:px-12">
    <h3 className="text-2xl font-bold text-slate-900">Who We Clean For</h3>

    {/* Residential focus */}
    <div className="mt-4">
      <p className="text-slate-600 text-sm mb-2 font-medium">Residential</p>
      <div className="flex flex-wrap gap-2">
        <span className="rounded-full bg-white ring-1 ring-slate-200 px-3 py-1 text-sm">Homes</span>
        <span className="rounded-full bg-white ring-1 ring-slate-200 px-3 py-1 text-sm">Apartments & Condos</span>
        <span className="rounded-full bg-white ring-1 ring-slate-200 px-3 py-1 text-sm">Move-In / Move-Out</span>
        <span className="rounded-full bg-white ring-1 ring-slate-200 px-3 py-1 text-sm">Deep Cleaning</span>
        <span className="rounded-full bg-white ring-1 ring-slate-200 px-3 py-1 text-sm">Recurring (Weekly/Bi-Weekly)</span>
      </div>
    </div>

    {/* Commercial kept visible */}
    <div className="mt-8" id="commercial">
      <p className="text-slate-600 text-sm mb-2 font-medium">Commercial</p>
      <div className="flex flex-wrap gap-2">
        <span className="rounded-full bg-white ring-1 ring-slate-200 px-3 py-1 text-sm">Professional Offices</span>
        <span className="rounded-full bg-white ring-1 ring-slate-200 px-3 py-1 text-sm">Medical / Dental</span>
        <span className="rounded-full bg-white ring-1 ring-slate-200 px-3 py-1 text-sm">Law Firms</span>
        <span className="rounded-full bg-white ring-1 ring-slate-200 px-3 py-1 text-sm">Retail Suites</span>
        <span className="rounded-full bg-white ring-1 ring-slate-200 px-3 py-1 text-sm">Property Management</span>

        {/* ✅ keep the map, but make it a proper expression that renders <span> chips */}
        {[
          // add anything you want here, or keep it empty if you don't need extras
          // "Gyms", "Daycares"
        ].map((i) => (
          <span
            key={i}
            className="rounded-full bg-white ring-1 ring-slate-200 px-3 py-1 text-sm text-slate-700 whitespace-nowrap"
          >
            {i}
          </span>
        ))}
      </div>
    </div>
  </div>
</section>

      {/* CTA band */}
      <CtaBand />

{/* Reviews */}
<section id="reviews" className="w-full px-4 md:px-8 lg:px-12 py-16 rounded-[2rem]">
  <div className="mb-6">
    <h2 className="text-2xl font-bold text-slate-900">Customer Reviews</h2>
    <p className="text-slate-600 mt-1">Real feedback from happy clients.</p>
  </div>

  <ul className="grid md:grid-cols-3 gap-4 list-none">
    {[
      {
        quote: `House smelled so nice when I came home! Everything just SPARKLED. I love how they polish my granite and the care they take with the rest of the house. We have three dogs so it was very important that they got along with our babies. Team is wonderful to work with. The whole team with her are such hard workers. Keep up the good work!`,
        name: "Shantell R, Verified Customer",
      },
      {
        quote: `I love this company! I have had house cleaners for many years. At the recommendation of a friend I decided to try them. I was VERY impressed. They did a spotless job. I would recommend them to anyone; their prices are very fair. You can reach them at admin@impressyoucleaning.com. You will be very happy you called. They are awesome!`,
        name: "Juli E, Verified Customer",
      },
      {
        quote: `Extremely impressed with the cleaning service I received! My house was spotless and the customer service from the employees was exceptional! Along with the great service, the price was definitely something I cannot complain about. I am extremely pleased and will definitely utilize them again.`,
        name: "Omally O, Verified Customer",
      },
    ].map((r, i) => {
      const cleaned = r.quote.replace(/(^\s*[“”"']+)|([“”"']+\s*$)/g, "");
      return (
        <li
          key={i}
          className="rounded-2xl bg-white ring-1 ring-slate-200 shadow-sm p-6 transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-md"
        >
        </li>
      );
    })}
  </ul>
</section>

{/* Service Area */}
<section className="w-full px-4 md:px-8 lg:px-12 py-16">
  <h3 className="text-xl md:text-2xl font-semibold">Service Area</h3>
  <p className="text-slate-600 mt-2">
    Greater metro area and nearby suburbs. If you’re just outside, ask—we’re flexible for the right fit.
  </p>          
<div className="mt-6 w-full h-48 md:h-64 rounded-2xl overflow-hidden bg-white shadow-sm">
<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d54879.50592557885!2d-97.72647995000001!3d30.71926849999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8644d5693958ab55%3A0xa2ee570eaadd9735!2sSun%20City%2C%20Georgetown%2C%20TX%2078633!5e0!3m2!1sen!2sus!4v1760480263582!5m2!1sen!2sus" 
className="w-full h-full block border-none outline-none -translate-y-px"
      style={{ border: 'none' }}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      allowFullScreen
      title="Service area map"
    />
  </div>
</section>
{/* Quote Form */}
<section id="quote" className="w-full px-4 md:px-8 lg:px-12 py-16">
    <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight text-[#0B2850]">
    Request a Quote
  </h2>
  <p className="mt-3 md:mt-3 text-lg md:text-1xl leading-snug text-slate-600 max-w-5xl">
    Tell us about your space and schedule. We’ll respond quickly after submitting your request.
  </p>
  <form onSubmit={handleSubmit} className="rounded-2xl bg-white ring-1 ring-slate-200 shadow-sm p-6 md:p-8">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Name */}
      <div className="col-span-1">
        <label htmlFor="name" className="block text-sm font-medium text-slate-700">
          Name <span className="text-rose-500">*</span>
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          placeholder="Full name"
          className="mt-1 w-full rounded-xl bg-white ring-1 ring-slate-200 px-3.5 py-2.5 text-slate-900 placeholder-slate-400 shadow-sm outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {/* Phone */}
      <div className="col-span-1">
        <label htmlFor="phone" className="block text-sm font-medium text-slate-700">
          Phone <span className="text-rose-500">*</span>
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          required
          placeholder="(512) 555-0123"
          className="mt-1 w-full rounded-xl bg-white ring-1 ring-slate-200 px-3.5 py-2.5 text-slate-900 placeholder-slate-400 shadow-sm outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {/* Email */}
      <div className="col-span-1">
        <label htmlFor="email" className="block text-sm font-medium text-slate-700">
          Email <span className="text-rose-500">*</span>
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder="you@email.com"
          className="mt-1 w-full rounded-xl bg-white ring-1 ring-slate-200 px-3.5 py-2.5 text-slate-900 placeholder-slate-400 shadow-sm outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {/* Address (full width on md) */}
      <div className="md:col-span-2">
        <label htmlFor="address" className="block text-sm font-medium text-slate-700">
          Address <span className="text-rose-500">*</span>
        </label>
        <input
          id="address"
          name="address"
          type="text"
          required
          placeholder="Street, city, ZIP"
          className="mt-1 w-full rounded-xl bg-white ring-1 ring-slate-200 px-3.5 py-2.5 text-slate-900 placeholder-slate-400 shadow-sm outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {/* Sq. Ft. */}
      <div className="col-span-1">
        <label htmlFor="sqft" className="block text-sm font-medium text-slate-700">Sq. Ft.</label>
        <input
          id="sqft"
          name="sqft"
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder="e.g., 1800"
          className="mt-1 w-full rounded-xl bg-white ring-1 ring-slate-200 px-3.5 py-2.5 text-slate-900 placeholder-slate-400 shadow-sm outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {/* Frequency (custom select) */}
      <div className="col-span-1">
        <label htmlFor="frequency" className="block text-sm font-medium text-slate-700">Frequency</label>
        <div className="relative">
          <select
            id="frequency"
            name="frequency"
            defaultValue="One-Time"
            className="mt-1 w-full appearance-none rounded-xl bg-white ring-1 ring-slate-200 px-3.5 py-2.5 pr-9 text-slate-900 shadow-sm outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option>One-Time</option>
            <option>Weekly</option>
            <option>Bi-Weekly</option>
            <option>Monthly</option>
            <option>Move-In / Move-Out</option>
            <option>Deep Clean</option>
          </select>
          <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path d="M6 8l4 4 4-4" />
          </svg>
        </div>
      </div>

      {/* Start (custom select) */}
      <div className="col-span-1 md:col-span-2 lg:col-span-1">
        <label htmlFor="start" className="block text-sm font-medium text-slate-700">Start</label>
        <div className="relative">
          <select
            id="start"
            name="start"
            defaultValue="Asap"
            className="mt-1 w-full appearance-none rounded-xl bg-white ring-1 ring-slate-200 px-3.5 py-2.5 pr-9 text-slate-900 shadow-sm outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option>Asap</option>
            <option>This Week</option>
            <option>Next Week</option>
            <option>Next Month</option>
          </select>
          <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path d="M6 8l4 4 4-4" />
          </svg>
        </div>
      </div>

      {/* Notes */}
      <div className="md:col-span-2">
        <label htmlFor="notes" className="block text-sm font-medium text-slate-700">Notes / Access Details</label>
        <textarea
          id="notes"
          name="notes"
          rows={4}
          placeholder="Alarms, after-hours, special areas…"
          className="mt-1 w-full resize-y rounded-xl bg-white ring-1 ring-slate-200 px-3.5 py-2.5 text-slate-900 placeholder-slate-400 shadow-sm outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>
    </div>

    {/* Actions */}
    <div className="mt-6 flex items-center gap-4">
      <button
        type="submit"
        className="inline-flex items-center justify-center rounded-full bg-[#0B2850] px-5 py-2.5 text-white font-semibold shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0"
      >
        Send Request
      </button>
      <a href="mailto:admin@impressyoucleaning.com" className="text-slate-600 hover:text-slate-900 text-sm underline-offset-2 hover:underline">
      </a>
    </div>

    <p className="mt-4 text-xs text-slate-500">
      By submitting, you agree to be contacted about your request. No spam.
    </p>
  </form>
</section>

    </main>
  );
}

// ---------- UI building blocks ----------
function Card({ title, desc }) {
  return (
    <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <span className="inline-grid place-items-center w-9 h-9 rounded-xl border border-slate-200">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
            <path d="M20 7L9 18l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <div>
          <div className="font-semibold">{title}</div>
          <p className="text-sm text-slate-600 mt-1">{desc}</p>
        </div>
      </div>
    </div>
  );
}

function Field({ label, id, type = "text", as, rows = 3, inputMode, placeholder, required }) {
  const Tag = as || "input";
  return (
    <label className="block">
      <span className="text-xs text-slate-600">{label}{required ? " *" : ""}</span>
      <Tag
        id={id}
        name={id}
        type={as ? undefined : type}
        rows={as ? rows : undefined}
        inputMode={inputMode}
        placeholder={placeholder}
        required={required}
        className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
      />
    </label>
  );
}

function Select({ label, id, options }) {
  return (
    <label className="block">
      <span className="text-xs text-slate-600">{label}</span>
      <select id={id} name={id} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300">
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </label>
  );
}

function TrustChip({ label }) {
  return (
    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 bg-white shadow-sm">
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 7L9 18l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="text-xs text-slate-700">{label}</span>
    </span>
  );
}

function Logo({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-slate-900">
      <path d="M12 2l3 3-3 3-3-3 3-3zm0 6l8 8-8 8-8-8 8-8z" fill="currentColor" opacity="0.08" />
      <path d="M5 13l4 4 10-10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function HeroPhoto() {
  return (
    <div className="relative aspect-[4/3] rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm">
      {/* photo */}
      <img
        src="/hero-cleaners.jpg"           // <-- drop your image in /public as hero-cleaners.jpg
        alt="Professional cleaners from Impress Cleaning"
        className="absolute inset-0 h-full w-full object-cover"
      />
      {/* soft gradient + subtle frame */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-slate-900/10" />
      <div className="absolute inset-0 ring-1 ring-inset ring-black/5 rounded-3xl pointer-events-none" />
    </div>
  );
}

function Badge({ label }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 shadow-sm">
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2l7 4v6c0 5-7 10-7 10s-7-5-7-10V6l7-4z" stroke="currentColor" strokeWidth="1.5" fill="currentColor" opacity="0.06" />
        <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {label}
    </span>
  );
}

function Pillar({ title, desc }) {
  return (
    <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="font-semibold">{title}</div>
      <p className="mt-1 text-sm text-slate-600">{desc}</p>
    </div>
  );
}

function CtaBand() {
  return (
    <section className="relative">
      <div className="w-full px-4 md:px-8 lg:px-12">
        <div className="mt-2 rounded-3xl border border-slate-200 bg-slate-900 text-white p-6 md:p-8 shadow-sm grid md:grid-cols-2 gap-6 items-center">
          <div>
            <h3 className="text-xl md:text-2xl font-semibold">Ready for a spotless space?</h3>
            <p className="mt-1 text-white/80 text-sm">Get a fast quote below.</p>
          </div>
          <div className="flex md:justify-end gap-3">
            <a href="#quote" className="rounded-2xl px-5 py-3 font-semibold bg-white text-slate-900 shadow hover:shadow-md">Get My Quote</a>
            <a href="tel:+1-512-277-5364" className="rounded-2xl px-5 py-3 font-semibold border border-white/30">Call Now</a>
          </div>
        </div>
      </div>
    </section>
  );
}
function FAQItem({ q, a }) {
  return (
    <details className="rounded-2xl border border-slate-200 bg-white p-4 open:shadow-sm transition-all">
      <summary className="marker:content-[''] cursor-pointer font-medium">{q}</summary>
      <p className="mt-2 text-sm text-slate-600">{a}</p>
    </details>
  );
}

function MapPlaceholder() {
  return (
    <div className="mt-6 aspect-[16/9] rounded-2xl border border-slate-200 bg-slate-50 grid place-items-center text-slate-500 text-sm">
      Service area map or list of neighborhoods goes here
    </div>
  );
}

// Lightweight dropdown menu (desktop)
function DropdownMenu({ label, items = [] }) {
  return (
    <div className="relative group">
      <button className="inline-flex items-center gap-1 hover:text-slate-950" aria-haspopup="true" aria-expanded="false">
        <span>{label}</span>
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-opacity duration-150 absolute left-0 top-full mt-2 w-56 rounded-2xl border border-slate-200 bg-white shadow-lg p-2">
        <ul className="py-1">
          {items.map((item) => (
            <li key={item.label}>
              <a href={item.href} className="block px-3 py-2 rounded-lg hover:bg-slate-50 text-slate-700">
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}