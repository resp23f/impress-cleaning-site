"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useMemo } from "react";

const NAV = [
{ label: "Residential", href: "/#services" },
{ label: "Commercial",  href: "/#services" },
{ label: "Why Hire Us", href: "/#about" },
{ label: "About Us",    href: "/#about" },
{ label: "FAQ",         href: "/#faq"   },
];

export default function Header() {
const pathname = usePathname() || "/";
const isJobs = pathname === "/aplicar" || pathname.startsWith("/aplicar/");
return isJobs ? <JobsHeader /> : <SiteHeader />;
}

function SiteHeader() {
const [open, setOpen] = useState(false);
const pathname = usePathname() || "/";
const active = useMemo(
() => (href) => (pathname === href ? "text-emerald-700 font-semibold" : ""),
[pathname]
);


/* ------- MAIN SITE HEADER ------- */
return (
<header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur border-b border-slate-100">
<div className="mx-auto max-w-8xl px-4 md:px-5">
          {/* ── Row 1: Brand + utility links ───────────────────────────── */}
      <div className="flex items-center justify-between py-8">
        {/* Brand */}
        <Link href="/" aria-label="Impress Cleaning Services LLC" className="flex items-start gap-3 shrink-0">
          <img src="/sparkle.svg" alt="" className="w-6 h-6" />
          <div>
            <div className="font-brand uppercase tracking-[0.05em] text-[#0B2850] font-black text-[25px] md:text-[35px] leading-none">
              IMPRESS CLEANING SERVICES
              <span className="text-[10px] leading-none -translate-y-[1px] md:-translate-y-[2px]">LLC</span>
            </div>
            <p className="text-slate-500 text-sm md:text-md">A clean home is an impressive home.</p>
          </div>
        </Link>

        {/* Utility links (right, small text) */}
        <ul className="hidden md:flex items-center gap-8 text-slate-600 text-[16px]">
          <li><Link href="/careers" className="hover:text-slate-900">Apply</Link></li>
          <li><Link href="/aplicar" className="hover:text-slate-900">Aplicar</Link></li>
          <li><Link href="/gift-cards" className="hover:text-slate-900">Gift Certificates</Link></li>
        </ul>

        {/* Mobile hamburger (optional) */}
        <button
          onClick={() => setOpen(v => !v)}
          className="md:hidden inline-flex items-center justify-center p-2 rounded-lg ring-1 ring-slate-300"
          aria-label="Open menu"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M3 6h18M3 12h18M3 18h18" />
          </svg>
        </button>
      </div>

      {/* ── Row 2 (DESKTOP): Tabs + inline CTAs ────────────────────── */}
<div className="hidden md:flex items-center justify-between pb-3">
          {/* Tabs (left) */}
        <nav className="flex-1 min-w-0">
          <ul className="flex items-center gap-20">
            <li><a href="#residential" className="text-[20px] font-medium text-slate-900 hover:text-[#0B2850]">Residential</a></li>
            <li><a href="#commercial"  className="text-[20px] font-medium text-slate-900 hover:text-[#0B2850]">Commercial</a></li>
            <li><a href="#why"         className="text-[20px] font-medium text-slate-900 hover:text-[#0B2850]">Why Hire Us</a></li>
            <li><a href="#about"       className="text-[20px] font-medium text-slate-900 hover:text-[#0B2850]">About Us</a></li>
            <li><a href="#faq"         className="text-[20px] font-medium text-slate-900 hover:text-[#0B2850]">FAQ</a></li>
          </ul>
        </nav>

        {/* Inline CTAs (right, NOT buttons to match old look) */}
        <div className="flex items-center gap-10 shrink-0">
          <a href="#quote" className="text-[20px] font-semibold text-[#0B2850] hover:underline">Free Quote</a>
          <a href="tel:+15122775364" className="text-[20px] font-semibold text-[#0B2850] hover:underline">(512) 277-5364</a>
        </div>
      </div>

      
{/* MOBILE NAV (phones & small tablets) — desktop untouched */}
<nav className="md:hidden border-b border-slate-200/70 bg-white">
  <div
    className="px-4 py-2 flex flex-wrap items-stretch gap-2 text-[13px] font-medium text-slate-900"
  >
    {/* 3-column chips, wrap to new lines as needed */}
    <a href="#residential"
       className="basis-[32%] grow text-center py-1.5 rounded-lg ring-1 ring-slate-200">
      Residential
    </a>
    <a href="#commercial"
       className="basis-[32%] grow text-center py-1.5 rounded-lg ring-1 ring-slate-200">
      Commercial
    </a>
    <a href="#why"
       className="basis-[32%] grow text-center py-1.5 rounded-lg ring-1 ring-slate-200">
      Why Hire Us
    </a>

    <a href="#about"
       className="basis-[32%] grow text-center py-1.5 rounded-lg ring-1 ring-slate-200">
      About Us
    </a>
    <a href="#faq"
       className="basis-[32%] grow text-center py-1.5 rounded-lg ring-1 ring-slate-200">
      FAQ
    </a>
    <Link href="/aplicar"
       className="basis-[32%] grow text-center py-1.5 rounded-lg ring-1 ring-slate-200">
      Aplicar
    </Link>

    <Link href="/apply"
       className="basis-[32%] grow text-center py-1.5 rounded-lg ring-1 ring-slate-200">
      Apply
    </Link>
    <a href="/gift-cards"
       className="basis-[32%] grow text-center py-1.5 rounded-lg ring-1 ring-slate-200">
      Gift Certificates
    </a>

    {/* compact phone CTA stays last; shows inline with chips */}
    <a href="tel:+15122775364"
       className="basis-[32%] grow text-center py-1.5 rounded-lg bg-[#0B2850] text-white">
      (512) 277-5364
    </a>
  </div>
</nav>
</div>
</header>
);
}


