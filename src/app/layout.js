// src/app/layout.jsx
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ContactButton from '@/components/ContactButton'
import { Analytics } from '@vercel/analytics/react';
import { Inter, Playfair_Display } from "next/font/google";


const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
    variable: "--font-playfair",
});

export const metadata = {
title: "House Cleaning Services | Impress Cleaning Services",
description:
"Locally owned residential cleaning service in Georgetown, TX. Reliable, professional, and thorough home cleaning.",
colorScheme: "light",      // <- opt out of OS dark
themeColor: "#FFFDF8",     // <- iOS/Android top bar color
viewport: {
width: "device-width",
initialScale: 1,
viewportFit: "cover",    // <- respects the notch (safe areas)
},
icons: {
icon: { url: "/favicon-v2.png", sizes: "32x32", type: "image/png" },
apple: { url: "/favicon-v2.png", sizes: "180x180", type: "image/png" },
},
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="bg-[#FAFAF8] text-slate-900 antialiased">

       <Header />
        <main className="min-h-screen flex flex-col">
            {children}
        </main>
        <Footer/>
        <ContactButton />
      </body>
    </html>
  );
}
