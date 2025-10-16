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
<footer className="mt-20 border-t border-slate-200">
        {/* Top section: brand + columns */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid grid-cols-1 gap-8 py-10 md:grid-cols-4">
          {/* Brand column */}
          <div className="space-y-4">
            {/* Replace with your logo */}
            <div className="text-2xl font-bold">
              <span className="align-[-2px]">Impress Cleaning Services</span>{" "}
              <span className="text-[#0B2850]">LLC</span>
            </div>

            <a
              href="tel:(512)277-5364"
              className="inline-flex items-center gap-2 text-lg font-semibold text-primary"
            >
              {/* phone icon (inline SVG for no extra deps) */}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5"
                   viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2
                  19.86 19.86 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6
                  A19.86 19.86 0 0 1 2.08 4.18 2 2 0 0 1 4.06 2h3
                  a2 2 0 0 1 2 1.72c.12.9.33 1.77.62 2.6a2 2 0 0 1-.45 2.11L8.1 9.9
                  a16 16 0 0 0 6 6l1.47-1.13a2 2 0 0 1 2.11-.45
                  c.83.29 1.7.5 2.6.62A2 2 0 0 1 22 16.92z"/>
              </svg>
              (512) 277-5364
            </a>

            <div className="flex items-center gap-3 pt-2">
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

          {/* Column 1 */}
          <div>
            <h3 className="mb-3 text-sm font-semibold tracking-wide">SERVICES</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/services/house-cleaning" className="hover:underline">Residential</Link></li>
              <li><Link href="/services/commercial" className="hover:underline">Light Commercial</Link></li>
            </ul>
          </div>

          {/* Column 2 */}
          <div>
            <h3 className="mb-3 text-sm font-semibold tracking-wide">COMPANY</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/why-us" className="hover:underline">Why Hire Us</Link></li>
              <li><Link href="/about" className="hover:underline">About Us</Link></li>
              <li><Link href="/contact" className="hover:underline">Contact Us</Link></li>
              <li><Link href="/apply" className="hover:underline">Apply Locally</Link></li>
              <li><Link href="aplicar" className="hover:underline">Aplicar Localmente</Link></li>
            </ul>
          </div>

          {/* Column 3 */}
          <div>
            <h3 className="mb-3 text-sm font-semibold tracking-wide">RESOURCES</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/blog" className="hover:underline">Cleaning Tips</Link></li>
              <li><Link href="/locations" className="hover:underline">Our Locations</Link></li>
              <li><Link href="/sitemap" className="hover:underline">Site Map</Link></li>
              <li><Link href="/gift-cards" className="hover:underline">Gift Certificates</Link></li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px w-full bg-[#FFFDF8]" />

        {/* Disclaimer */}
        <div className="py-6 text-center text-xs leading-5 text-slate-600">
          This information is for general purposes only. Each location is independently owned and operated.
          Services may vary by location. Contact your local office for details.
        </div>
      </div>

      {/* Bottom bar */}
      <div className="bg-[#FFFDF8]">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-4 text-xs text-gray-600 sm:flex-row sm:px-6">
          <div className="flex flex-wrap items-center gap-4">
<Link href="/terms" className="hover:text-slate-900">Terms of Use</Link>
            <Link href="/privacy" className="hover:text-slate-900">Privacy Policy</Link>
            <Link href="/accessibility" className="hover:text-slate-900">Accessibility</Link>
            <Link href="/do-not-sell" className="hover:text-slate-900">Do Not Sell My Info</Link>
            <Link href="/your-privacy-rights" className="hover:text-slate-900">Your Privacy Rights</Link>          </div>
          <div>© {year} Impress Cleaning Services LLC. All rights reserved.</div>
        </div>
      </div>
    </footer>
  );
}
