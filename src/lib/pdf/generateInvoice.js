import jsPDF from 'jspdf'
import 'jspdf-autotable'
import { format } from 'date-fns'

/**
 * Generate a PDF invoice
 * @param {Object} invoice - Invoice data from Supabase
 * @param {Object} customer - Customer profile data
 * @param {Object} address - Service address data
 * @returns {jsPDF} PDF document
 */
export function generateInvoicePDF(invoice, customer, address) {
  const doc = new jsPDF()

  // Brand colors
  const primaryGreen = [7, 148, 71] // #079447
  const darkNavy = [28, 41, 78] // #1C294E
  const lightGray = [243, 244, 246]

  // Header - Company Info
  doc.setFillColor(...primaryGreen)
  doc.rect(0, 0, 220, 40, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.text('Impress Cleaning', 20, 20)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('Professional Cleaning Services', 20, 28)
  doc.text('Central Texas', 20, 33)

  // Invoice Title
  doc.setTextColor(...darkNavy)
  doc.setFontSize(28)
  doc.setFont('helvetica', 'bold')
  doc.text('INVOICE', 150, 20)

  // Invoice Number and Status
  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.text(`#${invoice.invoice_number}`, 150, 28)

  // Status badge
  const statusColors = {
    paid: [34, 197, 94], // green
    unpaid: [239, 68, 68], // red
    pending: [234, 179, 8], // yellow
    overdue: [239, 68, 68], // red
  }
  const statusColor = statusColors[invoice.status] || [156, 163, 175]

  doc.setFillColor(...statusColor)
  doc.roundedRect(148, 31, 42, 6, 2, 2, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  const statusText = invoice.status.toUpperCase()
  const statusX = 169 - (doc.getTextWidth(statusText) / 2)
  doc.text(statusText, statusX, 35)

  // Reset text color
  doc.setTextColor(...darkNavy)

  // Bill To Section
  let yPos = 55
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('BILL TO:', 20, yPos)

  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  yPos += 7
  doc.text(customer.full_name || customer.email, 20, yPos)
  yPos += 5
  doc.text(customer.email, 20, yPos)
  if (customer.phone) {
    yPos += 5
    doc.text(customer.phone, 20, yPos)
  }

  // Service Address
  if (address) {
    yPos += 8
    doc.setFont('helvetica', 'bold')
    doc.text('SERVICE ADDRESS:', 20, yPos)
    doc.setFont('helvetica', 'normal')
    yPos += 7
    doc.text(address.address, 20, yPos)
    if (address.address_line2) {
      yPos += 5
      doc.text(address.address_line2, 20, yPos)
    }
    yPos += 5
    doc.text(`${address.city}, ${address.state} ${address.zip_code}`, 20, yPos)
  }

  // Invoice Details (right side)
  const rightX = 120
  yPos = 55
  doc.setFont('helvetica', 'bold')
  doc.text('Invoice Date:', rightX, yPos)
  doc.setFont('helvetica', 'normal')
  doc.text(format(new Date(invoice.created_at), 'MMM d, yyyy'), rightX + 30, yPos)

  yPos += 7
  doc.setFont('helvetica', 'bold')
  doc.text('Due Date:', rightX, yPos)
  doc.setFont('helvetica', 'normal')
  doc.text(format(new Date(invoice.due_date), 'MMM d, yyyy'), rightX + 30, yPos)

  if (invoice.service_date) {
    yPos += 7
    doc.setFont('helvetica', 'bold')
    doc.text('Service Date:', rightX, yPos)
    doc.setFont('helvetica', 'normal')
    doc.text(format(new Date(invoice.service_date), 'MMM d, yyyy'), rightX + 30, yPos)
  }

  // Line Items Table
  yPos = 115
  const tableData = []

  // Add main service
  if (invoice.service_type) {
    const serviceNames = {
      standard: 'Standard Cleaning',
      deep: 'Deep Cleaning',
      move_in_out: 'Move In/Out Cleaning',
      post_construction: 'Post-Construction Cleaning',
      office: 'Office Cleaning',
    }
    tableData.push([
      serviceNames[invoice.service_type] || invoice.service_type,
      '1',
      `$${invoice.amount.toFixed(2)}`,
      `$${invoice.amount.toFixed(2)}`,
    ])
  }

  // Add line items if any
  if (invoice.line_items && invoice.line_items.length > 0) {
    invoice.line_items.forEach((item) => {
      tableData.push([
        item.description,
        item.quantity.toString(),
        `$${item.unit_price.toFixed(2)}`,
        `$${(item.quantity * item.unit_price).toFixed(2)}`,
      ])
    })
  }

  doc.autoTable({
    startY: yPos,
    head: [['Description', 'Qty', 'Rate', 'Amount']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: darkNavy,
      textColor: [255, 255, 255],
      fontSize: 11,
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 10,
      cellPadding: 5,
    },
    columnStyles: {
      0: { cellWidth: 100 },
      1: { cellWidth: 20, halign: 'center' },
      2: { cellWidth: 30, halign: 'right' },
      3: { cellWidth: 35, halign: 'right' },
    },
  })

  // Totals
  yPos = doc.lastAutoTable.finalY + 10

  const totalsX = 120
  doc.setFontSize(11)

  // Subtotal
  doc.setFont('helvetica', 'normal')
  doc.text('Subtotal:', totalsX, yPos)
  doc.text(`$${invoice.amount.toFixed(2)}`, 185, yPos, { align: 'right' })

  // Tax if applicable
  if (invoice.tax_amount && invoice.tax_amount > 0) {
    yPos += 7
    doc.text(`Tax (${invoice.tax_rate || 0}%):`, totalsX, yPos)
    doc.text(`$${invoice.tax_amount.toFixed(2)}`, 185, yPos, { align: 'right' })
  }

  // Total
  yPos += 10
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.text('Total:', totalsX, yPos)
  const totalAmount = invoice.amount + (invoice.tax_amount || 0)
  doc.text(`$${totalAmount.toFixed(2)}`, 185, yPos, { align: 'right' })

  // Amount Paid
  if (invoice.paid_amount && invoice.paid_amount > 0) {
    yPos += 8
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(11)
    doc.text('Amount Paid:', totalsX, yPos)
    doc.setTextColor(...primaryGreen)
    doc.text(`-$${invoice.paid_amount.toFixed(2)}`, 185, yPos, { align: 'right' })
    doc.setTextColor(...darkNavy)
  }

  // Balance Due
  const balanceDue = totalAmount - (invoice.paid_amount || 0)
  if (balanceDue > 0) {
    yPos += 8
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.text('Balance Due:', totalsX, yPos)
    doc.setTextColor(...(invoice.status === 'overdue' ? statusColors.overdue : darkNavy))
    doc.text(`$${balanceDue.toFixed(2)}`, 185, yPos, { align: 'right' })
    doc.setTextColor(...darkNavy)
  }

  // Notes
  if (invoice.notes) {
    yPos += 15
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('Notes:', 20, yPos)
    yPos += 6
    doc.setFont('helvetica', 'normal')
    const splitNotes = doc.splitTextToSize(invoice.notes, 170)
    doc.text(splitNotes, 20, yPos)
    yPos += splitNotes.length * 5
  }

  // Payment Instructions
  yPos = Math.max(yPos + 15, 240)
  doc.setFillColor(...lightGray)
  doc.roundedRect(15, yPos, 180, 30, 3, 3, 'F')

  yPos += 8
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('Payment Options:', 20, yPos)

  yPos += 7
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text('• Online: Visit your customer portal to pay securely with credit card', 20, yPos)

  yPos += 5
  doc.text('• Zelle: Send payment to [phone/email]', 20, yPos)

  yPos += 5
  doc.text('• Check: Make payable to "Impress Cleaning Services"', 20, yPos)

  // Footer
  doc.setFontSize(8)
  doc.setTextColor(128, 128, 128)
  doc.text('Thank you for your business!', 105, 285, { align: 'center' })
  doc.text('Impress Cleaning Services | Central Texas', 105, 290, { align: 'center' })

  return doc
}

/**
 * Download invoice as PDF
 * @param {Object} invoice - Invoice data
 * @param {Object} customer - Customer data
 * @param {Object} address - Address data
 */
export function downloadInvoicePDF(invoice, customer, address) {
  const doc = generateInvoicePDF(invoice, customer, address)
  doc.save(`Invoice-${invoice.invoice_number}.pdf`)
}

/**
 * Get PDF as blob for email attachment or preview
 * @param {Object} invoice - Invoice data
 * @param {Object} customer - Customer data
 * @param {Object} address - Address data
 * @returns {Blob} PDF blob
 */
export function getInvoicePDFBlob(invoice, customer, address) {
  const doc = generateInvoicePDF(invoice, customer, address)
  return doc.output('blob')
}
