import ConfirmationContent from './ConfirmationContent';

export const metadata = {
  title: 'Booking Confirmed | Impress Cleaning Services Georgetown TX',
  
  description: 'Your cleaning service is confirmed! Serving Georgetown, Round Rock, Cedar Park, Leander, Pflugerville, Hutto, and Austin since 1998. Check your email for booking details and next steps.',
  
  keywords: 'booking confirmation Georgetown TX, cleaning appointment confirmed Round Rock, service confirmation Cedar Park, cleaning scheduled Leander, appointment confirmed Pflugerville, booking success Hutto, cleaning confirmation Austin, Lakeway booking confirmed, Bee Cave appointment confirmation, Liberty Hill cleaning scheduled, Jarrell service confirmed, Florence TX booking confirmation, Taylor cleaning appointment, Jonestown booking success, cleaning service confirmed',
  
  openGraph: {
    title: 'Booking Confirmed | Impress Cleaning Services Georgetown TX',
    description: 'Your cleaning service is confirmed! Serving Georgetown, Round Rock, Cedar Park, Leander, Pflugerville, Hutto, and Austin since 1998. Check your email for booking details and next steps.',
    url: 'https://impressyoucleaning.com/booking/confirmation',
    siteName: 'Impress Cleaning Services',
    images: [
      {
        url: 'https://impressyoucleaning.com/impress-cleaning-background.png',
        width: 1200,
        height: 630,
        alt: 'Booking Confirmed - Impress Cleaning Services'
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  
  twitter: {
    card: 'summary_large_image',
    title: 'Booking Confirmed | Impress Cleaning Services Georgetown TX',
    description: 'Your cleaning service is confirmed! Serving Georgetown, Round Rock, Cedar Park, Leander, Pflugerville, Hutto, and Austin since 1998. Check your email for booking details.',
    images: ['https://impressyoucleaning.com/impress-cleaning-background.png'],
  },
};

export default function ConfirmationPage() {
  return <ConfirmationContent />;
}