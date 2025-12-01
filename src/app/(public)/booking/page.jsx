import BookingContent from './BookingContent';

export const metadata = {
  title: 'Book Cleaning Service Online | Impress Cleaning Services Georgetown TX',
  
  description: 'Book your professional cleaning service online in Georgetown, Round Rock, Cedar Park, Leander, Pflugerville, Hutto, and Austin. Trusted since 1998. Easy online scheduling, instant quotes, and flexible appointments.',
  
  keywords: 'book cleaning service Georgetown TX, schedule cleaning Round Rock, online booking Cedar Park, cleaning appointment Leander, book maid service Pflugerville, schedule house cleaning Hutto, cleaning booking Austin, Lakeway cleaning booking, Bee Cave online scheduling, Liberty Hill cleaning appointment, Jarrell booking, Florence TX cleaning schedule, Taylor house cleaning booking, Jonestown cleaning service, online cleaning quotes, instant cleaning booking',
  
  openGraph: {
    title: 'Book Cleaning Service Online | Impress Cleaning Services Georgetown TX',
    description: 'Book your professional cleaning service online in Georgetown, Round Rock, Cedar Park, Leander, Pflugerville, Hutto, and Austin. Trusted since 1998. Easy online scheduling, instant quotes, and flexible appointments.',
    url: 'https://impressyoucleaning.com/booking',
    siteName: 'Impress Cleaning Services',
    images: [
      {
        url: 'https://impressyoucleaning.com/impress-cleaning-background.png',
        width: 1200,
        height: 630,
        alt: 'Book Cleaning Service - Impress Cleaning Services'
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  
  twitter: {
    card: 'summary_large_image',
    title: 'Book Cleaning Service Online | Impress Cleaning Services Georgetown TX',
    description: 'Book your professional cleaning service online in Georgetown, Round Rock, Cedar Park, Leander, Pflugerville, Hutto, and Austin. Trusted since 1998. Easy online scheduling and instant quotes.',
    images: ['https://impressyoucleaning.com/impress-cleaning-background.png'],
  },
};

export default function BookingPage() {
  return <BookingContent />;
}