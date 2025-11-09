"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useMemo } from "react";
import { Playfair_Display, Inter } from "next/font/google";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["700"] });   // for IMPRESS
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


  return (
    <>
      {/* Top Utility Bar */}
      <div className="font-headline h-9 flex items-center justify-end gap-5 px-6 bg-[#202E56] text-white text-[13px] font-semibold tracking-wide">
        <Link href="#gift" className="hover:text-[#42924F] transition">Gift Certificates</Link>
        <Link href="#apply" className="hover:text-[#42924F] transition">Apply</Link>
        <Link href="#aplicar" className="hover:text-[#42924F] transition">Aplicar</Link>
      </div>

      {/* Main Header */}
<header className="sticky top-0 z-50 bg-[#FAFAF8]">
<div className="relative w-full">
  <div className="absolute inset-0 bg-[#FAFAF8]" aria-hidden />
  <div className="absolute inset-x-0 bottom-0 translate-y-full h-[50px] bg-[#FAFAF8]" aria-hidden />

  <div className="relative flex items-center justify-between px-8 py-[0.5px] translate-y-[4px] md:translate-y-[40px]">
    {/* Logo pinned left */}
    <a
      href="#top"
      className="flex flex-col select-none"
      aria-label="Impress Cleaning Home"
    >
      <div className="flex items-end text-[#202E56] leading-none">
        <span
          className="text-[98px] relative top-[10px] font-serif font-bold"
          style={{
            lineHeight: "0.9",
            display: "inline-block",
            transform: "scaleY(1.25)",
            transformOrigin: "top",
            textShadow: '0 2px 3px rgba(0, 0, 0, 0.45)', // <— subtle drop shadow
          }}>
          I
        </span>
        <span className="text-[78px] font-serif font-bold tracking-[0.07em]" style={{ textShadow: '0 2px 3px rgba(0, 0, 0, 0.45)' }}>
          MPRESS
        </span>
      </div>
      <div className="text-[20px] font-serif font-extrabold uppercase tracking-[0.20em] text-[#42924F] mt-[-3px] ml-[39px]" style={{ textShadow: '0 2px 3px rgba(0, 0, 0, 0.25)' }}>
        Cleaning Services LLC
      </div>
    </a>

    {/* Hamburger toggle (mobile only) */}
    <button
      type="button"
      aria-label="Toggle navigation"
      onClick={() => setOpen((prev) => !prev)}
      className="md:hidden ml-auto inline-flex items-center justify-center w-10 h-10 rounded-md ring-1 ring-slate-300 text-[#202E56] hover:bg-slate-100"
    >
      {open ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      )}
    </button>

    {/* Centered nav (desktop only) */}
    <nav className="hidden md:flex items-center gap-8 text-[22.5px] font-normal text-[#202E56] font-headline" aria-label="Primary">
      <a href="#residential" className="hover:text-[#42924F] transition">
        Residential
      </a>
      <a href="#commercial" className="hover:text-[#42924F] transition">
        Commercial
      </a>
      <a href="#why" className="hover:text-[#42924F] transition">
        Why Hire Us
      </a>
      <a href="#faq" className="hover:text-[#42924F] transition">
        FAQ
      </a>
      <a href="#about" className="hover:text-[#42924F] transition">
        About Us
      </a>
      <a
        href="#quote"
        className="inline-flex items-center justify-center px-4 py-2 border-2 border-[#42924F] text-[#42924F] rounded-[18px] font-extrabold hover:bg-[#E7F5EA] transition font-headline"
      >
        Request a Quote
      </a>
    </nav>
  </div>

  {/* Mobile dropdown menu */}
  {open && (
    <div className="md:hidden bg-[#FAFAF8] border-t border-slate-200 px-6 py-4 space-y-3 text-[#202E56]">
      <a href="#residential" className="block hover:text-[#42924F] transition">
        Residential
      </a>
      <a href="#commercial" className="block hover:text-[#42924F] transition">
        Commercial
      </a>
      <a href="#why" className="block hover:text-[#42924F] transition">
        Why Hire Us
      </a>
      <a href="#faq" className="block hover:text-[#42924F] transition">
        FAQ
      </a>
      <a href="#about" className="block hover:text-[#42924F] transition">
        About Us
      </a>
      <a
        href="#quote"
        className="block w-full text-center px-4 py-2 border-2 border-[#42924F] text-[#42924F] rounded-[18px] font-semibold hover:bg-[#E7F5EA] transition"
      >
        Request a Quote
      </a>
    </div>
  )}
</div>
</header>
</>
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
