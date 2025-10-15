// src/app/aplicar/page.jsx
"use client";

import { useState } from "react";
import { CheckCircle2, Upload, MapPin, CalendarDays, Clock } from "lucide-react";

const FORM_ENDPOINT = ""; // add Formspree/Make endpoint later

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
      const res = await fetch(FORM_ENDPOINT, { method: "POST", body: new FormData(e.currentTarget) });
      res.ok ? setSent(true) : setError("No pudimos enviar tu solicitud. Intenta de nuevo.");
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
    } finally { setSending(false); }
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

  return (
    <>
      {/* badges like Molly Maid */}
      <section className="mb-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Badge icon={<MapPin className="w-4 h-4" />} text="Georgetown + Norte de Austin" />
        <Badge icon={<CalendarDays className="w-4 h-4" />} text="Tiempo completo o medio tiempo" />
        <Badge icon={<Clock className="w-4 h-4" />} text="Horarios de día — sin noches" />
      </section>

      <form onSubmit={onSubmit} className="bg-white rounded-xl ring-1 ring-slate-200 shadow-sm p-6 md:p-8" encType="multipart/form-data">
        <input type="text" name="empresa_oculta" className="hidden" tabIndex={-1} autoComplete="off" />

        <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Nombre" name="nombre" required />
          <Field label="Apellido" name="apellido" required />
          <Field label="Teléfono" name="telefono" type="tel" placeholder="(512) 555-1234" required />
          <Field label="Correo electrónico" name="email" type="email" placeholder="tu@correo.com" required />
          <Field label="Ciudad" name="ciudad" />
          <Field label="Código postal" name="zip" inputMode="numeric" />
        </fieldset>

        <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <Select label="Puesto de interés" name="puesto" options={["Limpieza residencial","Limpieza comercial","Supervisor/a"]} required />
          <Select label="Tipo de empleo" name="tipo_empleo" options={["Tiempo completo","Medio tiempo"]} required />
        </fieldset>

        <fieldset className="mt-6">
          <legend className="text-slate-900 font-medium mb-2">Disponibilidad</legend>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"].map((d)=>(
              <ChipCheck key={d} name="dias[]" value={d} label={d} />
            ))}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
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
          <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg ring-1 ring-slate-200 hover:ring-slate-300 cursor-pointer">
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

        {error && <p className="text-sm text-red-600 mt-3">{error}</p>}

        <div className="mt-6 flex items-center gap-3">
          <button type="submit" disabled={sending} className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60">
            {sending ? "Enviando…" : "Enviar solicitud"}
          </button>
          <a href="/" className="text-slate-600 hover:text-slate-900 text-sm">Cancelar</a>
        </div>
      </form>
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
