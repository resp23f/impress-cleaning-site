'use client'

import { useState, useRef, useEffect } from 'react'
import { MapPin } from 'lucide-react'

export default function AddressAutocomplete({ onSelect, defaultValue = '' }) {
  const [inputValue, setInputValue] = useState(defaultValue)
  const inputRef = useRef(null)
  const autocompleteRef = useRef(null)

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

    // Listen for place selection
    autocompleteRef.current.addListener('place_changed', () => {
      const place = autocompleteRef.current.getPlace()

      if (!place.address_components) {
        return
      }

      // Parse address components
      const addressData = {
        street_address: '',
        city: '',
        state: '',
        zip_code: '',
        place_id: place.place_id,
        formatted_address: place.formatted_address,
      }

      let streetNumber = ''
      let route = ''

      place.address_components.forEach((component) => {
        const types = component.types

        if (types.includes('street_number')) {
          streetNumber = component.long_name
        }
        if (types.includes('route')) {
          route = component.long_name
        }
        if (types.includes('locality')) {
          addressData.city = component.long_name
        }
        if (types.includes('administrative_area_level_1')) {
          addressData.state = component.short_name
        }
        if (types.includes('postal_code')) {
          addressData.zip_code = component.long_name
        }
      })

      addressData.street_address = `${streetNumber} ${route}`.trim()

      setInputValue(addressData.formatted_address)
      onSelect(addressData)
    })
  }, [onSelect])

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
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Start typing your address..."
          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1C294E] focus:border-transparent"
          required
        />
      </div>
      <p className="text-xs text-gray-500 mt-1">
        We'll auto-fill your address details
      </p>
    </div>
  )
}