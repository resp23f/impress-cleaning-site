"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useMemo, useEffect } from "react"; // ← Add useEffect


const NAV = [
  { label: "Residential", href: "/#services" },
  { label: "Commercial",  href: "/#services" },
  { label: "Why Hire Us", href: "/#about" },
  { label: "About Us",    href: "/#about" },
  { label: "FAQ",         href: "/#faq"   },
];
export default function Header() {
  return <SiteHeader />;
}
function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false); // ← ADD THIS
  const pathname = usePathname() || "/";
  const active = useMemo(
    () => (href) => (pathname === href ? "text-green font-semibold" : ""),
    [pathname]
  );
  // ← ADD THIS useEffect
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 20);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  return (
    <>
{/* ========== TOP BAR (Gift Certificates | Careers | Aplicar) - DESKTOP ONLY ========== */}
<div className="hidden md:block bg-background border-b border-gray-100">
  <div className="max-w-[1400px] mx-auto flex items-center justify-end gap-4 py-2 px-6 lg:px-8 font-manrope text-[13px] text-gray-600">
    <Link href="/gift-certificate" className="hover:text-green transition-colors">
      Gift Certificates
    </Link>
    <span className="text-gray-300">•</span>
    <Link href="/apply" className="hover:text-green transition-colors">
      Careers
    </Link>
    <span className="text-gray-300">•</span>
    <Link href="/aplicar" className="hover:text-green transition-colors">
      Aplicar
    </Link>
  </div>
</div>


      {/* ========== MAIN HEADER (Logo + Navigation) ========== */}
<header className={`md:sticky fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
  isScrolled 
    ? 'bg-white backdrop-blur-md shadow-lg' 
    : 'bg-white'
}`}>
  
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

            {/* ========== HAMBURGER MENU Icon (Mobile Only) ========== */}
<button
  type="button"
  aria-label="Toggle navigation"
  onClick={() => setOpen((prev) => !prev)}
  className={`md:hidden inline-flex items-center justify-center w-10 h-10 hover:text-green transition-colors relative z-10 ${
    isScrolled ? 'text-navy' : 'text-navy'
  }`}
>
  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
  </svg>
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

              {/* ADD THIS PHONE NUMBER */}
              <a 
                href="tel:+15122775364"
                className="hover:text-green transition-colors duration-200 font-display flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>(512) 277-5364</span>
              </a>

              {/* ========== ACTION BUTTONS WITH FLUID SIZING ========== */}
              <div className="flex items-center" style={{ gap: 'clamp(6px, 1vw, 16px)' }}>
                <Link
                  href="/booking" 
                  className="inline-flex items-center justify-center rounded-lg font-bold text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 bg-[#079447] hover:bg-[#08A855] font-manrope" 
                  style={{ padding: 'clamp(4px, 0.8vw, 12px) clamp(12px, 1.5vw, 24px)', fontSize: 'clamp(11px, 1.3vw, 16px)' }}
                >
                  Book Now
                </Link>
                <Link
                  href="/service-quote" 
                  className="inline-flex items-center justify-center rounded-lg font-bold text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 bg-[#079447] hover:bg-[#08A855] font-manrope" 
                  style={{ padding: 'clamp(4px, 0.8vw, 12px) clamp(12px, 1.5vw, 24px)', fontSize: 'clamp(11px, 1.3vw, 16px)' }}
                >
                  Request a Quote
                </Link>
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
          <a href="#apply" className="block hover:text-green-400 transition font-display" onClick={() => setOpen(false)}>
            Careers
          </a>
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
