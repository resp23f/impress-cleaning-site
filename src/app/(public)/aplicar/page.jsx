//Aplicar Home Page - src/app/aplicar/page.jsx//
"use client";
import Link from "next/link";
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
  CheckCircle
} from "lucide-react";
import Header from '@/components/Header';
const jobs = [
  { 
    id: 1, 
    slug: "tecnico-de-limpieza", 
    title: "Técnico de Limpieza", 
    location: "Georgetown, TX",
    type: "Tiempo Completo",
    experience: "No se requiere experiencia"
  },
  { 
    id: 2, 
    slug: "supervisor-de-equipo", 
    title: "Supervisor de Equipo", 
    location: "Georgetown, TX",
    type: "Tiempo Completo", 
    experience: "2+ años de experiencia"
  },
  { 
    id: 3, 
    slug: "asistente-de-gerencia-de-operaciones", 
    title: "Asistente de Gerencia de Operaciones", 
    location: "Georgetown, TX",
    type: "Tiempo Completo",
    experience: "1+ año de experiencia"
  },
];
const benefits = [
  {
    icon: <DollarSign className="w-6 h-6" />,
    title: "Salario Competitivo",
    description: "Pago justo desde el día uno, con aumentos basados en desempeño y bonos por excelencia."
  },
  {
    icon: <Sun className="w-6 h-6" />,
    title: "Horarios de Día",
    description: "Lunes a Viernes, sin noches ni fines de semana. Tiempo para tu familia y vida personal."
  },
  {
    icon: <Heart className="w-6 h-6" />,
    title: "Seguro Médico",
    description: "Cobertura de salud completa para empleados de tiempo completo después de 90 días."
  },
  {
    icon: <Award className="w-6 h-6" />,
    title: "Entrenamiento Pagado",
    description: "Te capacitamos completamente con pago completo. No necesitas experiencia previa."
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: "Equipo Estable",
    description: "Únete a una empresa familiar con 20+ años de historia y empleados de largo plazo."
  },
  {
    icon: <TrendingUp className="w-6 h-6" />,
    title: "Oportunidades de Crecimiento",
    description: "Muchos de nuestros líderes empezaron en limpieza. Tu futuro puede crecer aquí."
  }
];
const requirements = [
  "Transporte confiable para llegar al trabajo",
  "Capacidad de levantar hasta 25 libras",
  "Atención al detalle y actitud positiva",
  "Disponibilidad de Lunes a Viernes",
];
export default function AplicarPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">  
              <section className="relative overflow-hidden bg-[#001F3F]">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }} />
        </div>
        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              Únete a Nuestro Equipo
            </h1>
            <p className="text-xl sm:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Construye una carrera estable con Impress Cleaning Services - donde cada día haces la diferencia
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="#open-positions" className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-[#001F3F] bg-white rounded-lg hover:bg-gray-100 transition-colors">
                Ver Posiciones Abiertas
                <ChevronRight className="ml-2 w-5 h-5" />
              </a>
              <a href="#why-join" className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white border-2 border-white rounded-lg hover:bg-white/10 transition-colors">
                Por Qué Unirte
              </a>
            </div>
          </div>
        </div>
      </section>
      <section className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                Un Trabajo Limpio, Un Futuro Impresionante
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                En Impress Cleaning creemos que un buen trabajo empieza con un gran equipo. 
                Aquí encontrarás un ambiente positivo, horarios flexibles y la oportunidad 
                de crecer mientras ayudas a que cada hogar brille.
              </p>
              <p className="text-lg text-gray-600 mb-8">
                Nos enorgullece trabajar con personas dedicadas, alegres y con atención al 
                detalle — porque cuando nuestros clientes sonríen, nosotros también.
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700 font-medium">20+ años en el negocio</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700 font-medium">Empresa familiar local</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700 font-medium">Equipo estable y unido</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <img 
                src="/careers-team.jpg" 
                alt="Equipo de Impress Cleaning"
                className="rounded-2xl shadow-2xl"
              />
              <div className="absolute -bottom-6 -right-6 bg-[#079447] text-white p-6 rounded-xl shadow-xl">
                <div className="text-3xl font-bold">95%</div>
                <div className="text-sm">Satisfacción del Empleado</div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* BENEFITS SECTION */}
      <section id="why-join" className="py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              ¿Por Qué Trabajar Con Nosotros?
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Ofrecemos más que un trabajo - es una oportunidad de ser parte de algo especial
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="group hover:shadow-lg transition-shadow rounded-xl p-6 bg-gray-50 hover:bg-white border border-gray-100">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-[#079447]/10 rounded-lg flex items-center justify-center text-[#079447] group-hover:bg-[#079447] group-hover:text-white transition-colors">
                    {benefit.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {benefit.title}
                    </h3>
                    <p className="text-gray-600">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* JOB OPENINGS SECTION */}
      <section id="open-positions" className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Posiciones Disponibles
            </h2>
            <p className="text-lg text-gray-600">
              Encuentra tu lugar perfecto en nuestro equipo
            </p>
          </div>
          <div className="grid gap-6 max-w-4xl mx-auto">
            {jobs.map((job) => (
              <div key={job.id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow border border-gray-100">
                <div className="p-6 sm:p-8">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">
                        {job.title}
                      </h3>
                      <div className="flex flex-wrap gap-4 text-gray-600">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>{job.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Briefcase className="w-4 h-4" />
                          <span>{job.type}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>{job.experience}</span>
                        </div>
                      </div>
                    </div>
                    <Link 
                      href={`/aplicar/trabajos/${job.slug}`}
                      className="inline-flex items-center justify-center px-6 py-3 bg-[#079447] text-white font-semibold rounded-lg hover:bg-[#068339] transition-colors whitespace-nowrap"
                    >
                      Aplicar Ahora
                      <ChevronRight className="ml-2 w-5 h-5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* REQUIREMENTS SECTION */}
      <section className="py-16 lg:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Lo Que Buscamos
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                No necesitas experiencia previa en limpieza - te entrenaremos completamente. 
                Lo más importante es tu actitud y compromiso.
              </p>
              <ul className="space-y-3">
                {requirements.map((req, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{req}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Proceso de Aplicación
              </h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-[#079447] text-white rounded-full flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Envía tu Aplicación</h3>
                    <p className="text-gray-600">Completa nuestro formulario simple en línea</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-[#079447] text-white rounded-full flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Entrevista Telefónica</h3>
                    <p className="text-gray-600">Te llamamos en 1-2 días hábiles para conocerte</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-[#079447] text-white rounded-full flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Entrevista en Persona</h3>
                    <p className="text-gray-600">Ven a conocer nuestro equipo y las instalaciones</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-[#079447] text-white rounded-full flex items-center justify-center font-bold">
                    4
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">¡Comienza tu Carrera!</h3>
                    <p className="text-gray-600">Entrenamiento pagado y bienvenida al equipo</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* CTA SECTION */}
      <section className="py-16 lg:py-20 bg-[#001F3F]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            ¿Listo Para Comenzar Tu Futuro?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Únete a una empresa que valora a sus empleados tanto como a sus clientes
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/aplicar/trabajos/tecnico-de-limpieza"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-[#001F3F] bg-white rounded-lg hover:bg-gray-100 transition-colors"
            >
              Aplicar Ahora
              <ChevronRight className="ml-2 w-5 h-5" />
            </Link>
            <div className="flex flex-col bg-white text-[#001F3F] px-4 py-1 rounded-lg font-bold hover:bg-gray-100 transition-colors text-center">
                <span className="text-md">Envíanos un correo:</span>
                <a 
                  href="mailto:trabajos@impressyoucleaning.com" 
                  className="bg-white text-[#001F3F] px-4 py-2 rounded-lg font-extrabold hover:bg-gray-100 transition-colors text-center"
                >
                  trabajos@impressyoucleaning.com
                </a>
                </div>      
              </div>
          </div>          
      </section>
          </div>
  );
}