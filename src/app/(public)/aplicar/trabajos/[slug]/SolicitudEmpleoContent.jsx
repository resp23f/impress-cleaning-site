'use client'
import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  CheckCircle2,
  Upload,
  MapPin,
  Clock,
  ChevronLeft,
  Briefcase,
  DollarSign,
  Calendar,
  User,
  FileText,
  Send,
  Sparkles,
} from 'lucide-react'
import { useRecaptcha } from '@/hooks/useRecaptcha'
// Job data in Spanish
const jobsData = {
  'tecnico-de-limpieza': {
    title: 'Técnico de Limpieza',
    location: 'Georgetown, TX',
    type: 'Tiempo Completo',
    experience: 'No se requiere experiencia',
    salary: '$15-18/hora',
    schedule: 'Lunes a Viernes, 8:00 AM - 5:00 PM',
    description:
      'Buscamos personas dedicadas y detallistas para unirse a nuestro equipo de limpieza residencial y comercial. No se requiere experiencia previa - nosotros te entrenamos.',
    benefits: [
      'Pago competitivo con aumentos regulares',
      'Horario de lunes a viernes',
      'Entrenamiento pagado desde el primer día',
      'Seguro médico después de 90 días',
      'Oportunidades de crecimiento',
    ],
  },
  'supervisor-de-equipo': {
    title: 'Supervisor de Equipo',
    location: 'Georgetown, TX',
    type: 'Tiempo Completo',
    experience: '2+ años de experiencia',
    salary: '$20-25/hora',
    schedule: 'Lunes a Viernes, 7:30 AM - 5:30 PM',
    description:
      'Lidera y motiva equipos de limpieza, asegurando la calidad del servicio y la satisfacción del cliente. Experiencia previa en supervisión requerida.',
    benefits: [
      'Mayor pago por rol de liderazgo',
      'Paquete completo de beneficios',
      'Vehículo de la empresa proporcionado',
      'Bonos por desempeño',
      'Oportunidades de carrera',
    ],
  },
  'asistente-de-gerencia-de-operaciones': {
    title: 'Asistente de Gerencia de Operaciones',
    location: 'Georgetown, TX',
    type: 'Tiempo Completo',
    experience: '1+ año de experiencia',
    salary: '$18-22/hora',
    schedule: 'Lunes a Viernes, 8:00 AM - 5:00 PM',
    description:
      'Apoya las operaciones diarias, coordina horarios, y ayuda con la comunicación con clientes. Experiencia administrativa preferida.',
    benefits: [
      'Posición basada en oficina',
      'Paquete completo de beneficios',
      'Oportunidades de desarrollo profesional',
      'Ambiente de equipo solidario',
      'Espacio para avanzar',
    ],
  },
}

const FORM_ENDPOINT = 'https://formspree.io/f/mrbyrngw'

