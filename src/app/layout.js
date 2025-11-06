// src/app/layout.jsx
import "./globals.css";
import { Inter, Bebas_Neue } from "next/font/google";
import Footer from "@/components/Footer";
import { Analytics } from '@vercel/analytics/react';

const inter = Inter({
subsets: ["latin"],
weight: ["300", "400", "500"],
display: "swap",
variable: "--font-body",
});

const bebasNeue = Bebas_Neue({
subsets: ["latin"],
weight: ["400"],
display: "swap",
variable: "--font-heading",
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
    <html lang="en">
<body
  className={`${inter.variable} ${bebasNeue.variable} bg-[#FFFDF8] text-slate-900 antialiased`}
>
        <main className="min-h-screen flex flex-col">
          <div className="container">{children}</div>
        </main>
        <Footer/>
      </body>
    </html>
  );
}
