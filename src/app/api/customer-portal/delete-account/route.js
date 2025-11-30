import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function DELETE() {
  const supabase = await createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = user.id

  try {
    await supabaseAdmin
      .from('profiles')
      .update({
        full_name: 'Deleted Customer',
        phone: null,
        email: null,
      })
      .eq('id', userId)

    await supabaseAdmin
      .from('service_addresses')
      .update({
        street_address: 'Deleted Address',
        unit: null,
        city: null,
        state: null,
        zip_code: null,
        is_primary: false,
      })
      .eq('user_id', userId)

    await supabaseAdmin
      .from('payment_methods')
      .delete()
      .eq('user_id', userId)

    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId)
    if (authError) throw authError

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete account error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
