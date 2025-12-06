'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { format } from 'date-fns'
import { loadStripe } from '@stripe/stripe-js'
import {
Elements,
CardElement,
useStripe,
useElements,
} from '@stripe/react-stripe-js'
import {
CreditCard,
CheckCircle,
FileText,
Calendar,
QrCode,
Shield,
ChevronLeft,
Sparkles
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import toast from 'react-hot-toast'
import confetti from 'canvas-confetti'
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
// Stripe Elements card styling
const cardElementOptions = {
style: {
base: {
fontSize: '16px',
color: '#1e293b',
fontFamily: 'system-ui, -apple-system, sans-serif',
fontSmoothing: 'antialiased',
'::placeholder': {
color: '#94a3b8',
},
},
invalid: {
color: '#ef4444',
iconColor: '#ef4444',
},
},
hidePostalCode: true,
}
const formatMoney = (value) =>
typeof value === 'number' ? `$${value.toFixed(2)}` : value || '$0.00'
// Separate component for card input (must be inside Elements provider)
function CardPaymentForm({ 
invoice, 
savedCards, 
selectedCard, 
setSelectedCard,
useNewCard, 
setUseNewCard,
processing,
setProcessing,
onSuccess,
formatMoney 
}) {
const stripe = useStripe()
const elements = useElements()
const [cardError, setCardError] = useState(null)
const [saveCard, setSaveCard] = useState(false)
const handlePayment = async () => {
setProcessing(true)
setCardError(null)
try {
// SCENARIO 1: Using a saved card
if (!useNewCard && selectedCard) {
// Find the Stripe payment method ID
const card = savedCards.find(c => c.id === selectedCard)
if (invoice.stripe_invoice_id) {
// Pay Stripe Dashboard invoice with saved card
const response = await fetch('/api/stripe/pay-stripe-invoice', {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({
stripeInvoiceId: invoice.stripe_invoice_id,
paymentMethodId: card.stripe_payment_method_id,
}),
})
const data = await response.json()
if (!response.ok) throw new Error(data.error || 'Payment failed')
if (data.success) {
onSuccess()
return
} else if (data.requiresAction) {
const { error } = await stripe.confirmCardPayment(data.clientSecret)
if (error) throw new Error(error.message)
onSuccess()
return
}
} else {
// Pay portal invoice with saved card
const response = await fetch('/api/stripe/create-payment-intent', {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({
invoiceId: invoice.id,
amount: parseFloat(invoice.total ?? invoice.amount),
paymentMethodId: card.stripe_payment_method_id,
}),
})
const data = await response.json()
if (!response.ok) throw new Error(data.error || 'Payment failed')
if (data.success) {
onSuccess()
return
} else if (data.requiresAction) {
const { error } = await stripe.confirmCardPayment(data.clientSecret)
if (error) throw new Error(error.message)
onSuccess()
return
}
}
}
// SCENARIO 2: Using a new card via Stripe Elements
if (!stripe || !elements) {
throw new Error('Payment system not ready. Please refresh and try again.')
}
const cardElement = elements.getElement(CardElement)
if (!cardElement) {
throw new Error('Card input not found. Please refresh and try again.')
}
// Create PaymentMethod from the card
const { error: pmError, paymentMethod } = await stripe.createPaymentMethod({
type: 'card',
card: cardElement,
})
if (pmError) {
throw new Error(pmError.message)
}
if (invoice.stripe_invoice_id) {
// Pay Stripe Dashboard invoice with new card
const response = await fetch('/api/stripe/pay-stripe-invoice', {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({
stripeInvoiceId: invoice.stripe_invoice_id,
paymentMethodId: paymentMethod.id,
saveCard: saveCard,
invoiceId: invoice.id,
}),
})
const data = await response.json()
if (!response.ok) throw new Error(data.error || 'Payment failed')
if (data.success) {
onSuccess()
return
} else if (data.requiresAction) {
const { error } = await stripe.confirmCardPayment(data.clientSecret)
if (error) throw new Error(error.message)
onSuccess()
return
}
} else {
// Pay portal invoice with new card
const response = await fetch('/api/stripe/create-payment-intent', {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({
invoiceId: invoice.id,
amount: parseFloat(invoice.total ?? invoice.amount),
paymentMethodId: paymentMethod.id,
saveCard: saveCard,
}),
})
const data = await response.json()
if (!response.ok) throw new Error(data.error || 'Payment failed')
if (data.success) {
onSuccess()
return
} else if (data.requiresAction) {
const { error } = await stripe.confirmCardPayment(data.clientSecret)
if (error) throw new Error(error.message)
onSuccess()
return
}
}
} catch (error) {
console.error('Payment error:', error)
setCardError(error.message)
toast.error(error.message || 'Payment failed')
} finally {
setProcessing(false)
}
}
return (
<div className="animate-fadeIn">
{savedCards.length > 0 && !useNewCard && (
<div className="mb-6">
<h3 className="text-sm font-semibold text-slate-700 mb-3">
Saved Cards
</h3>
<div className="space-y-3">
{savedCards.map((card) => (
<label
key={card.id}
className={`
flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all duration-200
${selectedCard === card.id
? 'border-emerald-500 bg-gradient-to-br from-emerald-50/50 to-teal-50/30'
: 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
}
`}
>
<input
type="radio"
name="card"
checked={selectedCard === card.id}
onChange={() => setSelectedCard(card.id)}
className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-slate-300"
/>
<div className="flex-1">
<div className="flex items-center gap-2">
<span className="font-semibold text-slate-800">
{card.card_brand} •••• {card.card_last4}
</span>
{card.is_default && (
<span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
Default
</span>
)}
</div>
<p className="text-sm text-slate-500">
Expires {card.card_exp_month}/{card.card_exp_year}
</p>
</div>
</label>
))}
</div>
<button
onClick={() => setUseNewCard(true)}
className="mt-4 text-sm text-emerald-600 font-medium hover:text-emerald-700 transition-colors"
>
+ Use a different card
</button>
</div>
)}
{(useNewCard || savedCards.length === 0) && (
<div className="mb-6">
{savedCards.length > 0 && (
<button
onClick={() => setUseNewCard(false)}
className="mb-4 text-sm text-emerald-600 font-medium hover:text-emerald-700 transition-colors"
>
← Back to saved cards
</button>
)}
<div className="space-y-4">
<div>
<label className="block text-sm font-medium text-slate-700 mb-2">
Card Details
</label>
<div className="p-4 border-2 border-slate-200 rounded-xl bg-white focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 transition-all">
<CardElement options={cardElementOptions} />
</div>
{cardError && (
<p className="mt-2 text-sm text-red-600">{cardError}</p>
)}
</div>
<label className="flex items-center gap-2 cursor-pointer">
<input
type="checkbox"
checked={saveCard}
onChange={(e) => setSaveCard(e.target.checked)}
className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-slate-300 rounded"
/>
<span className="text-sm text-slate-600">Save this card for future payments</span>
</label>
</div>
</div>
)}
<Button
variant="primary"
fullWidth
size="lg"
onClick={handlePayment}
loading={processing}
disabled={!stripe || processing}
className="!py-4 !bg-gradient-to-r !from-emerald-500 !to-teal-500 hover:!from-emerald-600 hover:!to-teal-600 shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/30 transition-colors duration-200"
>
<CreditCard className="w-5 h-5" />
Pay {formatMoney(invoice?.total ?? invoice?.amount)}
</Button>
{/* Security Trust Badge */}
<div className="mt-6 pt-5 border-t border-slate-100">
<div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
<div className="flex items-center gap-2">
<div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center">
<Shield className="w-3.5 h-3.5 text-emerald-600" />
</div>
<div className="text-left">
<p className="text-[11px] font-semibold text-slate-700">256-bit SSL</p>
<p className="text-[9px] text-slate-400">Encryption</p>
</div>
</div>
<div className="flex items-center gap-2">
<div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
<svg className="w-3.5 h-3.5 text-indigo-600" viewBox="0 0 24 24" fill="currentColor">
<path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z"/>
</svg>
</div>
<div className="text-left">
<p className="text-[11px] font-semibold text-slate-700">Stripe Secure</p>
<p className="text-[9px] text-slate-400">PCI Compliant</p>
</div>
</div>
<div className="flex items-center gap-2">
<div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
<Sparkles className="w-3.5 h-3.5 text-amber-600" />
</div>
<div className="text-left">
<p className="text-[11px] font-semibold text-slate-700">Bank-Level</p>
<p className="text-[9px] text-slate-400">Security</p>
</div>
</div>
</div>
</div>
</div>
)
}
export default function PayInvoicePage() {
const router = useRouter()
const params = useParams()
const invoiceId = params.id
const [loading, setLoading] = useState(true)
const [processing, setProcessing] = useState(false)
const [invoice, setInvoice] = useState(null)
const [paymentMethod, setPaymentMethod] = useState('stripe')
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
const colors = ['#10b981', '#14b8a6', '#1C294E']
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
const handlePaymentSuccess = () => {
triggerConfetti()
toast.success('Payment successful!')
setTimeout(() => {
router.push('/portal/invoices')
}, 2000)
}
const handleZelleConfirmation = async () => {
setProcessing(true)
try {
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
<div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
<div className="py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
{/* Skeleton */}
<div className="animate-pulse">
{/* Back button */}
<div className="h-5 w-32 bg-slate-200 rounded mb-8" />
{/* Header */}
<div className="text-center mb-10">
<div className="h-8 w-48 bg-slate-200 rounded mx-auto mb-3" />
<div className="h-5 w-32 bg-slate-100 rounded mx-auto" />
</div>
{/* Cards */}
<div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
<div className="lg:col-span-2">
<div className="h-80 bg-white rounded-2xl border border-slate-100" />
</div>
<div className="lg:col-span-3">
<div className="h-96 bg-white rounded-2xl border border-slate-100" />
</div>
</div>
</div>
</div>
</div>
)
}
if (!invoice) {
return null
}
return (
<div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
<div className="py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
{/* Back Button */}
<button
onClick={() => router.back()}
className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors mb-8 group"
>
<ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
Back to Invoices
</button>
{/* Header */}
<div className="text-center mb-10 animate-fadeIn">
<div className="inline-flex items-center gap-2 mb-3">
<div className="h-0.5 w-8 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full" />
<span className="text-xs font-semibold text-emerald-600 uppercase tracking-widest">
Secure Payment
</span>
<div className="h-0.5 w-8 bg-gradient-to-r from-teal-400 to-emerald-400 rounded-full" />
</div>
<h1 className="text-3xl font-bold text-slate-800 mb-2">
Complete Your Payment
</h1>
<p className="text-slate-500">
Invoice {invoice.invoice_number}
</p>
</div>
<div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
{/* Invoice Summary */}
<div className="lg:col-span-2 animate-fadeIn" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
<div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
{/* Header */}
<div className="bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-4">
<div className="flex items-center gap-3">
<div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
<FileText className="w-5 h-5 text-white" />
</div>
<div>
<h2 className="text-lg font-bold text-white">Invoice Summary</h2>
<p className="text-sm text-slate-300">{invoice.invoice_number}</p>
</div>
</div>
</div>
<div className="p-6">
{/* Details */}
<div className="space-y-4 mb-6">
<div className="flex items-center justify-between">
<div className="flex items-center gap-2 text-sm text-slate-500">
<Calendar className="w-4 h-4" />
<span>Date</span>
</div>
<span className="font-medium text-slate-800">
{format(new Date(invoice.created_at), 'MMM d, yyyy')}
</span>
</div>
{invoice.due_date && (
<div className="flex items-center justify-between">
<div className="flex items-center gap-2 text-sm text-slate-500">
<Calendar className="w-4 h-4" />
<span>Due Date</span>
</div>
<span className="font-medium text-slate-800">
{format(new Date(invoice.due_date), 'MMM d, yyyy')}
</span>
</div>
)}
</div>
{/* Line Items */}
{invoice.line_items && (
<div className="mb-6 pb-6 border-b border-slate-100">
<h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
Services
</h3>
<div className="space-y-2">
{invoice.line_items.map((item, index) => (
<div key={index} className="flex justify-between text-sm">
<span className="text-slate-600">{item.description}</span>
<span className="font-medium text-slate-800">
{formatMoney(item.amount)}
</span>
</div>
))}
</div>
</div>
)}
{/* Totals */}
{invoice?.tax_rate > 0 && (
<div className="space-y-2 mb-4 pb-4 border-b border-slate-100">
<div className="flex justify-between text-sm">
<span className="text-slate-500">Subtotal</span>
<span className="font-medium text-slate-700">{formatMoney(invoice.amount)}</span>
</div>
<div className="flex justify-between text-sm">
<span className="text-slate-500">Tax ({invoice.tax_rate}%)</span>
<span className="font-medium text-slate-700">{formatMoney(invoice.tax_amount)}</span>
</div>
</div>
)}
{/* Total */}
<div className="flex justify-between items-center">
<span className="text-lg font-semibold text-slate-800">Total Due</span>
<span className="text-3xl font-bold text-emerald-600">
{formatMoney(invoice?.total ?? invoice?.amount)}
</span>
</div>
</div>
</div>
</div>
{/* Payment Method */}
<div className="lg:col-span-3 animate-fadeIn" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
<div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
<div className="p-6 border-b border-slate-100">
<h2 className="text-lg font-bold text-slate-800 mb-1">
Select Payment Method
</h2>
<p className="text-sm text-slate-400">Choose how you'd like to pay</p>
</div>
<div className="p-6">
{/* Payment Method Tabs */}
<div className="flex gap-4 mb-6">
<button
onClick={() => setPaymentMethod('stripe')}
className={`
flex-1 flex items-center justify-center gap-2.5 px-6 py-4 rounded-xl border-2 transition-all duration-200
${paymentMethod === 'stripe'
? 'border-emerald-500 bg-gradient-to-br from-emerald-50/80 to-teal-50/50 text-emerald-700'
: 'border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'
}
`}
>
<CreditCard className="w-5 h-5" />
<span className="font-semibold">Credit Card</span>
</button>
<button
onClick={() => setPaymentMethod('zelle')}
className={`
flex-1 flex items-center justify-center gap-2.5 px-6 py-4 rounded-xl border-2 transition-all duration-200
${paymentMethod === 'zelle'
? 'border-emerald-500 bg-gradient-to-br from-emerald-50/80 to-teal-50/50 text-emerald-700'
: 'border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'
}
`}
>
<QrCode className="w-5 h-5" />
<span className="font-semibold">Zelle</span>
</button>
</div>
{/* Stripe Payment */}
{paymentMethod === 'stripe' && (
   <Elements stripe={stripePromise}>
    <CardPaymentForm
     invoice={invoice}
     savedCards={savedCards}
     selectedCard={selectedCard}
     setSelectedCard={setSelectedCard}
     useNewCard={useNewCard}
     setUseNewCard={setUseNewCard}
     processing={processing}
     setProcessing={setProcessing}
     onSuccess={handlePaymentSuccess}
     formatMoney={formatMoney}
    />
   </Elements>
  )}
  
  {/* Zelle Payment */}
{paymentMethod === 'zelle' && (
<div className="animate-fadeIn">
<div className="bg-gradient-to-br from-slate-50 to-slate-100/50 border border-slate-200 rounded-xl p-6 mb-6">
<div className="flex items-center gap-3 mb-5">
<div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
<QrCode className="w-5 h-5 text-purple-600" />
</div>
<h3 className="font-semibold text-slate-800">
Pay with Zelle
</h3>
</div>
<div className="space-y-4">
<div className="p-4 bg-white rounded-xl border border-slate-100">
<p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
Send payment to
</p>
<p className="text-lg font-bold text-emerald-600">
payments@impresscleaning.com
</p>
</div>
<div className="grid grid-cols-2 gap-4">
<div className="p-4 bg-white rounded-xl border border-slate-100">
<p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
Amount
</p>
<p className="text-xl font-bold text-slate-800">
{formatMoney(invoice?.total ?? invoice?.amount)}
</p>
</div>
<div className="p-4 bg-white rounded-xl border border-slate-100">
<p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
Reference
</p>
<p className="text-lg font-mono font-bold text-slate-800">
{invoice.invoice_number}
</p>
</div>
</div>
</div>
<div className="mt-5 p-4 bg-white rounded-xl border border-slate-100">
<p className="text-sm font-semibold text-slate-700 mb-2">
Instructions
</p>
<ol className="text-sm text-slate-600 space-y-1.5 list-decimal list-inside">
<li>Open your Zelle app or banking app</li>
<li>Send to <strong className="text-slate-800">payments@impresscleaning.com</strong></li>
<li>Enter amount: <strong className="text-slate-800">{formatMoney(invoice?.total ?? invoice?.amount)}</strong></li>
<li>Include reference: <strong className="text-slate-800">{invoice.invoice_number}</strong></li>
<li>Click the button below after sending</li>
</ol>
</div>
</div>
<Button
variant="primary"
fullWidth
size="lg"
onClick={() => setShowZelleModal(true)}
className="!py-4 !bg-gradient-to-r !from-emerald-500 !to-teal-500 hover:!from-emerald-600 hover:!to-teal-600 shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/30 transition-colors duration-200"
>
<CheckCircle className="w-5 h-5" />
I've Sent the Payment
</Button>
</div>
)}
</div>
</div>
</div>
</div>
{/* Zelle Confirmation Modal */}
<Modal
isOpen={showZelleModal}
onClose={() => setShowZelleModal(false)}
title="Confirm Zelle Payment"
>
<div className="space-y-4">
<p className="text-slate-600">
Please confirm that you have sent <strong className="text-slate-800">{formatMoney(invoice?.total ?? invoice?.amount)}</strong> via Zelle to <strong className="text-slate-800">payments@impresscleaning.com</strong> with reference <strong className="text-slate-800">{invoice.invoice_number}</strong>.
</p>
<div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 rounded-xl p-4">
<p className="text-sm text-amber-800">
<strong>Note:</strong> We'll verify your payment and update the invoice status within 24 hours.
</p>
</div>
<div className="flex gap-3 pt-2">
<Button
variant="secondary"
fullWidth
onClick={() => setShowZelleModal(false)}
className="!border-slate-200 hover:!bg-slate-50"
>
Cancel
</Button>
<Button
variant="primary"
fullWidth
onClick={handleZelleConfirmation}
loading={processing}
className="!bg-gradient-to-r !from-emerald-500 !to-teal-500 hover:!from-emerald-600 hover:!to-teal-600"
>
Confirm Payment Sent
</Button>
</div>
</div>
</Modal>
</div>
{/* Animation Styles */}
<style jsx global>{`
@keyframes fadeIn {
from {
opacity: 0;
transform: translateY(10px);
}
to {
opacity: 1;
transform: translateY(0);
}
}
.animate-fadeIn {
animation: fadeIn 0.4s ease-out forwards;
opacity: 0;
}
`}</style>
</div>
)
}