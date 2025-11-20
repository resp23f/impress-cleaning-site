"use client";
import Link from "next/link";
import Image from "next/image";

function SocialIcon({ href, label, children }) {
  return (
    <a
      href={href}
      aria-label={label}
      className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-slate-200 transition-all duration-300 hover:scale-105 hover:bg-[#079447] [&>svg]:hover:text-white"
    >
      {children}
    </a>
  );
}

export default function Footer() {
  const year = new Date().getFullYear();
  
  return (
    <footer className="relative z-10 bg-gray-50 text-slate-700 py-16 px-6 md:px-8 border-t-2 border-[#079447]">
      <div className="max-w-7xl mx-auto">
        
        {/* Top Section - Logo and Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          {/* Logo and Company Info */}
          <div className="md:col-span-1 flex flex-col items-center md:items-start">
            <Link href="/" className="mb-3">
              <Image
                src="/logo_impress_green.png"
                alt="Impress Cleaning Services"
                width={220}
                height={132}
                className="w-auto h-20 md:h-24"
              />
            </Link>
            <p className="font-playfair italic text-sm text-slate-600 text-center md:text-left">
              Impress Every Time<sup className="text-[10px]">®</sup>
            </p>
          </div>

          {/* Services Column */}
          <div className="text-center md:text-left">
            <h4 className="text-xs font-oswald font-semibold mb-4 text-slate-500 uppercase tracking-widest">
              Services
            </h4>
            <ul className="font-manrope space-y-3 text-sm text-slate-700">
              <li>
                <Link 
                  href="/residential-section" 
                  className="hover:text-[#079447] transition-colors duration-200 block"
                >
                  Residential
                </Link>
              </li>
              <li>
                <Link 
                  href="/commercial" 
                  className="hover:text-[#079447] transition-colors duration-200 block"
                >
                  Commercial
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Column */}
          <div className="text-center md:text-left">
            <h4 className="text-xs font-oswald font-semibold mb-4 text-slate-500 uppercase tracking-widest">
              Company
            </h4>
            <ul className="font-manrope space-y-3 text-sm text-slate-700">
              <li>
                <Link 
                  href="/about-us" 
                  className="hover:text-[#079447] transition-colors duration-200 block"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link 
                  href="/careers" 
                  className="hover:text-[#079447] transition-colors duration-200 block"
                >
                  Apply
                </Link>
              </li>
              <li>
                <Link 
                  href="/aplicar" 
                  className="hover:text-[#079447] transition-colors duration-200 block"
                >
                  Aplicar
                </Link>
              </li>
              <li>
                <Link 
                  href="/service-quote" 
                  className="hover:text-[#079447] transition-colors duration-200 block"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources Column */}
          <div className="text-center md:text-left">
            <h4 className="text-xs font-oswald font-semibold mb-4 text-slate-500 uppercase tracking-widest">
              Resources
            </h4>
            <ul className="font-manrope space-y-3 text-sm text-slate-700">
              <li>
                <Link 
                  href="/faq" 
                  className="hover:text-[#079447] transition-colors duration-200 block"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link 
                  href="/gift-certificates" 
                  className="hover:text-[#079447] transition-colors duration-200 block"
                >
                  Gift Certificates
                </Link>
              </li>
              <li>
                <Link 
                  href="/cleaning-tips" 
                  className="hover:text-[#079447] transition-colors duration-200 block"
                >
                  Cleaning Tips
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Contact and Social Section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 py-8 border-t border-slate-300">
          
          {/* Contact Info - Left Side */}
          <div className="flex flex-col items-center md:items-start gap-4">
            {/* Office Phone */}
            <a 
              href="tel:+15122775364" 
              className="inline-flex items-center gap-3 text-base font-manrope text-slate-700 hover:text-[#079447] transition group"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="w-5 h-5 text-[#079447] group-hover:scale-110 transition-transform" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth={2} 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M22 16.92v2.5a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.58 4.18 2 2 0 0 1 4.56 2h2.5a2 2 0 0 1 2 1.72c.1.74.27 1.46.5 2.15a2 2 0 0 1-.45 2.11L8.1 9.9a16 16 0 0 0 6 6l1.92-1.41a2 2 0 0 1 2.11-.45c.69.23 1.41.4 2.15.5A2 2 0 0 1 22 16.92Z" />
              </svg>
              <div className="flex flex-col">
                <span className="text-xs text-slate-500 font-medium">Office</span>
                <span className="font-semibold">(512) 277-5364</span>
              </div>
            </a>

            {/* Mobile Phone */}
            <a 
              href="tel:+15127382642" 
              className="inline-flex items-center gap-3 text-base font-manrope text-slate-700 hover:text-[#079447] transition group"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="w-5 h-5 text-[#079447] group-hover:scale-110 transition-transform" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth={2} 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
                <line x1="12" y1="18" x2="12.01" y2="18"/>
              </svg>
              <div className="flex flex-col">
                <span className="text-xs text-slate-500 font-medium">Mobile</span>
                <span className="font-semibold">(512) 738-2642</span>
              </div>
            </a>

            {/* Email */}
            <a 
              href="mailto:admin@impressyoucleaning.com" 
              className="inline-flex items-center gap-3 text-base font-manrope text-slate-700 hover:text-[#079447] transition group"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="w-5 h-5 text-[#079447] group-hover:scale-110 transition-transform" 
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
              <span className="font-medium">admin@impressyoucleaning.com</span>
            </a>
          </div>

          {/* Social Icons - Right Side */}
          <div className="flex items-center gap-3">
            {/* Facebook */}
            <SocialIcon 
              href="https://www.facebook.com/share/19vUj9gptf/?mibextid=wwXIfr" 
              label="Facebook"
            >
              <svg className="h-5 w-5 text-slate-700" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </SocialIcon>
            
            {/* Instagram */}
            <SocialIcon 
              href="https://instagram.com" 
              label="Instagram"
            >
              <svg className="h-5 w-5 text-slate-700" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </SocialIcon>

            {/* Nextdoor */}
            <SocialIcon 
              href="#" 
              label="Nextdoor"
            >
              <svg className="h-5 w-5 text-slate-700" fill="currentColor" viewBox="0 0 24 24">
                <path d="M.029,12.775c0-3.421,2.663-6.19,5.948-6.19c1.056,0,2.042.271,2.905.747V3.641c0-.218.094-.423.257-.56 l5.257-4.428c.146-.123.331-.19.523-.19s.377.067.523.19l5.257,4.428c.163.137.257.342.257.56v3.691 c.863-.476,1.85-.747,2.905-.747c3.285,0,5.948,2.769,5.948,6.19c0,3.42-2.663,6.19-5.948,6.19c-1.904,0-3.595-.93-4.685-2.37 l-2.477,5.076c-.098.201-.302.329-.525.329s-.427-.128-.525-.329l-2.477-5.076c-1.09,1.44-2.781,2.37-4.685,2.37 C2.692,18.965.029,16.196.029,12.775z M5.977,8.585c-2.233,0-4.035,1.876-4.035,4.19s1.802,4.19,4.035,4.19 c1.624,0,3.007-.999,3.657-2.438l-2.479-5.082c-.098-.201-.302-.329-.525-.329s-.427.128-.525.329L4.196,13.29h1.782 c-.194-.417-.302-.881-.302-1.371C5.676,10.419,7.479,8.585,5.977,8.585z"/>
              </svg>
            </SocialIcon>

            {/* Yelp */}
            <SocialIcon 
              href="#" 
              label="Yelp"
            >
              <svg className="h-5 w-5 text-slate-700" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21.111 18.226c-.141.969-2.119 3.483-3.029 3.847-.311.124-.611.094-.85-.09-.154-.12-.314-.365-2.447-3.827l-.633-1.032c-.244-.37-.199-.857.104-1.229.297-.365.816-.525 1.229-.39l1.733.521c3.764 1.015 3.86 1.065 3.999 1.156.384.242.523.666.394 1.044zm-1.732-7.81c-.17.096-.293.154-3.968 1.387l-1.669.554c-.459.132-.932-.043-1.224-.409-.289-.365-.311-.887-.051-1.242l.831-.992c2.579-3.113 2.745-3.334 2.945-3.449.402-.229.867-.143 1.159.207.11.137 2.192 2.851 2.214 3.816.002.385-.176.75-.437.895v.001zM11.658 20.682c-.526.01-3.592-.143-4.382-.665-.27-.174-.418-.428-.415-.721.002-.168.063-.337 1.817-3.823l.524-1.05c.201-.402.663-.654 1.134-.617.471.035.922.365 1.074.826l.617 1.632c1.485 3.872 1.518 3.969 1.518 4.145-.001.44-.243.791-.679.973-.12.049-.293.095-.494.127-.123.019-.413.044-.714.046v.127zm-7.747-3.498c-.194.33-.53.531-.894.533-.426.002-.854-.18-1.017-.543-.067-.15-.984-2.328-1.013-3.355-.011-.368.161-.722.456-.911.136-.087.28-.137 3.977-1.354l1.672-.567c.428-.108.893.064 1.173.423.28.359.304.837.064 1.205l-.849 1.004c-2.589 3.098-2.752 3.315-2.899 3.459l.33.106zm8.989-11.764c.003.417-.242.82-.665 1.079-.139.085-.276.134-3.828 1.758l-1.623.739c-.396.178-.868.087-1.19-.225-.322-.311-.449-.774-.32-1.16l.41-1.627c1.096-3.878 1.142-3.97 1.257-4.108.286-.336.746-.448 1.158-.283.162.063 3.262 1.906 3.634 2.563.148.261.17.59.167.894v.37z"/>
              </svg>
            </SocialIcon>

            {/* Google */}
            <SocialIcon 
              href="#" 
              label="Google"
            >
              <svg className="h-5 w-5 text-slate-700" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            </SocialIcon>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center pt-6 border-t border-slate-300">
          <p className="text-xs text-slate-500 font-manrope">
            &copy; {year} Impress Cleaning Services LLC. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}