'use client'
import Link from 'next/link'
import {
  MapPin,
  Clock,
  DollarSign,
  Heart,
  Users,
  TrendingUp,
  Sun,
  Award,
  Briefcase,
  ChevronRight,
  CheckCircle,
  Sparkles,
  Shield,
  Calendar,
  Car,
  GraduationCap,
  ArrowRight,
} from 'lucide-react'

// Job listings data
const jobs = [
  {
    id: 1,
    slug: 'tecnico-de-limpieza',
    title: 'Técnico de Limpieza',
    location: 'Georgetown, TX',
    type: 'Tiempo Completo',
    experience: 'No se requiere experiencia',
    salary: '$15-18/hr',
    highlight: 'Más Popular',
  },
  {
    id: 2,
    slug: 'supervisor-de-equipo',
    title: 'Supervisor de Equipo',
    location: 'Georgetown, TX',
    type: 'Tiempo Completo',
    experience: '2+ años de experiencia',
    salary: '$20-25/hr',
    highlight: null,
  },
  {
    id: 3,
    slug: 'asistente-de-gerencia-de-operaciones',
    title: 'Asistente de Gerencia de Operaciones',
    location: 'Georgetown, TX',
    type: 'Tiempo Completo',
    experience: '1+ año de experiencia',
    salary: '$18-22/hr',
    highlight: null,
  },
]

// Benefits data
const benefits = [
  {
    icon: DollarSign,
    title: 'Salario Competitivo',
    description:
      'Pago justo desde el día uno, con aumentos basados en desempeño y bonos por excelencia.',
  },
  {
    icon: Sun,
    title: 'Horarios de Día',
    description:
      'Lunes a Viernes, sin noches ni fines de semana. Tiempo para tu familia y vida personal.',
  },
  {
    icon: Heart,
    title: 'Seguro Médico',
    description: 'Cobertura de salud completa para empleados de tiempo completo después de 90 días.',
  },
  {
    icon: GraduationCap,
    title: 'Entrenamiento Pagado',
    description: 'Te capacitamos completamente con pago completo. No necesitas experiencia previa.',
  },
  {
    icon: Users,
    title: 'Equipo Estable',
    description: 'Únete a una empresa familiar con 20+ años de historia y empleados de largo plazo.',
  },
  {
    icon: TrendingUp,
    title: 'Oportunidades de Crecimiento',
    description: 'Muchos de nuestros líderes empezaron en limpieza. Tu futuro puede crecer aquí.',
  },
]

// Stats data
const stats = [
  { value: '20+', label: 'Años en el Negocio' },
  { value: '95%', label: 'Satisfacción del Empleado' },
  { value: '500+', label: 'Clientes Satisfechos' },
  { value: '15+', label: 'Miembros del Equipo' },
]

// Process steps
const processSteps = [
  {
    step: 1,
    title: 'Aplica en Línea',
    description: 'Completa nuestro formulario simple en solo unos minutos.',
  },
  {
    step: 2,
    title: 'Entrevista Telefónica',
    description: 'Te llamamos en 1-2 días hábiles para conocerte.',
  },
  {
    step: 3,
    title: 'Conoce al Equipo',
    description: 'Visita nuestra oficina para una entrevista en persona.',
  },
  {
    step: 4,
    title: 'Comienza tu Carrera',
    description: '¡Entrenamiento pagado y bienvenida a la familia Impress!',
  },
]

