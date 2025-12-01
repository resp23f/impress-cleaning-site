import SuccessContent from './SuccessContent';

export const metadata = {
  title: 'Gift Certificate Purchase Successful | Impress Cleaning Services Georgetown TX',
  
  description: 'Thank you for your gift certificate purchase! Serving Georgetown, Round Rock, Cedar Park, Leander, Pflugerville, Hutto, and Austin since 1998. Check your email for your gift certificate details and delivery confirmation.',
  
  keywords: 'gift certificate confirmation Georgetown TX, cleaning gift purchased Round Rock, gift card success Cedar Park, cleaning gift confirmation Leander, purchase complete Pflugerville, gift certificate success Hutto, cleaning gift confirmation Austin, Lakeway gift success, Bee Cave gift certificate purchased, Liberty Hill cleaning gift confirmation, Jarrell gift success, Florence TX gift certificate confirmation, Taylor cleaning gift purchased, Jonestown gift certificate success, cleaning gift purchase complete',
  
  openGraph: {
    title: 'Gift Certificate Purchase Successful | Impress Cleaning Services Georgetown TX',
    description: 'Thank you for your gift certificate purchase! Serving Georgetown, Round Rock, Cedar Park, Leander, Pflugerville, Hutto, and Austin since 1998. Check your email for your gift certificate details and delivery confirmation.',
    url: 'https://impressyoucleaning.com/gift-certificate/success',
    siteName: 'Impress Cleaning Services',
    images: [
      {
        url: 'https://impressyoucleaning.com/impress-cleaning-background.png',
        width: 1200,
        height: 630,
        alt: 'Gift Certificate Success - Impress Cleaning Services'
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  
  twitter: {
    card: 'summary_large_image',
    title: 'Gift Certificate Purchase Successful | Impress Cleaning Services Georgetown TX',
    description: 'Thank you for your gift certificate purchase! Serving Georgetown, Round Rock, Cedar Park, Leander, Pflugerville, Hutto, and Austin since 1998. Check your email for details.',
    images: ['https://impressyoucleaning.com/impress-cleaning-background.png'],
  },
};

export default function SuccessPage() {
  return <SuccessContent />;
}