"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useMemo, useEffect, useRef } from "react"; 
const NAV = [
 { label: "Residential", href: "/#services" },
 { label: "Commercial", href: "/#services" },
 { label: "Why Hire Us", href: "/#about" },
 { label: "About Us", href: "/#about" },
 { label: "FAQ", href: "/#faq" },
];
export default function Header() {
 return <SiteHeader />;
}
function SiteHeader() {
 const [open, setOpen] = useState(false);
 const [isScrolled, setIsScrolled] = useState(false);
 const [isHidden, setIsHidden] = useState(false); // replaces scrollDirection
 
 const pathname = usePathname() || "/";
 const active = useMemo(
  () => (href) => (pathname === href ? "text-green font-semibold" : ""),
  [pathname]
 );
 
 const lastScrollY = useRef(0);
 const scrollState = useRef({ isScrolled: false, isHidden: false });
 
 
 useEffect(() => {
  const handleScroll = () => {
   const y = window.scrollY;
   const atTop = y < 20;
   
   const scrollingDown = y > lastScrollY.current;
   const scrollingUp = y < lastScrollY.current;
   
   let nextIsScrolled = !atTop;
   let nextIsHidden = scrollState.current.isHidden;
   
   if (atTop) {
    // At very top: show header, no glass
    nextIsHidden = false;
   } else {
    // Below top: glass turns on, and we hide/show based on direction
    if (scrollingUp && y > 100) {
     // scrolling UP away from top → hide
     nextIsHidden = true;
    } else if (scrollingDown) {
     // scrolling DOWN → show
     nextIsHidden = false;
    }
   }
   
   lastScrollY.current = y;
   
   if (
    nextIsScrolled !== scrollState.current.isScrolled ||
    nextIsHidden !== scrollState.current.isHidden
   ) {
    scrollState.current = {
     isScrolled: nextIsScrolled,
     isHidden: nextIsHidden,
    };
    setIsScrolled(nextIsScrolled);
    setIsHidden(nextIsHidden);
   }
  };
  
  // Initialize on load
  handleScroll();
  
  window.addEventListener("scroll", handleScroll, { passive: true });
  return () => window.removeEventListener("scroll", handleScroll);
 }, []);
 
 return (
  <>
  {/* = TOP BAR (Hours | Aplicar | Apply) - DESKTOP ONLY = */}
  <div className="hidden md:block bg-background border-b border-gray-100">
  <div className="max-w-[1400px] mx-auto flex items-center justify-end gap-4 py-2 px-6 lg:px-8 font-manrope text-[13px] font-bold">
  <div className="flex items-center gap-1.5 text-slate-600">
  <svg className="w-3.5 h-3.5 text-[#079447]" fill="currentColor" viewBox="0 0 20 20">
  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
  </svg>
  <span>Mon-Fri 7:00AM-6:30PM</span>
  </div>
  <span className="text-gray-300 font-bold">•</span>
  <Link href="/aplicar" className="hover:text-green transition-colors">
  Aplicar
  </Link>
  <span className="text-gray-300 font-bold">•</span>
  <Link href="/apply" className="hover:text-green transition-colors">
  Apply
  </Link>
  </div>
  </div>
  
  {/* ========== MAIN HEADER (Logo + Navigation) ========== */}
  <header
  className={`
      sticky top-0 z-50 w-full
      transform transition-transform duration-300 ease-out
      ${isHidden ? "-translate-y-full" : "translate-y-0"}
      ${
   isScrolled
   ? "bg-white/25 backdrop-blur-[20px] border-b border-white/30 shadow-sm transition-[background,backdrop-filter] duration-300 ease-out"
   : "bg-gray-50 transition-[background,backdrop-filter] duration-300 ease-out"
  }
    `}
  >
  
  {/* CONTAINER WITH FLUID MAX-WIDTH */}
  <div className="w-full mx-auto relative px-4 lg:px-8" style={{ maxWidth: 'clamp(900px, 95vw, 1600px)' }}>
  <div className="flex items-center justify-between gap-2 flex-nowrap py-3 md:py-4 2xl:py-5">
  
  {/* LOGO */}
  <Link
  href="/"
  className="flex items-center select-none shrink-0 relative z-10 md:-ml-2 lg:-ml-3 xl:-ml-4"
  aria-label="Impress Cleaning Home"
  >
  <Image
  src="/optimized-header-logo.png"
  alt="Impress Cleaning Services"
  width={240}
  height={140}
  className="h-[70px] w-auto md:h-[85px] lg:h-[95px] xl:h-[105px] 2xl:h-[115px] object-contain"
  priority
  />
  </Link>
  
  {/* HAMBURGER MENU Icon (Mobile Only) */}
  <button
  type="button"
  aria-label="Toggle navigation"
  onClick={() => setOpen((prev) => !prev)}
  className={`md:hidden inline-flex items-center justify-center w-10 h-10 hover:text-green transition-colors relative z-10 ${isScrolled ? 'text-navy' : 'text-navy'
  }`}
  >
  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
  </svg>
  </button>
  {/* ========== NAVIGATION MENU WITH FLUID SIZING (Desktop Only) ========== */}
  <nav
  className="hidden md:flex md:flex-1 md:items-center md:justify-center font-display font-medium text-navy whitespace-nowrap"
  style={{ gap: 'clamp(8px, 1.5vw, 48px)', fontSize: 'clamp(12px, 1.3vw, 21px)' }}
  aria-label="Primary"
  >
  <Link href="/" className="relative hover:text-green transition-all duration-200 font-display px-3 py-1.5 rounded-full hover:bg-green-50/50">
  Home
  </Link>
  <Link href="/residential-section" className="relative hover:text-green transition-all duration-200 font-display px-3 py-1.5 rounded-full hover:bg-green-50/50">
  Residential
  </Link>
  <Link href="/commercial" className="relative hover:text-green transition-all duration-200 font-display px-3 py-1.5 rounded-full hover:bg-green-50/50">
  Commercial
  </Link>
  <Link href="/gift-certificate" className="relative hover:text-green transition-all duration-200 font-display px-3 py-1.5 rounded-full hover:bg-green-50/50">
  Gift Certificates
  </Link>
  <Link href="/faq" className="relative hover:text-green transition-all duration-200 font-display px-3 py-1.5 rounded-full hover:bg-green-50/50">
  FAQ
  </Link>
  <Link href="/about-us" className="relative hover:text-green transition-all duration-200 font-display px-3 py-1.5 rounded-full hover:bg-green-50/50">
  About Us
  </Link>
  
  {/* ========== ACTION BUTTONS - PREMIUM LAYOUT ========== */}
  <div className="flex items-center gap-3 ml-auto">
  
  {/* Portal - Subtle text link */}
  <Link
  href="/auth/login"
  className="hidden lg:inline-flex items-center gap-1.5 text-slate-600 hover:text-[#079447] transition-colors font-manrope text-sm font-medium"
  >
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
  Portal
  </Link>
  
  {/* Book Now - Hero CTA */}
  <Link
  href="/booking"
  className="inline-flex items-center justify-center px-6 py-3 rounded-xl font-bold text-white text-[15px] bg-gradient-to-r from-[#079447] to-[#08A855] hover:shadow-lg hover:shadow-green-500/20 hover:scale-[1.05] transition-all duration-300 font-manrope whitespace-nowrap"
  >
  Book Now
  </Link>
  
  {/* Phone - Secondary CTA */}
  
  <a href="tel:+15122775364"
  className="hidden md:inline-flex items-center justify-center px-5 py-3 rounded-xl font-semibold text-[15px] border-2 border-[#079447] text-[#079447] hover:bg-[#079447] hover:text-white transition-all duration-300 font-manrope whitespace-nowrap"
  >
  (512) 277-5364
  </a>
  </div>
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
  
  {/* ADD THIS ENTIRE BLOCK HERE ↓ */}
  <div className="px-6 pt-6">
  {/* Customer Portal - Featured */}
  <Link
  href="/auth/login"
  className="block text-center rounded-lg bg-gradient-to-r from-[#079447] to-[#08A855] hover:from-[#08A855] hover:to-[#079447] px-6 py-4 text-white font-bold text-lg transition-all duration-300 shadow-lg"
  onClick={() => setOpen(false)}
  >
  <div className="flex items-center justify-center gap-2">
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
  Customer Portal
  </div>
  </Link>
  <div className="border-t border-white/10 mt-6" />
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
  <Link href="/gift-certificate" className="block hover:text-green-400 transition font-display" onClick={() => setOpen(false)}>
  Gift Certificates
  </Link>
  <Link href="/faq" className="block hover:text-green-400 transition font-display" onClick={() => setOpen(false)}>
  FAQ
  </Link>
  <Link href="/apply" className="block hover:text-green-400 transition font-display" onClick={() => setOpen(false)}>
  Apply
  </Link>
  <Link href="/aplicar" className="block hover:text-green-400 transition font-display" onClick={() => setOpen(false)}>
  Aplicar
  </Link>
  {/* Mobile Action Buttons */}
  <div className="pt-6 border-t border-white/10 space-y-3">
  <Link
  href="/booking"
  className="block text-center rounded-lg bg-[#079447] hover:bg-[#08A855] px-6 py-3 text-white font-semibold transition-all duration-300"
  onClick={() => setOpen(false)}
  >
  Book Now
  </Link>
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
