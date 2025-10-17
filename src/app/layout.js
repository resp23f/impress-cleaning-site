// src/app/layout.jsx
import "./globals.css";
import { Oswald } from "next/font/google";
import Footer from "@/components/Footer";

const oswald = Oswald({
subsets: ["latin"],
weight: ['400', '500', '600', '700'],
display: "swap",
variable: "--font-brand", // we'll use this only for the logo word
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
    className={`${oswald.variable} bg-[#FAFBFC] text-slate-900 antialiased`}
    >
    <main className="min-h-screen flex flex-col">{children}</main>
    <Footer />
    </body>
</html>
);
}