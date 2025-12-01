import FAQContent from './FAQContent';

export const metadata = {
  title: 'Frequently Asked Questions | Impress Cleaning Services Georgetown TX',
  
  description: 'Get answers to common questions about our cleaning services in Georgetown, Round Rock, Cedar Park, Leander, Pflugerville, Hutto, and Austin. Serving Central Texas since 1998 with transparent pricing and flexible scheduling.',
  
  keywords: 'cleaning FAQ Georgetown TX, cleaning questions Round Rock, house cleaning answers Cedar Park, cleaning service FAQ Leander, maid service questions Pflugerville, cleaning help Hutto, cleaning FAQ Austin, Lakeway cleaning questions, Bee Cave cleaning FAQ, Liberty Hill cleaning answers, Jarrell cleaning questions, Florence TX cleaning FAQ, Taylor cleaning help, Jonestown cleaning questions, cleaning service answers, house cleaning help',
  
  openGraph: {
    title: 'Frequently Asked Questions | Impress Cleaning Services Georgetown TX',
    description: 'Get answers to common questions about our cleaning services in Georgetown, Round Rock, Cedar Park, Leander, Pflugerville, Hutto, and Austin. Serving Central Texas since 1998 with transparent pricing and flexible scheduling.',
    url: 'https://impressyoucleaning.com/faq',
    siteName: 'Impress Cleaning Services',
    images: [
      {
        url: 'https://impressyoucleaning.com/impress-cleaning-background.png',
        width: 1200,
        height: 630,
        alt: 'FAQ - Impress Cleaning Services'
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  
  twitter: {
    card: 'summary_large_image',
    title: 'Frequently Asked Questions | Impress Cleaning Services Georgetown TX',
    description: 'Get answers to common questions about our cleaning services in Georgetown, Round Rock, Cedar Park, Leander, Pflugerville, Hutto, and Austin. Serving Central Texas since 1998.',
    images: ['https://impressyoucleaning.com/impress-cleaning-background.png'],
  },
};

export default function FAQPage() {
  return <FAQContent />;
}