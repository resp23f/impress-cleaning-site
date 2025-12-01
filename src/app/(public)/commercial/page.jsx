import CommercialContent from './CommercialContent';

export const metadata = {
  title: 'Commercial Cleaning Services | Impress Cleaning Services Georgetown TX',
  
  description: 'Professional commercial cleaning services for offices, retail spaces, and businesses in Georgetown, Round Rock, Cedar Park, Leander, Pflugerville, Hutto, and Austin. Trusted since 1998 with customized cleaning solutions.',
  
  keywords: 'commercial cleaning Georgetown TX, office cleaning Round Rock, business cleaning Cedar Park, janitorial services Leander, commercial cleaners Pflugerville, office janitorial Hutto, commercial cleaning Austin, Lakeway office cleaning, Bee Cave commercial cleaning, Liberty Hill janitorial services, Jarrell business cleaning, Florence TX commercial cleaners, Taylor office cleaning, Jonestown commercial cleaning, retail cleaning, medical office cleaning',
  
  openGraph: {
    title: 'Commercial Cleaning Services | Impress Cleaning Services Georgetown TX',
    description: 'Professional commercial cleaning services for offices, retail spaces, and businesses in Georgetown, Round Rock, Cedar Park, Leander, Pflugerville, Hutto, and Austin. Trusted since 1998 with customized cleaning solutions.',
    url: 'https://impressyoucleaning.com/commercial',
    siteName: 'Impress Cleaning Services',
    images: [
      {
        url: 'https://impressyoucleaning.com/impress-cleaning-background.png',
        width: 1200,
        height: 630,
        alt: 'Commercial Cleaning Services - Impress Cleaning Services'
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  
  twitter: {
    card: 'summary_large_image',
    title: 'Commercial Cleaning Services | Impress Cleaning Services Georgetown TX',
    description: 'Professional commercial cleaning services for offices, retail spaces, and businesses in Georgetown, Round Rock, Cedar Park, Leander, Pflugerville, Hutto, and Austin. Trusted since 1998.',
    images: ['https://impressyoucleaning.com/impress-cleaning-background.png'],
  },
};

export default function CommercialPage() {
  return <CommercialContent />;
}