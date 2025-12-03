import ApplyContent from './ApplyContent';

export const metadata = {
  title: 'Careers at Impress Cleaning Services | Join Our Team in Georgetown TX',
  
  description: 'Join our professional cleaning team serving Georgetown, Round Rock, Cedar Park, Leander, Pflugerville, Hutto, and Austin since 1998. Competitive pay, paid training, health benefits, and flexible schedules. Apply today.',
  
  keywords: 'cleaning jobs Georgetown TX, house cleaning careers Round Rock, maid service jobs Cedar Park, cleaning employment Leander, janitorial jobs Pflugerville, housekeeping jobs Hutto, cleaning careers Austin, Lakeway cleaning jobs, Bee Cave employment, Liberty Hill cleaning careers, Jarrell jobs, Florence TX cleaning employment, Taylor housekeeping jobs, Jonestown cleaning careers, residential cleaning jobs Central Texas, cleaning technician jobs, professional cleaning employment',
  
  openGraph: {
    title: 'Careers at Impress Cleaning Services | Join Our Team in Georgetown TX',
    description: 'Join our professional cleaning team serving Georgetown, Round Rock, Cedar Park, Leander, Pflugerville, Hutto, and Austin since 1998. Competitive pay, paid training, health benefits, and flexible schedules.',
    url: 'https://impressyoucleaning.com/apply',
    siteName: 'Impress Cleaning Services',
    images: [
      {
        url: 'https://impressyoucleaning.com/careers-hero.jpg',
        width: 1200,
        height: 630,
        alt: 'Careers at Impress Cleaning Services'
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  
  twitter: {
    card: 'summary_large_image',
    title: 'Careers at Impress Cleaning Services | Join Our Team in Georgetown TX',
    description: 'Join our professional cleaning team serving Georgetown, Round Rock, Cedar Park, Leander, Pflugerville, Hutto, and Austin since 1998. Competitive pay, paid training, and health benefits.',
    images: ['https://impressyoucleaning.com/careers-hero.jpg'],
  },
};

export default function ApplyPage() {
  return <ApplyContent />;
}