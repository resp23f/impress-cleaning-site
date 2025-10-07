'use client';
import React, { useState } from "react";


// Impress Cleaning Services — Starter Site (React + Tailwind)
// Fixed: restored full file; added working DropdownMenu component; desktop dropdowns for Residential/Commercial
// Sections: Hero, Credibility, Services, Why, Industries, CTA, Process, Reviews, FAQ, Service Area, About, Quote, Footer

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
      <header className="sticky top-0 z-40 backdrop-blur bg-white/75 border-b border-slate-100">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
          <a href="#home" className="flex items-center gap-2">
            <img
  src="/ImpressLogo.png"
  alt="Impress Cleaning Services"
  className="h-8 w-auto md:h-10"
/>
            <div className="leading-tight">
              <span className="block font-semibold tracking-tight">Impress Cleaning Services LLC</span>
              <span className="block text-xs text-slate-500">Because a clean home impresses..</span>
            </div>
          </a>

          {/* Desktop nav with dropdowns */}
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <DropdownMenu
              label="Residential"
              items={[
                { label: "Recurring Cleaning", href: "#services" },
                { label: "One‑Time Cleaning", href: "#services" },
                { label: "Move‑In / Move‑Out", href: "#services" },
                { label: "Eco‑Friendly", href: "#services" },
              ]}
            />
            <DropdownMenu
              label="Commercial"
              items={[
                { label: "Law Firms", href: "#industries" },
                { label: "Medical / Dental", href: "#industries" },
                { label: "Title & Real Estate", href: "#industries" },
                { label: "Professional Offices", href: "#industries" },
              ]}
            />
            <a href="#why" className="hover:text-slate-950">Why Hire Us</a>
            <a href="/about" className="hover:text-slate-950">About Us</a>
            <a href="/faq" className="hover:text-slate-950">FAQ</a>
          </nav>

          <div className="flex items-center gap-3">
            <a
              href="#quote"
              className="rounded-2xl px-4 py-2 text-sm font-medium shadow-sm border border-slate-200 hover:border-slate-300 hover:shadow"
            >
              Get a Quote · <span className="text-slate-500"></span>
            </a>
            <a
              href="tel:+1-512-277-5364"
              className="hidden md:inline-flex rounded-2xl px-4 py-2 text-sm font-semibold bg-slate-900 text-white shadow hover:shadow-md"
            >
              Call (512) 277‑5364
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
<section
  className="relative bg-slate-900 text-white"
  id="home"
