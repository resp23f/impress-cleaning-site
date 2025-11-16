"use client";
import Link from "next/link";
import Image from "next/image";

function SocialIcon({ href, label, children }) {
  return (
    <a
      href={href}
      aria-label={label}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 transition hover:scale-110 hover:bg-white/10 hover:border-white/40"
    >
      {children}
    </a>
    );
}

export default function Footer() {
  const year = new Date().getFullYear();
  
  return (
    <footer className="relative z-10 bg-[#0B2850] text-white py-12 px-6 md:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Top Section - Logo and Contact */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          
          {/* Logo and Company Info */}
          <div className="md:col-span-1 flex flex-col items-center md:items-start">
            <Link href="/" className="mb-4">
              <Image
                src="/logo_impress_white.png"
                alt="Impress Cleaning Services"
                width={200}
                height={120}
                className="w-auto h-20 md:h-24"
              />
            </Link>
            <p className="font-manrope text-sm text-center md:text-left text-white/80 mb-4">
              A clean home is a happy home.
            </p>
          </div>

          {/* Services Column */}
          <div className="text-center md:text-left">
            <h4 className="text-lg font-oswald font-bold mb-3 text-[#7AC699] uppercase tracking-wide">
              Services
            </h4>
            <ul className="font-manrope space-y-2 text-base text-white/80">
              <li>
                <Link 
                  href="/residential-section" 
                  className="hover:text-[#7AC699] transition-colors duration-200 block"
                >
                  Residential
                </Link>
              </li>
              <li>
                <Link 
                  href="/commercial" 
                  className="hover:text-[#7AC699] transition-colors duration-200 block"
                >
                  Commercial
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Column */}
          <div className="text-center md:text-left">
            <h4 className="text-lg font-oswald font-bold mb-3 text-[#7AC699] uppercase tracking-wide">
              Company
            </h4>
            <ul className="font-manrope space-y-2 text-base text-white/80">
              <li>
                <Link 
                  href="/about-us" 
                  className="hover:text-[#7AC699] transition-colors duration-200 block"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link 
                  href="/careers" 
                  className="hover:text-[#7AC699] transition-colors duration-200 block"
                >
                  Apply
                </Link>
              </li>
              <li>
                <Link 
                  href="/aplicar" 
                  className="hover:text-[#7AC699] transition-colors duration-200 block"
                >
                  Aplicar
                </Link>
              </li>
              <li>
                <Link 
                  href="/service-quote" 
                  className="hover:text-[#7AC699] transition-colors duration-200 block"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources Column */}
          <div className="text-center md:text-left">
            <h4 className="text-lg font-oswald font-bold mb-3 text-[#7AC699] uppercase tracking-wide">
              Resources
            </h4>
            <ul className="font-manrope space-y-2 text-base text-white/80">
              <li>
                <Link 
                  href="/faq" 
                  className="hover:text-[#7AC699] transition-colors duration-200 block"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link 
                  href="/gift-certificates" 
                  className="hover:text-[#7AC699] transition-colors duration-200 block"
                >
                  Gift Certificates
                </Link>
              </li>
              <li>
                <Link 
                  href="/cleaning-tips" 
                  className="hover:text-[#7AC699] transition-colors duration-200 block"
                >
                  Cleaning Tips
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Contact and Social Section */}
<div className="flex flex-col md:flex-row items-center justify-between gap-6 py-6 border-t border-white/10">
  
  {/* Phone and Email - Left Side */}
  <div className="flex flex-col items-center md:items-start gap-3">
    {/* Phone */}
    <a 
      href="tel:+15122775364" 
      className="inline-flex items-center gap-2 text-lg font-oswald text-white hover:text-[#A9E5BB] transition"
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className="w-5 h-5 text-[#7AC699]" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth={2} 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <path d="M22 16.92v2.5a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.58 4.18 2 2 0 0 1 4.56 2h2.5a2 2 0 0 1 2 1.72c.1.74.27 1.46.5 2.15a2 2 0 0 1-.45 2.11L8.1 9.9a16 16 0 0 0 6 6l1.92-1.41a2 2 0 0 1 2.11-.45c.69.23 1.41.4 2.15.5A2 2 0 0 1 22 16.92Z" />
      </svg>
      <span>(512) 277-5364</span>
    </a>

    {/* Email */}
    <a 
      href="mailto:admin@impressyoucleaning.com" 
      className="inline-flex items-center gap-2 text-lg font-oswald text-white hover:text-[#A9E5BB] transition"
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className="w-5 h-5 text-[#7AC699]" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth={2} 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
      <span>admin@impressyoucleaning.com</span>
    </a>
  </div>

  {/* Social Icons - Right Side */}
  <div className="flex items-center gap-3">
    <SocialIcon 
      href="https://www.facebook.com/share/19vUj9gptf/?mibextid=wwXIfr" 
      label="Facebook"
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className="h-5 w-5" 
        viewBox="0 0 24 24" 
        fill="currentColor"
      >
        <path d="M22 12a10 10 0 1 0-11.5 9.9v-7h-2.5v-2.9h2.5V9.5c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.4h-1.2c-1.2 0-1.6.8-1.6 1.6v1.9h2.7l-.4 2.9h-2.3v7A10 10 0 0 0 22 12z" />
      </svg>
    </SocialIcon>
    
    <SocialIcon 
      href="https://instagram.com" 
      label="Instagram"
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className="h-5 w-5" 
        viewBox="0 0 24 24" 
        fill="currentColor"
      >
        <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm5 5a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm6.5-.8a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4z" />
      </svg>
    </SocialIcon>
  </div>

</div>
        {/* Copyright */}
        <div className="text-center pt-6 border-t border-white/10">
          <p className="text-sm text-white/80 font-manrope">
            &copy; {year} Impress Cleaning Services LLC. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
} 
