'use client'
import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  CheckCircle2,
  Upload,
  MapPin,
  Clock,
  ChevronLeft,
  Briefcase,
  DollarSign,
  Calendar,
  User,
  FileText,
  Send,
  Sparkles,
} from 'lucide-react'
import useRecaptcha from '@/hooks/useRecaptcha'

// Job data
const jobsData = {
  'cleaning-technician': {
    title: 'Cleaning Technician',
    location: 'Georgetown, TX',
    type: 'Full-Time',
    experience: 'No experience required',
    salary: '$15-18/hour',
    schedule: 'Monday - Friday, 8:00 AM - 5:00 PM',
    description:
      "We're looking for dedicated and detail-oriented individuals to join our residential and commercial cleaning team. No prior experience needed — we'll train you completely.",
    responsibilities: [
      'Perform cleaning duties in residential and commercial properties',
      'Follow established cleaning procedures and checklists',
      'Maintain cleaning equipment and supplies',
      'Communicate professionally with clients',
      'Work effectively as part of a team',
    ],
    benefits: [
      'Competitive starting pay with regular raises',
      'Full-time Monday-Friday schedule',
      'Paid training from day one',
      'Health insurance after 90 days',
      'Opportunities for advancement',
    ],
  },
  'team-supervisor': {
    title: 'Team Supervisor',
    location: 'Georgetown, TX',
    type: 'Full-Time',
    experience: '2+ years experience',
    salary: '$20-25/hour',
    schedule: 'Monday - Friday, 7:30 AM - 5:30 PM',
    description:
      'Lead and motivate cleaning teams while ensuring service quality and customer satisfaction. Prior supervisory experience required.',
    responsibilities: [
      'Supervise and train cleaning team members',
      'Conduct quality inspections and provide feedback',
      'Manage schedules and assign daily tasks',
      'Handle customer inquiries and concerns',
      'Maintain inventory and supply orders',
    ],
    benefits: [
      'Higher pay rate for leadership role',
      'Full benefits package',
      'Company vehicle provided',
      'Performance bonuses',
      'Career growth opportunities',
    ],
  },
  'operations-assistant': {
    title: 'Operations Assistant',
    location: 'Georgetown, TX',
    type: 'Full-Time',
    experience: '1+ year experience',
    salary: '$18-22/hour',
    schedule: 'Monday - Friday, 8:00 AM - 5:00 PM',
    description:
      'Support daily operations, coordinate schedules, and help with client communications. Administrative experience preferred.',
    responsibilities: [
      'Coordinate cleaning schedules and assignments',
      'Answer phones and respond to customer inquiries',
      'Process invoices and maintain records',
      'Assist with inventory management',
      'Support the operations manager with daily tasks',
    ],
    benefits: [
      'Office-based position',
      'Full benefits package',
      'Professional development opportunities',
      'Supportive team environment',
      'Room for advancement',
    ],
  },
}

const FORM_ENDPOINT = 'https://formspree.io/f/YOUR_FORM_ID' // TODO: Replace with your Formspree endpoint

