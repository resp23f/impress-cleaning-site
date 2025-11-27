import { supabaseAdmin } from '@/lib/supabase/admin'

export async function createCustomerNotification({
  userId,
  type,
  title,
  message,
  link,
  referenceId = null,
  referenceType = null,
}) {
  console.log('🔔 Creating notification for user:', userId)
  console.log('📋 Notification data:', { type, title, message, link })
  
  try {
    const { data, error } = await supabaseAdmin
      .from('customer_notifications')
      .insert({
        user_id: userId,
        type,
        title,
        message,
        link,
        reference_id: referenceId,
        reference_type: referenceType,
        is_read: false,
      })
      .select()
      .single()

    if (error) {
      console.error('❌ Error creating notification:', error)
      throw error
    }

    console.log('✅ Notification created successfully:', data)
    return { success: true, data }
  } catch (error) {
    console.error('❌ Failed to create customer notification:', error)
    return { success: false, error }
  }
}