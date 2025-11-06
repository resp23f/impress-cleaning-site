'use client';
import React, { useState } from "react";
import Link from "next/link";
import { track } from '@vercel/analytics';




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
const FORM_ENDPOINT = "https://formspree.io/f/xblzwdek"

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
      track('quote_submitted', { method: 'mailto' });
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
      track('quote_submitted', { method: 'formspree' });
    setSent(true);
    form.reset();
} else {
      track('quote_submit_failed', { status: res.status });
    console.error("Formspree JSON error", res.status, payload);
    alert(payload.errors?.[0]?.message ?? "Submit failed. Check Allowed Domains.");
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
    

{/* Hero */}
<section   id="home"
  className="relative w-screen left-1/2 right-1/2 -mx-[50vw] overflow-hidden"
>
  {/* Background image */}
  <img
    src="/hero-cleaners1.jpg"
    alt="Professional cleaners from Impress Cleaning"
    className="absolute inset-0 w-full h-full object-cover object-[60%_center]"
  />

  {/* Semi-transparent dark overlay */}
  <div className="absolute inset-0 bg-black/40"></div>

  {/* Text overlay container */}
  <div className="relative z-10 flex items-center h-[520px] sm:h-[600px] md:h-[680px]">
    <div className="container text-left px-6 md:px-8">
      <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight leading-tight max-w-2xl">
        Sparkling homes, zero hassle.
      </h1>
      <p className="mt-4 text-lg text-slate-100 max-w-prose">
        Reliable, insured, and detail-obsessed cleaning for residential homes,
        offices, and commercial spaces.
      </p>
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
    <h3 className="text-lg font-semibold text-black mb-2">Weekly / Bi-Weekly</h3>
    <p className="text-black text-sm leading-relaxed">
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
    <p className="text-black text-sm leading-relaxed">
        Whether you’re settling in or saying goodbye, we’ll leave the space sparkling clean and move-in ready.
    </p>
    </div>

    {/* Service 3 – Commercial */}
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-md border-t-4 border-green-500 transition-all duration-300 hover:-translate-y-1 p-8">
    <svg aria-hidden="true" viewBox="0 0 24 24" className="w-8 h-8 mb-4 text-green-600">
        <path fill="currentColor" d="M3 21V7l9-4 9 4v14h-7v-5H10v5H3zM5 19h3v-3H5v3zm11 0h3v-9h-3v9zM8 9h3V7H8v2z"/>
    </svg>
    <h3 className="text-lg font-semibold text-slate-900 mb-2">Commercial Cleaning</h3>
    <p className="text-black text-sm leading-relaxed">
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
<h2 className="text-2xl md:text-3xl font-bold text-black">Why Choose Impress Cleaning Services</h2>
<p className="text-slate-600 mt-1">
</p>

{/* Why Choose Impress Grid */}
<div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
{[
{
    title: "Satisfaction Guarantee",
    desc:  "If anything misses the mark, we’ll get it taken care of.",
icon: (
<svg viewBox="0 0 24 24" className="w-7 h-7 md:w-8 md:h-8 text-emerald-600" xmlns="http://www.w3.org/2000/svg">
  <path fill="currentColor" d="M12 2 2 7v6c0 5 4 9 10 9s10-4 10-9V7L12 2zm-1 13-3-3 1.4-1.4L11 12.2l3.6-3.6L16 10l-5 5z"/>
</svg>
),
},
{
    title: "Locally Owned",
    desc:  "Georgetown-based team—your dollars stay in the community.",
icon: (
<svg viewBox="0 0 24 24" className="w-7 h-7 md:w-8 md:h-8 text-emerald-600" xmlns="http://www.w3.org/2000/svg">
  <path fill="currentColor" d="M12 3 3 10v11h7v-6h4v6h7V10l-9-7zm0 13.3-2.1-2.1a2.5 2.5 0 1 1 3.6-3.6 2.5 2.5 0 1 1 3.6 3.6L12 16.3z"/>
</svg>
),
},
{
    title: "Reliable Results",
    desc:  "Every clean follows our proven checklist system—so your space looks great no matter who’s on the schedule.",
icon: (
<svg viewBox="0 0 24 24" className="w-7 h-7 md:w-8 md:h-8 text-emerald-600" xmlns="http://www.w3.org/2000/svg">
  <path fill="currentColor" d="M9 3h6l1 2h3v16H5V5h3l1-2zm2 4h2V6h-2v1zm-2 8-2-2 1.4-1.4L9 12.2l4.6-4.6L15 9l-6 6z"/>
</svg>
),
},
{
    title: "Clear Communication",
    desc:  "We keep you in the loop from booking to follow-up, so you always know what’s happening and when.",
    icon: (
<svg viewBox="0 0 24 24" className="w-7 h-7 md:w-8 md:h-8 text-emerald-600" xmlns="http://www.w3.org/2000/svg">
  <path fill="currentColor" d="M4 4h14v8H6l-2 2V4zm4 10h12v6l-2-2H8v-4z"/>
</svg>
    ),
},
{
    title: "Quality-Driven Service",
    desc:  "Supervisors review each job and feedback is built into our process, keeping standards high and details consistent.",
    icon: (
<svg viewBox="0 0 24 24" className="w-7 h-7 md:w-8 md:h-8 text-emerald-600" xmlns="http://www.w3.org/2000/svg">
  <path fill="currentColor" d="M12 3 13.5 8H19l-4 3 1.5 5L12 13 8.5 16 10 11 6 8h5.5L12 3zm7 2 1 3h3l-2.5 2 1 3L19 11l-2.5 2 1-3L15 8h3l1-3zM2 10l.8 2.4H5l-1.9 1.4.7 2.3L2 14.7.2 16l.7-2.3L0 12.4h2.2L2 10z"/>
</svg>
    ),
    
},  
{

  title: "Easy Booking & Reminders",
  desc: "Schedule cleanings online in seconds—plus text confirmations and reminders before every visit.",
  icon: (
<svg viewBox="0 0 24 24" className="w-7 h-7 md:w-8 md:h-8 text-emerald-600" xmlns="http://www.w3.org/2000/svg">
  <path fill="currentColor" d="M7 2h2v2h6V2h2v2h2a2 2 0 0 1 2 2v6h-2V8H5v12h6v2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2V2zM15.5 13A5.5 5.5 0 1 1 10 18.5 5.5 5.5 0 0 1 15.5 13zm-.5 1v3.3l2.2 1.3.8-1.3-1.5-.9V14h-1.5z"/>
</svg>
  ),
},

].map(({ title, desc, icon }) => (
<div
  key={title}
className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 border-t-[3px] border-emerald-500 p-5 md:p-6 flex items-center gap-4 h-full transform transition-all duration-200 hover:shadow-md hover:-translate-y-[2px] hover:scale-[1.02]"
>
<div className="shrink-0 w-10 h-10 md:w-11 md:h-11 rounded-xl bg-emerald-50 flex items-center justify-center shadow-inner ring-1 ring-emerald-100">
  {icon}
</div>
    <div className="space-y-1.5">
    <h4 className="font-semibold text-black">{title}</h4>
    <p className="text-black text-sm leading-relaxed">{desc}</p>
    </div>
</div>
))}
</div>
</div>
</section>

{/* Who we clean for */}
<section id="who-we-clean" className="py-16 bg-[#FFFDF8]">
  <div className="w-full px-4 md:px-8 lg:px-12 mx-auto">
    <header className="mb-6">
      <h3 className="text-2xl md:text-3xl font-bold text-slate-900">Who We Clean For</h3>
      <p className="text-slate-600 mt-1">
      </p>
    </header>

    {/* Cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
      {/* Residential */}
      <div className="bg-white rounded-2xl ring-1 ring-slate-200 shadow-sm hover:shadow-md transition">
        <div className="p-5 md:p-6">
          <div className="flex items-center gap-2 mb-3">
            <svg aria-hidden="true" viewBox="0 0 24 24" className="w-5 h-5 text-emerald-600">
              <path fill="currentColor" d="M12 3 3 10v11h6v-6h6v6h6V10l-9-7z"/>
            </svg>
            <h4 className="font-semibold text-slate-900">Residential</h4>
          </div>
          <ul className="flex flex-wrap gap-2">
            {[
              "Homes",
              "Apartments & Condos",
              "Move-In / Move-Out",
              "Deep Cleaning",
              "Recurring (Weekly/Bi-Weekly)"
            ].map((label) => (
              <li key={label} className="rounded-full bg-white ring-1 ring-slate-200 px-3 py-1 text-sm text-slate-700">
                {label}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Commercial */}
      <div className="bg-white rounded-2xl ring-1 ring-slate-200 shadow-sm hover:shadow-md transition">
        <div className="p-5 md:p-6">
          <div className="flex items-center gap-2 mb-3">
            <svg aria-hidden="true" viewBox="0 0 24 24" className="w-5 h-5 text-emerald-600">
              <path fill="currentColor" d="M3 21V7l9-4 9 4v14h-7v-5H10v5H3z"/>
            </svg>
            <h4 className="font-semibold text-black">Commercial</h4>
          </div>
          <ul className="flex flex-wrap gap-2">
            {[
              "Professional Offices",
              "Medical / Dental",
              "Law Firms",
              "Retail Suites",
              "Property Management"
            ].map((label) => (
              <li key={label} className="rounded-full bg-white ring-1 ring-slate-200 px-3 py-1 text-sm text-slate-700">
                {label}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  </div>
</section>

    {/* CTA band */}
    <CtaBand />

{/* Reviews */}
<section id="reviews" className="w-full px-4 md:px-8 lg:px-12 py-16 rounded-[2rem]">
<div className="mb-6">
<h2 className="text-2xl font-bold text-black">Customer Reviews</h2>
<p className="text-black mt-1">Real feedback from happy clients.</p>
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
<p className="text-black leading-relaxed">“{cleaned}”</p>
    <footer className="mt-3 text-sm text-black">— {r.name}</footer>
</li>     
    );
})}
</ul>
</section>

{/* Service Area */}
<section className="w-full px-4 md:px-8 lg:px-12 py-16">
<h3 className="text-xl md:text-2xl font-semibold">Service Area</h3>
<p className="text-black mt-2">
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
<section id="quote" className="w-full px-4 md:px-8 lg:px-12 py-10 md:py-12">
{/* Header wrapper (same width as form) */}
<div className="mx-auto max-w-5xl">
<h2 className="text-2xl md:text-4xl font-extrabold tracking-tight text-[#0B2850]">
    Request a Quote
</h2>
<p className="mt-2 md:mt-4 text-lg md:text-xl text-black max-w-5xl">
    Tell us about your space and schedule. We’ll respond quickly after submitting your request.
</p>
</div>  

{sent ? (
<div className="mt-6 rounded-2xl bg-white ring-1 ring-emerald-100 shadow-sm p-10 text-center text-emerald-700 animate-fade-in">
    <p className="text-2xl font-semibold mb-2">Thank you!</p>
    <p className="text-lg">We&apos;ll be in touch with you soon.</p>
</div>
) : (
    /* --- FORM CARD --- */  
<form onSubmit={handleSubmit} className="mt-5 mx-auto max-w-5xl rounded-2xl bg-white ring-1 ring-slate-200 shadow-sm p-5 md:p-6">
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {/* Name */}
    <div className="col-span-2">
    <label htmlFor="name" className="block text-sm font-bold text-black">
        Name <span className="text-rose-500">*</span>
    </label>
    <input
        id="name"
        name="name"
        type="text"
        required
        placeholder="Full name"
        className="mt-2 w-full rounded-xl bg-white ring-1 ring-slate-200 px-3.5 py-2.5 text-slate-900 placeholder-slate-400 shadow-sm outline-none focus:ring-2 focus:ring-emerald-500"
    />
    </div>

    {/* Phone */}
    <div className="col-span-2">
    <label htmlFor="phone" className="block text-sm font-bold text-black">
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
    <div className="col-span-2">
    <label htmlFor="email" className="block text-sm font-bold text-black">
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
    <div className="col-span-2">
    <label htmlFor="address" className="block text-sm font-bold text-black">
        Service Address <span className="text-rose-500">*</span>
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

    {/* Frequency (custom select) */}
    <div className="col-span-2">
    <label htmlFor="frequency" className="block text-sm font-bold text-black">
        Frequency <span className="text-rose-500">*</span>
    </label>
    <div className="relative">
 <select
  id="Frequency"
  name="Frequency"
  defaultValue="Frequency"
  className="mt-1 w-full rounded-xl ring-1 ring-slate-200
  px-4 pr-10 h-12 text-[16px]
  md:px-3.5 md:py-2.5 md:h-[46px] md:text-base
  text-slate-900 placeholder-slate-400 shadow-sm outline-none
  focus:ring-2 focus:ring-emerald-500 appearance-none"
>
        <option>Select Option</option>
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

    {/* Start date (custom select) */}
    <div className="col-span-2">
    <label htmlFor="start" className="block text-sm font-bold text-black">
        Start Date<span className="text-rose-500">*</span>
    </label>
    <div className="relative">
<select
  id="start"
  name="start"
  defaultValue="Start Date"
  className="mt-1 w-full rounded-xl ring-1 ring-slate-200
  px-4 pr-10 h-12 text-[16px]
  md:px-3.5 md:py-2.5 md:h-[46px] md:text-base
  text-slate-900 placeholder-slate-400 shadow-sm outline-none
  focus:ring-2 focus:ring-emerald-500 appearance-none"
> 
       <option>Select Option</option>
        <option>ASAP</option>
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
    <div className="col-span-2">
    <label htmlFor="notes" className="block text-sm font-bold text-black">Notes / Access Details</label>
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
    {sending ? "Sending..." : "Submit Request"}
    </button>
    <a href="mailto:admin@impressyoucleaning.com" className="text-slate-600 hover:text-slate-900 text-sm underline-offset-2 hover:underline">
    </a>
</div>
<p className="mt-4 text-xs text-slate-500">
    By submitting, you agree to be contacted about your request. No spam.
</p>
</form>
)}
</section>
</main>
)

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
        <h3 className="text-xl md:text-2xl font-semibold text-white">Ready for a spotless space?</h3>
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
}}