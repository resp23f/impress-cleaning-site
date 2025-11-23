import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateInvoicePDF } from '@/lib/pdf/generateInvoice'

export async function GET(request, { params }) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Get the authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch invoice with related data
    const { data: invoice, error } = await supabase
      .from('invoices')
      .select(`
        *,
        profiles!invoices_user_id_fkey (
          full_name,
          email,
          phone
        ),
        service_addresses (
          address,
          address_line2,
          city,
          state,
          zip_code
        )
      `)
      .eq('id', id)
      .single()

    if (error) throw error

    // Check if user owns this invoice (or is admin)
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (invoice.user_id !== user.id && profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Generate PDF
    const doc = generateInvoicePDF(
      invoice,
      invoice.profiles,
      invoice.service_addresses
    )

    // Convert to buffer
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'))

    // Return PDF with appropriate headers
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Invoice-${invoice.invoice_number}.pdf"`,
      },
    })
  } catch (error) {
    console.error('Error generating PDF:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    )
  }
}
