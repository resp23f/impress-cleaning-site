// src/app/aplicar/page.jsx
"use client";

import { useState } from "react";
import { CheckCircle2, Upload, MapPin, CalendarDays, Clock } from "lucide-react";
import {
  CurrencyDollarIcon,
  SunIcon,
  AcademicCapIcon,
  UsersIcon,
  HeartIcon,
  ChartBarIcon,
} from "@heroicons/react/24/solid";



const FORM_ENDPOINT = "https://formspree.io/f/mrbyrngw"

export default function Page() {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setError(""); setSending(true);

    const hp = e.currentTarget.elements.namedItem("empresa_oculta")?.value || "";
    if (hp) { setSending(false); return; }

    if (!FORM_ENDPOINT) {
      setTimeout(() => { setSending(false); setSent(true); }, 600);
      return;
    }
try {
  const formData = new FormData(e.currentTarget);
  formData.append("_subject", "Nueva solicitud de empleo - Impress Cleaning");

  const res = await fetch(FORM_ENDPOINT, {
    method: "POST",
    body: formData,
    headers: { Accept: "application/json" },
  });

  if (res.ok) {
    setSent(true);
  } else {
    setError("No pudimos enviar tu solicitud. Intenta de nuevo.");
  }
} catch (err) {
  setError("Error de conexión. Intenta de nuevo.");
} finally {
  setSending(false);
}

  if (sent) {
    return (
      <div className="bg-white rounded-xl ring-1 ring-slate-200 shadow-sm p-6 md:p-8">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-6 h-6 text-emerald-600" />
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">¡Solicitud enviada!</h2>
            <p className="text-slate-600 mt-1">Te contactaremos en 1–2 días hábiles.</p>
          </div>
        </div>
        <a href="/" className="inline-flex mt-6 px-4 py-2 rounded-lg ring-1 ring-slate-200 hover:ring-slate-300">
          Volver al inicio
        </a>
      </div>
    );
  }
  }

