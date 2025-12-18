'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { MapPin } from 'lucide-react'

// Debounce utility to reduce API calls
function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// XSS sanitization for address fields - preserves spaces in middle
function sanitizeInput(input, preserveSpaces = true) {
  if (!input) return ''
  let sanitized = String(input)
    .replace(/[<>]/g, '') // Remove angle brackets only

  // Only trim if not preserving spaces (for final values, not during typing)
  return preserveSpaces ? sanitized : sanitized.trim()
}

export default function AddressAutocomplete({ onSelect, onInputChange, defaultValue = '' }) {
  const [inputValue, setInputValue] = useState(defaultValue)
  const inputRef = useRef(null)
  const autocompleteRef = useRef(null)
  const listenerRef = useRef(null)

  useEffect(() => {
    if (typeof window === 'undefined' || !window.google) return

    // Initialize Google Places Autocomplete
    autocompleteRef.current = new window.google.maps.places.Autocomplete(
      inputRef.current,
      {
        types: ['address'],
        componentRestrictions: { country: 'us' },
        fields: ['address_components', 'formatted_address', 'place_id', 'geometry']
      }
    )

    // Place selection handler with retry logic
    const handlePlaceChanged = () => {
      const place = autocompleteRef.current.getPlace()

      // If place details are ready, process immediately
      if (place.address_components) {
        processPlace(place)
        return
      }

      // Retry with increasing delays (50ms, 100ms, 200ms, 400ms)
      let retryCount = 0
      const maxRetries = 4
      const delays = [50, 100, 200, 400]

      const attemptRetry = () => {
        const retryPlace = autocompleteRef.current.getPlace()
        if (retryPlace.address_components) {
          processPlace(retryPlace)
          return
        }
        
        retryCount++
        if (retryCount < maxRetries) {
          setTimeout(attemptRetry, delays[retryCount])
        }
      }

      setTimeout(attemptRetry, delays[0])
    }

    const processPlace = (place) => {

      // Parse address components with XSS sanitization
      const addressData = {
        street_address: '',
        city: '',
        state: '',
        zip_code: '',
        place_id: sanitizeInput(place.place_id),
        formatted_address: sanitizeInput(place.formatted_address),
      }

      let streetNumber = ''
      let route = ''

      place.address_components.forEach((component) => {
        const types = component.types

        if (types.includes('street_number')) {
          streetNumber = sanitizeInput(component.long_name)
        }
        if (types.includes('route')) {
          route = sanitizeInput(component.long_name)
        }
        if (types.includes('locality')) {
          addressData.city = sanitizeInput(component.long_name)
        }
        if (types.includes('administrative_area_level_1')) {
          addressData.state = sanitizeInput(component.short_name)
        }
        if (types.includes('postal_code')) {
          addressData.zip_code = sanitizeInput(component.long_name)
        }
      })

      addressData.street_address = sanitizeInput(`${streetNumber} ${route}`, false) // trim on final
      setInputValue(addressData.formatted_address)
      onSelect(addressData)
    }

    // Add listener with debouncing
    listenerRef.current = autocompleteRef.current.addListener('place_changed', handlePlaceChanged)

    // Cleanup
    return () => {
      if (listenerRef.current && window.google) {
        window.google.maps.event.removeListener(listenerRef.current)
      }
    }
  }, [onSelect])

  // Debounced input change handler
  const debouncedInputChange = useCallback(
    debounce((value) => {
      // This reduces unnecessary re-renders while typing
      setInputValue(value)
    }, 300),
    []
  )

  const handleInputChange = (e) => {
    // Preserve spaces during typing - only sanitize dangerous characters
    const sanitizedValue = sanitizeInput(e.target.value, true)
    setInputValue(sanitizedValue)
    // Sync raw street address to parent for device autofill support
    if (onInputChange) {
      onInputChange(sanitizedValue)
    }
  }
  return (
    <div className="relative">
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        Service Address *
      </label>
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
          <MapPin className="w-5 h-5" />
        </div>
        <input
          ref={inputRef}
          type="text"
          name="street-address"
          value={inputValue}
          onChange={handleInputChange}
          placeholder="Start typing your address..."
          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1C294E] focus:border-transparent"
          required
          autoComplete="street-address"
        />
      </div>
      <p className="text-xs text-gray-500 mt-1">
        We'll auto-fill your address details
      </p>
    </div>
  )
}