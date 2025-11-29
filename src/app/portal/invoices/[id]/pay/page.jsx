'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { format } from 'date-fns'
import { loadStripe } from '@stripe/stripe-js'
import {
 CreditCard,
 CheckCircle,
 AlertCircle,
 Loader,
 QrCode
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import Modal from '@/components/ui/Modal'
import toast from 'react-hot-toast'
import confetti from 'canvas-confetti'
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
const formatMoney = (value) =>
 typeof value === 'number' ? `$${value.toFixed(2)}` : value || '$0.00'
export default function PayInvoicePage() {
 const router = useRouter()
 const params = useParams()
 const invoiceId = params.id
 const [loading, setLoading] = useState(true)
 const [processing, setProcessing] = useState(false)
 const [invoice, setInvoice] = useState(null)
 const [paymentMethod, setPaymentMethod] = useState('stripe') // 'stripe' or 'zelle'
 const [showZelleModal, setShowZelleModal] = useState(false)
 const [savedCards, setSavedCards] = useState([])
 const [selectedCard, setSelectedCard] = useState(null)
 const [useNewCard, setUseNewCard] = useState(false)
 const supabase = createClient()
 useEffect(() => {
  const loadData = async () => {
   try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
     router.push('/auth/login')
     return
    }
    // Get invoice
    const { data: invoiceData, error: invoiceError } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', invoiceId)
    .eq('customer_id', user.id)
    .single()
    if (invoiceError) throw invoiceError
    if (!invoiceData) {
     toast.error('Invoice not found')
     router.push('/portal/invoices')
     return
    }
    if (invoiceData.status === 'paid') {
     toast.error('This invoice has already been paid')
     router.push('/portal/invoices')
     return
    }
    setInvoice(invoiceData)
    // Get saved payment methods
    const { data: cards } = await supabase
    .from('payment_methods')
    .select('*')
    .eq('user_id', user.id)
    .order('is_default', { ascending: false })
    setSavedCards(cards || [])
    if (cards && cards.length > 0) {
     setSelectedCard(cards.find(c => c.is_default)?.id || cards[0].id)
    } else {
     setUseNewCard(true)
    }
   } catch (error) {
    console.error('Error loading data:', error)
    toast.error('Failed to load invoice')
    router.push('/portal/invoices')
   } finally {
    setLoading(false)
   }
  }
  loadData()
 }, [invoiceId, supabase, router])
 const triggerConfetti = () => {
  const duration = 3 * 1000
  const end = Date.now() + duration
  const colors = ['#079447', '#1C294E']
  ;(function frame() {
   confetti({
    particleCount: 2,
    angle: 60,
    spread: 55,
    origin: { x: 0 },
    colors: colors,
   })
   confetti({
    particleCount: 2,
    angle: 120,
    spread: 55,
    origin: { x: 1 },
    colors: colors,
   })
   if (Date.now() < end) {
    requestAnimationFrame(frame)
   }
  })()
 }
 const handleStripePayment = async () => {
  setProcessing(true)
  try {
   // Create payment intent
   const response = await fetch('/api/stripe/create-payment-intent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
     invoiceId: invoice.id,
     amount: parseFloat(invoice.total ?? invoice.amount),
     paymentMethodId: useNewCard ? null : selectedCard,
    }),
   })
   const data = await response.json()
   if (!response.ok) {
    throw new Error(data.error || 'Payment failed')
   }
   if (data.success) {
    // Payment successful
    triggerConfetti()
    toast.success('Payment successful!')
    // Refresh invoice data
    const { data: updatedInvoice } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', invoiceId)
    .single()
    if (updatedInvoice?.status === 'paid') {
     setTimeout(() => {
      router.push('/portal/invoices')
     }, 2000)
    }
   } else if (data.requiresAction) {
    // Handle 3D Secure or other required actions
    const stripe = await stripePromise
    const { error } = await stripe.confirmCardPayment(data.clientSecret)
    if (error) {
     throw new Error(error.message)
    }
    triggerConfetti()
    toast.success('Payment successful!')
    setTimeout(() => {
     router.push('/portal/invoices')
    }, 2000)
   }
  } catch (error) {
   console.error('Payment error:', error)
   toast.error(error.message || 'Payment failed')
  } finally {
   setProcessing(false)
  }
 }
 const handleZelleConfirmation = async () => {
  setProcessing(true)
  try {
   // Mark as pending payment via Zelle
   const { error } = await supabase
   .from('invoices')
   .update({
    payment_method: 'zelle',
    notes: 'Payment pending - customer marked as sent via Zelle',
   })
   .eq('id', invoice.id)
   if (error) throw error
   toast.success('Thank you! We\'ll confirm your payment within 24 hours.')
   setShowZelleModal(false)
   setTimeout(() => {
    router.push('/portal/invoices')
   }, 2000)
  } catch (error) {
   console.error('Error:', error)
   toast.error('Failed to update invoice')
  } finally {
   setProcessing(false)
  }
 }
 if (loading) {
  return (
   <div className="min-h-screen flex items-center justify-center">
   <LoadingSpinner size="lg" />
   </div>
  )
 }
 if (!invoice) {
  return null
 }
 return (
  <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
  {/* Header */}
  <div className="mb-8">
  <h1 className="text-3xl font-bold text-[#1C294E] mb-2">
  Pay Invoice
  </h1>
  <p className="text-gray-600">
  Invoice {invoice.invoice_number}
  </p>
  </div>
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  {/* Invoice Summary */}
  <div className="lg:col-span-1">
  <Card>
  <h2 className="text-lg font-semibold text-[#1C294E] mb-4">
  Invoice Summary
  </h2>
  <div className="space-y-3 mb-6">
  <div className="flex justify-between text-sm">
  <span className="text-gray-600">Invoice Number</span>
  <span className="font-medium text-[#1C294E]">{invoice.invoice_number}</span>
  </div>
  <div className="flex justify-between text-sm">
  <span className="text-gray-600">Date</span>
  <span className="font-medium text-[#1C294E]">
  {format(new Date(invoice.created_at), 'MMM d, yyyy')}
  </span>
  </div>
  {invoice.due_date && (
   <div className="flex justify-between text-sm">
   <span className="text-gray-600">Due Date</span>
   <span className="font-medium text-[#1C294E]">
   {format(new Date(invoice.due_date), 'MMM d, yyyy')}
   </span>
   </div>
  )}
  </div>
  {invoice?.tax_rate > 0 && (
   <div className="space-y-3 mb-3 pb-3 border-b border-gray-200">
   <div className="flex justify-between text-sm">
   <span className="text-gray-600">Subtotal</span>
   <span className="font-medium text-[#1C294E]">{formatMoney(invoice.amount)}</span>
   </div>
   <div className="flex justify-between text-sm">
   <span className="text-gray-600">Tax ({invoice.tax_rate}%)</span>
   <span className="font-medium text-[#1C294E]">{formatMoney(invoice.tax_amount)}</span>
   </div>
   </div>
  )}
  <div className="border-t border-gray-200 pt-4">
  <div className="flex justify-between items-center">
  <span className="text-lg font-semibold text-[#1C294E]">Total</span>
  <span className="text-2xl font-bold text-[#1C294E]">
  {formatMoney(invoice?.total ?? invoice?.amount)}
  </span>
  </div>
  </div>
  {invoice.line_items && (
   <div className="mt-6">
   <h3 className="text-sm font-semibold text-[#1C294E] mb-3">Line Items</h3>
   <div className="space-y-2">
   {invoice.line_items.map((item, index) => (
    <div key={index} className="flex justify-between text-sm">
    <span className="text-gray-600">{item.description}</span>
    <span className="font-medium text-[#1C294E]">
    {formatMoney(item.amount)}    </span>
    </div>
   ))}
   </div>
   </div>
  )}
  </Card>
  </div>
  {/* Payment Method */}
  <div className="lg:col-span-2">
  <Card>
  <h2 className="text-lg font-semibold text-[#1C294E] mb-6">
  Select Payment Method
  </h2>
  {/* Payment Method Tabs */}
  <div className="flex gap-4 mb-6">
  <button
  onClick={() => setPaymentMethod('stripe')}
  className={`
                  flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg border-2 transition-all
                  ${paymentMethod === 'stripe'
   ? 'border-[#079447] bg-[#079447]/5 text-[#079447]'
   : 'border-gray-200 text-gray-600 hover:border-gray-300'
  }
                `}
  >
  <CreditCard className="w-5 h-5" />
  <span className="font-medium">Credit Card</span>
  </button>
  <button
  onClick={() => setPaymentMethod('zelle')}
  className={`
                  flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg border-2 transition-all
                  ${paymentMethod === 'zelle'
   ? 'border-[#079447] bg-[#079447]/5 text-[#079447]'
   : 'border-gray-200 text-gray-600 hover:border-gray-300'
  }
                `}
  >
  <QrCode className="w-5 h-5" />
  <span className="font-medium">Zelle</span>
  </button>
  </div>
  {/* Stripe Payment */}
  {paymentMethod === 'stripe' && (
   <div>
   {savedCards.length > 0 && !useNewCard && (
    <div className="mb-6">
    <h3 className="text-sm font-semibold text-[#1C294E] mb-3">
    Saved Cards
    </h3>
    <div className="space-y-3">
    {savedCards.map((card) => (
     <label
     key={card.id}
     className={`
                            flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all
                            ${selectedCard === card.id
      ? 'border-[#079447] bg-[#079447]/5'
      : 'border-gray-200 hover:border-gray-300'
     }
                          `}
     >
     <input
     type="radio"
     name="card"
     checked={selectedCard === card.id}
     onChange={() => setSelectedCard(card.id)}
     className="w-4 h-4 text-[#079447] focus:ring-[#079447]"
     />
     <div className="flex-1">
     <div className="flex items-center gap-2">
     <span className="font-medium text-[#1C294E]">
     {card.card_brand} •••• {card.card_last4}
     </span>
     {card.is_default && (
      <span className="text-xs bg-[#079447] text-white px-2 py-0.5 rounded-full">
      Default
      </span>
     )}
     </div>
     <p className="text-sm text-gray-600">
     Expires {card.card_exp_month}/{card.card_exp_year}
     </p>
     </div>
     </label>
    ))}
    </div>
    <button
    onClick={() => setUseNewCard(true)}
    className="mt-3 text-sm text-[#079447] font-medium hover:underline"
    >
    Use a different card
    </button>
    </div>
   )}
   {(useNewCard || savedCards.length === 0) && (
    <div className="mb-6">
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
    <p className="text-sm text-blue-900">
    <strong>Note:</strong> This is a demo. In production, Stripe Elements would be loaded here for secure card input.
    </p>
    </div>
    {savedCards.length > 0 && (
     <button
     onClick={() => setUseNewCard(false)}
     className="mb-4 text-sm text-[#079447] font-medium hover:underline"
     >
     ← Back to saved cards
     </button>
    )}
    {/* Stripe Elements would go here */}
    <div className="space-y-4">
    <div className="p-4 border-2 border-gray-200 rounded-lg">
    <p className="text-sm text-gray-600">
    Stripe Elements Card Input
    </p>
    </div>
    <label className="flex items-center gap-2">
    <input type="checkbox" className="w-4 h-4 text-[#079447] focus:ring-[#079447] rounded" />
    <span className="text-sm text-gray-600">Save this card for future payments</span>
    </label>
    </div>
    </div>
   )}
   <Button
   variant="primary"
   fullWidth
   size="lg"
   onClick={handleStripePayment}
   loading={processing}
   >
   <CreditCard className="w-5 h-5" />
   Pay {formatMoney(invoice?.total ?? invoice?.amount)}
   </Button>
   <p className="text-xs text-center text-gray-500 mt-4">
   Powered by Stripe • Secure payment processing
   </p>
   </div>
  )}
  {/* Zelle Payment */}
  {paymentMethod === 'zelle' && (
   <div>
   <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
   <h3 className="font-semibold text-[#1C294E] mb-4">
   Pay with Zelle
   </h3>
   <div className="space-y-4">
   <div>
   <p className="text-sm font-medium text-gray-700 mb-1">
   Send payment to:
   </p>
   <p className="text-lg font-bold text-[#079447]">
   payments@impresscleaning.com
   </p>
   </div>
   <div>
   <p className="text-sm font-medium text-gray-700 mb-1">
   Amount:
   </p>
   <p className="text-2xl font-bold text-[#1C294E]">
   {formatMoney(invoice?.total ?? invoice?.amount)}
   </p>   </div>
   <div>
   <p className="text-sm font-medium text-gray-700 mb-1">
   Reference:
   </p>
   <p className="text-lg font-mono text-[#1C294E]">
   {invoice.invoice_number}
   </p>
   </div>
   </div>
   <div className="mt-6 p-4 bg-white rounded-lg">
   <p className="text-sm text-gray-600">
   <strong>Instructions:</strong>
   </p>
   <ol className="text-sm text-gray-600 mt-2 space-y-1 list-decimal list-inside">
   <li>Open your Zelle app or banking app</li>
   <li>Send to <strong>payments@impresscleaning.com</strong></li>
   <li>Enter amount: <strong>{formatMoney(invoice?.total ?? invoice?.amount)}</strong></li>   <li>Include invoice number: <strong>{invoice.invoice_number}</strong></li>
   <li>Click the button below after sending</li>
   </ol>
   </div>
   </div>
   <Button
   variant="primary"
   fullWidth
   size="lg"
   onClick={() => setShowZelleModal(true)}
   >
   <CheckCircle className="w-5 h-5" />
   I&apos;ve Sent the Payment
   </Button>
   </div>
  )}
  </Card>
  </div>
  </div>
  {/* Zelle Confirmation Modal */}
  <Modal
  isOpen={showZelleModal}
  onClose={() => setShowZelleModal(false)}
  title="Confirm Zelle Payment"
  >
  <div className="space-y-4">
  <p className="text-gray-600">
  Please confirm that you have sent <strong>{formatMoney(invoice?.total ?? invoice?.amount)}</strong> via Zelle to <strong>payments@impresscleaning.com</strong> with reference <strong>{invoice.invoice_number}</strong>.
  </p>
  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
  <p className="text-sm text-yellow-900">
  <strong>Note:</strong> We&apos;ll verify your payment and update the invoice status within 24 hours.
  </p>
  </div>
  <div className="flex gap-3">
  <Button
  variant="secondary"
  fullWidth
  onClick={() => setShowZelleModal(false)}
  >
  Cancel
  </Button>
  <Button
  variant="primary"
  fullWidth
  onClick={handleZelleConfirmation}
  loading={processing}
  >
  Confirm Payment Sent
  </Button>
  </div>
  </div>
  </Modal>
  </div>
 )
}