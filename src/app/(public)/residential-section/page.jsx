import ResidentialContent from './ResidentialContent';

export const metadata = {
  title: 'Residential Cleaning Services Georgetown TX | Impress Cleaning Services',
  
  description: 'Professional residential cleaning services in Georgetown, Round Rock, Cedar Park, Leander, Pflugerville, Hutto, and Austin. Trusted since 1998 with eco-friendly products, flexible scheduling, and satisfaction guaranteed.',
  
  keywords: 'residential cleaning Georgetown TX, house cleaning Round Rock, home cleaning Cedar Park, maid service Leander, house cleaners Pflugerville, residential cleaners Hutto, home cleaning Austin, Lakeway house cleaning, Bee Cave residential cleaning, Liberty Hill maid service, Jarrell house cleaners, Florence TX home cleaning, Taylor residential cleaning, Jonestown house cleaning, deep cleaning, move-in cleaning, move-out cleaning',
  
  openGraph: {
    title: 'Residential Cleaning Services Georgetown TX | Impress Cleaning Services',
    description: 'Professional residential cleaning services in Georgetown, Round Rock, Cedar Park, Leander, Pflugerville, Hutto, and Austin. Trusted since 1998 with eco-friendly products, flexible scheduling, and satisfaction guaranteed.',
    url: 'https://impressyoucleaning.com/residential-section',
    siteName: 'Impress Cleaning Services',
    images: [
      {
        url: 'https://impressyoucleaning.com/residential-section-group-photo.png',
        width: 1200,
        height: 630,
        alt: 'Residential Cleaning Services - Impress Cleaning Services'
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  
  twitter: {
    card: 'summary_large_image',
    title: 'Residential Cleaning Services Georgetown TX | Impress Cleaning Services',
    description: 'Professional residential cleaning services in Georgetown, Round Rock, Cedar Park, Leander, Pflugerville, Hutto, and Austin. Trusted since 1998 with eco-friendly products and flexible scheduling.',
    images: ['https://impressyoucleaning.com/residential-section-group-photo.png'],
  },
};

export default function ResidentialPage() {
  return <ResidentialContent />;
}