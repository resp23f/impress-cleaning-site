// src/app/aplicar/formulario/page.jsx
export const metadata = {
title: "Formulario de Aplicación — Impress Cleaning Services",
};

export default function Page() {
return (
<div className="mx-auto max-w-3xl px-4 py-16">
    <h1 className="font-brand text-3xl text-[#0B2850] mb-8">
    Formulario de Aplicación
    </h1>

    <form
    action="https://formspree.io/f/your-impress-endpoint" // ⟵ replace with your Formspree endpoint
    method="POST"
    encType="multipart/form-data"
    className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white/80 ring-1 ring-slate-200 rounded-2xl shadow-sm p-6 md:p-8"
    >
    <label className="block text-sm font-medium text-slate-800">
        Nombre completo
        <input
        type="text"
        name="nombre"
        required
        className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:ring-2 focus:ring-emerald-600"
        />
    </label>

    <label className="block text-sm font-medium text-slate-800">
        Teléfono
        <input
        type="tel"
        name="telefono"
        required
        className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:ring-2 focus:ring-emerald-600"
        />
    </label>

    <label className="md:col-span-2 block text-sm font-medium text-slate-800">
        Email
        <input
        type="email"
        name="email"
        required
        className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:ring-2 focus:ring-emerald-600"
        />
    </label>

    <label className="md:col-span-2 block text-sm font-medium text-slate-800">
        Experiencia relevante
        <textarea
        name="experiencia"
        rows="4"
        className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:ring-2 focus:ring-emerald-600"
        />
    </label>

    <label className="md:col-span-2 block text-sm font-medium text-slate-800">
        Adjuntar CV (opcional)
        <input
        type="file"
        name="cv"
        accept=".pdf,.doc,.docx,.png,.jpg"
        className="mt-2 block w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 file:mr-4 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2"
        />
    </label>

    <div className="md:col-span-2">
        <button
        type="submit"
        className="mt-4 inline-flex items-center justify-center rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white shadow hover:bg-emerald-700 transition"
        >
        Enviar solicitud
        </button>
    </div>
    </form>
</div>
);
}
