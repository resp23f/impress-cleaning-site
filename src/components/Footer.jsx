"use client";
import Link from "next/link";

function SocialIcon({ href, label, children }) {
  return (
    <Link
      href={href}
      aria-label={label}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full border transition hover:scale-[1.03] hover:bg-gray-50"
    >
      {children}
    </Link>
  );
}

export default function Footer() {
  const year = new Date().getFullYear();

  return (
<footer className="bg-[#0B2850] text-white py-12 px-6 md:px-12">
  <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
    {/* Contact */}
    <div>
      <h3 className="text-xl font-bold mb-3 text-white/90">
        Impress Cleaning Services LLC
      </h3>
      <p className="text-sm font-semibold mb-3 text-white/90">
        A clean home is an impressive home.
      </p>
<a
  href="tel:+15122775364"
  className="inline-flex items-center gap-2 text-lg font-semibold text-white hover:text-[#A9E5BB] transition"
>
  {/* phone icon (inline SVG) */}
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-5 h-5 text-[#00A86B]"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M22 16.92v2.5a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.58 4.18 2 2 0 0 1 4.56 2h2.5a2 2 0 0 1 2 1.72c.1.74.27 1.46.5 2.15a2 2 0 0 1-.45 2.11L8.1 9.9a16 16 0 0 0 6 6l1.92-1.41a2 2 0 0 1 2.11-.45c.69.23 1.41.4 2.15.5A2 2 0 0 1 22 16.92Z" />
  </svg>

  <span>(512) 277-5364</span>
</a>
              
      <div className="flex gap-3 mt-3">
            <div className="flex items-center gap-4 pt-2">
              
              <SocialIcon href="https://facebook.com" label="Facebook">
                {/* facebook */}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5"
                     viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22 12a10 10 0 1 0-11.5 9.9v-7h-2.5v-2.9h2.5V9.5
                    c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.4h-1.2
                    c-1.2 0-1.6.8-1.6 1.6v1.9h2.7l-.4 2.9h-2.3v7A10 10 0 0 0 22 12z"/>
                </svg>
              </SocialIcon>
              <SocialIcon href="https://instagram.com" label="Instagram">
                {/* instagram */}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5"
                     viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm5 5a5 5 0 1 0 0 10
                    5 5 0 0 0 0-10zm6.5-.8a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4z"/>
                </svg>
              </SocialIcon>
      </div>
    </div>
    </div>
    {/* Services */}
    <div>
      <h4 className="text-sm font-semibold mb-2 text-[#A9E5BB] uppercase tracking-wide">
        Services
      </h4>
      <ul className="space-y-1 text-sm text-white/80">
        <li>Residential</li>
        <li>Light Commercial</li>
      </ul>
    </div>

    {/* Company */}
    <div>
      <h4 className="text-sm font-semibold mb-2 text-[#A9E5BB] uppercase tracking-wide">
        Company
      </h4>
      <ul className="space-y-1 text-sm text-white/80">
        <li>Why Hire Us</li>
        <li>About Us</li>
        <li>Apply</li>
        <li>Applicar</li>
      </ul>
    </div>

    {/* Resources */}
    <div>
      <h4 className="text-sm font-semibold mb-2 text-[#A9E5BB] uppercase tracking-wide">
        Resources
      </h4>
      <ul className="space-y-1 text-sm text-white/80">
        <li>Cleaning Tips</li>
        <li>Gift Certificates</li>
      </ul>
    </div>
  </div>

  {/* Bottom disclaimer */}
  <div className="mt-10 border-t border-white/10 pt-6 text-center text-xs text-white/70">
    © {new Date().getFullYear()} Impress Cleaning Services LLC. All rights reserved.
  </div>
</footer>
  );
}
