"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useMemo, useEffect, useRef } from "react";

export default function Header() {
 return <SiteHeader />;
}

function SiteHeader() {
 const [desktopMenuOpen, setDesktopMenuOpen] = useState(false);
 const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
 const [isScrolled, setIsScrolled] = useState(false);
 const [isHidden, setIsHidden] = useState(false);
 
 const headerRef = useRef(null);
 const desktopMenuRef = useRef(null);
 const desktopButtonRef = useRef(null);
 
 const pathname = usePathname() || "/";
 const active = useMemo(
  () => (href) => (pathname === href ? "text-green font-semibold" : ""),
  [pathname]
 );
 
 const lastScrollY = useRef(0);
 const scrollState = useRef({ isScrolled: false, isHidden: false });
 
 // Scroll behavior (preserved from original)
 useEffect(() => {
  const handleScroll = () => {
   const y = window.scrollY;
   const atTop = y < 10;
   
   const scrollingDown = y > lastScrollY.current;
   const scrollingUp = y < lastScrollY.current;
   
   let nextIsScrolled = !atTop;
   let nextIsHidden = scrollState.current.isHidden;
   
   if (atTop) {
    nextIsHidden = false;
   } else {
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
  
  handleScroll();
  window.addEventListener("scroll", handleScroll, { passive: true });
  return () => window.removeEventListener("scroll", handleScroll);
 }, []);
 
 // Close desktop dropdown when clicking outside
 useEffect(() => {
  const handleClickOutside = (event) => {
   if (
    desktopMenuOpen &&
    desktopMenuRef.current &&
    !desktopMenuRef.current.contains(event.target) &&
    desktopButtonRef.current &&
    !desktopButtonRef.current.contains(event.target)
   ) {
    setDesktopMenuOpen(false);
   }
  };
  
  document.addEventListener("mousedown", handleClickOutside);
  return () => document.removeEventListener("mousedown", handleClickOutside);
 }, [desktopMenuOpen]);
 
 // Sync main offset to actual header height across breakpoints
 useEffect(() => {
  const setHeaderOffset = () => {
   if (!headerRef.current) return;
   const height = headerRef.current.getBoundingClientRect().height;
   document.documentElement.style.setProperty("--header-offset", `${height}px`);
  };
  
  setHeaderOffset();
  
  const resizeObserver = typeof ResizeObserver !== "undefined"
   ? new ResizeObserver(setHeaderOffset)
   : null;
  if (resizeObserver && headerRef.current) {
   resizeObserver.observe(headerRef.current);
  }
  
  window.addEventListener("resize", setHeaderOffset);
  return () => {
   window.removeEventListener("resize", setHeaderOffset);
   if (resizeObserver) resizeObserver.disconnect();
  };
 }, []);
 
 // Close mobile menu on route change
 useEffect(() => {
  setMobileMenuOpen(false);
  setDesktopMenuOpen(false);
 }, [pathname]);
 
 // Prevent body scroll when mobile menu open
 useEffect(() => {
  if (mobileMenuOpen) {
   document.body.style.overflow = "hidden";
  } else {
   document.body.style.overflow = "";
  }
  return () => {
   document.body.style.overflow = "";
  };
 }, [mobileMenuOpen]);
 
 return (
  <>
  {/* HEADER */}
  <header
  ref={headerRef}
  className={`
          fixed top-0 left-0 right-0 z-50 w-full
          transform transition-transform duration-300 ease-out
          ${isHidden ? "-translate-y-full" : "translate-y-0"}
          ${
   isScrolled
   ? "bg-white/25 backdrop-blur-[20px] border-b border-white/30 shadow-sm"
   : "bg-gradient-to-b from-gray-50 via-gray-50/95 to-gray-100 border-b border-gray-200/40"
  }
          transition-[background,backdrop-filter] duration-300 ease-out
        `}
  >
  <div className="w-full mx-auto relative px-3 sm:px-4 lg:px-6 xl:px-8 max-w-[1600px]">
  
  <div className="flex items-center justify-between gap-2 flex-nowrap py-2 lg:py-3 2xl:py-4">
  {/* LOGO */}
<Link
  href="/"
  className="flex items-center select-none shrink-0 relative z-10 -ml-4 md:-ml-6 lg:-ml-8 xl:-ml-10 2xl:-ml-12"
  aria-label="Impress Cleaning Home"
>
  <Image
    src="/optimized-header-logo.png"
    alt="Impress Cleaning Services"
    width={240}
    height={140}
    className="h-[60px] md:h-[70px] lg:h-[80px] xl:h-[85px] 2xl:h-[95px] object-contain"
    priority
  />
</Link>
  
  {/* MOBILE HAMBURGER */}
  <button
  type="button"
  aria-label="Toggle navigation"
  onClick={() => setMobileMenuOpen((prev) => !prev)}
  className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-full border border-slate-200 hover:border-slate-300 hover:shadow-sm bg-white text-slate-600 hover:text-[#079447] transition-all duration-200"
  >
  {mobileMenuOpen ? (
   <svg
   className="w-5 h-5"
   fill="none"
   viewBox="0 0 24 24"
   stroke="currentColor"
   strokeWidth="2"
   >
   <path
   strokeLinecap="round"
   strokeLinejoin="round"
   d="M6 18L18 6M6 6l12 12"
   />
   </svg>
  ) : (
   <svg
   className="w-5 h-5"
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
  )}
  </button>
  
  {/* DESKTOP NAV */}
  <nav>
<div className="flex flex-1 items-center justify-center gap-[clamp(2px,1vw,24px)]">
  <Link
    href="/"
    className="relative font-display px-2 lg:px-3 xl:px-4 py-2 rounded-full transition-all duration-300 ease-out hover:bg-green-50/60 hover:text-[#079447] hover:shadow-sm hover:-translate-y-[1px]"
  >
    Home
  </Link>
  <Link
    href="/residential-section"
    className="relative font-display px-2 lg:px-3 xl:px-4 py-2 rounded-full transition-all duration-300 ease-out hover:bg-green-50/60 hover:text-[#079447] hover:shadow-sm hover:-translate-y-[1px]"
  >
    Residential
  </Link>
  <Link
    href="/commercial"
    className="relative font-display px-2 lg:px-3 xl:px-4 py-2 rounded-full transition-all duration-300 ease-out hover:bg-green-50/60 hover:text-[#079447] hover:shadow-sm hover:-translate-y-[1px]"
  >
    Commercial
  </Link>
  <Link
    href="/gift-certificate"
    className="relative font-display px-2 lg:px-3 xl:px-4 py-2 rounded-full transition-all duration-300 ease-out hover:bg-green-50/60 hover:text-[#079447] hover:shadow-sm hover:-translate-y-[1px]"
  >
    <span className="hidden xl:inline">Gift Certificates</span>
    <span className="xl:hidden">Gifts</span>
  </Link>
  <Link
    href="/faq"
    className="relative font-display px-2 lg:px-3 xl:px-4 py-2 rounded-full transition-all duration-300 ease-out hover:bg-green-50/60 hover:text-[#079447] hover:shadow-sm hover:-translate-y-[1px]"
  >
    FAQ
  </Link>
  <Link
    href="/about-us"
    className="relative font-display px-2 lg:px-3 xl:px-4 py-2 rounded-full transition-all duration-300 ease-out hover:bg-green-50/60 hover:text-[#079447] hover:shadow-sm hover:-translate-y-[1px]"
  >
    <span className="hidden xl:inline">About Us</span>
    <span className="xl:hidden">About</span>
  </Link>
  {/* RIGHT-SIDE ACTIONS */}
<div className="flex items-center gap-0.5 lg:gap-1 xl:gap-2 2xl:gap-3 ml-auto shrink-0">
  {/* Book Now – PRIMARY */}
<Link
  href="/booking"
  className="inline-flex items-center justify-center px-3 lg:px-4 xl:px-6 py-2 lg:py-2.5 xl:py-3 rounded-xl font-bold text-white text-[13px] lg:text-[14px] xl:text-[15px] bg-gradient-to-r from-[#079447] to-[#08A855] hover:shadow-lg hover:shadow-green-500/20 hover:scale-[1.05] transition-all duration-300 font-manrope whitespace-nowrap"
>
  <span className="hidden sm:inline">Book Now</span>
  <span className="sm:hidden">Book</span>
</Link>
  {/* Customer Portal – OUTLINED BUTTON */}
<Link
  href="/auth/login"
  className="inline-flex items-center justify-center gap-1 px-2.5 lg:px-3 xl:px-5 py-2 lg:py-2.5 xl:py-3 rounded-xl border border-slate-300 text-slate-700 text-[13px] lg:text-[14px] xl:text-[15px] font-semibold hover:border-[#079447] hover:text-[#079447] hover:bg-white transition-all duration-300 font-manrope whitespace-nowrap"
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
  <span className="hidden xl:inline">Portal</span>
</Link>
</div>




  {/* Hamburger Menu – DESKTOP DROPDOWN TRIGGER */}
  <div className="relative">
<button
  ref={desktopButtonRef}
  type="button"
  aria-label="More options"
  onClick={() => setDesktopMenuOpen((prev) => !prev)}
  className={`inline-flex items-center justify-center w-8 lg:w-9 xl:w-10 2xl:w-11 h-8 lg:h-9 xl:h-10 2xl:h-11 rounded-full border transition-all duration-200 ${
    desktopMenuOpen
      ? "border-slate-400 bg-slate-50 shadow-sm"
      : "border-slate-300 bg-white hover:border-slate-400 hover:shadow-sm"
  }`}
>
  <svg
    className="w-3.5 lg:w-4 xl:w-5 h-3.5 lg:h-4 xl:h-5 text-slate-600"
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
  
  {/* DESKTOP DROPDOWN MENU */}
  {desktopMenuOpen && (
   <div
   ref={desktopMenuRef}
   className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200/80 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
   >
   {/* Phone */}
   <a
   href="tel:+15122775364"
   className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors"
   >
   <div className="w-9 h-9 rounded-full bg-green-50 flex items-center justify-center">
   <svg
   className="w-4 h-4 text-[#079447]"
   fill="none"
   stroke="currentColor"
   viewBox="0 0 24 24"
   strokeWidth="2"
   >
   <path
   strokeLinecap="round"
   strokeLinejoin="round"
   d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
   />
   </svg>
   </div>
   <div>
   <p className="text-sm font-semibold text-slate-800">
   (512) 277-5364
   </p>
   <p className="text-xs text-slate-500">Call us</p>
   </div>
   </a>
   
   {/* Hours */}
   <div className="flex items-center gap-3 px-4 py-3">
   <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center">
   <svg
   className="w-4 h-4 text-blue-600"
   fill="currentColor"
   viewBox="0 0 20 20"
   >
   <path
   fillRule="evenodd"
   d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
   clipRule="evenodd"
   />
   </svg>
   </div>
   <div>
   <p className="text-sm font-semibold text-slate-800">
   Mon-Fri 7:00AM-6:30PM
   </p>
   <p className="text-xs text-slate-500">Business hours</p>
   </div>
   </div>
   
   <div className="my-2 border-t border-slate-100" />
   
   {/* Apply */}
   <Link
   href="/apply"
   className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors"
   onClick={() => setDesktopMenuOpen(false)}
   >
   <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center">
   <svg
   className="w-4 h-4 text-slate-600"
   fill="none"
   stroke="currentColor"
   viewBox="0 0 24 24"
   strokeWidth="2"
   >
   <path
   strokeLinecap="round"
   strokeLinejoin="round"
   d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
   />
   </svg>
   </div>
   <div>
   <p className="text-sm font-semibold text-slate-800">
   Apply
   </p>
   <p className="text-xs text-slate-500">Join our team</p>
   </div>
   </Link>
   
   {/* Aplicar */}
   <Link
   href="/aplicar"
   className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors"
   onClick={() => setDesktopMenuOpen(false)}
   >
   <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center">
   <svg
   className="w-4 h-4 text-slate-600"
   fill="none"
   stroke="currentColor"
   viewBox="0 0 24 24"
   strokeWidth="2"
   >
   <path
   strokeLinecap="round"
   strokeLinejoin="round"
   d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
   />
   </svg>
   </div>
   <div>
   <p className="text-sm font-semibold text-slate-800">
   Aplicar
   </p>
   <p className="text-xs text-slate-500">
   Únete a nuestro equipo
   </p>
   </div>
   </Link>
   </div>
  )}
  </div>
  </div>
  </nav>
  </div>
  </div>
  </header>
  
  {/* MOBILE MENU OVERLAY */}
  {mobileMenuOpen && (
   <div
   className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-200"
   onClick={() => setMobileMenuOpen(false)}
   />
  )}
  
  {/* MOBILE DROPDOWN MENU */}
  <div
  className={`fixed top-0 left-0 right-0 z-50 lg:hidden transform transition-all duration-300 ease-out ${
   mobileMenuOpen
   ? "translate-y-0 opacity-100"
   : "-translate-y-full opacity-0 pointer-events-none"
  }`}
  >
  {/* Premium softer navy: #1e3a5f */}
  <div className="bg-[#1e3a5f] text-white rounded-b-3xl shadow-2xl max-h-[85vh] overflow-y-auto">
  {/* Header row with logo area and close button */}
  <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
  <span className="text-lg font-bold font-display">Menu</span>
  <button
  onClick={() => setMobileMenuOpen(false)}
  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
  aria-label="Close menu"
  >
  <svg
  className="w-5 h-5"
  fill="none"
  viewBox="0 0 24 24"
  stroke="currentColor"
  strokeWidth="2"
  >
  <path
  strokeLinecap="round"
  strokeLinejoin="round"
  d="M6 18L18 6M6 6l12 12"
  />
  </svg>
  </button>
  </div>
  
  {/* Primary CTAs */}
  <div className="px-5 py-4 space-y-3">
  <Link
  href="/auth/login"
  className="flex items-center justify-center gap-2 w-full rounded-xl bg-white text-[#1e3a5f] px-6 py-3.5 font-bold text-base transition-all duration-300 hover:bg-slate-100"
  onClick={() => setMobileMenuOpen(false)}
  >
  <svg
  className="w-5 h-5"
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
  Customer Portal
  </Link>
  <Link
  href="/booking"
  className="flex items-center justify-center w-full rounded-xl bg-gradient-to-r from-[#079447] to-[#08A855] text-white px-6 py-3.5 font-bold text-base transition-all duration-300 hover:shadow-lg"
  onClick={() => setMobileMenuOpen(false)}
  >
  Book Now
  </Link>
  </div>
  
  <div className="border-t border-white/10" />
  
  {/* Navigation Links */}
  <nav className="px-5 py-4 space-y-1">
  {[
   { href: "/", label: "Home" },
   { href: "/residential-section", label: "Residential" },
   { href: "/commercial", label: "Commercial" },
   { href: "/gift-certificate", label: "Gift Certificates" },
   { href: "/faq", label: "FAQ" },
   { href: "/about-us", label: "About Us" },
  ].map((link) => (
   <Link
   key={link.href}
   href={link.href}
   className="block px-4 py-3 rounded-xl text-lg font-display hover:bg-white/10 transition-colors"
   onClick={() => setMobileMenuOpen(false)}
   >
   {link.label}
   </Link>
  ))}
  </nav>
  
  <div className="border-t border-white/10" />
  
  {/* Secondary Info */}
  <div className="px-5 py-4 space-y-3">
  {/* Phone */}
  <a
  href="tel:+15122775364"
  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
  >
  <div className="w-10 h-10 rounded-full bg-[#079447]/20 flex items-center justify-center">
  <svg
  className="w-5 h-5 text-[#08A855]"
  fill="none"
  stroke="currentColor"
  viewBox="0 0 24 24"
  strokeWidth="2"
  >
  <path
  strokeLinecap="round"
  strokeLinejoin="round"
  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
  />
  </svg>
  </div>
  <div>
  <p className="font-semibold">(512) 277-5364</p>
  <p className="text-sm text-white/60">Tap to call</p>
  </div>
  </a>
  
  {/* Hours */}
  <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5">
  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
  <svg
  className="w-5 h-5 text-blue-400"
  fill="currentColor"
  viewBox="0 0 20 20"
  >
  <path
  fillRule="evenodd"
  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
  clipRule="evenodd"
  />
  </svg>
  </div>
  <div>
  <p className="font-semibold">Mon-Fri 7:00AM-6:30PM</p>
  <p className="text-sm text-white/60">Business hours</p>
  </div>
  </div>
  </div>
  
  <div className="border-t border-white/10" />
  
  {/* Apply Links */}
  <div className="px-5 py-4 pb-6 flex gap-3">
  <Link
  href="/apply"
  className="flex-1 text-center px-4 py-3 rounded-xl border border-white/20 font-semibold hover:bg-white/10 transition-colors"
  onClick={() => setMobileMenuOpen(false)}
  >
  Apply
  </Link>
  <Link
  href="/aplicar"
  className="flex-1 text-center px-4 py-3 rounded-xl border border-white/20 font-semibold hover:bg-white/10 transition-colors"
  onClick={() => setMobileMenuOpen(false)}
  >
  Aplicar
  </Link>
  </div>
  </div>
  </div>
  </>
 );
}
