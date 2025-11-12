"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useMemo } from "react";
import { Playfair_Display, Inter } from "next/font/google";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["700"] });
const inter  = Inter({ subsets: ["latin"],  weight: ["500"] });

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
        <div className="fixed top-0 left-0 right-0 h-2 bg-white z-[9999]" />

<div className="relative overflow-hidden bg-white">
<div className="bg-white py-2 px-6">
<div className="flex items-center justify-end gap-6 text-gray-600 text-sm font-medium pr-8">
<a href="#gift" className="hover:text-[#00A884] transition">
      Gift Certificates
    </a>
    <span className="text-gray-300">|</span>
    <a href="#apply" className="hover:text-[#00A884] transition">
      Careers
    </a>
    <span className="text-gray-300">|</span>
    <a href="#aplicar" className="hover:text-[#00A884] transition">
      Aplicar
    </a>
  </div>
</div>
</div>

{/* Main Header */}
<header className="sticky top-0 z-50 bg-white relative border-0">
<div className="relative w-full border-0">
  <div className="absolute inset-0 bg-white border-0" aria-hidden="true" />
  <div
    className="absolute inset-x-0 bottom-[-1px] translate-y-full h-[50px] bg-white border-0"
    aria-hidden="true"
  />
<div className="relative flex items-center justify-center md:justify-between px-8 py-3 md:py-[0.5px] translate-y-[30px] md:translate-y-[40px]">
            
              <a href="#top"
              className="flex flex-col select-none absolute left-4 md:static scale-90 md:scale-100"
              aria-label="Impress Cleaning Home"
            >
              <div className="flex items-end text-[#1C294E] leading-none">
                <span
                  className="text-[98px] relative top-[10px] font-serif font-bold"
                  style={{
                    lineHeight: "0.9",
                    display: "inline-block",
                    transform: "scaleY(1.25)",
                    transformOrigin: "top",
                    textShadow: '0 2px 3px rgba(0, 0, 0, 0.45)',
                  }}>
                  I
                </span>
                <span className="text-[78px] font-serif font-bold tracking-[0.07em] text-[#1C294E]" style={{ textShadow: '0 2px 3px rgba(0, 0, 0, 0.45)' }}>
                  MPRESS
                </span>
              </div>
              <div className="text-[20px] font-serif font-extrabold uppercase tracking-[0.20em] text-[#079447] mt-[-3px] ml-[39px]" style={{ textShadow: '0 2px 3px rgba(0, 0, 0, 0.25)' }}>
                Cleaning Services LLC
              </div>
            </a>

            {/* Hamburger toggle (mobile only) */}
            <button
              type="button"
              aria-label="Toggle navigation"
              onClick={() => setOpen((prev) => !prev)}
              className="md:hidden absolute right-4 top-1/2 -translate-y-1/2 inline-flex items-center justify-center w-12 h-12 text-[#202E56] hover:text-[#42924F] transition-colors"
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
<nav className="hidden md:flex items-center gap-8 text-[16px] md:text-[20px] lg:text-[36px] font-medium text-[#202E56] font-manrope" aria-label="Primary">
<a href="#residential" className="hover:text-[#00A884] transition-colors duration-200">
Residential
              </a>
              <a href="#commercial" className="hover:text-[#00A884] transition-colors duration-200">
                Commercial
              </a>
              <a href="#why" className="hover:text-[#00A884] transition-colors duration-200">
                Why Hire Us
              </a>
              <a href="#faq" className="hover:text-[#00A884] transition-colors duration-200">
                FAQ
              </a>
              <a href="#about" className="hover:text-[#00A884] transition-colors duration-200">
                About Us
              </a>
              
                <a href="#quote"
  className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-bold text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 bg-[#00A884] hover:bg-[#009879] font-manrope"
  >
                Request a Quote
              </a>
            </nav>
          </div>

          {/* Overlay */}
          {open && (
            <div 
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setOpen(false)}
            />
          )}

          {/* Slide-in drawer menu */}
          <div className={`fixed top-0 left-0 h-full w-[280px] bg-[#1C294E] text-white z-50 transform transition-transform duration-300 ease-in-out md:hidden ${open ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="p-6">
              <button 
                onClick={() => setOpen(false)}
                className="absolute top-4 right-4 text-white/70 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              <nav className="mt-12 space-y-6 font-inter text-lg">
                <a href="#residential" className="block hover:text-[#42924F] transition" onClick={() => setOpen(false)}>
                  Residential
                </a>
                <a href="#commercial" className="block hover:text-[#42924F] transition" onClick={() => setOpen(false)}>
                  Commercial
                </a>
                <a href="#why" className="block hover:text-[#42924F] transition" onClick={() => setOpen(false)}>
                  Why Hire Us
                </a>
                <a href="#about" className="block hover:text-[#42924F] transition" onClick={() => setOpen(false)}>
                  About Us
                </a>
<a href="#gift" className="block hover:text-[#42924F] transition" onClick={() => setOpen(false)}>
  Gift Certificates
</a>
<a href="#apply" className="block hover:text-[#42924F] transition" onClick={() => setOpen(false)}>
  Apply
</a>
<a href="#aplicar" className="block hover:text-[#42924F] transition" onClick={() => setOpen(false)}>
  Aplicar
</a>
<a href="#faq" className="block hover:text-[#42924F] transition" onClick={() => setOpen(false)}>
                  FAQ
                </a>

              </nav>
            </div>
          </div>
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
            src="/sparkle.svg"
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