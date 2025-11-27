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

  const missingEnv = []
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) missingEnv.push('NEXT_PUBLIC_SUPABASE_URL')
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) missingEnv.push('SUPABASE_SERVICE_ROLE_KEY')

  if (missingEnv.length > 0) {
    const error = new Error(
      `Supabase admin client is missing env vars: ${missingEnv.join(', ')}`
    )
    console.error('❌ Cannot create notification - admin client not configured:', error)
    return { success: false, error }
  }

  if (!userId) {
    const error = new Error('userId is required to create a customer notification')
    console.error('❌ Cannot create notification - missing userId:', error)
    return { success: false, error }
  }
  
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
      console.error('❌ Error creating notification:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      })
      return { success: false, error }
    }

    console.log('✅ Notification created successfully:', data)
    return { success: true, data }
  } catch (error) {
    console.error('❌ Failed to create customer notification:', error)
    return { success: false, error }
  }
}
