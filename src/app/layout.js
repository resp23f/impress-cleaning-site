import "./globals.css";
import { Nunito_Sans } from "next/font/google";
import Footer from "@/components/Footer";

const nunito = Nunito_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-sans",
});

export const metadata = {
  title: "Impress Cleaning Services",
  description:
    "Locally owned residential cleaning service in Georgetown, TX. Reliable, professional, and thorough home cleaning you can count on.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${nunito.variable} antialiased`}>
      <body className="min-h-screen flex flex-col">
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
