import React from "react";

export default function FAQPage() {
  return (
    <main className="min-h-screen text-slate-800 bg-white">
      <section id="faq" className="mx-auto max-w-7xl px-4 py-20">
        <div className="max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">FAQ</h1>
          <p className="mt-3 text-slate-600">
            Common questions about our cleaning services, insurance, and scheduling.
          </p>

          <div className="mt-8 space-y-4">
            <FAQItem q="Are you insured and can you provide a COI?" a="Yes. We’re fully insured and can send a COI with your building listed as additional insured upon request." />
            <FAQItem q="Do you bring supplies and equipment?" a="Yes—commercial vacuums, microfiber, disinfectants, and restroom/kitchen supplies as needed." />
            <FAQItem q="How do you price office cleaning?" a="By scope and frequency. Walk us through your space and we’ll build a fixed monthly or per-visit rate with taxes shown up-front." />
            <FAQItem q="Can you start after hours?" a="Absolutely. Evenings and overnight are common. We work with alarms, fobs, and lockboxes." />
          </div>
        </div>
      </section>
    </main>
  );
}

function FAQItem({ q, a }) {
  return (
    <details className="rounded-2xl border border-slate-200 bg-white p-4 open:shadow-sm transition-all">
      <summary className="marker:content-[''] cursor-pointer font-medium">{q}</summary>
      <p className="mt-2 text-sm text-slate-600">{a}</p>
    </details>
  );
}
