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
<main className="pt-[130px] md:pt-[150px] lg:pt-[160px] min-h-screen flex-col">
  {children}
</main>
      </PageTransition>
      <Footer />
      <ContactButton />
      <TawkToChat />
    </>
  );
}