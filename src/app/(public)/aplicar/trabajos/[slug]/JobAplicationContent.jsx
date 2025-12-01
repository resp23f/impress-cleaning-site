"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  CheckCircle2, 
  Upload, 
  MapPin, 
  Clock,
  ChevronLeft,
  Briefcase,
  DollarSign,
  Calendar
} from "lucide-react";
// Job data - matching what you have in the main page
const jobsData = {
  "tecnico-de-limpieza": {
    title: "Técnico de Limpieza",
    location: "Georgetown, TX",
    type: "Tiempo Completo",
    experience: "No se requiere experiencia",
    salary: "$15-18/hora",
    schedule: "Lunes a Viernes, 8:00 AM - 5:00 PM",
    description: "Buscamos personas dedicadas y detallistas para unirse a nuestro equipo de limpieza residencial y comercial. No se requiere experiencia previa - nosotros te entrenamos."
  },
  "supervisor-de-equipo": {
    title: "Supervisor de Equipo",
    location: "Georgetown, TX",
    type: "Tiempo Completo",
    experience: "2+ años de experiencia",
    salary: "$20-25/hora",
    schedule: "Lunes a Viernes, 7:30 AM - 5:30 PM",
    description: "Lidera y motiva equipos de limpieza, asegurando la calidad del servicio y la satisfacción del cliente. Experiencia previa en supervisión requerida."
  },
  "asistente-de-gerencia-de-operaciones": {
    title: "Asistente de Gerencia de Operaciones",
    location: "Georgetown, TX",
    type: "Tiempo Completo",
    experience: "1+ año de experiencia",
    salary: "$18-22/hora",
    schedule: "Lunes a Viernes, 8:00 AM - 5:00 PM",
    description: "Apoya las operaciones diarias, coordina horarios, y ayuda con la comunicación con clientes. Experiencia administrativa preferida."
  }
};
const FORM_ENDPOINT = "https://formspree.io/f/mrbyrngw"; // Your Formspree endpoint
export default function JobApplicationPage() {
  const params = useParams();
  const router = useRouter();
  const jobSlug = params.slug;
  const job = jobsData[jobSlug];
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");
  // If job doesn't exist, redirect to main careers page
  if (!job) {
    router.push('/aplicar');
    return null;
  }
  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setSending(true);
    // Honeypot check
    const hp = e.currentTarget.elements.namedItem("empresa_oculta")?.value || "";
    if (hp) {
      setSending(false);
      return;
    }
    try {
      const formData = new FormData(e.currentTarget);
      formData.append("_subject", `Nueva solicitud - ${job.title} - Impress Cleaning`);
      formData.append("puesto_aplicado", job.title);
      const res = await fetch(FORM_ENDPOINT, {
        method: "POST",
        body: formData,
        headers: { Accept: "application/json" },
      });
      if (res.ok) {
        setSent(true);
        // Scroll to top to show success message
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setError("No pudimos enviar tu solicitud. Por favor intenta de nuevo.");
      }
    } catch (err) {
      setError("Error de conexión. Por favor intenta de nuevo.");
    } finally {
      setSending(false);
    }
  }
  // Success state
  if (sent) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-20">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-start gap-4">
              <CheckCircle2 className="w-8 h-8 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  ¡Solicitud Enviada con Éxito!
                </h2>
                <p className="text-lg text-gray-600 mb-6">
                  Hemos recibido tu aplicación para el puesto de <span className="font-semibold">{job.title}</span>.
                  Te contactaremos en 1-2 días hábiles para los siguientes pasos.
                </p>
                <div className="space-y-2 text-gray-600 mb-6">
                  <p>✓ Revisaremos tu aplicación cuidadosamente</p>
                  <p>✓ Te llamaremos para una entrevista telefónica</p>
                  <p>✓ Si calificas, programaremos una entrevista en persona</p>
                </div>
                <div className="flex gap-4">
                  <Link 
                    href="/aplicar" 
                    className="inline-flex items-center px-6 py-3 bg-[#079447] text-white font-semibold rounded-lg hover:bg-[#068339] transition"
                  >
                    Ver Otros Puestos
                  </Link>
                  <Link 
                    href="/" 
                    className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
                  >
                    Volver al Inicio
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Header/Breadcrumb */}
      <div className="bg-[#001F3F] text-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link 
            href="/aplicar" 
            className="inline-flex items-center text-blue-200 hover:text-white transition mb-4"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Volver a Empleos
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold">Aplicar para {job.title}</h1>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Job Details Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Detalles del Puesto</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Ubicación</p>
                    <p className="font-medium text-gray-900">{job.location}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Briefcase className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Tipo de Empleo</p>
                    <p className="font-medium text-gray-900">{job.type}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Experiencia</p>
                    <p className="font-medium text-gray-900">{job.experience}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <DollarSign className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Salario</p>
                    <p className="font-medium text-gray-900">{job.salary}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Horario</p>
                    <p className="font-medium text-gray-900">{job.schedule}</p>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">Descripción</h3>
                <p className="text-gray-600 text-sm">{job.description}</p>
              </div>
            </div>
          </div>
          {/* Application Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md">
              <div className="border-b border-gray-200 px-6 py-5">
                <h2 className="text-2xl font-bold text-gray-900">Formulario de Aplicación</h2>
                <p className="text-gray-600 mt-1">
                  Complete todos los campos requeridos. Te contactaremos en 1-2 días hábiles.
                </p>
              </div>
              <form onSubmit={onSubmit} className="p-6 space-y-6" encType="multipart/form-data">
                {/* Honeypot field */}
                <input type="text" name="empresa_oculta" className="hidden" tabIndex={-1} autoComplete="off" />
                {/* Personal Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Personal</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre *
                      </label>
                      <input
                        type="text"
                        name="nombre"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#079447] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Apellido *
                      </label>
                      <input
                        type="text"
                        name="apellido"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#079447] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Teléfono *
                      </label>
                      <input
                        type="tel"
                        name="telefono"
                        placeholder="(512) 555-1234"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#079447] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Correo Electrónico *
                      </label>
                      <input
                        type="email"
                        name="email"
                        placeholder="tu@correo.com"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#079447] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ciudad *
                      </label>
                      <input
                        type="text"
                        name="ciudad"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#079447] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Código Postal *
                      </label>
                      <input
                        type="text"
                        name="codigo_postal"
                        pattern="[0-9]{5}"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#079447] focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
                {/* Availability */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Disponibilidad</h3>
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Días Disponibles *</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"].map((day) => (
                        <label key={day} className="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="checkbox" 
                            name="dias[]" 
                            value={day}
                            className="w-4 h-4 text-[#079447] border-gray-300 rounded focus:ring-[#079447]"
                          />
                          <span className="text-gray-700">{day}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ¿Cuándo puedes empezar? *
                      </label>
                      <select 
                        name="fecha_inicio" 
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#079447] focus:border-transparent"
                      >
                        <option value="">Selecciona una opción</option>
                        <option value="inmediato">Inmediatamente</option>
                        <option value="1_semana">En 1 semana</option>
                        <option value="2_semanas">En 2 semanas</option>
                        <option value="1_mes">En 1 mes</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tipo de empleo deseado *
                      </label>
                      <select 
                        name="tipo_empleo" 
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#079447] focus:border-transparent"
                      >
                        <option value="">Selecciona una opción</option>
                        <option value="tiempo_completo">Tiempo Completo</option>
                        <option value="medio_tiempo">Medio Tiempo</option>
                      </select>
                    </div>
                  </div>
                </div>
                {/* Requirements */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Requisitos</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ¿Tienes transporte confiable? *
                      </label>
                      <select 
                        name="transporte" 
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#079447] focus:border-transparent"
                      >
                        <option value="">Selecciona</option>
                        <option value="si">Sí</option>
                        <option value="no">No</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ¿Autorizado para trabajar en EE.UU.? *
                      </label>
                      <select 
                        name="autorizado" 
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#079447] focus:border-transparent"
                      >
                        <option value="">Selecciona</option>
                        <option value="si">Sí</option>
                        <option value="no">No</option>
                      </select>
                    </div>
                  </div>
                </div>
                {/* Experience */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Experiencia</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Experiencia Relevante
                    </label>
                    <textarea
                      name="experiencia"
                      rows={4}
                      placeholder="Describe tu experiencia en limpieza, supervisión, o trabajos relacionados..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#079447] focus:border-transparent"
                    />
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ¿Por qué quieres trabajar con nosotros?
                    </label>
                    <textarea
                      name="por_que"
                      rows={3}
                      placeholder="Cuéntanos qué te motiva a unirte a nuestro equipo..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#079447] focus:border-transparent"
                    />
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Referencias (Opcional)
                    </label>
                    <textarea
                      name="referencias"
                      rows={3}
                      placeholder="Nombre, relación y teléfono de 2-3 referencias..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#079447] focus:border-transparent"
                    />
                  </div>
                </div>
                {/* File Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Currículum / Resume (Opcional)
                  </label>
                  <label className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition">
                    <Upload className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-700">
                      {fileName || "Elegir archivo"}
                    </span>
                    <input 
                      name="cv" 
                      type="file" 
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => setFileName(e.target.files?.[0]?.name || "")}
                      className="hidden" 
                    />
                  </label>
                  <p className="text-xs text-gray-500 mt-1">PDF o Word, máximo 10 MB</p>
                </div>
                {/* Consent */}
                <div className="flex items-start gap-2">
                  <input 
                    id="consent" 
                    name="consent" 
                    type="checkbox" 
                    required
                    className="mt-1 w-4 h-4 text-[#079447] border-gray-300 rounded focus:ring-[#079447]"
                  />
                  <label htmlFor="consent" className="text-sm text-gray-700">
                    Acepto que Impress Cleaning me contacte por teléfono o correo electrónico 
                    sobre mi solicitud y autorizo la verificación de mis antecedentes laborales. *
                  </label>
                </div>
                {/* Error message */}
                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700">{error}</p>
                  </div>
                )}
                {/* Submit buttons */}
                <div className="flex items-center gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={sending}
                    className="px-6 py-3 bg-[#079447] text-white font-semibold rounded-lg hover:bg-[#068339] disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    {sending ? "Enviando..." : "Enviar Solicitud"}
                  </button>
                  <Link 
                    href="/aplicar"
                    className="text-gray-600 hover:text-gray-900 font-medium"
                  >
                    Cancelar
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}