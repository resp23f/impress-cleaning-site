'use client'

import { useState } from 'react'
import Button from './ui/Button'
import { Download } from 'lucide-react'
import { downloadInvoicePDF } from '@/lib/pdf/generateInvoice'
import toast from 'react-hot-toast'

export default function DownloadInvoicePDF({ invoice, customer, address, variant = 'text', size = 'sm', showText = false }) {
  const [downloading, setDownloading] = useState(false)

  const handleDownload = async () => {
    setDownloading(true)
    try {
      await downloadInvoicePDF(invoice, customer, address)
      toast.success('Invoice downloaded successfully!')
    } catch (error) {
      console.error('Error downloading PDF:', error)
      toast.error('Failed to download invoice')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleDownload}
      loading={downloading}
      disabled={downloading}
    >
      <Download className="w-4 h-4" />
      {showText && ' Download PDF'}
    </Button>
  )
}