/* -------------------- Jobs/aplicar header -------------------- */
function JobsHeader() {
return (
<header className="relative z-50 bg-[linear-gradient(to_bottom,#FFFFFF,#FFFDF8)] border-b border-slate-100">
<div className="w-full flex items-center gap-8 px-2 md:px-6 py-4 md:py-5">
{/* --- Left: Brand logo --- */}
<a href="/" className="flex items-center gap-3">
    <img
    src="/sparkle.svg" // your sparkle mark or replace with your logo image
    alt="Impress Cleaning logo"
    className="h-7 w-7"
    />
    <div className="flex flex-col leading-tight scale-[1.15] md:scale-[1.25] ml-2 md:ml-8">
    <span className="font-brand uppercase text-[#0B2850] text-2xl font-black tracking-wide">
        Impress Cleaning Services <span className="relative top-[1px] -ml-[6px] text-[11px] font bold md:text-[11px] font-medium tracking-tight">LLC</span>
    </span>
    <span className="text-[11px] text-[#0B2850]/80 uppercase tracking-[0.08em]">
        A clean home is an impressive home.
    </span>
    </div>
</a>

{/* --- Center/Right: Nav links --- */}
<nav className="hidden md:flex items-center gap-10 text-[16px] text-[#0B2850] font-medium ml-auto">
    <a href="/aplicar" className="hover:text-emerald-700">
    </a>
    <a href="/english" className="hover:text-emerald-700">
    English Site
    </a>

    {/* --- CTA Button --- */}
    <a
    href="#aplicar-form"
    className="rounded-lg bg-gradient-to-r from-green-300 via-emerald-300 to-green-400
            px-6 py-3 text-white font-semibold shadow-md hover:shadow-lg
            hover:from-green-400 hover:to-emerald-400 transition"
    >
    Explora todos los empleos
    </a>
</nav>

{/* --- Mobile menu placeholder (optional) --- */}
<button
    type="button"
    className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-[#0B2850] hover:bg-slate-100"
    aria-label="Open menu"
>
    <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth="2"
    stroke="currentColor"
    className="h-6 w-6"
    >
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
</button>
</div>
</header>
);
}
