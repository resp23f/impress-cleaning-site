import AplicarContent from './AplicarContent';

export const metadata = {
  title: 'Empleos en Impress Cleaning Services | Trabajos de Limpieza en Georgetown TX',
  
  description: 'Únete a nuestro equipo de limpieza profesional. Servimos Georgetown, Round Rock, Cedar Park, Leander, Pflugerville, Hutto y Austin desde 1998. Excelentes beneficios, entrenamiento pagado, y horarios flexibles.',
  
  keywords: 'empleos limpieza Georgetown TX, trabajos de limpieza Round Rock, jobs cleaning Cedar Park, trabajo Leander, empleo Pflugerville, trabajos Hutto, empleos limpieza Austin, cleaning jobs Central Texas, trabajo de limpiador, empleo de conserje, house cleaning jobs, trabajos de limpieza residencial',
  
  openGraph: {
    title: 'Empleos en Impress Cleaning Services | Trabajos de Limpieza en Georgetown TX',
    description: 'Únete a nuestro equipo de limpieza profesional. Servimos Georgetown, Round Rock, Cedar Park, Leander, Pflugerville, Hutto y Austin desde 1998. Excelentes beneficios, entrenamiento pagado, y horarios flexibles.',
    url: 'https://impressyoucleaning.com/aplicar',
    siteName: 'Impress Cleaning Services',
    images: [
      {
        url: 'https://impressyoucleaning.com/careers-hero.jpg',
        width: 1200,
        height: 630,
        alt: 'Empleos de Limpieza en Impress Cleaning Services'
      }
    ],
    locale: 'es_US',
    type: 'website',
  },
  
  twitter: {
    card: 'summary_large_image',
    title: 'Empleos en Impress Cleaning Services | Trabajos de Limpieza en Georgetown TX',
    description: 'Únete a nuestro equipo de limpieza profesional. Servimos Georgetown, Round Rock, Cedar Park, Leander, Pflugerville, Hutto y Austin desde 1998.',
    images: ['https://impressyoucleaning.com/careers-hero.jpg'],
  },
};

export default function AplicarPage() {
  return <AplicarContent />;
}