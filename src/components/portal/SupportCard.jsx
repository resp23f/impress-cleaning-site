'use client'
import { Phone, Clock, AlertCircle } from 'lucide-react'
import Card from '@/components/ui/Card'

export default function SupportCard() {
  return (
    <Card>
      <h2 className="text-xl font-bold text-[#1C294E] mb-4">Support & Help</h2>
      
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Clock className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#1C294E] mb-1">Business Hours</p>
            <p className="text-sm text-gray-600">7:00 AM - 6:30 PM</p>
            <p className="text-xs text-gray-500">Monday - Saturday</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Phone className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#1C294E] mb-1">Contact Support</p>
            <a href="tel:5122775364" className="text-sm text-[#079447] hover:underline font-medium">
              {'(512) 277-5364'}
            </a>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#1C294E] mb-1">Emergency Contact</p>
            <a href="tel:5127382642" className="text-sm text-[#079447] hover:underline font-medium block mb-1">
              {'(512) 738-2642'}
            </a>
            <a href="mailto:notifications@impressyoucleaning.com" className="text-sm text-[#079447] hover:underline font-medium">
              notifications@impressyoucleaning.com
            </a>
          </div>
        </div>
      </div>
    </Card>
  )
}