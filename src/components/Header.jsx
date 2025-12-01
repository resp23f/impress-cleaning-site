"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useMemo, useEffect, useRef } from "react";

export default function Header() {
 return <SiteHeader />;
}

function SiteHeader() {
 const [open, setOpen] = useState(false);
 const [isScrolled, setIsScrolled] = useState(false);
 const [isHidden, setIsHidden] = useState(false);
 
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
   const atTop = y < 10;
   
   const scrollingDown = y > lastScrollY.current;
   const scrollingUp = y < lastScrollY.current;
   
   let nextIsScrolled = !atTop;
   let nextIsHidden = scrollState.current.isHidden;
   
   if (atTop) {
    // At very top → show header, no hide
    nextIsHidden = false;
   } else {
    // Below top → hide/show based on direction
    if (scrollingUp && y > 80) {
     nextIsHidden = true;
    } else if (scrollingDown) {
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
  
  handleScroll(); // init
  window.addEventListener("scroll", handleScroll, { passive: true });
  return () => window.removeEventListener("scroll", handleScroll);
 }, []);
 
 return (
  <>
  {/* HEADER (top bar + main row) */}
  <header
  className={`
          fixed top-0 left-0 right-0 z-50 w-full
          transform transition-transform duration-300 ease-out
          ${isHidden ? "-translate-y-full" : "translate-y-0"}
          ${isScrolled
   ? "bg-white/25 backdrop-blur-[20px] border-b border-white/30 shadow-sm"
   : "bg-gradient-to-b from-gray-50 via-gray-50/95 to-gray-100 border-b border-gray-200/40"
  }
          transition-[background,backdrop-filter] duration-300 ease-out
        `}
  >
  {/* TOP BAR (now INSIDE header) */}
  <div className="hidden md:block">
  <div className="max-w-[1600px] mx-auto flex items-center justify-end gap-6 py-2 pr-8 lg:pr-10 font-manrope text-[13px] font-bold">
  <div className="flex items-center gap-1.5 text-slate-600">
  <svg
  className="w-3.5 h-3.5 text-[#079447]"
  fill="currentColor"
  viewBox="0 0 20 20"
  >
  <path
  fillRule="evenodd"
  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
  clipRule="evenodd"
  />
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
  
  {/* MAIN HEADER ROW */}
  <div
  className="w-full mx-auto relative px-4 lg:px-8"
  style={{ maxWidth: "clamp(900px, 95vw, 1600px)" }}
  >
  <div className="flex items-center justify-between gap-2 flex-nowrap py-2 md:py-3 2xl:py-4">
  
  
  {/* LOGO */}
  <Link
  href="/"
  className="flex items-center select-none shrink-0 relative z-10 md:-ml-3 lg:-ml-4 xl:-ml-5"
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
  
  {/* MOBILE HAMBURGER */}
  <button
  type="button"
  aria-label="Toggle navigation"
  onClick={() => setOpen((prev) => !prev)}
  className={`md:hidden inline-flex items-center justify-center w-10 h-10 hover:text-green transition-colors relative z-10 text-navy`}
  >
  <svg
  xmlns="http://www.w3.org/2000/svg"
  className="w-6 h-6"
  fill="none"
  viewBox="0 0 24 24"
  stroke="currentColor"
  strokeWidth="2"
  >
  <path
  strokeLinecap="round"
  strokeLinejoin="round"
  d="M4 6h16M4 12h16M4 18h16"
  />
  </svg>
  </button>
  
  {/* DESKTOP NAV */}
  <nav
  className="hidden md:flex md:flex-1 md:items-center font-display font-medium text-navy whitespace-nowrap"
  style={{
   gap: "clamp(8px, 1.5vw, 48px)",
   fontSize: "clamp(12px, 1.3vw, 21px)",
  }}
  aria-label="Primary"
  >
  {/* CENTERED NAV LINKS */}
  <div className="flex flex-1 items-center justify-center gap-[clamp(8px,1.5vw,48px)]">
  <Link
  href="/"
  className="
  relative font-display px-4 py-2 rounded-full
  transition-all duration-300 ease-out
  hover:bg-green-50/60 hover:text-[#079447] hover:shadow-sm hover:-translate-y-[1px]"
  >
  Home
  </Link>
  <Link
  href="/residential-section"
  className="
  relative font-display px-4 py-2 rounded-full
  transition-all duration-300 ease-out
  hover:bg-green-50/60 hover:text-[#079447] hover:shadow-sm hover:-translate-y-[1px]"
  >
  Residential
  </Link>
  <Link
  href="/commercial"
  className="
  relative font-display px-4 py-2 rounded-full
  transition-all duration-300 ease-out
  hover:bg-green-50/60 hover:text-[#079447] hover:shadow-sm hover:-translate-y-[1px]"
  >
  Commercial
  </Link>
  <Link
  href="/gift-certificate"
  className="
  relative font-display px-4 py-2 rounded-full
  transition-all duration-300 ease-out
  hover:bg-green-50/60 hover:text-[#079447] hover:shadow-sm hover:-translate-y-[1px]"
  >
  Gift Certificates
  </Link>
  <Link
  href="/faq"
  className="
  relative font-display px-4 py-2 rounded-full
  transition-all duration-300 ease-out
  hover:bg-green-50/60 hover:text-[#079447] hover:shadow-sm hover:-translate-y-[1px]"
  >
  FAQ
  </Link>
  <Link
  href="/about-us"
  className="
  relative font-display px-4 py-2 rounded-full
  transition-all duration-300 ease-out
  hover:bg-green-50/60 hover:text-[#079447] hover:shadow-sm hover:-translate-y-[1px]"
  >
  About Us
  </Link>
  </div>
  
  {/* RIGHT-SIDE ACTIONS */}
  <div className="flex items-center gap-3 ml-auto">
  {/* Book Now – PRIMARY */}
  <Link
  href="/booking"
  className="inline-flex items-center justify-center px-6 py-3 rounded-xl font-bold text-white text-[15px] bg-gradient-to-r from-[#079447] to-[#08A855] hover:shadow-lg hover:shadow-green-500/20 hover:scale-[1.05] transition-all duration-300 font-manrope whitespace-nowrap"
  >
  Book Now
  </Link>
  
  {/* Phone – OUTLINE */}
  <a
  href="tel:+15122775364"
  className="hidden md:inline-flex items-center justify-center px-5 py-3 rounded-xl border border-slate-300 text-slate-700 text-[15px] font-semibold hover:border-[#079447] hover:text-[#079447] hover:bg-white transition-all duration-300 font-manrope whitespace-nowrap"
  >
  (512) 277-5364
  </a>
  
  {/* Customer Portal – TEXT LINK WITH ICON */}
  <Link
  href="/auth/login"
  className="hidden lg:inline-flex items-center gap-1.5 text-slate-600 hover:text-[#079447] transition-colors font-manrope text-sm font-semibold"
  >
  <svg
  className="w-4 h-4"
  fill="none"
  stroke="currentColor"
  viewBox="0 0 24 24"
  strokeWidth="2"
  >
  <path
  strokeLinecap="round"
  strokeLinejoin="round"
  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
  />
  </svg>
  <span>Customer Portal</span>
  </Link>
  </div>
  </nav>
  </div>
  </div>
  </header>
  
  {/* MOBILE MENU OVERLAY */}
  {open && (
   <div
   className="fixed inset-0 bg-black/50 z-40 md:hidden"
   onClick={() => setOpen(false)}
   />
  )}
  
  {/* MOBILE DRAWER */}
  <div
  className={`fixed top-0 left-0 h-screen w-[75vw] max-w-[320px] z-50 bg-[#001F3F] text-white transform transition-transform duration-300 ease-in-out md:hidden ${open ? "translate-x-0" : "-translate-x-full"
  } shadow-2xl overflow-y-auto`}
  >
  <div className="sticky top-0 bg-[#001F3F] p-6 border-b border-white/10">
  <button
  onClick={() => setOpen(false)}
  className="absolute top-6 right-6 text-white hover:text-green-400 transition"
  aria-label="Close menu"
  >
  <svg
  className="w-7 h-7"
  fill="none"
  viewBox="0 0 24 24"
  stroke="currentColor"
  strokeWidth="2.5"
  >
  <path
  strokeLinecap="round"
  strokeLinejoin="round"
  d="M6 18L18 6M6 6l12 12"
  />
  </svg>
  </button>
  <div className="mt-2">
  <span className="text-lg font-bold font-display">Menu</span>
  </div>
  </div>
  
  <div className="px-6 pt-6">
  <Link
  href="/auth/login"
  className="block text-center rounded-lg bg-gradient-to-r from-[#079447] to-[#08A855] hover:from-[#08A855] hover:to-[#079447] px-6 py-4 text-white font-bold text-lg transition-all duration-300 shadow-lg"
  onClick={() => setOpen(false)}
  >
  <div className="flex items-center justify-center gap-2">
  <svg
  className="w-5 h-5"
  fill="none"
  stroke="currentColor"
  viewBox="0 0 24 24"
  >
  <path
  strokeLinecap="round"
  strokeLinejoin="round"
  strokeWidth={2}
  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
  />
  </svg>
  Customer Portal
  </div>
  </Link>
  <div className="border-t border-white/10 mt-6" />
  </div>
  
  <nav className="p-6 space-y-6 font-display text-xl">
  <Link href="/" className="block hover:text-green-400" onClick={() => setOpen(false)}>
  Home
  </Link>
  <Link href="/residential-section" className="block hover:text-green-400" onClick={() => setOpen(false)}>
  Residential
  </Link>
  <Link href="/commercial" className="block hover:text-green-400" onClick={() => setOpen(false)}>
  Commercial
  </Link>
  <Link href="/about-us" className="block hover:text-green-400" onClick={() => setOpen(false)}>
  About Us
  </Link>
  <Link href="/gift-certificate" className="block hover:text-green-400" onClick={() => setOpen(false)}>
  Gift Certificates
  </Link>
  <Link href="/faq" className="block hover:text-green-400" onClick={() => setOpen(false)}>
  FAQ
  </Link>
  <Link href="/apply" className="block hover:text-green-400" onClick={() => setOpen(false)}>
  Apply
  </Link>
  <Link href="/aplicar" className="block hover:text-green-400" onClick={() => setOpen(false)}>
  Aplicar
  </Link>
  
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
