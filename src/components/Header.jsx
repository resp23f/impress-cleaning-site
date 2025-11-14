"use client";
import Link from "next/link";
import Image from "next/image";
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
    () => (href) => (pathname === href ? "text-green font-semibold" : ""),
    [pathname]
  );

  return (
    <>
      {/* ========== TOP BAR (Gift Certificates | Careers | Aplicar) - DESKTOP ONLY ========== */}
      <div className="hidden md:block bg-background">
        <div className="max-w-[1400px] mx-auto flex items-center justify-end gap-6 py-1.5 px-6 lg:px-8 relative left-[10px] font-manrope font-semibold text-textLight text-[13px] lg:text-[15px]">
          <a href="#gift" className="hover:text-green transition font-manrope">
            Gift Certificates
          </a>
          <span className="text-borderGray font-manrope">|</span>
          <a href="#apply" className="hover:text-green transition font-manrope">
            Careers
          </a>
          <span className="text-borderGray font-manrope">|</span>
          <a href="#aplicar" className="hover:text-green transition font-manrope">
            Aplicar
          </a>
        </div>
      </div>

      {/* ========== MAIN HEADER (Logo + Navigation) ========== */}
      <header className="sticky top-0 z-50 bg-background [transform:translateZ(0)] [backface-visibility:hidden]">
        
        {/* ========== CONTAINER WITH FLUID MAX-WIDTH ========== */}
        <div className="w-full mx-auto relative px-4 lg:px-8" style={{ maxWidth: 'clamp(900px, 95vw, 1600px)' }}>          
          <div className="flex items-center justify-between gap-2 flex-nowrap py-3 md:py-4 2xl:py-5">
            
            {/* ========== LOGO - FIXED POSITIONING ========== */}
            <Link 
              href="/" 
              className="flex items-center select-none shrink-0 relative z-10" 
              aria-label="Impress Cleaning Home"
            >
              <Image
                src="/impress-cleaning-background.png"
                alt="Impress Cleaning Services"
                width={170}
                height={100}
                className="h-[60px] w-auto md:h-[70px] lg:h-[85px] xl:h-[95px] 2xl:h-[110px] object-contain"
                priority
              />
            </Link>

            {/* ========== HAMBURGER MENU (Mobile Only) ========== */}
            <button
              type="button"
              aria-label="Toggle navigation"
              onClick={() => setOpen((prev) => !prev)}
              className="md:hidden inline-flex items-center justify-center w-10 h-10 text-navy hover:text-green transition-colors relative z-10"
            >
              {open ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>

            {/* ========== NAVIGATION MENU WITH FLUID SIZING (Desktop Only) ========== */}
            <nav 
              className="hidden md:flex md:flex-1 md:items-center md:justify-center font-display font-medium text-navy whitespace-nowrap" 
              style={{ gap: 'clamp(8px, 1.5vw, 48px)', fontSize: 'clamp(12px, 1.8vw, 28px)' }} 
              aria-label="Primary"
            >
              <Link href="/" className="hover:text-green transition-colors duration-200 font-display">
                Home
              </Link>
              
              <Link href="/residential-section" className="hover:text-green transition-colors duration-200 font-display">
                Residential
              </Link>

              <Link href="/commercial" className="hover:text-green transition-colors duration-200 font-display">
                Commercial
              </Link>

              <Link href="/faq" className="hover:text-green transition-colors duration-200 font-display">
                FAQ
              </Link>
              
              <Link href="/about-us" className="hover:text-green transition-colors duration-200 font-display">
                About Us
              </Link>

              {/* ========== REQUEST A QUOTE BUTTON WITH FLUID SIZING ========== */}
              <Link
                href="/service-quote" 
                className="inline-flex items-center justify-center rounded-lg font-bold text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 bg-[#079447] hover:bg-[#08A855] font-manrope" 
                style={{ padding: 'clamp(4px, 0.8vw, 12px) clamp(12px, 1.5vw, 24px)', fontSize: 'clamp(11px, 1.3vw, 16px)' }}
              >
                Request a Quote
              </Link> 
            </nav>
          </div>
        </div>
      </header>

      {/* ========== MOBILE MENU OVERLAY ========== */}
      {open && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ========== SLIDE-IN DRAWER MENU (Mobile) ========== */}
      <div className={`fixed top-0 left-0 h-screen w-[75vw] max-w-[320px] z-50 bg-[#001F3F] text-white transform transition-transform duration-300 ease-in-out md:hidden ${open ? 'translate-x-0' : '-translate-x-full'} shadow-2xl overflow-y-auto`}>
        
        <div className="sticky top-0 bg-[#001F3F] p-6 border-b border-white/10">
          <button 
            onClick={() => setOpen(false)}
            className="absolute top-6 right-6 text-white hover:text-green-400 transition"
            aria-label="Close menu"
          >
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          {/* Optional: Add logo in mobile menu */}
          <div className="mt-2">
            <span className="text-lg font-bold font-display">Menu</span>
          </div>
        </div>
        
        <nav className="p-6 space-y-6 font-display text-xl">
          <Link href="/" className="block hover:text-green-400 transition font-display" onClick={() => setOpen(false)}>
            Home
          </Link>
          <Link href="/residential-section" className="block hover:text-green-400 transition font-display" onClick={() => setOpen(false)}>
            Residential
          </Link>
          <Link href="/commercial" className="block hover:text-green-400 transition font-display" onClick={() => setOpen(false)}>
            Commercial
          </Link>
          <Link href="/about-us" className="block hover:text-green-400 transition font-display" onClick={() => setOpen(false)}>
            About Us
          </Link>
          <Link href="/gift-certificates" className="block hover:text-green-400 transition font-display" onClick={() => setOpen(false)}>
            Gift Certificates
          </Link>
          <Link href="/faq" className="block hover:text-green-400 transition font-display" onClick={() => setOpen(false)}>
            FAQ
          </Link>
          <a href="#apply" className="block hover:text-green-400 transition font-display" onClick={() => setOpen(false)}>
            Careers
          </a>
          <a href="#aplicar" className="block hover:text-green-400 transition font-display" onClick={() => setOpen(false)}>
            Aplicar
          </a>
          
          {/* Mobile Quote Button */}
          <div className="pt-6 border-t border-white/10">
            <Link
              href="/service-quote" 
              className="block text-center rounded-lg bg-[#079447] hover:bg-[#08A855] px-6 py-3 text-white font-semibold transition-all duration-300"
              onClick={() => setOpen(false)}
            >
              Request a Quote
            </Link>
          </div>
        </nav>
      </div>
    </>
  ); 
}

