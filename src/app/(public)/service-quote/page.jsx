import ServiceQuoteContent from './ServiceQuoteContent';

export const metadata = {
  title: 'Get a Free Cleaning Quote | Impress Cleaning Services Georgetown TX',
  
  description: 'Request a free cleaning quote for your home or business in Georgetown, Round Rock, Cedar Park, Leander, Pflugerville, Hutto, and Austin. Serving Central Texas since 1998 with transparent pricing and customized cleaning plans.',
  
  keywords: 'free cleaning quote Georgetown TX, cleaning estimate Round Rock, service quote Cedar Park, cleaning pricing Leander, free estimate Pflugerville, cleaning quote Hutto, service estimate Austin, Lakeway cleaning quote, Bee Cave free estimate, Liberty Hill cleaning pricing, Jarrell service quote, Florence TX cleaning estimate, Taylor cleaning quote, Jonestown free quote, house cleaning estimate, commercial cleaning quote',
  
  openGraph: {
    title: 'Get a Free Cleaning Quote | Impress Cleaning Services Georgetown TX',
    description: 'Request a free cleaning quote for your home or business in Georgetown, Round Rock, Cedar Park, Leander, Pflugerville, Hutto, and Austin. Serving Central Texas since 1998 with transparent pricing and customized cleaning plans.',
    url: 'https://impressyoucleaning.com/service-quote',
    siteName: 'Impress Cleaning Services',
    images: [
      {
        url: 'https://impressyoucleaning.com/impress-cleaning-background.png',
        width: 1200,
        height: 630,
        alt: 'Free Cleaning Quote - Impress Cleaning Services'
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  
  twitter: {
    card: 'summary_large_image',
    title: 'Get a Free Cleaning Quote | Impress Cleaning Services Georgetown TX',
    description: 'Request a free cleaning quote for your home or business in Georgetown, Round Rock, Cedar Park, Leander, Pflugerville, Hutto, and Austin. Serving Central Texas since 1998.',
    images: ['https://impressyoucleaning.com/impress-cleaning-background.png'],
  },
};

export default function ServiceQuotePage() {
  return <ServiceQuoteContent />;
}