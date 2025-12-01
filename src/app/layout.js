// src/app/layout.js
import "./globals.css";
import { Analytics } from '@vercel/analytics/react';
import { Manrope, Onest } from "next/font/google";

const manrope = Manrope({
 subsets: ["latin"],
 weight: ["400", "500", "600"],
 variable: "--font-sans",
 display: "swap",
});

const onest = Onest({
 subsets: ["latin"],
 weight: ["600", "700"],
 variable: "--font-heading",
 display: "swap",
});

export const viewport = {
 width: 'device-width',
 initialScale: 1,
 viewportFit: 'cover',
 themeColor: '#FAFAF8',
};

export const metadata = {
 title: "Impress Cleaning Services - Residential Cleaning Service",
 description: "Residential cleaning services in Central Texas. Reliable and Trusted.",
 icons: {
  icon: [
   { url: '/favicon.png' },
  ],
  apple: [
   { url: '/apple-touch-icon.png' },
  ],
 },
 appleWebApp: {
  capable: true,
  statusBarStyle: 'default',
 },
};

export default function RootLayout({ children }) {
 const schemaData = {
  "@context": "https://schema.org",
  "@graph": [
   {
    "@type": "LocalBusiness",
    "@id": "https://impressyoucleaning.com/#organization",
    "name": "Impress Cleaning Services",
    "legalName": "Impress Cleaning Services LLC",
    "url": "https://impressyoucleaning.com",
    "logo": "https://impressyoucleaning.com/impress-logo.png",
    "image": "https://impressyoucleaning.com/residential-section-group-photo.png",
    "description": "Professional residential and commercial cleaning services serving Central Texas since 1998. Trusted by thousands of homes in Georgetown, Round Rock, Cedar Park, and surrounding areas.",
    "foundingDate": "1998",
    "address": {
     "@type": "PostalAddress",
     "streetAddress": "1530 Sun City Blvd Ste 120-403",
     "addressLocality": "Georgetown",
     "addressRegion": "TX",
     "postalCode": "78633",
     "addressCountry": "US"
    },
    "geo": {
     "@type": "GeoCoordinates",
     "latitude": "30.6332",
     "longitude": "-97.6779"
    },
    "telephone": "+1-512-277-5364",
    "email": "admin@impressyoucleaning.com",
    "priceRange": "$$",
    "openingHoursSpecification": [
     {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      "opens": "07:00",
      "closes": "18:30"
     },
     {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": "Saturday",
      "opens": "08:00",
      "closes": "17:00"
     }
    ],
    "areaServed": [
     {
      "@type": "City",
      "name": "Georgetown",
      "containedIn": {
       "@type": "State",
       "name": "Texas"
      }
     },
     {
      "@type": "City",
      "name": "Round Rock",
      "containedIn": {
       "@type": "State",
       "name": "Texas"
      }
     },
     {
      "@type": "City",
      "name": "Cedar Park",
      "containedIn": {
       "@type": "State",
       "name": "Texas"
      }
     },
     {
      "@type": "City",
      "name": "Leander",
      "containedIn": {
       "@type": "State",
       "name": "Texas"
      }
     },
     {
      "@type": "City",
      "name": "Pflugerville",
      "containedIn": {
       "@type": "State",
       "name": "Texas"
      }
     },
     {
      "@type": "City",
      "name": "Hutto",
      "containedIn": {
       "@type": "State",
       "name": "Texas"
      }
     },
     {
      "@type": "City",
      "name": "Austin",
      "containedIn": {
       "@type": "State",
       "name": "Texas"
      }
     },
     {
      "@type": "City",
      "name": "Lakeway",
      "containedIn": {
       "@type": "State",
       "name": "Texas"
      }
     },
     {
      "@type": "City",
      "name": "Bee Cave",
      "containedIn": {
       "@type": "State",
       "name": "Texas"
      }
     },
     {
      "@type": "City",
      "name": "Liberty Hill",
      "containedIn": {
       "@type": "State",
       "name": "Texas"
      }
     },
     {
      "@type": "City",
      "name": "Jarrell",
      "containedIn": {
       "@type": "State",
       "name": "Texas"
      }
     },
     {
      "@type": "City",
      "name": "Florence",
      "containedIn": {
       "@type": "State",
       "name": "Texas"
      }
     },
     {
      "@type": "City",
      "name": "Taylor",
      "containedIn": {
       "@type": "State",
       "name": "Texas"
      }
     },
     {
      "@type": "City",
      "name": "Jonestown",
      "containedIn": {
       "@type": "State",
       "name": "Texas"
      }
     }
    ],
    "sameAs": [
     "https://www.facebook.com/people/Impress-Cleaning-Services-LLC/61583022374354/",
     "https://www.yelp.com/biz/impress-cleaning-services-austin",
     "https://nextdoor.com/page/impress-you-cleaning-georgetown-tx"
    ],
    "hasOfferCatalog": {
     "@type": "OfferCatalog",
     "name": "Cleaning Services",
     "itemListElement": [
      {
       "@type": "Offer",
       "itemOffered": {
        "@type": "Service",
        "name": "Residential Cleaning",
        "description": "Professional house cleaning services including deep cleaning, regular maintenance, and move-in/move-out cleaning"
       }
      },
      {
       "@type": "Offer",
       "itemOffered": {
        "@type": "Service",
        "name": "Commercial Cleaning",
        "description": "Office and commercial space cleaning services with flexible scheduling"
       }
      },
      {
       "@type": "Offer",
       "itemOffered": {
        "@type": "Service",
        "name": "Deep Cleaning",
        "description": "Comprehensive deep cleaning service for homes and businesses"
       }
      },
      {
       "@type": "Offer",
       "itemOffered": {
        "@type": "Service",
        "name": "Move-In/Move-Out Cleaning",
        "description": "Thorough cleaning for properties during relocation"
       }
      }
     ]
    }
   }
  ]
 };

 return (
  <html lang="en" className={`${manrope.variable} ${onest.variable}`}>
   <head>
    <script
     type="application/ld+json"
     dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
    />
   </head>
   <body className="font-sans antialiased bg-background text-slate-900">
    {children}
    <Analytics />
   </body>
  </html>
 );
}