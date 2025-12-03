import CleaningTipsContent from './CleaningTipsContent';

export const metadata = {
  title: 'Cleaning Tips & Advice | Impress Cleaning Services Georgetown TX',
  
  description: 'Expert cleaning tips and advice from our professional team serving Georgetown, Round Rock, Cedar Park, Leander, Pflugerville, Hutto, and Austin since 1998. Learn effective cleaning techniques and maintenance strategies.',
  
  keywords: 'cleaning tips Georgetown TX, house cleaning advice Round Rock, cleaning hacks Cedar Park, home maintenance tips Leander, cleaning guides Pflugerville, housekeeping tips Hutto, cleaning advice Austin, Lakeway cleaning tips, Bee Cave cleaning advice, Liberty Hill cleaning guides, Jarrell cleaning tips, Florence TX cleaning advice, Taylor housekeeping tips, Jonestown cleaning hacks, professional cleaning tips, home cleaning advice',
  
  openGraph: {
    title: 'Cleaning Tips & Advice | Impress Cleaning Services Georgetown TX',
    description: 'Expert cleaning tips and advice from our professional team serving Georgetown, Round Rock, Cedar Park, Leander, Pflugerville, Hutto, and Austin since 1998. Learn effective cleaning techniques and maintenance strategies.',
    url: 'https://impressyoucleaning.com/cleaning-tips',
    siteName: 'Impress Cleaning Services',
    images: [
      {
        url: 'https://impressyoucleaning.com/impress-cleaning-background.png',
        width: 1200,
        height: 630,
        alt: 'Cleaning Tips - Impress Cleaning Services'
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  
  twitter: {
    card: 'summary_large_image',
    title: 'Cleaning Tips & Advice | Impress Cleaning Services Georgetown TX',
    description: 'Expert cleaning tips and advice from our professional team serving Georgetown, Round Rock, Cedar Park, Leander, Pflugerville, Hutto, and Austin since 1998. Learn effective cleaning techniques.',
    images: ['https://impressyoucleaning.com/impress-cleaning-background.png'],
  },
};

export default function CleaningTipsPage() {
  return <CleaningTipsContent />;
}