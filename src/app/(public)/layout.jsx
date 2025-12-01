import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ContactButton from "@/components/ContactButton";
import TawkToChat from "@/components/TawkToChat";
import PageTransition from '@/components/PageTransition';
export default function PublicLayout({ children }) {
  return (
    <>
      <Header />
      <PageTransition>
<main className="pt-[75px] md:pt-[90px] lg:pt-[110px] xl:pt-[120px] 2xl:pt-[135px] min-h-screen flex-col">          {children}
        </main>
      </PageTransition>
      <Footer />
      <ContactButton />
      <TawkToChat />
    </>
  );
}