>
  {/* Background image */}
  <img
    src="/hero-cleaners.jpg"
    alt="Professional cleaners from Impress Cleaning"
    className="absolute inset-0 w-full h-full object-cover"
  />
  <div className="absolute inset-0 bg-black/40" /> {/* subtle dark overlay */}

  {/* Text content */}
  <div className="relative z-10 mx-auto max-w-6xl px-6 py-32 md:py-40">
    <div className="max-w-2xl">
      <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight">
        Sparkling offices, zero hassle.
      </h1>
      <p className="mt-4 text-lg text-white/90 max-w-prose">
        Reliable, insured, and detail-obsessed cleaning for law firms, clinics,
        startups, and professional spaces. Nightly, weekly, or on-demand.
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


      {/* Credibility strip */}
      <section className="border-y border-slate-100 bg-white/60">
        <div className="mx-auto max-w-7xl px-4 py-6 flex flex-wrap items-center justify-center gap-6">
          <Badge label="Bonded & Insured" />
          <Badge label="Background‑Checked" />
          <Badge label="Satisfaction Guarantee" />
          <Badge label="Locally Owned" />
        </div>
      </section>

      {/* Services (trimmed) */}
      <section id="services" className="mx-auto max-w-7xl px-4 py-16">
        <header className="max-w-2xl">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Services</h2>
          <p className="mt-2 text-slate-600">Built for modern offices—customized to your building and schedule.</p>
        </header>
        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { title: "Weekly / Bi‑Weekly", desc: "Flexible recurring service with checklists tuned to your space." },
            { title: "Deep Cleaning", desc: "Top‑to‑bottom resets: vents, baseboards, appliances, and more." },
            { title: "Move‑In / Move‑Out", desc: "Turnkey for suites and tenant flips (COI provided)." },
          ].map((s) => (
            <Card key={s.title} title={s.title} desc={s.desc} />
          ))}
        </div>
      </section>

      {/* Why Us */}
      <section id="why" className="mx-auto max-w-7xl px-4 py-16">
        <header className="max-w-2xl">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Why Choose Impress</h2>
          <p className="mt-2 text-slate-600">Franchise‑level reliability with a local, detail‑first approach.</p>
        </header>
        <div className="mt-8 grid md:grid-cols-3 gap-6">
          <Pillar title="Crystal‑Clear Scope" desc="Itemized quotes with taxes shown up‑front. No surprises, ever." />
          <Pillar title="Consistent Teams" desc="Trained pros assigned to your site so quality stays tight." />
          <Pillar title="Proactive QA" desc="Checklists posted onsite and periodic inspections built‑in." />
        </div>
      </section>

      {/* Industries */}
      <section id="industries" className="mx-auto max-w-7xl px-4 py-14">
        <h3 className="text-xl md:text-2xl font-semibold">Industries We Serve</h3>
        <ul className="mt-5 flex flex-wrap gap-2 text-sm">
          {[
            "Law Firms",
            "Medical / Dental",
            "Title & Real Estate",
            "Startups & Tech",
            "Professional Offices",
            "Retail Suites",
            "Common Areas",
            "Property Management",
          ].map((i) => (
            <li key={i} className="px-3 py-1.5 rounded-full border border-slate-200 text-slate-700 whitespace-nowrap">{i}</li>
          ))}
        </ul>
      </section>

      {/* CTA band */}
      <CtaBand />

      {/* Process */}
      <section id="process" className="mx-auto max-w-7xl px-4 py-16">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { step: 1, title: "Walkthrough", desc: "We tour your space (or video call) and align on scope, frequency, and access." },
            { step: 2, title: "Crystal‑Clear Quote", desc: "Written scope with taxes/fees shown up‑front—no surprises." },
            { step: 3, title: "Onboarding & Shine", desc: "Supplies stocked, checklist posted, and quality checks from day one." },
          ].map((p) => (
            <div key={p.step} className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="text-xs text-slate-500">Step {p.step}</div>
              <div className="mt-1 font-semibold">{p.title}</div>
              <p className="mt-2 text-slate-600 text-sm">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Reviews */}
      <section id="reviews" className="mx-auto max-w-7xl px-4 py-16 bg-slate-50 rounded-[2rem]">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { quote: "They keep our firm spotless and are proactive when anything needs attention.", name: "Operations Manager, Law Firm" },
            { quote: "On‑time, trustworthy, and flexible. The onboarding was painless.", name: "Practice Coordinator, Dental Clinic" },
            { quote: "Clear pricing and excellent communication—our team loves the results.", name: "Office Lead, Startup" },
          ].map((r, idx) => (
            <blockquote key={idx} className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
              <p>“{r.quote}”</p>
              <footer className="mt-3 text-sm text-slate-600">— {r.name}</footer>
            </blockquote>
          ))}
        </div>
      </section>

      {/* Service Area */}
      <section className="mx-auto max-w-7xl px-4 pb-16">
        <h3 className="text-xl md:text-2xl font-semibold">Service Area</h3>
        <p className="text-slate-600 mt-2 max-w-prose">Greater metro area and nearby suburbs. If you’re just outside, ask—we’re flexible for the right fit.</p>
        <div className="mt-6 rounded-2xl border border-slate-200 overflow-hidden">
  <div className="aspect-[16/9]">
    <iframe
      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d35685.410477753896!2d-97.75336058902573!3d30.725935029808827!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8644d5693958ab55%3A0xa2ee570eaadd9735!2sSun%20City%2C%20Georgetown%2C%20TX%2078633!5e0!3m2!1sen!2sus!4v1759798997027!5m2!1sen!2sus"
      className="w-full h-full"
      style={{ border: 0 }}
      allowFullScreen
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
    />
  </div>
