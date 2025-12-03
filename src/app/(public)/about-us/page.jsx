import AboutContent from './AboutContent';

export const metadata = {
  title: 'About Impress Cleaning Services | 25+ Years Serving Georgetown & Central Texas',
  
  description: 'Professional cleaning service established in 1998, serving Georgetown, Round Rock, Cedar Park, Leander, Pflugerville, Hutto, and Austin. Meet our experienced team and discover our commitment to quality.',
  
  keywords: 'about Impress Cleaning Services, Georgetown cleaning company, Round Rock cleaning service, Cedar Park cleaners, Leander house cleaning, Pflugerville cleaning company, Hutto cleaning service, Austin cleaning, Lakeway cleaning, Bee Cave cleaning service, Liberty Hill cleaners, Jarrell cleaning, Florence TX cleaning, Taylor cleaning service, Jonestown cleaners, Central Texas cleaning',
  
  openGraph: {
    title: 'About Impress Cleaning Services | 25+ Years Serving Georgetown & Central Texas',
    description: 'Professional cleaning service established in 1998, serving Georgetown, Round Rock, Cedar Park, Leander, Pflugerville, Hutto, and Austin. Meet our experienced team and discover our commitment to quality.',
    url: 'https://impressyoucleaning.com/about-us',
    siteName: 'Impress Cleaning Services',
    images: [
      {
        url: 'https://impressyoucleaning.com/residential-section-group-photo.png',
        width: 1200,
        height: 630,
        alt: 'Impress Cleaning Services Professional Team'
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  
  twitter: {
    card: 'summary_large_image',
    title: 'About Impress Cleaning Services | 25+ Years Serving Georgetown & Central Texas',
    description: 'Professional cleaning service established in 1998, serving Georgetown, Round Rock, Cedar Park, Leander, Pflugerville, Hutto, and Austin. Meet our experienced team and discover our commitment to quality.',
    images: ['https://impressyoucleaning.com/residential-section-group-photo.png'],
  },
};

export default function AboutUsPage() {
  return <AboutContent />;
}