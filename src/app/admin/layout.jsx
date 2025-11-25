import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Toast from '@/components/ui/Toast'
export default async function AdminLayout({ children }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth/login')
  }
  // Get user profile and check admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .single()
  // Redirect non-admins
  if (profile?.role !== 'admin') {
    redirect('/portal/dashboard')
  }
  return (
    <div className="min-h-screen bg-gray-50">
      <Toast />
      {children}
    </div>
  )
}