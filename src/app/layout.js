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

 

// ✅ SEPARATE viewport export

export const viewport = {

  width: 'device-width',

  initialScale: 1,

  viewportFit: 'cover',

  themeColor: '#FAFAF8',

};

 

// ✅ metadata WITHOUT viewport and themeColor

export const metadata = {

  title: "Impress Cleaning Services - Residential Cleaning Service",

  description: "Residential cleaning services in Central Texas. Reliable and Trusted.",

  icons: {

    icon: [

      { url: '/favicon.png' },

      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },

      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },

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

  return (

    <html lang="en" className={`${manrope.variable} ${onest.variable}`}>

      <body className="font-sans antialiased bg-background text-slate-900">

        {children}

        <Analytics />

      </body>

    </html>

  );

}