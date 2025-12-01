import JobApplicationContent from './JobApplicationContent';

export const metadata = {
  title: 'Job Application | Impress Cleaning Services Georgetown TX',
  
  description: 'Apply for professional cleaning positions in Georgetown, Round Rock, Cedar Park, Leander, Pflugerville, Hutto, and Austin. Paid training, full benefits, and flexible schedules. Join our team established in 1998.',
  
  keywords: 'apply cleaning job Georgetown TX, job application Round Rock, employment application Cedar Park, apply cleaner Leander, cleaning job form Pflugerville, employment Hutto, cleaning job application Austin, Lakeway job application, Bee Cave employment form, Liberty Hill cleaning application, Jarrell job form, Florence TX employment application, Taylor housekeeping application, Jonestown cleaning job application, job application form, housekeeping application, cleaning technician application',
  
  openGraph: {
    title: 'Job Application | Impress Cleaning Services Georgetown TX',
    description: 'Apply for professional cleaning positions in Georgetown, Round Rock, Cedar Park, Leander, Pflugerville, Hutto, and Austin. Paid training, full benefits, and flexible schedules.',
    url: 'https://impressyoucleaning.com/apply/jobs',
    siteName: 'Impress Cleaning Services',
    images: [
      {
        url: 'https://impressyoucleaning.com/careers-hero.jpg',
        width: 1200,
        height: 630,
        alt: 'Job Application - Impress Cleaning Services'
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  
  twitter: {
    card: 'summary_large_image',
    title: 'Job Application | Impress Cleaning Services Georgetown TX',
    description: 'Apply for professional cleaning positions in Georgetown, Round Rock, Cedar Park, Leander, Pflugerville, Hutto, and Austin. Paid training and full benefits.',
    images: ['https://impressyoucleaning.com/careers-hero.jpg'],
  },
};

export default function JobApplicationPage() {
  return <JobApplicationContent />;
}