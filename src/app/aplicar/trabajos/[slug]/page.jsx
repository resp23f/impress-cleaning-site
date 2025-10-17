// src/app/aplicar/trabajos/[slug]/page.jsx
import Link from "next/link";
import { notFound } from "next/navigation";

/* ---- Minimal job catalog (edit/add as needed) ---- */
const JOBS = {
  "tecnico-de-limpieza": {
    titulo: "Técnico de Limpieza",
    ciudad: "Georgetown, TX",
    tipo: "Tiempo completo",
    pago: "$16–$20/hora + propinas",
    resumen:
      "Únete a un equipo estable con horarios de día, capacitación pagada y un ambiente respetuoso.",
    responsabilidades: [
      "Limpieza detallada de casas según checklist.",
      "Uso seguro de productos y equipos.",
      "Comunicación amable con clientes y compañeros.",
    ],
    requisitos: [
      "Actitud positiva y confiable.",
      "Licencia de conducir y transporte confiable preferidos.",
      "Capacidad para levantar hasta 25 lb.",
    ],
    beneficios: [
      "Pago semanal puntual",
      "Capacitación pagada",
      "Propinas/bonos",
      "Crecimiento interno",
    ],
    horario: "L–V, ~8:30 a 5:00 (sin noches).",
  },
  "supervisor-de-equipo": {
    titulo: "Supervisor de Equipo",
    ciudad: "Georgetown, TX",
    tipo: "Tiempo completo",
    pago: "$18–$22/hora + bonos",
    resumen:
      "Lidera un pequeño equipo, asegura calidad y sé el puente con la oficina.",
    responsabilidades: ["Conducir rutas y revisar calidad.", "Entrenar a nuevos integrantes.", "Resolver dudas de clientes."],
    requisitos: ["Experiencia en limpieza o liderazgo.", "Licencia y vehículo confiable.", "Buena comunicación."],
    beneficios: ["Pago semanal", "Bono desempeño", "Crecimiento"],
    horario: "L–V, ~8:00 a 5:30.",
  },
  "asistente-de-gerencia-de-operaciones": {
    titulo: "Asistente de Gerencia de Operaciones",
    ciudad: "Georgetown, TX",
    tipo: "Tiempo completo",
    pago: "$20–$24/h según experiencia",
    resumen:
      "Apoya programación, calidad y logística para que el equipo brille.",
    responsabilidades: ["Ayudar con rutas y horarios.", "Revisar calidad/feedback.", "Inventario de suministros."],
    requisitos: ["Organización impecable.", "Habilidad con apps/hojas de cálculo.", "Actitud de servicio."],
    beneficios: ["Pago semanal", "Capacitación pagada", "Crecimiento"],
    horario: "L–V, horario de oficina.",
  },
};

export function generateStaticParams() {
  return Object.keys(JOBS).map(slug => ({ slug }));
}

export async function generateMetadata({ params }) {
  const t = JOBS[params.slug];
  return t ? { title: `${t.titulo} — Impress Cleaning Services`, description: t.resumen } : {};
}

export default function Page({ params }) {
  const t = JOBS[params.slug];
  if (!t) return notFound();

  return (
    <div className="mx-auto max-w-5xl px-4 pb-24 pt-10">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-slate-600">
        <Link href="/" className="hover:underline">Inicio</Link>
        <span className="px-2">/</span>
        <Link href="/aplicar" className="hover:underline">Empleos</Link>
        <span className="px-2">/</span>
        <span className="font-semibold text-slate-800">{t.titulo}</span>
      </nav>

      {/* Header */}
<header className="rounded-2xl bg-white/80 ring-1 ring-slate-200 shadow-sm p-6 md:p-8 mb-8">
  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
    <div>
      <h1 className="font-brand text-3xl md:text-4xl text-[#0B2850]">
        {t.titulo}
      </h1>
      <p className="mt-2 text-slate-700">{t.ciudad}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Chip>{t.tipo}</Chip>
        <Chip>{t.pago}</Chip>
      </div>
      <p className="mt-4 max-w-2xl text-slate-700">{t.resumen}</p>
    </div>
  </div>
</header>

      {/* Details */}
      <section 
      id="form"
      className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card title="Responsabilidades"><List items={t.responsabilidades} /></Card>
          <Card title="Requisitos"><List items={t.requisitos} /></Card>
          <Card title="Horario"><p className="text-slate-700">{t.horario}</p></Card>
          <Card title="Beneficios">
            <div className="flex flex-wrap gap-2">{t.beneficios.map(b => <Chip key={b}>{b}</Chip>)}</div>
          </Card>
        </div>
        <aside className="lg:col-span-1">
          <div className="rounded-2xl bg-white/80 ring-1 ring-slate-200 shadow-sm p-6 sticky top-6">
            <h3 className="font-semibold text-slate-900 text-lg">¿Listo para aplicar?</h3>
            <p className="mt-2 text-slate-700">Completa el formulario y te contactamos.</p>
<a
  href="/aplicar/formulario"
  target="_blank"
  rel="noopener noreferrer"
  className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-emerald-600 px-4 py-2.5 font-semibold text-white hover:bg-emerald-700 transition"
>
  Aplicar Ahora
</a>

</div>
        </aside>
      </section>
    </div>
  );
}

/* small UI helpers */
function Chip({ children }) {
  return <span className="whitespace-nowrap rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-sm">{children}</span>;
}
function Card({ title, children }) {
  return <div className="rounded-2xl bg-white/80 ring-1 ring-slate-200 shadow-sm p-6"><h2 className="font-brand text-2xl text-[#0B2850]">{title}</h2><div className="mt-4 text-slate-700">{children}</div></div>;
}
function List({ items }) {
  return <ul className="list-disc pl-5 space-y-2 text-slate-700">{items.map((it, i) => <li key={i}>{it}</li>)}</ul>;
}
function Field({ label, name, type="text", as, rows=3, className="", ...rest }) {
  const Tag = as === "textarea" ? "textarea" : "input";
  return (
    <div className={className}>
      <label htmlFor={name} className="block text-sm font-medium text-slate-800">{label}</label>
      <Tag id={name} name={name} type={as === "textarea" ? undefined : type} rows={as === "textarea" ? rows : undefined}
           className="mt-2 block w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500" {...rest} />
    </div>
  );
}
