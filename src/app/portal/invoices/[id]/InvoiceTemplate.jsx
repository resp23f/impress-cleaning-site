// src/app/portal/invoices/[id]/InvoiceTemplate.jsx
'use client'

export default function InvoiceTemplate({ invoice, customer, lineItems }) {
  const formatMoney = (value) =>
    typeof value === 'number' ? `$${value.toFixed(2)}` : value || '$0.00'

  const statusLabel = invoice?.status || 'pending'

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4">
      <div className="mx-auto max-w-3xl bg-white shadow-md rounded-xl overflow-hidden">
        {/* Top brand bar */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-200">
          <div>
            <img
              src="/logo-impress.png"
              alt="Impress Cleaning Services"
              className="h-8 mb-2"
            />
            <p className="text-xs text-slate-500">
              Impress Cleaning Services, LLC
            </p>
          </div>
          <div className="text-right">
            <div className="text-xs font-semibold tracking-[0.2em] uppercase text-slate-400">
              Invoice
            </div>
            <div className="text-lg font-semibold text-slate-900">
              {invoice?.invoice_number || `INV-${invoice?.id || '000000'}`}
            </div>
            <div className="mt-1 text-xs text-slate-500 space-y-0.5">
              <div>
                <span className="font-medium">Issued:</span>{' '}
                {invoice?.issue_date || '—'}
              </div>
              {invoice?.due_date && (
                <div>
                  <span className="font-medium">Due:</span> {invoice.due_date}
                </div>
              )}
              <div>
                <span className="font-medium">Status:</span> {statusLabel}
              </div>
            </div>
          </div>
        </div>

        {/* Bill to + summary */}
        <div className="px-8 py-6 border-b border-slate-200">
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="flex-1">
              <div className="text-xs font-semibold tracking-[0.18em] uppercase text-slate-400 mb-2">
                Bill to
              </div>
              <div className="text-sm font-semibold text-slate-900">
                {customer?.name || 'Customer'}
              </div>
              <div className="mt-1 text-xs text-slate-600 space-y-1">
                {customer?.email && <div>{customer.email}</div>}
                {customer?.phone && <div>{customer.phone}</div>}
                {customer?.street && <div>{customer.street}</div>}
                {(customer?.city || customer?.state) && (
                  <div>
                    {customer.city}, {customer.state} {customer.zip}
                  </div>
                )}
              </div>
            </div>
            <div className="flex-1">
              <div className="text-xs font-semibold tracking-[0.18em] uppercase text-slate-400 mb-2">
                Service details
              </div>
              <div className="text-xs text-slate-600 leading-relaxed">
                {invoice?.service_summary
                  ? invoice.service_summary
                  : 'Cleaning services as scheduled. See line items below for details.'}
              </div>
            </div>
          </div>
        </div>

        {/* Line items */}
        <div className="px-8 pt-6 pb-4">
          <table className="w-full border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left py-2 px-2 font-semibold text-slate-700">
                  Description
                </th>
                <th className="text-center py-2 px-2 font-semibold text-slate-700 w-16">
                  Qty
                </th>
                <th className="text-right py-2 px-2 font-semibold text-slate-700 w-24">
                  Rate
                </th>
                <th className="text-right py-2 px-2 font-semibold text-slate-700 w-24">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {(lineItems || []).map((item) => (
                <tr
                  key={item.id || item.description}
                  className="border-b border-slate-100"
                >
                  <td className="py-2 px-2 text-slate-800 align-top">
                    {item.description || 'Service'}
                  </td>
                  <td className="py-2 px-2 text-center text-slate-700 align-top">
                    {item.quantity ?? 1}
                  </td>
                  <td className="py-2 px-2 text-right text-slate-700 align-top">
                    {formatMoney(item.rate)}
                  </td>
                  <td className="py-2 px-2 text-right text-slate-900 align-top">
                    {formatMoney(item.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="mt-6 flex justify-end">
            <div className="w-full max-w-xs">
              <div className="flex justify-between text-sm text-slate-700">
                <span>Subtotal</span>
                <span>{formatMoney(invoice?.subtotal ?? invoice?.amount)}</span>
              </div>
              {invoice?.tax_rate && (
                <div className="flex justify-between text-sm text-slate-700 mt-1">
                  <span>
                    Tax ({invoice.tax_rate}
                    %)
                  </span>
                  <span>{formatMoney(invoice.tax_amount)}</span>
                </div>
              )}
              <div className="border-t border-slate-200 mt-3 pt-3 flex justify-between text-sm font-semibold text-slate-900">
                <span className="text-[#079447] tracking-wide uppercase">
                  Amount due
                </span>
                <span>{formatMoney(invoice?.total ?? invoice?.amount)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notes + footer */}
        {invoice?.notes && (
          <div className="px-8 pb-4">
            <div className="text-xs font-semibold tracking-[0.18em] uppercase text-slate-400 mb-1">
              Notes
            </div>
            <p className="text-xs text-slate-600 whitespace-pre-line">
              {invoice.notes}
            </p>
          </div>
        )}

        <div className="bg-[#1C294E] text-white text-[11px] tracking-[0.2em] uppercase text-center py-3">
          Thank you for choosing Impress Cleaning Services
        </div>
      </div>
    </div>
  )
}
