import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET(request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const missingEnv = []
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) missingEnv.push('NEXT_PUBLIC_SUPABASE_URL')
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) missingEnv.push('SUPABASE_SERVICE_ROLE_KEY')

    if (missingEnv.length > 0) {
      console.error(
        '❌ Notifications fetch aborted - admin client missing env vars:',
        missingEnv.join(', ')
      )
      return NextResponse.json(
        { error: 'Server misconfigured', missingEnv },
        { status: 500 }
      )
    }

    // Get customer notifications using admin client (bypass RLS)
    const { data: notifications, error } = await supabaseAdmin
      .from('customer_notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) {
      console.error('❌ Error fetching notifications for user:', {
        userId: user.id,
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      })
      throw error
    }

    console.log('🔔 Notifications fetched:', {
      userId: user.id,
      count: notifications?.length || 0,
    })

    // Get unread count
    const unreadCount = notifications?.filter(n => !n.is_read).length || 0

    return NextResponse.json({
      data: notifications || [],
      unreadCount,
    })
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch notifications' },
      { status: 500 }
    )
  }
}
