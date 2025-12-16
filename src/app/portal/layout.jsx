import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PortalNav from '@/components/portal/PortalNav'
import Toast from '@/components/ui/Toast'
export const metadata = {
  title: 'Client Portal | Impress Cleaning Services',
}
export default async function PortalLayout({ children }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth/login')
  }
  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, phone, role')
    .eq('id', user.id)
    .single()
  // Require completed profile
  if (!profile?.full_name || !profile?.phone) {
    redirect('/auth/profile-setup')
  }
  // Redirect admins to admin panel
  if (profile?.role === 'admin') {
    redirect('/admin/dashboard')
  }
  const firstName = profile?.full_name?.split(' ')[0] || 'there'
  return (
    <>
      <style>{`
  html, body {
    background: #f1f5f9;
    -webkit-overflow-scrolling: touch;
  }
`}</style>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 overscroll-none">
        <PortalNav userName={firstName} />
        {/* Main Content */}
        <div className="lg:pl-72">
          <main className="pt-12 lg:pt-0 pb-20 lg:pb-0">
            {children}
          </main>
        </div>
        <Toast />
      </div>
    </>
  )
}
