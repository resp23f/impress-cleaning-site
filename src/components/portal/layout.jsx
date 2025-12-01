import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PortalNav from '@/components/portal/PortalNav'
import Toast from '@/components/ui/Toast'
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
 .select('full_name, account_status, role')
 .eq('id', user.id)
 .single()
 // Check if account is approved
 if (profile?.account_status !== 'active') {
  redirect('/auth/pending-approval')
 }
 // Redirect admins to admin panel
 if (profile?.role === 'admin') {
  redirect('/admin/dashboard')
 }
 const firstName = profile?.full_name?.split(' ')[0] || 'there'
 return (
  <div className="min-h-screen bg-gray-50">
  <PortalNav userName={firstName} />
  {/* Main Content */}
  <div className="lg:pl-72">
  <main className="pt-14 md:pt-16 lg:pt-0 pb-20 lg:pb-0">
  {children}
  </main>
  </div>
  <Toast />
  </div>
 )
}