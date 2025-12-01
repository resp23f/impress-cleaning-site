import JobApplicationContent from './JobApplicationContent';

export const metadata = {
  title: 'Aplicar para Empleo | Impress Cleaning Services Georgetown TX',
  
  description: 'Aplica para trabajos de limpieza profesional en Georgetown, Round Rock, Cedar Park, Leander, Pflugerville, Hutto y Austin. Entrenamiento pagado, beneficios completos, y horarios flexibles. Únete a nuestro equipo establecido en 1998.',
  
  keywords: 'aplicar empleo limpieza Georgetown, job application cleaning Round Rock, solicitud de trabajo Cedar Park, aplicar limpiador Leander, empleo Pflugerville, trabajo Hutto, cleaning job application Austin, formulario de empleo, solicitud de trabajo de limpieza',
  
  openGraph: {
    title: 'Aplicar para Empleo | Impress Cleaning Services Georgetown TX',
    description: 'Aplica para trabajos de limpieza profesional en Georgetown, Round Rock, Cedar Park, Leander, Pflugerville, Hutto y Austin. Entrenamiento pagado, beneficios completos, y horarios flexibles.',
    url: 'https://impressyoucleaning.com/aplicar/trabajos',
    siteName: 'Impress Cleaning Services',
    images: [
      {
        url: 'https://impressyoucleaning.com/careers-hero.jpg',
        width: 1200,
        height: 630,
        alt: 'Aplicación de Empleo - Impress Cleaning Services'
      }
    ],
    locale: 'es_US',
    type: 'website',
  },
  
  twitter: {
    card: 'summary_large_image',
    title: 'Aplicar para Empleo | Impress Cleaning Services Georgetown TX',
    description: 'Aplica para trabajos de limpieza profesional en Georgetown, Round Rock, Cedar Park, Leander, Pflugerville, Hutto y Austin.',
    images: ['https://impressyoucleaning.com/careers-hero.jpg'],
  },
};

export default function JobApplicationPage() {
  return <JobApplicationContent />;
}