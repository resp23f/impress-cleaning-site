import { supabaseAdmin } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sanitizeText } from '@/lib/sanitize'
export async function POST(request) {
  try {
    // Verify user is admin
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
const invoiceData = await request.json()

    // Sanitize text fields
    const sanitizedData = {
      ...invoiceData,
      notes: invoiceData.notes 
        ? sanitizeText(invoiceData.notes).slice(0, 1000) 
        : null,
      // Sanitize line item descriptions if present
      line_items: invoiceData.line_items 
        ? invoiceData.line_items.map(item => ({
            ...item,
            description: item.description 
              ? sanitizeText(item.description).slice(0, 200) 
              : ''
          }))
        : null,
    }

    // Generate invoice number using database function
        const { data: invoiceNumber, error: numberError } = await supabaseAdmin
      .rpc('generate_invoice_number')
    if (numberError) throw numberError
    // Create invoice using admin client
const { data, error } = await supabaseAdmin
      .from('invoices')
      .insert([{
        ...sanitizedData,
        invoice_number: invoiceNumber
      }])
      .select()
          if (error) throw error
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error creating invoice:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}