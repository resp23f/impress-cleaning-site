// src/app/layout.jsx
import "./globals.css";
import { Nunito_Sans, Cinzel } from "next/font/google";
import Footer from "@/components/Footer";

const nunito = Nunito_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
});

const brand = Cinzel({
  subsets: ["latin"],
  weight: ["700", "800", "900"],
  display: "swap",
  variable: "--font-brand", // we'll use this only for the logo word
});

export const metadata = {
  title: "House Cleaning Services | Impress Cleaning Services",
  description:
    "Locally owned residential cleaning service in Georgetown, TX. Reliable, professional, and thorough home cleaning you can count on.",
  icons: {
    icon: [
      { url: "/favicon-v2.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-v2.png", sizes: "512x512", type: "image/png" },
    ],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="bg-[#FFFDF8] text-slate-900 antialiased">
      {/* expose both font variables on <body> */}
      <body className={`${nunito.variable} ${playfair.variable} min-h-screen flex flex-col`}>
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
