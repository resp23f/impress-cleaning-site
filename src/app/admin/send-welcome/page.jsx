'use client'

import { useState } from 'react'
import { Mail, Send, CheckCircle, AlertCircle, Plus, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function SendWelcomePage() {
  const [recipients, setRecipients] = useState([{ firstName: '', email: '' }])
  const [sending, setSending] = useState(false)
  const [results, setResults] = useState([])

  const addRecipient = () => {
    setRecipients([...recipients, { firstName: '', email: '' }])
  }

  const removeRecipient = (index) => {
    if (recipients.length === 1) return
    setRecipients(recipients.filter((_, i) => i !== index))
  }

  const updateRecipient = (index, field, value) => {
    const updated = [...recipients]
    updated[index][field] = value
    setRecipients(updated)
  }

  const sendEmails = async () => {
    const validRecipients = recipients.filter(r => r.firstName && r.email)

    if (validRecipients.length === 0) {
      toast.error('Please add at least one recipient')
      return
    }

    setSending(true)
    setResults([])
    const newResults = []

    for (const recipient of validRecipients) {
      try {
        const res = await fetch('/api/email/customer-welcome', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(recipient),
        })

        const data = await res.json()

        if (res.ok) {
          newResults.push({ ...recipient, success: true })
        } else {
          newResults.push({ ...recipient, success: false, error: data.error })
        }
      } catch (err) {
        newResults.push({ ...recipient, success: false, error: err.message })
      }
    }

    setResults(newResults)
    setSending(false)

    const successCount = newResults.filter(r => r.success).length
    if (successCount === newResults.length) {
      toast.success(`All ${successCount} emails sent!`)
    } else {
      toast.error(`${successCount}/${newResults.length} emails sent`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1C294E] to-[#0f1a2e] p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Send Portal Welcome Email</h1>
          </div>
          <p className="text-gray-400">Invite existing customers to create their portal account</p>
        </div>

        {/* Recipients Form */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 mb-6">
          <div className="space-y-4">
            {recipients.map((recipient, index) => (
              <div key={index} className="flex gap-3 items-start">
                <div className="flex-1 grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="First Name"
                    value={recipient.firstName}
                    onChange={(e) => updateRecipient(index, 'firstName', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
                  />
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={recipient.email}
                    onChange={(e) => updateRecipient(index, 'email', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
                  />
                </div>
                {recipients.length > 1 && (
                  <button
                    onClick={() => removeRecipient(index)}
                    className="p-3 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={addRecipient}
            className="mt-4 flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 text-gray-300 hover:bg-white/20 transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Add Another
          </button>
        </div>

        {/* Send Button */}
        <button
          onClick={sendEmails}
          disabled={sending}
          className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold text-lg shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {sending ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Send Welcome Emails
            </>
          )}
        </button>

        {/* Results */}
        {results.length > 0 && (
          <div className="mt-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
            <h3 className="text-white font-semibold mb-4">Results</h3>
            <div className="space-y-3">
              {results.map((result, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-3 p-3 rounded-xl ${result.success ? 'bg-emerald-500/20' : 'bg-red-500/20'
                    }`}
                >
                  {result.success ? (
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-400" />
                  )}
                  <div className="flex-1">
                    <p className={result.success ? 'text-emerald-300' : 'text-red-300'}>
                      {result.firstName} ({result.email})
                    </p>
                    {result.error && (
                      <p className="text-red-400 text-sm">{result.error}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}