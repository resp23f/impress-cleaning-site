"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useMemo } from "react";
import { Oswald, Inter } from "next/font/google";

const oswald = Oswald({ subsets: ["latin"], weight: ["700"] });   // for IMPRESS
const inter  = Inter({ subsets: ["latin"],  weight: ["500"] });   // for "cleaning services LLC"

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


/* MAIN SITE HEADER */ 

  return (
    <>
      {/* Top Utility Bar */}
      <div className="h-9 flex items-center justify-end gap-5 px-6 bg-[#202E56] text-white text-[13px] font-semibold tracking-wide">
        <Link href="#gift" className="hover:text-[#42924F] transition">Gift Certificates</Link>
        <Link href="#apply" className="hover:text-[#42924F] transition">Apply</Link>
        <Link href="#aplicar" className="hover:text-[#42924F] transition">Aplicar</Link>
      </div>

      {/* Main Header */}
<header className="sticky top-0 z-50 shadow-md">
  {/* White underlay that covers the header AND extends below it */}
  <div className="relative w-full">
    {/* full header background */}
    <div className="absolute inset-0 bg-white" aria-hidden />
    {/* extension: pushes white below header so the brand overhang is covered */}
    <div className="absolute inset-x-0 bottom-0 translate-y-full h-[50px] bg-white" aria-hidden />

    {/* content layer */}
    <div className="relative flex items-center justify-center px-8 py-4 translate-y-[6px] md:translate-y-[20px]">
      {/* Logo pinned left */}
      <a
        href="#top"
        className="flex flex-col select-none absolute left-4 md:left-8"
        aria-label="Impress Cleaning Home"
      >
        <div className="flex items-end text-[#202E56] leading-none">
          <span className="text-[86px] relative top-[10px] font-serif font-bold"
          style={{
    lineHeight: '0.8',
    display: 'inline-block',
    transform: 'scaleY(1.3)',  // elongates vertically
    transformOrigin: 'top',     // stretch downward
  }}>I</span>
          <span className="text-[58px] font-serif font-bold tracking-[0.02em]">MPRESS</span>
        </div>
        <div className="text-[14px] uppercase tracking-[0.16em] text-[#475569] mt-[2px] ml-[50px]">
          Cleaning Services LLC
        </div>
      </a>

      {/* centered nav */}
      <nav className="flex items-center gap-8 text-[15.5px] font-medium text-[#202E56]" aria-label="Primary">
        <a href="#residential" className="hover:text-[#42924F] transition">Residential</a>
        <a href="#commercial" className="hover:text-[#42924F] transition">Commercial</a>
        <a href="#why" className="hover:text-[#42924F] transition">Why Hire Us</a>
        <a href="#faq" className="hover:text-[#42924F] transition">FAQ</a>
        <a href="#about" className="hover:text-[#42924F] transition">About Us</a>
        <a
          href="#quote"
          className="inline-flex items-center justify-center px-4 py-2 border-2 border-[#42924F] text-[#42924F] rounded-[18px] font-semibold hover:bg-[#E7F5EA] transition"
        >
          Request a Quote
        </a>
      </nav>
    </div>
  </div>
</header>    </>
  );
}

      
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
