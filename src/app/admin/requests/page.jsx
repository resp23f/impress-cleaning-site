'use client'
import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import {
  ClipboardList,
  CheckCircle,
  XCircle,
  Calendar,
  MapPin,
  FileText,
  Repeat
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import AdminNav from '@/components/admin/AdminNav'
import toast from 'react-hot-toast'
export default function ServiceRequestsPage() {
  const [loading, setLoading] = useState(true)
  const [requests, setRequests] = useState([])
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [appointmentData, setAppointmentData] = useState({
    scheduledDate: '',
    scheduledTimeStart: '',
    scheduledTimeEnd: '',
    teamMembers: '',
  })
  const supabase = createClient()
  useEffect(() => {
    loadRequests()
  }, [])
  const loadRequests = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('service_requests')
        .select(`
          *,
profiles!customer_id(full_name, email, phone),
service_addresses!address_id(*)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
      if (error) throw error
      setRequests(data || [])
    } catch (error) {
      console.error('Error loading requests:', error)
      toast.error('Failed to load requests')
    } finally {
      setLoading(false)
    }
  }
  const handleViewDetails = (request) => {
    setSelectedRequest(request)
    setShowModal(true)
    // Pre-fill appointment data with request details
    setAppointmentData({
      scheduledDate: request.preferred_date || '',
      scheduledTimeStart: request.preferred_time || '09:00',
      scheduledTimeEnd: request.preferred_time ?
        (parseInt(request.preferred_time.split(':')[0]) + 2) + ':00' : '11:00',
      teamMembers: '',
    })
  }
  const formatServiceType = (type) => {
    const types = {
      standard: 'Standard Cleaning',
      deep: 'Deep Cleaning',
      move_in_out: 'Move In/Out Cleaning',
      post_construction: 'Post-Construction Cleaning',
      office: 'Office Cleaning',
    }
    return types[type] || type
  }
  const handleApprove = async () => {
    if (!selectedRequest) return
    if (!appointmentData.scheduledDate || !appointmentData.scheduledTimeStart || !appointmentData.scheduledTimeEnd) {
      toast.error('Please fill in all appointment details')
      return
    }
    setProcessing(true)
    try {
      // Create appointment
      const { data: appointment, error: appointmentError } = await supabase
        .from('appointments')
        .insert({
          customer_id: selectedRequest.customer_id,
          address_id: selectedRequest.address_id,
          service_type: selectedRequest.service_type,
          scheduled_date: appointmentData.scheduledDate,
          scheduled_time_start: appointmentData.scheduledTimeStart,
          scheduled_time_end: appointmentData.scheduledTimeEnd,
          status: 'confirmed',
          team_members: appointmentData.teamMembers ?
            appointmentData.teamMembers.split(',').map(m => m.trim()).filter(Boolean) : [],
          special_instructions: selectedRequest.special_requests,
          is_recurring: selectedRequest.is_recurring,
          recurring_frequency: selectedRequest.recurring_frequency,
        })
        .select()
      if (appointmentError) throw appointmentError
      // Update request status
      const { error: updateError } = await supabase
        .from('service_requests')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', selectedRequest.id)
      if (updateError) throw updateError
      // TODO: Send confirmation email to customer
      // await fetch('/api/send-email/appointment-confirmed', {
      //   method: 'POST',
      //   body: JSON.stringify({ appointmentId: appointment[0].id })
      // })
      toast.success('Service request approved and appointment created!')
      setShowModal(false)
      loadRequests()
    } catch (error) {
      console.error('Error approving request:', error)
      toast.error(error.message || 'Failed to approve request')
    } finally {
      setProcessing(false)
    }
  }
  const handleDecline = async () => {
    if (!selectedRequest) return
    const reason = prompt('Reason for declining (optional):')
    setProcessing(true)
    try {
      const { error } = await supabase
        .from('service_requests')
        .update({
          status: 'declined',
          admin_notes: reason || null,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', selectedRequest.id)
      if (error) throw error
      // TODO: Send email to customer
      // await fetch('/api/send-email/request-declined', {
      //   method: 'POST',
      //   body: JSON.stringify({ requestId: selectedRequest.id, reason })
      // })
      toast.success('Service request declined')
      setShowModal(false)
      loadRequests()
    } catch (error) {
      console.error('Error declining request:', error)
      toast.error('Failed to decline request')
    } finally {
      setProcessing(false)
    }
  }
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <AdminNav pendingCount={0} requestsCount={0} />
        <LoadingSpinner size="lg" />
      </div>
    )
  }
  return (
    <div className="min-h-screen">
      <AdminNav pendingCount={0} requestsCount={requests.length} />
      <div className="lg:pl-64">
        <main className="py-8 px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#1C294E] mb-2">
              Service Requests
            </h1>
            <p className="text-gray-600">
              Review and approve customer service requests
            </p>
          </div>
          {/* Count */}
          {requests.length > 0 && (
            <Card className="mb-6 border-l-4 border-l-blue-500">
              <div className="flex items-center gap-3">
                <ClipboardList className="w-6 h-6 text-blue-600" />
                <div>
                  <p className="font-semibold text-[#1C294E]">
                    {requests.length} Pending Request{requests.length !== 1 ? 's' : ''}
                  </p>
                  <p className="text-sm text-gray-600">
                    Customers waiting for confirmation
                  </p>
                </div>
              </div>
            </Card>
          )}
          {/* Requests List */}
          {requests.length > 0 ? (
            <div className="space-y-4">
              {requests.map((req) => (
                <Card key={req.id} hover>
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <ClipboardList className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-semibold text-[#1C294E]">
                              {req.profiles?.full_name}
                            </h3>
                            {req.is_recurring && (
                              <Badge variant="primary" size="sm">
                                <Repeat className="w-3 h-3 mr-1" />
                                Recurring
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {formatServiceType(req.service_type)}
                          </p>
                          <p className="text-xs text-gray-500">
                            Requested {format(new Date(req.created_at), 'MMM d, yyyy \'at\' h:mm a')}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {req.preferred_date && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4" />
                            Preferred: {format(new Date(req.preferred_date), 'MMM d, yyyy')}
                            {req.preferred_time && ` at ${req.preferred_time}`}
                          </div>
                        )}
                        {req.is_flexible && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            Flexible with timing
                          </div>
                        )}
                        {req.service_addresses && (
                          <div className="flex items-start gap-2 text-sm text-gray-600 md:col-span-2">
                            <MapPin className="w-4 h-4 mt-0.5" />
                            <span>
                              {req.service_addresses.street_address}
                              {req.service_addresses.unit && `, ${req.service_addresses.unit}`}
                              {', '}
                              {req.service_addresses.city}, {req.service_addresses.state}
                            </span>
                          </div>
                        )}
                        {req.special_requests && (
                          <div className="flex items-start gap-2 text-sm text-gray-600 md:col-span-2">
                            <FileText className="w-4 h-4 mt-0.5" />
                            <span className="italic">&quot;{req.special_requests}&quot;</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 lg:min-w-[200px]">
                      <Button
                        variant="primary"
                        onClick={() => handleViewDetails(req)}
                        fullWidth
                      >
                        Review & Schedule
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <div className="text-center py-12">
                <ClipboardList className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-[#1C294E] mb-2">
                  No Pending Requests
                </h3>
                <p className="text-gray-600">
                  All service requests have been reviewed
                </p>
              </div>
            </Card>
          )}
        </main>
      </div>
      {/* Review Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Review Service Request"
        maxWidth="lg"
      >
        {selectedRequest && (
          <div className="space-y-6">
            {/* Customer Info */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Customer Information
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Name:</span>
                  <span className="text-sm font-medium text-[#1C294E]">
                    {selectedRequest.profiles?.full_name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Email:</span>
                  <span className="text-sm font-medium text-[#1C294E]">
                    {selectedRequest.profiles?.email}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Phone:</span>
                  <span className="text-sm font-medium text-[#1C294E]">
                    {selectedRequest.profiles?.phone || 'Not provided'}
                  </span>
                </div>
              </div>
            </div>
            {/* Request Details */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Request Details
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Service Type:</span>
                  <span className="text-sm font-medium text-[#1C294E]">
                    {formatServiceType(selectedRequest.service_type)}
                  </span>
                </div>
                {selectedRequest.is_recurring && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Frequency:</span>
                    <Badge variant="primary" size="sm">
                      {selectedRequest.recurring_frequency}
                    </Badge>
                  </div>
                )}
                {selectedRequest.preferred_date && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Preferred Date:</span>
                    <span className="text-sm font-medium text-[#1C294E]">
                      {format(new Date(selectedRequest.preferred_date), 'MMMM d, yyyy')}
                    </span>
                  </div>
                )}
                {selectedRequest.preferred_time && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Preferred Time:</span>
                    <span className="text-sm font-medium text-[#1C294E]">
                      {selectedRequest.preferred_time}
                    </span>
                  </div>
                )}
              </div>
              {selectedRequest.special_requests && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs font-semibold text-gray-700 mb-1">Special Requests:</p>
                  <p className="text-sm text-gray-600 italic">
                    &quot;{selectedRequest.special_requests}&quot;
                  </p>
                </div>
              )}
            </div>
            {/* Schedule Appointment */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Schedule Appointment
              </h3>
              <div className="space-y-4">
                <Input
                  type="date"
                  label="Scheduled Date"
                  value={appointmentData.scheduledDate}
                  onChange={(e) => setAppointmentData({ ...appointmentData, scheduledDate: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    type="time"
                    label="Start Time"
                    value={appointmentData.scheduledTimeStart}
                    onChange={(e) => setAppointmentData({ ...appointmentData, scheduledTimeStart: e.target.value })}
                    required
                  />
                  <Input
                    type="time"
                    label="End Time"
                    value={appointmentData.scheduledTimeEnd}
                    onChange={(e) => setAppointmentData({ ...appointmentData, scheduledTimeEnd: e.target.value })}
                    required
                  />
                </div>
                <Input
                  label="Team Members (comma-separated)"
                  placeholder="Sarah, Mike"
                  value={appointmentData.teamMembers}
                  onChange={(e) => setAppointmentData({ ...appointmentData, teamMembers: e.target.value })}
                />
              </div>
            </div>
            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <Button
                variant="primary"
                fullWidth
                onClick={handleApprove}
                loading={processing}
              >
                <CheckCircle className="w-5 h-5" />
                Approve & Create Appointment
              </Button>
              <Button
                variant="danger"
                fullWidth
                onClick={handleDecline}
                loading={processing}
              >
                <XCircle className="w-5 h-5" />
                Decline Request
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}