return (
  <>
  {/* ===== TOP HEADER (Molly-style) ===== */}
<header className="relative z-50 bg-[linear-gradient(to_bottom,#FFFFFF,#FFFDF8)] border-b border-slate-100">
  <div className="w-full flex items-center gap-8 px-2 md:px-6 py-4 md:py-5">
    {/* --- Left: Brand logo --- */}
    <a href="/" className="flex items-center gap-3">
      <img
        src="/sparkle.svg" // your sparkle mark or replace with your logo image
        alt="Impress Cleaning logo"
        className="h-7 w-7"
      />
      <div className="flex flex-col leading-tight scale-[1.15] md:scale-[1.25] ml-2 md:ml-8">
        <span className="font-brand uppercase text-[#0B2850] text-2xl font-black tracking-wide">
          Impress Cleaning Services <span className="relative top-[1px] -ml-[6px] text-[11px] font bold md:text-[11px] font-medium tracking-tight">LLC</span>
        </span>
        <span className="text-[11px] text-[#0B2850]/80 uppercase tracking-[0.08em]">
          A clean home is an impressive home.
        </span>
      </div>
    </a>

    {/* --- Center/Right: Nav links --- */}
    <nav className="hidden md:flex items-center gap-10 text-[16px] text-[#0B2850] font-medium ml-auto">
      <a href="/careers" className="hover:text-emerald-700">
        Carreras
      </a>
      <a href="/aplicar" className="hover:text-emerald-700">
        Empleos de limpieza profesional
      </a>
      <a href="/oficina" className="hover:text-emerald-700">
        Empleos de oficina
      </a>
      <a href="/english" className="hover:text-emerald-700">
        English Site
      </a>

      {/* --- CTA Button --- */}
      <a
        href="#aplicar-form"
        className="rounded-lg bg-gradient-to-r from-green-300 via-emerald-300 to-green-400
             px-6 py-3 text-white font-semibold shadow-md hover:shadow-lg
             hover:from-green-400 hover:to-emerald-400 transition"
      >
        Explora todos los empleos
      </a>
    </nav>

    {/* --- Mobile menu placeholder (optional) --- */}
    <button
      type="button"
      className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-[#0B2850] hover:bg-slate-100"
      aria-label="Open menu"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="2"
        stroke="currentColor"
        className="h-6 w-6"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>
  </div>
</header>
{/* ===== HERO (refined) ===== */}
<section className="relative isolate overflow-hidden">
  {/* image height */}
  <div className="h-[52vh] md:h-[68vh] lg:h-[72vh]">
    {/* background image */}
    <img
      src="/careers-hero.jpg"
      alt="Equipo de limpieza profesional"
      className="absolute inset-0 h-full w-full object-cover object-[50%_28%]"
    />

    {/* content container */}
    <div className="relative z-10 mx-auto flex h-full max-w-6xl items-end md:items-center px-4 md:px-6 lg:px-8">
      <div
        className="inline-block rounded-xl bg-[#123a7c]/55 ring-1 ring-white/10
             backdrop-blur-sm px-9 py-9 sm:px-8 sm:py-6 shadow-[0_10px_30px_rgba(0,0,0,0.25)]
             translate-y-20 md:translate-y-45 max-w-2xl w-full text-center space-y-10 -translate-x-8 md:-translate-x-60"
      >
        <h1 className="text-white font-[Playfair_Display] font-bold leading-tight tracking-tight 
               text-3xl sm:text-5xl md:text-5xl">
          EMPLEOS EN IMPRESS CLEANING SERVICES
        </h1>
        <p className="mt-2 text-white/85 text-sm md:text-base">
        </p>

        <a
          href="#aplicar-form"
          className="mt-1 mx-auto flex items-center justify-center rounded-xl
             bg-gradient-to-r from-green-300 via-emerald-300 to-green-400
             px-6 py-3 text-white font-semibold shadow-md hover:shadow-lg
             hover:from-green-400 hover:to-emerald-400 transition"
        >
          Ver empleos disponibles
        </a>
      </div>
    </div>
  </div>

  {/* gentle fade into page background so the next section doesn’t feel chopped */}
  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-b from-transparent to-[#FFFDF8]/70" />

</section>
{/* ===== OPPORTUNITY SECTION ===== */}
<section className="bg-[#FFFDF8] py-24">
  <div className="max-w-9xl px-6 md:px-12 text-left ml-[8%]">
    <h2 className="text-4xl md:text-5xl font-[Playfair_Display] font-bold text-slate-800 mb-6 tracking-wide">
      UN TRABAJO LIMPIO, UN FUTURO IMPRESIONANTE.
    </h2>
    <p className="text-slate-600 text-lg leading-relaxed">
      En Impress Cleaning creemos que un buen trabajo empieza con un gran equipo. 
  Aquí encontrarás un ambiente positivo, horarios flexibles y la oportunidad de crecer mientras ayudas a que cada hogar brille. 
  Nos enorgullece trabajar con personas dedicadas, alegres y con atención al detalle — 
  porque cuando nuestros clientes sonríen, nosotros también.
    </p>
  </div>
</section>

{/* BEGIN Why Work Here */}
<section className="mb-10">
<div className="max-w-9xl px-6 md:px-12 text-center mx-auto">
  </div>

  <h2 className="text-4xl md:text-4xl font-[Playfair_Display] font-bold text-slate-800 mb-6 tracking-wide text-center">
    ¿Por qué trabajar aquí?
  </h2>
  <p className="mt-2 text-slate-600 text-md leading-relaxed">
  </p>

<div className="max-w-8xl mx-auto px-4 md:px-8">
  <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">    
    
    {/* 1 */}
    <li className="bg-white rounded-xl ring-1 ring-slate-200 shadow-sm p-5 hover:shadow-md transition">
      <div className="flex items-center gap-3">
<span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-[#0B2850]/5">
  <CurrencyDollarIcon className="w-5 h-5 text-[#0B2850]" />
</span>
        <div>
          <h3 className="font-semibold text-slate-900">Buen pago por un buen trabajo</h3>
          <p className="text-sm text-slate-600 mt-1">En Impress Cleaning creemos en pagar justamente por un trabajo bien hecho. Ofrecemos un salario competitivo, pagos puntuales y reconocemos el esfuerzo extra cuando alguien da lo mejor de sí.</p>
        </div>
      </div>
    </li>

    {/* 2 */}
    <li className="bg-white rounded-xl ring-1 ring-slate-200 shadow-sm p-5 hover:shadow-md transition">
      <div className="flex items-center gap-3">
<span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[#0B2850]/5">
  <SunIcon className="w-5 h-5 text-[#0B2850]" />
</span>
        <div>
          <h3 className="font-semibold text-slate-900">Horarios de día y tiempo para ti</h3>
          <p className="text-sm text-slate-600 mt-1">Nada de turnos nocturnos ni fines de semana interminables. Aquí trabajas de día, con tiempo para tu familia, tus planes y el descanso que te mereces. Queremos que tu vida laboral y personal estén en balance.</p>
        </div>
      </div>
    </li>

    {/* 3 */}
    <li className="bg-white rounded-xl ring-1 ring-slate-200 shadow-sm p-5 hover:shadow-md transition">
      <div className="flex items-center gap-3">
<span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[#0B2850]/5">
  <AcademicCapIcon className="w-5 h-5 text-[#0B2850]" />
</span>
        <div>
          <h3 className="font-semibold text-slate-900">Capacitación sencilla y pagada</h3>
          <p className="text-sm text-slate-600 mt-1">Nos encargamos de enseñarte todo lo que necesitas para sentirte cómodo desde el primer día. Aprendes mientras trabajas, y te pagamos por ello. No importa si es tu primer empleo o ya tienes experiencia: aquí crecerás rápido.</p>
        </div>
      </div>
    </li>

    {/* 4 */}
    <li className="bg-white rounded-xl ring-1 ring-slate-200 shadow-sm p-5 hover:shadow-md transition">
      <div className="flex items-center gap-3">
<span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[#0B2850]/5">
  <UsersIcon className="w-5 h-5 text-[#0B2850]" />
</span>
        <div>
          <h3 className="font-semibold text-slate-900">Un equipo con historia</h3>
          <p className="text-sm text-slate-600 mt-1">Llevamos más de 20 años limpiando hogares en el centro de Texas, y muchos de nuestros empleados han estado con nosotros por años. Somos un equipo pequeño, estable y de confianza, donde todos nos cuidamos mutuamente.</p>
        </div>
      </div>
    </li>

    {/* 5 */}
    <li className="bg-white rounded-xl ring-1 ring-slate-200 shadow-sm p-5 hover:shadow-md transition">
      <div className="flex items-center gap-3">
<span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[#0B2850]/5">
  <HeartIcon className="w-5 h-5 text-[#0B2850]" />
</span>
        <div>
          <h3 className="font-semibold text-slate-900">Seguro médico y apoyo real</h3>
          <p className="text-sm text-slate-600 mt-1">Tu bienestar importa tanto como el de nuestros clientes. Ofrecemos seguro de salud y un ambiente de trabajo seguro, respetuoso y sin presiones innecesarias. Queremos que te sientas bien dentro y fuera del trabajo.</p>
        </div>
      </div>
    </li>

    {/* 6 */}
    <li className="bg-white rounded-xl ring-1 ring-slate-200 shadow-sm p-5 hover:shadow-md transition">
      <div className="flex items-center gap-3">
<span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[#0B2850]/5">
  <ChartBarIcon className="w-5 h-5 text-[#0B2850]" />
</span>
        <div>
          <h3 className="font-semibold text-slate-900">Crecimiento a tu ritmo</h3>
          <p className="text-sm text-slate-600 mt-1">Si te gusta aprender, aquí siempre hay espacio para avanzar. Muchos de nuestros líderes empezaron como parte del equipo de limpieza. Con constancia y buena actitud, puedes construir una carrera estable con nosotros.</p>
        </div>
      </div>
    </li>
  </ul>
        </div>

</section>
{/* END Why Work Here */}


    {/* ===== WRAPPER ===== */}
    <section className="mx-auto max-w-6xl px-4 md:px-6 lg:px-8">
      {/* badges row */}
      <div className="mt-6 mb-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Badge icon={<MapPin className="w-4 h-4" />} text="Georgetown + Norte de Austin" />
        <Badge icon={<CalendarDays className="w-4 h-4" />} text="Tiempo completo o medio tiempo" />
        <Badge icon={<Clock className="w-4 h-4" />} text="Horarios de día — sin noches" />
      </div>

      {/* form card */}
      <div id="aplicar-form" className="bg-white rounded-2xl ring-1 ring-slate-200 shadow-sm">
        <div className="border-b border-slate-200 px-6 md:px-8 py-5">
          <h2 className="text-xl md:text-2xl font-semibold text-slate-900">Solicitud de empleo</h2>
          <p className="text-slate-600 text-sm mt-1">
            Completa el formulario y te contactaremos en 1–2 días hábiles.
          </p>
        </div>

        <form onSubmit={onSubmit} className="px-6 md:px-8 py-6" encType="multipart/form-data">
          <input type="text" name="empresa_oculta" className="hidden" tabIndex={-1} autoComplete="off" />

          <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Nombre" name="nombre" required />
            <Field label="Apellido" name="apellido" required />
            <Field label="Teléfono" name="telefono" type="tel" placeholder="(512) 555-1234" required />
            <Field label="Correo electrónico" name="email" type="email" placeholder="tu@correo.com" required />
            <Field label="Ciudad" name="ciudad" />
            <Field label="Código postal" name="zip" inputMode="numeric" />
          </fieldset>

          <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
            <Select label="Puesto de interés" name="puesto" options={["Limpieza residencial","Limpieza comercial","Supervisor/a"]} required />
            <Select label="Tipo de empleo" name="tipo_empleo" options={["Tiempo completo","Medio tiempo"]} required />
          </fieldset>

          <fieldset className="mt-6">
            <legend className="text-slate-900 font-medium mb-2">Disponibilidad</legend>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
              {["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"].map((d)=>(
                <ChipCheck key={d} name="dias[]" value={d} label={d} />
              ))}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 max-w-sm">
              <ChipCheck name="horario[]" value="Mañana" label="Mañana" />
              <ChipCheck name="horario[]" value="Tarde" label="Tarde" />
            </div>
          </fieldset>

          <fieldset className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select label="¿Tienes transporte propio?" name="transporte" options={["Sí","No"]} required />
            <Select label="¿Autorizado/a para trabajar en EE. UU.?" name="autorizado" options={["Sí","No"]} required />
          </fieldset>

          <fieldset className="mt-6 grid grid-cols-1 gap-4">
            <TextArea label="Experiencia relevante" name="experiencia" placeholder="Años de experiencia, tipos de espacios, productos, etc." />
            <TextArea label="Referencias (opcional)" name="referencias" placeholder="Nombre, relación y teléfono/correo." />
          </fieldset>

          <fieldset className="mt-6">
            <label className="block text-sm font-medium text-slate-900 mb-2">Sube tu CV (PDF o DOC)</label>
            <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg ring-1 ring-slate-200 hover:ring-slate-300 cursor-pointer bg-white">
              <Upload className="w-4 h-4" />
              <span>Elegir archivo</span>
              <input name="cv" type="file" accept=".pdf,.doc,.docx" className="hidden" />
            </label>
            <p className="text-xs text-slate-500 mt-1">Máx. 10 MB.</p>
          </fieldset>

          <div className="mt-6 flex items-start gap-2">
            <input id="consent" name="consent" type="checkbox" required className="mt-1 w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-600" />
            <label htmlFor="consent" className="text-sm text-slate-700">
              Acepto que Impress Cleaning me contacte por teléfono o correo sobre mi solicitud.
            </label>
          </div>

          {error && <p className="text-sm text-rose-600 mt-3">{error}</p>}

          <div className="mt-6 flex items-center gap-3">
            <button type="submit" disabled={sending} className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60">
              {sending ? "Enviando…" : "Enviar solicitud"}
            </button>
            <a href="/" className="text-slate-600 hover:text-slate-900 text-sm">Cancelar</a>
          </div>
        </form>
      </div>
    </section>
  </>
);
}
/* ——— small UI helpers ——— */
function Field({ label, name, type="text", placeholder="", inputMode, required }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-slate-900">{label}</span>
      <input name={name} type={type} placeholder={placeholder} inputMode={inputMode} required={required}
        className="mt-1 w-full rounded-lg ring-1 ring-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-600" />
    </label>
  );
}
function TextArea({ label, name, placeholder="" }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-slate-900">{label}</span>
      <textarea name={name} placeholder={placeholder} rows={4}
        className="mt-1 w-full rounded-lg ring-1 ring-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-600" />
    </label>
  );
}
function Select({ label, name, options=[], required }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-slate-900">{label}</span>
      <div className="relative mt-1">
        <select name={name} required={required}
          className="appearance-none w-full rounded-lg ring-1 ring-slate-200 bg-white px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-emerald-600">
          <option value="">Selecciona una opción</option>
          {options.map((o)=> (<option key={o} value={o}>{o}</option>))}
        </select>
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">▾</span>
      </div>
    </label>
  );
}
function ChipCheck({ name, value, label }) {
  const id = `${name}-${value}`;
  return (
    <label htmlFor={id} className="cursor-pointer">
      <input id={id} name={name} value={value} type="checkbox" className="peer sr-only" />
      <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full ring-1 ring-slate-200 bg-white text-slate-700 peer-checked:ring-emerald-600 peer-checked:bg-emerald-50">
        <span className="block w-1.5 h-1.5 rounded-full bg-emerald-600" />
        {label}
      </span>
    </label>
  );
}
function Badge({ icon, text }) {
  return (
    <div className="bg-white rounded-full ring-1 ring-slate-200 shadow-sm px-4 py-2 text-sm text-slate-700 flex items-center gap-2">
      <span className="text-emerald-600">{icon}</span>
      <span className="whitespace-nowrap">{text}</span>
    </div>
  );
}
