'use client'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { format, parseISO, isAfter, isBefore } from 'date-fns'
import {
  History,
  Calendar,
  Filter,
  Image as ImageIcon,
  Receipt,
  CheckCircle,
  FileDown
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Badge from '@/components/ui/Badge'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import toast from 'react-hot-toast'
const serviceTypeLabel = (type) => {
  const labels = {
    standard: 'Standard Cleaning',
    deep: 'Deep Cleaning',
    move_in_out: 'Move In/Out',
    post_construction: 'Post-Construction',
    office: 'Office Cleaning',
  }
  return labels[type] || type
}
export default function ServiceHistoryPage() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const [loading, setLoading] = useState(true)
  const [services, setServices] = useState([])
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    serviceType: 'all',
  })
  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/auth/login')
          return
        }
        // Base history query (customer-scoped)
        const { data: history, error } = await supabase
          .from('service_history')
          .select('*')
          .eq('customer_id', user.id)
          .order('completed_date', { ascending: false })
        if (error) throw error
        if (!history || history.length === 0) {
          setServices([])
          return
        }
        const appointmentIds = history.map((h) => h.appointment_id).filter(Boolean)
        const appointmentsMap = {}
        const invoicesMap = {}
        if (appointmentIds.length > 0) {
          const { data: appointments, error: apptError } = await supabase
            .from('appointments')
            .select(`
              id,
              service_type,
              scheduled_date,
              team_members,
              address_id,
              service_addresses:address_id (
                street_address,
                unit,
                city,
                state,
                zip_code
              )
            `)
            .in('id', appointmentIds)
          if (apptError) throw apptError
          appointments?.forEach((apt) => {
            appointmentsMap[apt.id] = apt
          })
          const { data: invoices, error: invoiceError } = await supabase
            .from('invoices')
            .select('id, appointment_id, invoice_number, amount, status')
            .in('appointment_id', appointmentIds)
          if (invoiceError) throw invoiceError
          invoices?.forEach((inv) => {
            invoicesMap[inv.appointment_id] = inv
          })
        }
        const merged = history.map((h) => ({
          ...h,
          appointment: h.appointment_id ? appointmentsMap[h.appointment_id] : null,
          invoice: h.appointment_id ? invoicesMap[h.appointment_id] : null,
        }))
        setServices(merged)
      } catch (err) {
        console.error('Error loading history', err)
        toast.error('Could not load service history')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [router, supabase])
  const filtered = services.filter((svc) => {
    const date = svc.completed_date ? parseISO(svc.completed_date) : null
    if (filters.startDate && date && isBefore(date, parseISO(filters.startDate))) {
      return false
    }
    if (filters.endDate && date && isAfter(date, parseISO(filters.endDate))) {
      return false
    }
    if (filters.serviceType !== 'all' && svc.service_type !== filters.serviceType) {
      return false
    }
    return true
  })
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }
  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-[#1C294E]">Service History</h1>
          <p className="text-gray-600">Your completed cleanings and receipts</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <History className="w-4 h-4" />
          Auto-synced after each completed visit
        </div>
      </div>
      <Card padding="lg" className="space-y-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <p className="text-sm font-medium text-[#1C294E]">Filters</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            type="date"
            label="From"
            value={filters.startDate}
            onChange={(e) => setFilters((prev) => ({ ...prev, startDate: e.target.value }))}
          />
          <Input
            type="date"
            label="To"
            value={filters.endDate}
            onChange={(e) => setFilters((prev) => ({ ...prev, endDate: e.target.value }))}
          />
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-gray-700 mb-1 block">Service type</label>
            <select
              value={filters.serviceType}
              onChange={(e) => setFilters((prev) => ({ ...prev, serviceType: e.target.value }))}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#079447]"
            >
              <option value="all">All types</option>
              <option value="standard">Standard Cleaning</option>
              <option value="deep">Deep Cleaning</option>
              <option value="move_in_out">Move In/Out</option>
              <option value="post_construction">Post-Construction</option>
              <option value="office">Office Cleaning</option>
            </select>
          </div>
        </div>
      </Card>
      {filtered.length === 0 ? (
        <Card className="text-center py-8 text-gray-600">
          No services match these filters yet.
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map((svc) => (
            <Card key={svc.id} padding="lg" className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-lg font-semibold text-[#1C294E]">
                    {format(parseISO(svc.completed_date), 'EEEE, MMM d, yyyy')}
                  </p>
                  <p className="text-sm text-gray-600">
                    {serviceTypeLabel(svc.service_type)}
                  </p>
                </div>
                <Badge variant="success">
                  <CheckCircle className="w-4 h-4" />
                  Completed
                </Badge>
              </div>
              {svc.appointment?.service_addresses && (
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>
                    {svc.appointment.service_addresses.street_address}
                    {svc.appointment.service_addresses.unit && `, ${svc.appointment.service_addresses.unit}`},{' '}
                    {svc.appointment.service_addresses.city}, {svc.appointment.service_addresses.state}{' '}
                    {svc.appointment.service_addresses.zip_code}
                  </span>
                </div>
              )}
              {svc.team_members && svc.team_members.length > 0 && (
                <p className="text-sm text-gray-700">Cleaner(s): {svc.team_members.join(', ')}</p>
              )}
              {svc.photos && svc.photos.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 text-sm font-medium text-[#1C294E] mb-2">
                    <ImageIcon className="w-4 h-4" />
                    Before/After photos
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {svc.photos.map((url) => (
                      <a
                        key={url}
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="block rounded-lg overflow-hidden border border-gray-100 hover:shadow-md transition"
                      >
                        <img src={url} alt="Service photo" className="w-full h-32 object-cover" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex flex-wrap gap-3 items-center">
                {svc.invoice && (
                  <Link href={`/portal/invoices?focus=${svc.invoice.id}`}>
                    <Button variant="outline" size="sm">
                      <Receipt className="w-4 h-4" />
                      View invoice
                    </Button>
                  </Link>
                )}
                {svc.invoice?.id && (
                  <Link href={`/portal/invoices/${svc.invoice.id}/pay`}>
                    <Button variant="secondary" size="sm">
                      <FileDown className="w-4 h-4" />
                      Download receipt
                    </Button>
                  </Link>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
