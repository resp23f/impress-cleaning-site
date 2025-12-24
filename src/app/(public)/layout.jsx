import Script from 'next/script'
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ContactButton from "@/components/ContactButton";
import TawkToChat from "@/components/TawkToChat";
import PageTransition from '@/components/PageTransition';
export default function PublicLayout({ children }) {
  return (
    <>
      {/* Google Analytics - Public pages only */}
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-99P0RRZZ61"
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-99P0RRZZ61');
        `}
      </Script>

      <Header />
      <PageTransition>
<main className="pt-[var(--header-offset)] min-h-screen flex-col">
  {children}
</main>
      </PageTransition>
      <Footer />
      <ContactButton />
      <TawkToChat />
    </>
  );
}