</div>


      </section>


      {/* Quote Form */}
      <section id="quote" className="mx-auto max-w-7xl px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-10 items-start">
          <div>
            <h3 className="text-2xl md:text-3xl font-bold tracking-tight">Request a Quote</h3>
            <p className="mt-2 text-slate-600 max-w-prose">Tell us about your space and schedule. We’ll respond quickly with a clear, itemized estimate.</p>
            <ul className="mt-6 space-y-2 text-sm text-slate-600">
              <li>• COI available on request</li>
              <li>• Flexible start times (evenings / overnight)</li>
              <li>• Supplies & equipment included</li>
            </ul>
          </div>
          <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
            {sent ? (
              <div className="p-6 rounded-xl bg-green-50 border border-green-200 text-green-800">
                <div className="font-semibold">Thank you! / ¡Gracias!</div>
                <p className="text-sm mt-1">We’ll be in touch shortly with next steps.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Name" id="name" required />
                  <Field label="Company" id="company" />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Email" id="email" type="email" required />
                  <Field label="Phone" id="phone" type="tel" required />
                </div>
                <Field label="Address (City, Suite)" id="address" />
                <div className="grid sm:grid-cols-3 gap-4">
                  <Field label="Sq Ft" id="sqft" inputMode="numeric" />
                  <Select label="Frequency" id="frequency" options={["One‑Time", "Weekly", "Bi‑Weekly", "Monthly"]} />
                  <Select label="Start" id="start" options={["ASAP", "1‑2 Weeks", "Next Month"]} />
                </div>
                <Field label="Notes / Access Details" id="notes" as="textarea" rows={4} placeholder="Alarms, after‑hours, special areas…" />
                <div className="flex items-center gap-3">
                  <button type="submit" disabled={sending} className="rounded-2xl px-5 py-3 font-semibold bg-slate-900 text-white shadow hover:shadow-md disabled:opacity-60">{sending ? "Sending…" : "Send Request"}</button>
                  <span className="text-xs text-slate-500">o <a href="mailto:admin@impressyoucleaning.com" className="underline">enviar por correo</a></span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">By submitting, you agree to be contacted about your request. No spam.</p>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200">
        <div className="mx-auto max-w-7xl px-4 py-10 grid md:grid-cols-3 gap-6 text-sm">
          <div>
            <div className="flex items-center gap-2">
              <Logo size={18} />
              <span className="font-semibold">Impress Cleaning Services</span>
            </div>
            <p className="mt-2 text-slate-600 max-w-xs">Professional office cleaning. Locally owned. Detail‑driven.</p>
          </div>
          <div>
            <div className="font-semibold">Contact</div>
            <ul className="mt-2 text-slate-600 space-y-1">
              <li>Email: <a className="underline" href="mailto:admin@impressyoucleaning.com">admin@impressyoucleaning.com</a></li>
              <li>Phone: <a className="underline" href="tel:+1-512-277-5364">(512) 277‑5364</a></li>
              <li>PO Box 123, Your City, ST</li>
            </ul>
          </div>
          <div>
            <div className="font-semibold">Links</div>
            <ul className="mt-2 text-slate-600 space-y-1">
              <li><a className="hover:underline" href="#services">Services</a></li>
              <li><a className="hover:underline" href="#process">Process</a></li>
              <li><a className="hover:underline" href="#quote">Quote</a></li>
            </ul>
          </div>
        </div>
        <div className="text-xs text-slate-500 text-center pb-8">© {new Date().getFullYear()} Impress Cleaning Services LLC. All rights reserved.</div>
      </footer>
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
      <div className="mx-auto max-w-7xl px-4">
        <div className="mt-2 rounded-3xl border border-slate-200 bg-slate-900 text-white p-6 md:p-8 shadow-sm grid md:grid-cols-2 gap-6 items-center">
          <div>
            <h3 className="text-xl md:text-2xl font-semibold">Ready for a spotless office?</h3>
            <p className="mt-1 text-white/80 text-sm">Get a fast, itemized quote with taxes shown up‑front.</p>
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