/* ========== JOBS/APLICAR HEADER ========== */
function JobsHeader() {
  return (
    <header className="relative z-50 bg-[linear-gradient(to_bottom,#FFFFFF,#FFFDF8)] border-b border-slate-100">
      <div className="w-full flex items-center gap-8 px-2 md:px-6 py-4 md:py-5">
        <a href="/" className="flex items-center gap-3">
          <img src="/sparkle.svg" alt="Impress Cleaning logo" className="h-7 w-7" />
          <div className="flex flex-col leading-tight scale-[1.15] md:scale-[1.25] ml-2 md:ml-8">
            <span className="font-display uppercase text-navyDark text-2xl font-black tracking-wide">
              Impress Cleaning Services <span className="relative top-[1px] -ml-[6px] text-[11px] font-medium tracking-tight">LLC</span>
            </span>
            <span className="text-[11px] text-navyDark/80 uppercase tracking-[0.08em] font-manrope">
              A clean home is an impressive home.
            </span>
          </div>
        </a>

        <nav className="hidden md:flex items-center gap-10 text-[16px] text-navyDark font-manrope font-medium ml-auto">
          <a href="/aplicar" className="hover:text-green transition font-manrope"></a>
          <a href="/english" className="hover:text-green transition font-manrope">English Site</a>
          <a href="#aplicar-form" className="rounded-lg bg-gradient-to-r from-green-300 via-green to-green-400 px-6 py-3 text-white font-semibold font-manrope shadow-md hover:shadow-lg hover:from-green-400 hover:to-green transition">
            Explora todos los empleos
          </a>
        </nav>

        <button type="button" className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-navyDark hover:bg-slate-100 transition" aria-label="Open menu">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="h-6 w-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </header>
  );
}