export default function JobApplicationContent() {
  const params = useParams()
  const router = useRouter()
  const jobSlug = params.slug
  const job = jobsData[jobSlug]
  const { executeRecaptcha } = useRecaptcha()

  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [fileName, setFileName] = useState('')
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    city: '',
    zipCode: '',
    startDate: '',
    employmentType: '',
    hasTransport: '',
    authorizedToWork: '',
    experience: '',
    whyJoin: '',
    references: '',
  })
  const [selectedDays, setSelectedDays] = useState([])

  // If job doesn't exist, redirect to main careers page
  if (!job) {
    router.push('/apply')
    return null
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (error) setError('')
  }

  const handleDayToggle = (day) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    )
    if (error) setError('')
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError('')

    // Honeypot check (obscure field name)
    const hp = e.currentTarget.elements.namedItem('website_url_field')?.value || ''
    if (hp) {
      return
    }

    // Validate at least one day selected
    if (selectedDays.length === 0) {
      setError('Please select at least one day you are available to work.')
      return
    }

    setSending(true)

    try {
      // Verify reCAPTCHA
      const recaptchaToken = await executeRecaptcha('job_application')
      if (!recaptchaToken) {
        setError('Security verification failed. Please refresh and try again.')
        setSending(false)
        return
      }

      // Verify with backend
      const verifyRes = await fetch('/api/verify-recaptcha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: recaptchaToken, action: 'job_application' }),
      })

      const verifyData = await verifyRes.json()
      if (!verifyRes.ok || !verifyData.success) {
        setError('Security verification failed. Please try again.')
        setSending(false)
        return
      }

      // Submit to Formspree
      const form = new FormData(e.currentTarget)
      form.append('_subject', `New Application - ${job.title} - Impress Cleaning`)
      form.append('position_applied', job.title)
      form.append('available_days', selectedDays.join(', '))

      const res = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        body: form,
        headers: { Accept: 'application/json' },
      })

      if (res.ok) {
        setSent(true)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else {
        setError("We couldn't submit your application. Please try again.")
      }
    } catch (err) {
      console.error('Application submission error:', err)
      setError('Connection error. Please try again.')
    } finally {
      setSending(false)
    }
  }

  // Success state
  if (sent) {
    return (
      <div className="min-h-screen bg-[#FAFAF8]">
        <div className="py-20 lg:py-32">
          <div className="max-w-2xl mx-auto px-4">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 lg:p-12 text-center">
              {/* Success icon */}
              <div className="w-20 h-20 bg-gradient-to-br from-[#079447] to-[#08A855] rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg shadow-[#079447]/30">
                <CheckCircle2 className="w-10 h-10 text-white" />
              </div>

              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Application Submitted!
              </h2>
              <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
                We&apos;ve received your application for{' '}
                <span className="font-semibold text-[#079447]">{job.title}</span>. We&apos;ll
                contact you within 1-2 business days.
              </p>

              <div className="bg-gray-50 rounded-2xl p-6 mb-8 text-left max-w-sm mx-auto">
                <h4 className="font-semibold text-gray-900 mb-4">What happens next:</h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#079447] flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600 text-sm">
                      We&apos;ll review your application carefully
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#079447] flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600 text-sm">Phone interview within 1-2 days</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#079447] flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600 text-sm">In-person interview if qualified</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/apply"
                  className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-[#079447] to-[#08A855] text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-[#079447]/30 transition-all duration-300"
                >
                  View Other Positions
                </Link>
                <Link
                  href="/"
                  className="inline-flex items-center justify-center px-6 py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-300"
                >
                  Return Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      {/* Header banner */}
      <div className="bg-gradient-to-br from-[#001F3F] via-[#0B2859] to-[#001F3F] text-white py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/apply"
            className="inline-flex items-center text-blue-200 hover:text-white transition-colors mb-6 group"
          >
            <ChevronLeft className="w-5 h-5 mr-1 group-hover:-translate-x-1 transition-transform" />
            Back to All Jobs
          </Link>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">Apply for {job.title}</h1>
          <p className="text-lg text-blue-100/80 max-w-2xl">{job.description}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Sidebar - Job Details */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <div className="lg:sticky lg:top-24 space-y-6">
              {/* Job info card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-6">Position Details</h2>
                <div className="space-y-5">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-[#079447]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-[#079447]" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="font-medium text-gray-900">{job.location}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-[#079447]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Briefcase className="w-5 h-5 text-[#079447]" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Employment Type</p>
                      <p className="font-medium text-gray-900">{job.type}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-[#079447]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Clock className="w-5 h-5 text-[#079447]" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Experience</p>
                      <p className="font-medium text-gray-900">{job.experience}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-[#079447]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <DollarSign className="w-5 h-5 text-[#079447]" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Salary</p>
                      <p className="font-semibold text-[#079447]">{job.salary}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-[#079447]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-5 h-5 text-[#079447]" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Schedule</p>
                      <p className="font-medium text-gray-900">{job.schedule}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Benefits card */}
              <div className="bg-gradient-to-br from-[#079447] to-[#08A855] rounded-2xl shadow-lg p-6 text-white">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5" />
                  <h3 className="font-bold">What You&apos;ll Get</h3>
                </div>
                <ul className="space-y-3">
                  {job.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 opacity-90" />
                      <span className="text-sm text-white/90">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Main Form */}
          <div className="lg:col-span-2 order-1 lg:order-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Form header */}
              <div className="border-b border-gray-100 px-6 lg:px-8 py-6">
                <h2 className="text-2xl font-bold text-gray-900">Application Form</h2>
                <p className="text-gray-600 mt-1">
                  Fill out the form below. We&apos;ll get back to you within 1-2 business days.
                </p>
              </div>

              <form onSubmit={onSubmit} className="p-6 lg:p-8 space-y-8">
                {/* Honeypot - obscure name that bots won't recognize */}
                <input
                  type="text"
                  name="website_url_field"
                  className="hidden"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                />

                {/* Personal Information */}
                <div>
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-8 h-8 bg-[#079447]/10 rounded-lg flex items-center justify-center">
                      <User className="w-4 h-4 text-[#079447]" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        required
                        maxLength={50}
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#079447]/20 focus:border-[#079447] transition-all duration-200 outline-none"
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        required
                        maxLength={50}
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#079447]/20 focus:border-[#079447] transition-all duration-200 outline-none"
                        placeholder="Smith"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        required
                        maxLength={20}
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#079447]/20 focus:border-[#079447] transition-all duration-200 outline-none"
                        placeholder="(512) 555-1234"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        required
                        maxLength={254}
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#079447]/20 focus:border-[#079447] transition-all duration-200 outline-none"
                        placeholder="john@email.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="city"
                        required
                        maxLength={100}
                        value={formData.city}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#079447]/20 focus:border-[#079447] transition-all duration-200 outline-none"
                        placeholder="Georgetown"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ZIP Code <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="zipCode"
                        required
                        pattern="[0-9]{5}"
                        maxLength={5}
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#079447]/20 focus:border-[#079447] transition-all duration-200 outline-none"
                        placeholder="78626"
                      />
                    </div>
                  </div>
                </div>

                {/* Availability */}
                <div>
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-8 h-8 bg-[#079447]/10 rounded-lg flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-[#079447]" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Availability</h3>
                  </div>

                  <div className="mb-6">
                    <p className="text-sm font-medium text-gray-700 mb-3">
                      Days Available <span className="text-red-500">*</span>
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(
                        (day) => (
                          <button
                            key={day}
                            type="button"
                            onClick={() => handleDayToggle(day)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                              selectedDays.includes(day)
                                ? 'bg-[#079447] text-white shadow-md shadow-[#079447]/20'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {day}
                          </button>
                        )
                      )}
                    </div>
                    {selectedDays.length === 0 && (
                      <p className="text-xs text-gray-500 mt-2">Select at least one day</p>
                    )}
                  </div>

                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        When can you start? <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="startDate"
                        required
                        value={formData.startDate}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#079447]/20 focus:border-[#079447] transition-all duration-200 outline-none appearance-none bg-white"
                      >
                        <option value="">Select an option</option>
                        <option value="immediately">Immediately</option>
                        <option value="1_week">In 1 week</option>
                        <option value="2_weeks">In 2 weeks</option>
                        <option value="1_month">In 1 month</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Desired employment type <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="employmentType"
                        required
                        value={formData.employmentType}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#079447]/20 focus:border-[#079447] transition-all duration-200 outline-none appearance-none bg-white"
                      >
                        <option value="">Select an option</option>
                        <option value="full_time">Full-Time</option>
                        <option value="part_time">Part-Time</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Requirements */}
                <div>
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-8 h-8 bg-[#079447]/10 rounded-lg flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-[#079447]" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Requirements</h3>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Do you have reliable transportation? <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="hasTransport"
                        required
                        value={formData.hasTransport}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#079447]/20 focus:border-[#079447] transition-all duration-200 outline-none appearance-none bg-white"
                      >
                        <option value="">Select</option>
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Authorized to work in the US? <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="authorizedToWork"
                        required
                        value={formData.authorizedToWork}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#079447]/20 focus:border-[#079447] transition-all duration-200 outline-none appearance-none bg-white"
                      >
                        <option value="">Select</option>
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Experience */}
                <div>
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-8 h-8 bg-[#079447]/10 rounded-lg flex items-center justify-center">
                      <FileText className="w-4 h-4 text-[#079447]" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Experience</h3>
                  </div>
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Relevant Experience
                      </label>
                      <textarea
                        name="experience"
                        rows={4}
                        maxLength={2000}
                        value={formData.experience}
                        onChange={handleInputChange}
                        placeholder="Describe any experience in cleaning, customer service, or related work..."
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#079447]/20 focus:border-[#079447] transition-all duration-200 outline-none resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Why do you want to work with us?
                      </label>
                      <textarea
                        name="whyJoin"
                        rows={3}
                        maxLength={1000}
                        value={formData.whyJoin}
                        onChange={handleInputChange}
                        placeholder="Tell us what motivates you to join our team..."
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#079447]/20 focus:border-[#079447] transition-all duration-200 outline-none resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        References (Optional)
                      </label>
                      <textarea
                        name="references"
                        rows={3}
                        maxLength={1000}
                        value={formData.references}
                        onChange={handleInputChange}
                        placeholder="Name, relationship, and phone number for 2-3 references..."
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#079447]/20 focus:border-[#079447] transition-all duration-200 outline-none resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Resume Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Resume / CV (Optional)
                  </label>
                  <label className="flex items-center gap-3 px-4 py-3 border-2 border-dashed border-gray-200 rounded-xl hover:border-[#079447]/50 hover:bg-[#079447]/5 cursor-pointer transition-all duration-200">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Upload className="w-5 h-5 text-gray-500" />
                    </div>
                    <div>
                      <span className="text-gray-700 font-medium">
                        {fileName || 'Choose a file'}
                      </span>
                      <p className="text-xs text-gray-500 mt-0.5">PDF or Word, max 10MB</p>
                    </div>
                    <input
                      name="resume"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => setFileName(e.target.files?.[0]?.name || '')}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Consent */}
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                  <input
                    id="consent"
                    name="consent"
                    type="checkbox"
                    required
                    className="mt-1 w-5 h-5 text-[#079447] border-gray-300 rounded focus:ring-[#079447]"
                  />
                  <label htmlFor="consent" className="text-sm text-gray-600">
                    I agree to be contacted by Impress Cleaning via phone or email about my
                    application, and I authorize verification of my employment background.{' '}
                    <span className="text-red-500">*</span>
                  </label>
                </div>

                {/* Error message */}
                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                )}

                {/* Submit */}
                <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={sending}
                    className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-[#079447] to-[#08A855] text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-[#079447]/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 group"
                  >
                    {sending ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-2" />
                        Submit Application
                      </>
                    )}
                  </button>
                  <Link
                    href="/apply"
                    className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
                  >
                    Cancel
                  </Link>
                </div>

                {/* reCAPTCHA notice */}
                <p className="text-xs text-gray-400 text-center">
                  This site is protected by reCAPTCHA and the Google{' '}
                  <a
                    href="https://policies.google.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    Privacy Policy
                  </a>{' '}
                  and{' '}
                  <a
                    href="https://policies.google.com/terms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    Terms of Service
                  </a>{' '}
                  apply.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}