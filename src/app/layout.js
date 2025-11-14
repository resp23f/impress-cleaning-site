// src/app/layout.js
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ContactButton from "@/components/ContactButton";
import TawkToChat from "@/components/TawkToChat";
import PageTransition from '@/components/PageTransition'
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


export const metadata = {
  title: "Impress Cleaning Services - Professional House Cleaning in Georgetown, TX",
  description: "Professional cleaning services in Georgetown, Austin, and Central Texas. Reliable, insured, and trusted for over 15 years.",
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png' },
    ],
  },
};


export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${manrope.variable} ${onest.variable}`}>
      <body className="font-sans antialiased bg-background text-slate-900">
        <Header />
        <PageTransition>
        <main className="min-h-screen flex-col">
          {children}
        </main>
        <Footer />
        </PageTransition>
        <ContactButton />
        <TawkToChat />
      </body>
    </html>
  );
}
