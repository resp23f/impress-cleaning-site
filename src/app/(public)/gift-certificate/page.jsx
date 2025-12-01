import GiftCertificateContent from './GiftCertificateContent';

export const metadata = {
  title: 'Gift Certificates | Impress Cleaning Services Georgetown TX',
  
  description: 'Give the gift of a clean home with Impress Cleaning Services gift certificates. Serving Georgetown, Round Rock, Cedar Park, Leander, Pflugerville, Hutto, and Austin since 1998. Perfect for housewarmings, holidays, and special occasions.',
  
  keywords: 'cleaning gift certificate Georgetown TX, gift card cleaning Round Rock, cleaning gift Cedar Park, house cleaning gift Leander, maid service gift certificate Pflugerville, cleaning voucher Hutto, cleaning gift card Austin, Lakeway cleaning gift, Bee Cave gift certificate, Liberty Hill cleaning gift card, Jarrell cleaning voucher, Florence TX cleaning gift, Taylor house cleaning gift, Jonestown cleaning gift certificate, cleaning service gift, housewarming gift',
  
  openGraph: {
    title: 'Gift Certificates | Impress Cleaning Services Georgetown TX',
    description: 'Give the gift of a clean home with Impress Cleaning Services gift certificates. Serving Georgetown, Round Rock, Cedar Park, Leander, Pflugerville, Hutto, and Austin since 1998. Perfect for housewarmings, holidays, and special occasions.',
    url: 'https://impressyoucleaning.com/gift-certificate',
    siteName: 'Impress Cleaning Services',
    images: [
      {
        url: 'https://impressyoucleaning.com/impress-cleaning-background.png',
        width: 1200,
        height: 630,
        alt: 'Gift Certificates - Impress Cleaning Services'
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  
  twitter: {
    card: 'summary_large_image',
    title: 'Gift Certificates | Impress Cleaning Services Georgetown TX',
    description: 'Give the gift of a clean home with Impress Cleaning Services gift certificates. Serving Georgetown, Round Rock, Cedar Park, Leander, Pflugerville, Hutto, and Austin since 1998.',
    images: ['https://impressyoucleaning.com/impress-cleaning-background.png'],
  },
};

export default function GiftCertificatePage() {
  return <GiftCertificateContent />;
}