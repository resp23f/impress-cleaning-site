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

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    console.error('Error creating customer notification:', error)
    return { success: false, error }
  }
}