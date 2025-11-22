'use client'

 

import { useState, useEffect } from 'react'

import { useRouter } from 'next/navigation'

import { format } from 'date-fns'

import {

  UserCheck,

  X,

  Mail,

  Phone,

  MapPin,

  CheckCircle,

  XCircle

} from 'lucide-react'

import { createClient } from '@/lib/supabase/client'

import Card from '@/components/ui/Card'

import Button from '@/components/ui/Button'

import Badge from '@/components/ui/Badge'

import Modal from '@/components/ui/Modal'

import LoadingSpinner from '@/components/ui/LoadingSpinner'

import AdminNav from '@/components/admin/AdminNav'

import toast from 'react-hot-toast'

 

export default function PendingRegistrationsPage() {

  const router = useRouter()

  const [loading, setLoading] = useState(true)

  const [registrations, setRegistrations] = useState([])

  const [selectedReg, setSelectedReg] = useState(null)

  const [showModal, setShowModal] = useState(false)

  const [processing, setProcessing] = useState(false)

 

  const supabase = createClient()

 

  useEffect(() => {

    loadRegistrations()

  }, [])

 

  const loadRegistrations = async () => {

    setLoading(true)

    try {

      const { data, error } = await supabase

        .from('profiles')

        .select(`

          *,

          service_addresses(*)

        `)

        .eq('account_status', 'pending')

        .eq('role', 'customer')

        .order('created_at', { ascending: false })

 

      if (error) throw error

 

      setRegistrations(data || [])

    } catch (error) {

      console.error('Error loading registrations:', error)

      toast.error('Failed to load registrations')

    } finally {

      setLoading(false)

    }

  }

 

  const handleViewDetails = (registration) => {

    setSelectedReg(registration)

    setShowModal(true)

  }

 

  const handleApprove = async (regId) => {

    setProcessing(true)

 

    try {

      const { error } = await supabase

        .from('profiles')

        .update({ account_status: 'active' })

        .eq('id', regId)

 

      if (error) throw error

 

      // TODO: Send approval email via API route

      // await fetch('/api/send-email/account-approved', {

      //   method: 'POST',

      //   body: JSON.stringify({ userId: regId })

      // })

 

      toast.success('Account approved! Customer has been notified.')

      setShowModal(false)

      loadRegistrations()

    } catch (error) {

      console.error('Error approving account:', error)

      toast.error('Failed to approve account')

    } finally {

      setProcessing(false)

    }

  }

 

  const handleDeny = async (regId) => {

    const reason = prompt('Reason for denial (optional):')

 

    setProcessing(true)

 

    try {

      const { error } = await supabase

        .from('profiles')

        .update({

          account_status: 'suspended',

          // Could add a notes field to store denial reason

        })

        .eq('id', regId)

 

      if (error) throw error

 

      // TODO: Send denial email

      // await fetch('/api/send-email/account-denied', {

      //   method: 'POST',

      //   body: JSON.stringify({ userId: regId, reason })

      // })

 

      toast.success('Account denied')

      setShowModal(false)

      loadRegistrations()

    } catch (error) {

      console.error('Error denying account:', error)

      toast.error('Failed to deny account')

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

      <AdminNav pendingCount={registrations.length} requestsCount={0} />

 

      <div className="lg:pl-64">

        <main className="py-8 px-4 sm:px-6 lg:px-8">

          {/* Header */}

          <div className="mb-8">

            <h1 className="text-3xl font-bold text-[#1C294E] mb-2">

              Pending Registrations

            </h1>

            <p className="text-gray-600">

              Review and approve new customer accounts

            </p>

          </div>

 

          {/* Count */}

          {registrations.length > 0 && (

            <Card className="mb-6 border-l-4 border-l-yellow-500">

              <div className="flex items-center gap-3">

                <UserCheck className="w-6 h-6 text-yellow-600" />

                <div>

                  <p className="font-semibold text-[#1C294E]">

                    {registrations.length} Pending Registration{registrations.length !== 1 ? 's' : ''}

                  </p>

                  <p className="text-sm text-gray-600">

                    Awaiting your approval

                  </p>

                </div>

              </div>

            </Card>

          )}

 

          {/* Registrations List */}

          {registrations.length > 0 ? (

            <div className="space-y-4">

              {registrations.map((reg) => (

                <Card key={reg.id} hover>

                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">

                    <div className="flex-1">

                      <div className="flex items-center gap-3 mb-3">

                        <div className="w-12 h-12 bg-[#079447]/10 rounded-full flex items-center justify-center">

                          <UserCheck className="w-6 h-6 text-[#079447]" />

                        </div>

                        <div>

                          <h3 className="text-lg font-semibold text-[#1C294E]">

                            {reg.full_name || 'No name provided'}

                          </h3>

                          <p className="text-sm text-gray-600">

                            Registered {format(new Date(reg.created_at), 'MMM d, yyyy \'at\' h:mm a')}

                          </p>

                        </div>

                      </div>

 

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

                        <div className="flex items-center gap-2 text-sm text-gray-600">

                          <Mail className="w-4 h-4" />

                          {reg.email}

                        </div>

 

                        {reg.phone && (

                          <div className="flex items-center gap-2 text-sm text-gray-600">

                            <Phone className="w-4 h-4" />

                            {reg.phone}

                          </div>

                        )}

 

                        {reg.service_addresses && reg.service_addresses[0] && (

                          <div className="flex items-start gap-2 text-sm text-gray-600 md:col-span-2">

                            <MapPin className="w-4 h-4 mt-0.5" />

                            <span>

                              {reg.service_addresses[0].street_address}

                              {reg.service_addresses[0].unit && `, ${reg.service_addresses[0].unit}`}

                              {', '}

                              {reg.service_addresses[0].city}, {reg.service_addresses[0].state} {reg.service_addresses[0].zip_code}

                            </span>

                          </div>

                        )}

                      </div>

 

                      {reg.communication_preference && (

                        <div className="mt-3">

                          <Badge variant="default" size="sm">

                            Prefers: {reg.communication_preference}

                          </Badge>

                        </div>

                      )}

                    </div>

 

                    <div className="flex flex-col gap-2 lg:min-w-[200px]">

                      <Button

                        variant="primary"

                        onClick={() => handleViewDetails(reg)}

                        fullWidth

                      >

                        View Details

                      </Button>

                      <div className="grid grid-cols-2 gap-2">

                        <Button

                          variant="secondary"

                          size="sm"

                          onClick={() => handleApprove(reg.id)}

                          disabled={processing}

                        >

                          <CheckCircle className="w-4 h-4" />

                          Approve

                        </Button>

                        <Button

                          variant="danger"

                          size="sm"

                          onClick={() => handleDeny(reg.id)}

                          disabled={processing}

                        >

                          <XCircle className="w-4 h-4" />

                          Deny

                        </Button>

                      </div>

                    </div>

                  </div>

                </Card>

              ))}

            </div>

          ) : (

            <Card>

              <div className="text-center py-12">

                <UserCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />

                <h3 className="text-lg font-semibold text-[#1C294E] mb-2">

                  No Pending Registrations

                </h3>

                <p className="text-gray-600">

                  All customer accounts have been reviewed

                </p>

              </div>

            </Card>

          )}

        </main>

      </div>

 

      {/* Details Modal */}

      <Modal

        isOpen={showModal}

        onClose={() => setShowModal(false)}

        title="Registration Details"

        maxWidth="lg"

      >

        {selectedReg && (

          <div className="space-y-6">

            {/* Personal Info */}

            <div>

              <h3 className="text-sm font-semibold text-gray-700 mb-3">

                Personal Information

              </h3>

              <div className="space-y-2">

                <div className="flex justify-between">

                  <span className="text-sm text-gray-600">Full Name:</span>

                  <span className="text-sm font-medium text-[#1C294E]">

                    {selectedReg.full_name || 'Not provided'}

                  </span>

                </div>

                <div className="flex justify-between">

                  <span className="text-sm text-gray-600">Email:</span>

                  <span className="text-sm font-medium text-[#1C294E]">

                    {selectedReg.email}

                  </span>

                </div>

                <div className="flex justify-between">

                  <span className="text-sm text-gray-600">Phone:</span>

                  <span className="text-sm font-medium text-[#1C294E]">

                    {selectedReg.phone || 'Not provided'}

                  </span>

                </div>

                <div className="flex justify-between">

                  <span className="text-sm text-gray-600">Communication Preference:</span>

                  <span className="text-sm font-medium text-[#1C294E]">

                    {selectedReg.communication_preference || 'Not set'}

                  </span>

                </div>

              </div>

            </div>

 

            {/* Service Address */}

            {selectedReg.service_addresses && selectedReg.service_addresses[0] && (

              <div>

                <h3 className="text-sm font-semibold text-gray-700 mb-3">

                  Service Address

                </h3>

                <div className="p-4 bg-gray-50 rounded-lg">

                  <p className="text-sm text-[#1C294E]">

                    {selectedReg.service_addresses[0].street_address}

                    {selectedReg.service_addresses[0].unit && `, ${selectedReg.service_addresses[0].unit}`}

                  </p>

                  <p className="text-sm text-gray-600">

                    {selectedReg.service_addresses[0].city}, {selectedReg.service_addresses[0].state} {selectedReg.service_addresses[0].zip_code}

                  </p>

                </div>

              </div>

            )}

 

            {/* Registration Info */}

            <div>

              <h3 className="text-sm font-semibold text-gray-700 mb-3">

                Registration Information

              </h3>

              <div className="space-y-2">

                <div className="flex justify-between">

                  <span className="text-sm text-gray-600">Registered:</span>

                  <span className="text-sm font-medium text-[#1C294E]">

                    {format(new Date(selectedReg.created_at), 'MMM d, yyyy \'at\' h:mm a')}

                  </span>

                </div>

                <div className="flex justify-between">

                  <span className="text-sm text-gray-600">Status:</span>

                  <Badge variant="warning">

                    {selectedReg.account_status}

                  </Badge>

                </div>

              </div>

            </div>

 

            {/* Actions */}

            <div className="flex gap-3 pt-4 border-t border-gray-200">

              <Button

                variant="primary"

                fullWidth

                onClick={() => handleApprove(selectedReg.id)}

                loading={processing}

              >

                <CheckCircle className="w-5 h-5" />

                Approve Account

              </Button>

              <Button

                variant="danger"

                fullWidth

                onClick={() => handleDeny(selectedReg.id)}

                loading={processing}

              >

                <XCircle className="w-5 h-5" />

                Deny Account

              </Button>

            </div>

          </div>

        )}

      </Modal>

    </div>

  )

}