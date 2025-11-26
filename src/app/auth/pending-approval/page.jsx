'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Clock, CheckCircle, Mail } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
export default function PendingApprovalPage() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)
  const [user, setUser] = useState(null)
  const supabase = createClient()
  useEffect(() => {
    const checkStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }
      setUser(user)
      const { data: profile } = await supabase
        .from('profiles')
        .select('account_status, role')
        .eq('id', user.id)
        .single()
      if (profile?.account_status === 'active') {
        // Account is approved, redirect to dashboard
        const redirectUrl = profile.role === 'admin' ? '/admin/dashboard' : '/portal/dashboard'
        router.push(redirectUrl)
      } else {
        setChecking(false)
      }
    }
    checkStatus()
    // Set up real-time subscription to listen for approval
    const channel = supabase
      .channel('profile-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user?.id}`,
        },
        (payload) => {
          if (payload.new.account_status === 'active') {
            const redirectUrl = payload.new.role === 'admin' ? '/admin/dashboard' : '/portal/dashboard'
            router.push(redirectUrl)
          }
        }
      )
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, router, user?.id])
  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }
  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center">
            <Clock className="w-10 h-10 text-yellow-600" />
          </div>
        </div>
        {/* Content */}
        <h1 className="text-2xl font-bold text-[#1C294E] mb-3">
          Account Pending Approval
        </h1>
        <p className="text-gray-600 mb-6">
          Thanks for completing your profile! We&apos;re reviewing your account and you&apos;ll receive an email within 24 hours once you&apos;re approved.
        </p>
        {/* What Happens Next */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6 text-left">
          <h2 className="font-semibold text-[#1C294E] mb-3 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-blue-600" />
            What happens next?
          </h2>
          <ol className="text-sm text-gray-700 space-y-2 list-decimal list-inside">
            <li>Our team will review your registration</li>
            <li>You&apos;ll receive an approval email within 24 hours</li>
            <li>Click the link in the email to access your portal</li>
            <li>Start booking cleaning services!</li>
          </ol>
        </div>
        {/* Email Notice */}
        <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-6">
          <Mail className="w-4 h-4" />
          <span>
            We&apos;ll send updates to <strong>{user?.email}</strong>
          </span>
        </div>
        {/* Logout Button */}
        <Button
          variant="text"
          onClick={handleLogout}
        >
          Log Out
        </Button>
      </Card>
    </div>
  )
}