export default function AplicarContent() {
  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      {/* ========== HERO SECTION ========== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#001F3F] via-[#0B2859] to-[#001F3F] min-h-[85vh] flex items-center">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Gradient orbs */}
          <div className="absolute top-20 left-10 w-72 h-72 bg-[#079447]/20 rounded-full blur-3xl opacity-60" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#079447]/15 rounded-full blur-3xl opacity-50" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#079447]/10 rounded-full blur-3xl opacity-40" />

          {/* Subtle grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                               linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
              backgroundSize: '50px 50px',
            }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="max-w-4xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-8">
              <Sparkles className="w-4 h-4 text-[#079447]" />
              <span className="text-sm font-medium text-white/90">
                Estamos Contratando — Únete a Nuestro Equipo
              </span>
            </div>

            {/* Main headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-[1.1] tracking-tight">
              Construye una Carrera
              <span className="block text-[#7AC699]">Que Brille</span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl sm:text-2xl text-blue-100/90 mb-10 max-w-2xl leading-relaxed">
              Únete a un equipo donde tu trabajo hace la diferencia cada día. Buen salario, horarios
              flexibles y oportunidades reales de crecer.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="#positions"
                className="group inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-[#001F3F] bg-white rounded-xl hover:bg-gray-100 transition-all duration-300 shadow-lg shadow-black/20 hover:shadow-xl hover:-translate-y-0.5"
              >
                Ver Posiciones Abiertas
                <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
              <a
                href="#benefits"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white border-2 border-white/30 rounded-xl hover:bg-white/10 hover:border-white/50 transition-all duration-300"
              >
                Por Qué Unirte
              </a>
            </div>

            {/* Trust indicators */}
            <div className="mt-16 flex flex-wrap items-center gap-8 text-white/70">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-[#079447]" />
                <span>Sin Experiencia Necesaria</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-[#079447]" />
                <span>Entrenamiento Pagado</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-[#079447]" />
                <span>Beneficios Disponibles</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
            <div className="w-1.5 h-3 bg-white/50 rounded-full" />
          </div>
        </div>
      </section>

      {/* ========== STATS BAR ========== */}
      <section className="relative z-20 -mt-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl shadow-black/5 border border-gray-100 p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-4xl lg:text-5xl font-bold text-[#079447] mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600 font-medium uppercase tracking-wide">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ========== WHY JOIN US SECTION ========== */}
      <section id="benefits" className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-[#079447]/10 text-[#079447] text-sm font-semibold rounded-full mb-4">
              Beneficios y Ventajas
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              Por Qué Les Encanta Trabajar Aquí
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Ofrecemos más que un trabajo — es una oportunidad de ser parte de algo especial
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => {
              const IconComponent = benefit.icon
              return (
                <div
                  key={index}
                  className="group relative bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-xl hover:border-[#079447]/20 transition-all duration-500 hover:-translate-y-1"
                >
                  {/* Icon */}
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-[#079447] to-[#08A855] rounded-xl mb-6 shadow-lg shadow-[#079447]/20 group-hover:scale-110 transition-transform duration-300">
                    <IconComponent className="w-7 h-7 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{benefit.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{benefit.description}</p>

                  {/* Hover accent */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#079447] to-[#08A855] rounded-b-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ========== OPEN POSITIONS SECTION ========== */}
      <section id="positions" className="py-24 lg:py-32 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-[#001F3F]/10 text-[#001F3F] text-sm font-semibold rounded-full mb-4">
              Posiciones Abiertas
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              Encuentra Tu Rol Perfecto
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Elige una posición que coincida con tus habilidades e intereses. ¿Sin experiencia? No
              hay problema — te entrenaremos.
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="group relative bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-[#079447]/20 transition-all duration-500 overflow-hidden"
              >
                {/* Highlight badge */}
                {job.highlight && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-[#079447] to-[#08A855] text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl">
                    {job.highlight}
                  </div>
                )}

                <div className="p-8">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    {/* Job info */}
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-[#079447] transition-colors">
                        {job.title}
                      </h3>
                      <div className="flex flex-wrap gap-4">
                        <div className="flex items-center gap-2 text-gray-600">
                          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                            <MapPin className="w-4 h-4 text-gray-500" />
                          </div>
                          <span>{job.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Briefcase className="w-4 h-4 text-gray-500" />
                          </div>
                          <span>{job.type}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                            <DollarSign className="w-4 h-4 text-gray-500" />
                          </div>
                          <span className="font-semibold text-[#079447]">{job.salary}</span>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center gap-2 text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">{job.experience}</span>
                      </div>
                    </div>

                    {/* Apply button */}
                    <Link
                      href={`/aplicar/trabajos/${job.slug}`}
                      className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-[#079447] to-[#08A855] text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-[#079447]/30 transition-all duration-300 hover:-translate-y-0.5 whitespace-nowrap group/btn"
                    >
                      Aplicar Ahora
                      <ArrowRight className="ml-2 w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== HIRING PROCESS SECTION ========== */}
      <section className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-[#079447]/10 text-[#079447] text-sm font-semibold rounded-full mb-4">
              Proceso Simple
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              Tu Camino Para Unirte
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Nuestro proceso de contratación es rápido y directo. La mayoría de candidatos reciben
              respuesta en 48 horas.
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="relative">
              {/* Connection line */}
              <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-[#079447]/20 via-[#079447] to-[#079447]/20 -translate-y-1/2" />

              <div className="grid lg:grid-cols-4 gap-8">
                {processSteps.map((step, index) => (
                  <div key={index} className="relative text-center">
                    {/* Step number */}
                    <div className="relative z-10 w-16 h-16 bg-gradient-to-br from-[#079447] to-[#08A855] text-white text-2xl font-bold rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#079447]/30">
                      {step.step}
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                    <p className="text-gray-600">{step.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== REQUIREMENTS SECTION ========== */}
      <section className="py-24 lg:py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left column - Image/Visual */}
            <div className="relative">
              <div className="aspect-[4/3] bg-gradient-to-br from-[#001F3F] to-[#0B2859] rounded-3xl overflow-hidden shadow-2xl">
                {/* Placeholder for team image */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white/80">
                    <Users className="w-20 h-20 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">Foto del Equipo</p>
                    <p className="text-sm opacity-60">careers-team.jpg</p>
                  </div>
                </div>

                {/* Decorative overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#001F3F]/50 to-transparent" />
              </div>

              {/* Floating stats card */}
              <div className="absolute -bottom-8 -right-8 bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-[#079447] to-[#08A855] rounded-xl flex items-center justify-center shadow-lg">
                    <Award className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-gray-900">95%</div>
                    <div className="text-sm text-gray-600">Satisfacción del Empleado</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right column - Requirements */}
            <div>
              <span className="inline-block px-4 py-1.5 bg-[#079447]/10 text-[#079447] text-sm font-semibold rounded-full mb-4">
                Lo Que Buscamos
              </span>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Requisitos Simples</h2>
              <p className="text-lg text-gray-600 mb-8">
                No necesitas experiencia previa en limpieza — te entrenaremos completamente. Lo más
                importante es tu actitud y compromiso.
              </p>

              <div className="space-y-4">
                {[
                  { icon: Car, text: 'Transporte confiable para llegar al trabajo' },
                  { icon: Shield, text: 'Capacidad de levantar hasta 25 libras' },
                  { icon: Sparkles, text: 'Atención al detalle y actitud positiva' },
                  { icon: Calendar, text: 'Disponibilidad de Lunes a Viernes' },
                ].map((req, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-[#079447]/20 transition-all duration-300"
                  >
                    <div className="w-10 h-10 bg-[#079447]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <req.icon className="w-5 h-5 text-[#079447]" />
                    </div>
                    <span className="text-gray-700 font-medium">{req.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== CTA SECTION ========== */}
      <section className="py-24 lg:py-32 bg-gradient-to-br from-[#001F3F] via-[#0B2859] to-[#001F3F] relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#079447]/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#079447]/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
            ¿Listo Para Comenzar Tu Futuro?
          </h2>
          <p className="text-xl text-blue-100/90 mb-10 max-w-2xl mx-auto">
            Únete a una empresa que valora a sus empleados tanto como a sus clientes. Tu viaje
            comienza con un clic.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              href="/aplicar/trabajos/tecnico-de-limpieza"
              className="group inline-flex items-center justify-center px-10 py-5 text-lg font-semibold text-[#001F3F] bg-white rounded-xl hover:bg-gray-100 transition-all duration-300 shadow-lg shadow-black/20 hover:shadow-xl hover:-translate-y-0.5"
            >
              Aplicar Ahora
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Contact alternative */}
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 bg-white/10 backdrop-blur-sm rounded-2xl px-8 py-6 border border-white/20">
            <span className="text-white/80">¿Prefieres correo?</span>
            <a
              href="mailto:trabajos@impressyoucleaning.com"
              className="text-white font-bold hover:text-[#7AC699] transition-colors"
            >
              trabajos@impressyoucleaning.com
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}