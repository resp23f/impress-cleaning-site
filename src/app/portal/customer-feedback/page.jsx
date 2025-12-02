'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Star, Send, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import toast from 'react-hot-toast'
import styles from '../shared-animations.module.css'

export default function CustomerFeedbackPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [feedback, setFeedback] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (rating === 0) {
      toast.error('Please select a rating')
      return
    }

    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/auth/login')
        return
      }

      const { error } = await supabase
        .from('customer_reviews')
        .insert({
          customer_id: user.id,
          rating,
          review_text: feedback,
        })

      if (error) throw error

      setSubmitted(true)
      toast.success('Thank you for your feedback!')
      
      setTimeout(() => {
        router.push('/portal/dashboard')
      }, 2000)
      
    } catch (err) {
      console.error('Error submitting feedback:', err)
      toast.error('Failed to submit feedback')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
        <div className={`${styles.animateScaleIn} text-center`}>
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-[#1C294E] mb-2">
            Feedback Submitted!
          </h2>
          <p className="text-gray-600">
            Thank you for helping us improve our service.
          </p>
        </div>
      </div>
    )
  }

  return (
<div className={`min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 ${styles.contentReveal}`}>
      <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-2xl mx-auto">
        
        <div className={`mb-8 ${styles.cardReveal}`}>
                  <h1 className="text-3xl font-bold text-[#1C294E] mb-2">
            Share Your Feedback
          </h1>
          <p className="text-gray-600">
            We'd love to hear about your cleaning experience
          </p>
        </div>

<div className={styles.cardReveal1}>
          <Card className={styles.cardHover} padding="lg">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Rating */}
              <div>
                <label className="block text-sm font-semibold text-[#1C294E] mb-3">
                  How would you rate your experience?
                </label>
                <div className="flex gap-2 justify-center py-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className={`${styles.smoothTransition} transform hover:scale-110`}
                    >
                      <Star
                        className={`w-12 h-12 ${
                          star <= (hoverRating || rating)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                {rating > 0 && (
                  <p className="text-center text-sm text-gray-600 mt-2">
                    {rating === 5 && 'Excellent!'}
                    {rating === 4 && 'Great!'}
                    {rating === 3 && 'Good'}
                    {rating === 2 && 'Fair'}
                    {rating === 1 && 'Needs Improvement'}
                  </p>
                )}
              </div>

              {/* Feedback Text */}
              <div>
                <label className="block text-sm font-semibold text-[#1C294E] mb-2">
                  Tell us more (optional)
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#079447] focus:border-transparent transition-all"
                  placeholder="What did we do well? How can we improve?"
                />
              </div>

              {/* Submit */}
              <Button
                type="submit"
                variant="primary"
                fullWidth
                loading={loading}
                className={styles.smoothTransition}
              >
                <Send className="w-5 h-5" />
                Submit Feedback
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  )
}