export default function SolicitudEmpleoContent() {
  const params = useParams()
  const router = useRouter()
  const jobSlug = params.slug
  const job = jobsData[jobSlug]
  const { executeRecaptcha } = useRecaptcha()

  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [fileName, setFileName] = useState('')
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    ciudad: '',
    codigoPostal: '',
    fechaInicio: '',
    tipoEmpleo: '',
    transporte: '',
    autorizado: '',
    experiencia: '',
    porQue: '',
    referencias: '',
  })
  const [selectedDays, setSelectedDays] = useState([])

  // If job doesn't exist, redirect to main careers page
  if (!job) {
    router.push('/aplicar')
    return null
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (error) setError('')
  }

  const handleDayToggle = (day) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    )
    if (error) setError('')
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError('')

    // Honeypot check (obscure field name)
    const hp = e.currentTarget.elements.namedItem('sitio_web_campo')?.value || ''
    if (hp) {
      return
    }

    // Validate at least one day selected
    if (selectedDays.length === 0) {
      setError('Por favor selecciona al menos un día que estés disponible para trabajar.')
      return
    }

    setSending(true)

    try {
      // Verify reCAPTCHA
      const recaptchaToken = await executeRecaptcha('job_application_es')
      if (!recaptchaToken) {
        setError('Verificación de seguridad fallida. Por favor actualiza la página e intenta de nuevo.')
        setSending(false)
        return
      }

      // Verify with backend
      const verifyRes = await fetch('/api/verify-recaptcha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: recaptchaToken, action: 'job_application_es' }),
      })

      const verifyData = await verifyRes.json()
      if (!verifyRes.ok || !verifyData.success) {
        setError('Verificación de seguridad fallida. Por favor intenta de nuevo.')
        setSending(false)
        return
      }

      // Submit to Formspree
      const form = new FormData(e.currentTarget)
      form.append('_subject', `Nueva Solicitud - ${job.title} - Impress Cleaning`)
      form.append('puesto_aplicado', job.title)
      form.append('dias_disponibles', selectedDays.join(', '))

      const res = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        body: form,
        headers: { Accept: 'application/json' },
      })

      if (res.ok) {
        setSent(true)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else {
        setError('No pudimos enviar tu solicitud. Por favor intenta de nuevo.')
      }
    } catch (err) {
      console.error('Application submission error:', err)
      setError('Error de conexión. Por favor intenta de nuevo.')
    } finally {
      setSending(false)
    }
  }

  // Success state
  if (sent) {
    return (
      <div className="min-h-screen bg-[#FAFAF8]">
        <div className="py-20 lg:py-32">
          <div className="max-w-2xl mx-auto px-4">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 lg:p-12 text-center">
              {/* Success icon */}
              <div className="w-20 h-20 bg-gradient-to-br from-[#079447] to-[#08A855] rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg shadow-[#079447]/30">
                <CheckCircle2 className="w-10 h-10 text-white" />
              </div>

              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                ¡Solicitud Enviada!
              </h2>
              <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
                Hemos recibido tu aplicación para{' '}
                <span className="font-semibold text-[#079447]">{job.title}</span>. Te contactaremos
                en 1-2 días hábiles.
              </p>

              <div className="bg-gray-50 rounded-2xl p-6 mb-8 text-left max-w-sm mx-auto">
                <h4 className="font-semibold text-gray-900 mb-4">¿Qué sigue?</h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#079447] flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600 text-sm">
                      Revisaremos tu aplicación cuidadosamente
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#079447] flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600 text-sm">
                      Entrevista telefónica en 1-2 días
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#079447] flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600 text-sm">
                      Entrevista en persona si calificas
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/aplicar"
                  className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-[#079447] to-[#08A855] text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-[#079447]/30 transition-all duration-300"
                >
                  Ver Otros Puestos
                </Link>
                <Link
                  href="/"
                  className="inline-flex items-center justify-center px-6 py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-300"
                >
                  Volver al Inicio
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      {/* Header banner */}
      <div className="bg-gradient-to-br from-[#001F3F] via-[#0B2859] to-[#001F3F] text-white py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/aplicar"
            className="inline-flex items-center text-blue-200 hover:text-white transition-colors mb-6 group"
          >
            <ChevronLeft className="w-5 h-5 mr-1 group-hover:-translate-x-1 transition-transform" />
            Volver a Empleos
          </Link>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Aplicar para {job.title}
          </h1>
          <p className="text-lg text-blue-100/80 max-w-2xl">{job.description}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Sidebar - Job Details */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <div className="lg:sticky lg:top-24 space-y-6">
              {/* Job info card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-6">Detalles del Puesto</h2>
                <div className="space-y-5">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-[#079447]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-[#079447]" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Ubicación</p>
                      <p className="font-medium text-gray-900">{job.location}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-[#079447]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Briefcase className="w-5 h-5 text-[#079447]" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Tipo de Empleo</p>
                      <p className="font-medium text-gray-900">{job.type}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-[#079447]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Clock className="w-5 h-5 text-[#079447]" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Experiencia</p>
                      <p className="font-medium text-gray-900">{job.experience}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-[#079447]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <DollarSign className="w-5 h-5 text-[#079447]" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Salario</p>
                      <p className="font-semibold text-[#079447]">{job.salary}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-[#079447]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-5 h-5 text-[#079447]" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Horario</p>
                      <p className="font-medium text-gray-900">{job.schedule}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Benefits card */}
              <div className="bg-gradient-to-br from-[#079447] to-[#08A855] rounded-2xl shadow-lg p-6 text-white">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5" />
                  <h3 className="font-bold">Lo Que Ofrecemos</h3>
                </div>
                <ul className="space-y-3">
                  {job.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 opacity-90" />
                      <span className="text-sm text-white/90">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Main Form */}
          <div className="lg:col-span-2 order-1 lg:order-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Form header */}
              <div className="border-b border-gray-100 px-6 lg:px-8 py-6">
                <h2 className="text-2xl font-bold text-gray-900">Formulario de Aplicación</h2>
                <p className="text-gray-600 mt-1">
                  Completa el formulario. Te contactaremos en 1-2 días hábiles.
                </p>
              </div>

              <form onSubmit={onSubmit} className="p-6 lg:p-8 space-y-8">
                {/* Honeypot - obscure name */}
                <input
                  type="text"
                  name="sitio_web_campo"
                  className="hidden"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                />

                {/* Personal Information */}
                <div>
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-8 h-8 bg-[#079447]/10 rounded-lg flex items-center justify-center">
                      <User className="w-4 h-4 text-[#079447]" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Información Personal</h3>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="nombre"
                        required
                        maxLength={50}
                        value={formData.nombre}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#079447]/20 focus:border-[#079447] transition-all duration-200 outline-none"
                        placeholder="Juan"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Apellido <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="apellido"
                        required
                        maxLength={50}
                        value={formData.apellido}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#079447]/20 focus:border-[#079447] transition-all duration-200 outline-none"
                        placeholder="García"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Teléfono <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        name="telefono"
                        required
                        maxLength={20}
                        value={formData.telefono}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#079447]/20 focus:border-[#079447] transition-all duration-200 outline-none"
                        placeholder="(512) 555-1234"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Correo Electrónico <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        required
                        maxLength={254}
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#079447]/20 focus:border-[#079447] transition-all duration-200 outline-none"
                        placeholder="tu@correo.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ciudad <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="ciudad"
                        required
                        maxLength={100}
                        value={formData.ciudad}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#079447]/20 focus:border-[#079447] transition-all duration-200 outline-none"
                        placeholder="Georgetown"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Código Postal <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="codigoPostal"
                        required
                        pattern="[0-9]{5}"
                        maxLength={5}
                        value={formData.codigoPostal}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#079447]/20 focus:border-[#079447] transition-all duration-200 outline-none"
                        placeholder="78626"
                      />
                    </div>
                  </div>
                </div>

                {/* Availability */}
                <div>
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-8 h-8 bg-[#079447]/10 rounded-lg flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-[#079447]" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Disponibilidad</h3>
                  </div>

                  <div className="mb-6">
                    <p className="text-sm font-medium text-gray-700 mb-3">
                      Días Disponibles <span className="text-red-500">*</span>
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'].map((day) => (
                        <button
                          key={day}
                          type="button"
                          onClick={() => handleDayToggle(day)}
                          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                            selectedDays.includes(day)
                              ? 'bg-[#079447] text-white shadow-md shadow-[#079447]/20'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                    {selectedDays.length === 0 && (
                      <p className="text-xs text-gray-500 mt-2">Selecciona al menos un día</p>
                    )}
                  </div>

                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ¿Cuándo puedes empezar? <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="fechaInicio"
                        required
                        value={formData.fechaInicio}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#079447]/20 focus:border-[#079447] transition-all duration-200 outline-none appearance-none bg-white"
                      >
                        <option value="">Selecciona una opción</option>
                        <option value="inmediato">Inmediatamente</option>
                        <option value="1_semana">En 1 semana</option>
                        <option value="2_semanas">En 2 semanas</option>
                        <option value="1_mes">En 1 mes</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tipo de empleo deseado <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="tipoEmpleo"
                        required
                        value={formData.tipoEmpleo}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#079447]/20 focus:border-[#079447] transition-all duration-200 outline-none appearance-none bg-white"
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
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-8 h-8 bg-[#079447]/10 rounded-lg flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-[#079447]" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Requisitos</h3>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ¿Tienes transporte confiable? <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="transporte"
                        required
                        value={formData.transporte}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#079447]/20 focus:border-[#079447] transition-all duration-200 outline-none appearance-none bg-white"
                      >
                        <option value="">Selecciona</option>
                        <option value="si">Sí</option>
                        <option value="no">No</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ¿Autorizado para trabajar en EE.UU.? <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="autorizado"
                        required
                        value={formData.autorizado}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#079447]/20 focus:border-[#079447] transition-all duration-200 outline-none appearance-none bg-white"
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
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-8 h-8 bg-[#079447]/10 rounded-lg flex items-center justify-center">
                      <FileText className="w-4 h-4 text-[#079447]" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Experiencia</h3>
                  </div>
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Experiencia Relevante
                      </label>
                      <textarea
                        name="experiencia"
                        rows={4}
                        maxLength={2000}
                        value={formData.experiencia}
                        onChange={handleInputChange}
                        placeholder="Describe tu experiencia en limpieza, supervisión, o trabajos relacionados..."
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#079447]/20 focus:border-[#079447] transition-all duration-200 outline-none resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ¿Por qué quieres trabajar con nosotros?
                      </label>
                      <textarea
                        name="porQue"
                        rows={3}
                        maxLength={1000}
                        value={formData.porQue}
                        onChange={handleInputChange}
                        placeholder="Cuéntanos qué te motiva a unirte a nuestro equipo..."
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#079447]/20 focus:border-[#079447] transition-all duration-200 outline-none resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Referencias (Opcional)
                      </label>
                      <textarea
                        name="referencias"
                        rows={3}
                        maxLength={1000}
                        value={formData.referencias}
                        onChange={handleInputChange}
                        placeholder="Nombre, relación y teléfono de 2-3 referencias..."
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#079447]/20 focus:border-[#079447] transition-all duration-200 outline-none resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Resume Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Currículum / Resume (Opcional)
                  </label>
                  <label className="flex items-center gap-3 px-4 py-3 border-2 border-dashed border-gray-200 rounded-xl hover:border-[#079447]/50 hover:bg-[#079447]/5 cursor-pointer transition-all duration-200">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Upload className="w-5 h-5 text-gray-500" />
                    </div>
                    <div>
                      <span className="text-gray-700 font-medium">
                        {fileName || 'Elegir archivo'}
                      </span>
                      <p className="text-xs text-gray-500 mt-0.5">PDF o Word, máximo 10MB</p>
                    </div>
                    <input
                      name="cv"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => setFileName(e.target.files?.[0]?.name || '')}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Consent */}
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                  <input
                    id="consent"
                    name="consent"
                    type="checkbox"
                    required
                    className="mt-1 w-5 h-5 text-[#079447] border-gray-300 rounded focus:ring-[#079447]"
                  />
                  <label htmlFor="consent" className="text-sm text-gray-600">
                    Acepto que Impress Cleaning me contacte por teléfono o correo electrónico sobre
                    mi solicitud y autorizo la verificación de mis antecedentes laborales.{' '}
                    <span className="text-red-500">*</span>
                  </label>
                </div>

                {/* Error message */}
                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                )}

                {/* Submit */}
                <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={sending}
                    className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-[#079447] to-[#08A855] text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-[#079447]/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 group"
                  >
                    {sending ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-2" />
                        Enviar Solicitud
                      </>
                    )}
                  </button>
                  <Link
                    href="/aplicar"
                    className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
                  >
                    Cancelar
                  </Link>
                </div>

                {/* reCAPTCHA notice */}
                <p className="text-xs text-gray-400 text-center">
                  Este sitio está protegido por reCAPTCHA y aplican la{' '}
                  <a
                    href="https://policies.google.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    Política de Privacidad
                  </a>{' '}
                  y{' '}
                  <a
                    href="https://policies.google.com/terms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    Términos de Servicio
                  </a>{' '}
                  de Google.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}