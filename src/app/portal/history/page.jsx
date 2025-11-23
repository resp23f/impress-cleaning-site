'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Modal from '@/components/ui/Modal'
import { format, parseISO } from 'date-fns'
import { Calendar, MapPin, Package, Star, Image as ImageIcon, FileText, MessageSquare } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ServiceHistoryPage() {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedService, setSelectedService] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showRatingModal, setShowRatingModal] = useState(false)
  const [rating, setRating] = useState(0)
  const [review, setReview] = useState('')
  const [hoverRating, setHoverRating] = useState(0)
  const [submitLoading, setSubmitLoading] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    fetchServiceHistory()
  }, [])

  async function fetchServiceHistory() {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      const { data, error } = await supabase
        .from('service_history')
        .select(`
          *,
          service_addresses (
            address,
            address_line2,
            city,
            state,
            zip_code
          )
        `)
        .eq('user_id', user.id)
        .order('service_date', { ascending: false })

      if (error) throw error

      setServices(data || [])
    } catch (error) {
      console.error('Error fetching service history:', error)
      toast.error('Failed to load service history')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmitRating() {
    if (!selectedService || rating === 0) {
      toast.error('Please select a rating')
      return
    }

    setSubmitLoading(true)
    try {
      const { error } = await supabase
        .from('service_history')
        .update({
          rating,
          review: review.trim() || null,
        })
        .eq('id', selectedService.id)

      if (error) throw error

      toast.success('Thank you for your feedback!')
      setShowRatingModal(false)
      setSelectedService(null)
      setRating(0)
      setReview('')
      fetchServiceHistory()
    } catch (error) {
      console.error('Error submitting rating:', error)
      toast.error('Failed to submit rating')
    } finally {
      setSubmitLoading(false)
    }
  }

  function openDetailsModal(service) {
    setSelectedService(service)
    setShowDetailsModal(true)
  }

  function openRatingModal(service) {
    setSelectedService(service)
    setRating(service.rating || 0)
    setReview(service.review || '')
    setShowRatingModal(true)
  }

  const StarIcon = ({ filled, onHover, onClick, index }) => (
    <Star
      className={`w-8 h-8 cursor-pointer transition-all ${
        filled ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
      }`}
      onMouseEnter={() => onHover && onHover(index)}
      onMouseLeave={() => onHover && onHover(0)}
      onClick={() => onClick && onClick(index)}
    />
  )

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#1C294E] mb-2">Service History</h1>
        <p className="text-gray-600">View your past cleaning services and leave feedback</p>
      </div>

      {/* Service History List */}
      {services.length === 0 ? (
        <Card className="text-center py-12">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No service history yet</h3>
          <p className="text-gray-500 mb-6">
            Your completed services will appear here
          </p>
          <Button onClick={() => window.location.href = '/portal/request-service'}>
            Request a Service
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {services.map((service) => (
            <Card key={service.id} className="hover:shadow-lg transition-shadow">
              <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                {/* Left: Service Info */}
                <div className="flex-1 space-y-3">
                  {/* Service Type */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <Package className="w-5 h-5 text-[#079447]" />
                    <span className="font-semibold text-lg text-[#1C294E] capitalize">
                      {service.service_type.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Date */}
                  <div className="flex items-center gap-2 text-gray-700">
                    <Calendar className="w-4 h-4" />
                    <span>{format(parseISO(service.service_date), 'EEEE, MMM d, yyyy')}</span>
                  </div>

                  {/* Address */}
                  {service.service_addresses && (
                    <div className="flex items-start gap-2 text-gray-600">
                      <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                      <span className="text-sm">
                        {service.service_addresses.address}, {service.service_addresses.city}
                      </span>
                    </div>
                  )}

                  {/* Rating Display */}
                  {service.rating ? (
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-5 h-5 ${
                              star <= service.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">({service.rating}/5)</span>
                    </div>
                  ) : (
                    <Badge variant="yellow">Not Rated</Badge>
                  )}

                  {/* Review */}
                  {service.review && (
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <p className="text-sm text-gray-700 italic">"{service.review}"</p>
                    </div>
                  )}

                  {/* Service Notes */}
                  {service.service_notes && (
                    <div className="flex items-start gap-2 text-gray-600">
                      <FileText className="w-4 h-4 mt-1 flex-shrink-0" />
                      <span className="text-sm">{service.service_notes}</span>
                    </div>
                  )}

                  {/* Photos Indicator */}
                  {service.photos && service.photos.length > 0 && (
                    <div className="flex items-center gap-2 text-[#079447]">
                      <ImageIcon className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        {service.photos.length} photo{service.photos.length !== 1 ? 's' : ''} available
                      </span>
                    </div>
                  )}
                </div>

                {/* Right: Action Buttons */}
                <div className="flex lg:flex-col gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => openDetailsModal(service)}
                    className="flex-1 lg:flex-none whitespace-nowrap"
                  >
                    View Details
                  </Button>

                  <Button
                    variant={service.rating ? 'secondary' : 'primary'}
                    size="sm"
                    onClick={() => openRatingModal(service)}
                    className="flex-1 lg:flex-none whitespace-nowrap"
                  >
                    <Star className="w-4 h-4 mr-2" />
                    {service.rating ? 'Edit Rating' : 'Leave Rating'}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedService && (
        <Modal onClose={() => setShowDetailsModal(false)} title="Service Details">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Service Type</label>
              <p className="text-lg font-semibold text-[#1C294E] capitalize">
                {selectedService.service_type.replace('_', ' ')}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Service Date</label>
              <p className="text-gray-900">
                {format(parseISO(selectedService.service_date), 'EEEE, MMMM d, yyyy')}
              </p>
            </div>

            {selectedService.service_addresses && (
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Service Address</label>
                <p className="text-gray-900">
                  {selectedService.service_addresses.address}
                  {selectedService.service_addresses.address_line2 && (
                    <>, {selectedService.service_addresses.address_line2}</>
                  )}
                  <br />
                  {selectedService.service_addresses.city}, {selectedService.service_addresses.state}{' '}
                  {selectedService.service_addresses.zip_code}
                </p>
              </div>
            )}

            {selectedService.service_notes && (
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Service Notes</label>
                <p className="text-gray-900">{selectedService.service_notes}</p>
              </div>
            )}

            {selectedService.rating && (
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Your Rating</label>
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-6 h-6 ${
                          star <= selectedService.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-gray-600">({selectedService.rating}/5)</span>
                </div>
              </div>
            )}

            {selectedService.review && (
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Your Review</label>
                <p className="text-gray-900 italic">"{selectedService.review}"</p>
              </div>
            )}

            {/* Photos Section */}
            {selectedService.photos && selectedService.photos.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Service Photos</label>
                <div className="grid grid-cols-2 gap-2">
                  {selectedService.photos.map((photo, index) => (
                    <div key={index} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={photo}
                        alt={`Service photo ${index + 1}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                        onClick={() => window.open(photo, '_blank')}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4">
              <Button onClick={() => setShowDetailsModal(false)} fullWidth>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Rating Modal */}
      {showRatingModal && selectedService && (
        <Modal onClose={() => setShowRatingModal(false)} title="Rate This Service">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Service</label>
              <p className="font-semibold text-[#1C294E] capitalize">
                {selectedService.service_type.replace('_', ' ')} - {format(parseISO(selectedService.service_date), 'MMM d, yyyy')}
              </p>
            </div>

            {/* Star Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-3">
                How would you rate this service?
              </label>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <StarIcon
                    key={star}
                    filled={star <= (hoverRating || rating)}
                    onHover={setHoverRating}
                    onClick={setRating}
                    index={star}
                  />
                ))}
              </div>
              {rating > 0 && (
                <p className="text-center text-sm text-gray-600 mt-2">
                  {rating === 1 && 'Poor'}
                  {rating === 2 && 'Fair'}
                  {rating === 3 && 'Good'}
                  {rating === 4 && 'Very Good'}
                  {rating === 5 && 'Excellent'}
                </p>
              )}
            </div>

            {/* Review Text */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Write a Review (Optional)
              </label>
              <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="Share your experience with this service..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#079447] focus:border-transparent resize-none"
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1">{review.length}/500 characters</p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800">
                <MessageSquare className="w-4 h-4 inline mr-1" />
                Your feedback helps us improve our services!
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="secondary"
                onClick={() => setShowRatingModal(false)}
                fullWidth
                disabled={submitLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitRating}
                fullWidth
                loading={submitLoading}
                disabled={rating === 0}
              >
                Submit Rating
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
