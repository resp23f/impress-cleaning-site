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
        >(512) 277-5364</a>
        </div>

{/* MOBILE NAV (phones & small tablets) — desktop untouched */}
<div className="md:hidden px-4 pb-2 border-b border-slate-200/70">
<nav
className="
    flex flex-wrap items-center
    gap-x-4 gap-y-2
    text-[13px] font-semibold text-slate-900">

{/* primary */}
<a href="#residential" className="py-1.5">Residential</a>
<a href="#commercial"  className="py-1.5">Commercial</a>
<a href="#why"         className="py-1.5">Why Hire Us</a>
<a href="#about"       className="py-1.5">About Us</a>
<a href="#faq"         className="py-1.5">FAQ</a>

{/* utilities */}
<Link href="/en/aplicar" className="py-1.5">Apply</Link>
<Link href="/aplicar"    className="py-1.5">Aplicar</Link>
<a   href="/#gift"       className="py-1.5">Gift Certificates</a>

{/* compact phone CTA sticks to right when there’s room */}
<a
    href="tel:+15122775364"
    className="ml-auto rounded-lg bg-[#0B2850] px-3 py-1.5 text-white">
    (512) 277-5364</a>
</nav>
</div>
</div>
</div>
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
