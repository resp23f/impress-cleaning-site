'use client'

import { usePathname } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ContactButton from '@/components/ContactButton'
import TawkToChat from '@/components/TawkToChat'

export default function ConditionalLayout({ children }) {
  const pathname = usePathname()

  // Don't show public site header/footer on portal, admin, or auth pages
  const isPortalRoute = pathname.startsWith('/portal') ||
                        pathname.startsWith('/admin') ||
                        pathname.startsWith('/auth')

  return (
    <>
      {!isPortalRoute && <Header />}
      {children}
      {!isPortalRoute && <Footer />}
      {!isPortalRoute && <ContactButton />}
      {!isPortalRoute && <TawkToChat />}
    </>
  )
}
