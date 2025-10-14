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
    <html lang="en" className={`${nunito.variable} antialiased bg-gradient-to-b from-white to-[#fdf9f3]`}>
<body className="min-h-screen flex flex-col bg-transparent">
  <main className="flex-1">{children}</main>
  <Footer />
</body>    
</html>
  );
}
