"use client";
import Link from "next/link";
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

/* -------------------- Default site header (screenshot #1) -------------------- */
function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname() || "/";
  const active = useMemo(
    () => (href) => (pathname === href ? "text-emerald-700 font-semibold" : ""),
    [pathname]
  );

  return (
    <header className="sticky top-0 z-50 bg-white">
      <div className="mx-auto max-w-6xl px-4 pt-6">
        {/* Brand row */}
        <div className="flex items-start justify-between">
          <Link href="/" className="flex items-start gap-3">
            <img src="/sparkle.svg" alt="" className="w-6 h-6" />
            <div>
              <div className="font-brand text-3xl text-[#0B2850] tracking-wide">
                IMPRESS CLEANING SERVICES <span className="align-top text-[10px]">LLC</span>
              </div>
              <div className="text-slate-500 text-sm">A clean home is an impressive home.</div>
            </div>
          </Link>

          {/* Right utilities */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/en/aplicar" className="text-slate-800">Apply</Link>
            <span className="text-slate-300">|</span>
            <Link href="/aplicar" className="text-slate-800">Aplicar</Link>
            <span className="text-slate-300">|</span>
            <Link href="/#gift" className="text-slate-800">Gift Certificates</Link>

            <Link
              href="/#quote"
              className="rounded-xl bg-[#0B2850] text-white px-4 py-2 shadow"
            >
              Get a Free Quote
            </Link>
            <a
              href="tel:+15122775364"
              className="rounded-xl bg-[#0B2850] text-white px-4 py-2 shadow"
            >
              (512) 277-5364
            </a>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden text-slate-700"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            ☰
          </button>
        </div>

        {/* Tabs row */}
        <nav className="mt-6 hidden md:flex gap-10 text-slate-900 font-semibold">
          {NAV.map((i) => (
            <Link key={i.href} href={i.href} className={`hover:text-emerald-700 ${active(i.href)}`}>
              {i.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-slate-200 mt-4">
          <div className="px-4 py-3 flex flex-col gap-3">
            {NAV.map((i) => (
              <Link key={i.href} href={i.href} onClick={() => setOpen(false)} className="text-slate-900">
                {i.label}
              </Link>
            ))}
            <div className="h-px bg-slate-200 my-1" />
            <Link href="/en/aplicar" onClick={() => setOpen(false)}>Apply</Link>
            <Link href="/aplicar" onClick={() => setOpen(false)}>Aplicar</Link>
            <Link href="/#gift" onClick={() => setOpen(false)}>Gift Certificates</Link>
            <Link href="/#quote" onClick={() => setOpen(false)} className="rounded-xl bg-[#0B2850] text-white px-4 py-2 text-center">Get a Free Quote</Link>
            <a href="tel:+15122775364" className="rounded-xl bg-[#0B2850] text-white px-4 py-2 text-center"> (512) 277-5364</a>
          </div>
        </div>
      )}
    </header>
  );
}

/* -------------------- Jobs/aplicar header (screenshot #2) -------------------- */
function JobsHeader() {
  return (
    <header className="sticky top-0 z-50 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <img src="/sparkle.svg" alt="" className="w-6 h-6" />
          <div className="font-brand text-3xl text-[#0B2850] tracking-wide">
            IMPRESS CLEANING SERVICES<span className="text-[10px] align-top ml-1">LLC</span>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          <Link href="/en/aplicar" className="text-slate-800 underline underline-offset-4">
            English Site
          </Link>
          <Link
            href="/aplicar"
            className="rounded-xl bg-emerald-500 text-white px-4 py-2 shadow hover:scale-[1.01] transition"
          >
            Explora todos los empleos
          </Link>
        </div>
      </div>
    </header>
  );
}
