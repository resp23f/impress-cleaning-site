'use client'
import { useState, useEffect, useRef } from 'react'
import { MapPin } from 'lucide-react'

interface AddressData {
  street_address: string
  city: string
  state: string
  zip_code: string
  place_id: string
  formatted_address: string
  unit?: string
}

interface AddressAutocompleteProps {
  onSelect: (address: AddressData) => void
  onInputChange?: (value: string) => void
  defaultValue?: string
}

declare global {
  interface Window {
    google: any
  }
}

function sanitizeInput(input: string | undefined, preserveSpaces = true): string {
  if (!input) return ''
  let sanitized = String(input).replace(/[<>]/g, '')
  return preserveSpaces ? sanitized : sanitized.trim()
}

// Create a custom element type for the PlaceAutocompleteElement
interface PlaceAutocompleteElement extends HTMLElement {
  value?: string
}

export default function AddressAutocomplete({
  onSelect,
  onInputChange,
  defaultValue = ''
}: AddressAutocompleteProps) {
  const [scriptLoaded, setScriptLoaded] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const autocompleteRef = useRef<PlaceAutocompleteElement | null>(null)

  // Load the NEW Google Maps API with the right libraries
  useEffect(() => {
    if (window.google?.maps?.places?.PlaceAutocompleteElement) {
      setScriptLoaded(true)
      return
    }

    const script = document.createElement('script')
    // This loads the NEW API with PlaceAutocompleteElement support
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places,marker&v=beta&loading=async`
    script.async = true

    script.onload = () => {
      setScriptLoaded(true)
    }

    document.head.appendChild(script)
  }, [])

  // Initialize the NEW PlaceAutocompleteElement when script loads
  useEffect(() => {
    if (!scriptLoaded || !containerRef.current) return
    if (!window.google?.maps?.places?.PlaceAutocompleteElement) return

    // Create the NEW PlaceAutocompleteElement
    const PlaceAutocompleteElement = window.google.maps.places.PlaceAutocompleteElement
    const autocomplete = new PlaceAutocompleteElement({
      componentRestrictions: { country: 'us' },
      types: ['address']
    })

    autocompleteRef.current = autocomplete

    // Add to DOM
    containerRef.current.innerHTML = ''
    containerRef.current.appendChild(autocomplete)

    // Set default value if provided
    if (defaultValue && autocomplete.value !== undefined) {
      autocomplete.value = defaultValue
    }

    // Listen for place selection using the NEW event
    autocomplete.addEventListener('gmp-placeselect', async (event: any) => {
      const place = event.place

      if (!place?.location) return

      // Fetch place details
      await place.fetchFields({
        fields: ['addressComponents', 'formattedAddress', 'location']
      })

      const addressData: AddressData = {
        street_address: '',
        city: '',
        state: '',
        zip_code: '',
        place_id: place.id || '',
        formatted_address: place.formattedAddress || '',
      }

      let streetNumber = ''
      let route = ''

      if (place.addressComponents) {
        for (const component of place.addressComponents) {
          const type = component.types[0]

          if (type === 'street_number') {
            streetNumber = component.longText
          }
          if (type === 'route') {
            route = component.longText
          }
          if (type === 'locality') {
            addressData.city = component.longText
          }
          if (type === 'administrative_area_level_1') {
            addressData.state = component.shortText
          }
          if (type === 'postal_code') {
            addressData.zip_code = component.longText
          }
        }
      }

      addressData.street_address = sanitizeInput(`${streetNumber} ${route}`, false)
      onSelect(addressData)
    })
  }, [scriptLoaded, onSelect, defaultValue])

  return (
    <div className="relative">
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        Service Address *
      </label>
      <div className="relative">
        {!scriptLoaded ? (
          <input
            type="text"
            placeholder="Loading address search..."
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
            disabled
          />
        ) : (
          <div ref={containerRef} className="gmp-autocomplete-container" />
        )}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
          <MapPin className="w-5 h-5" />
        </div>
      </div>
      <p className="text-xs text-gray-500 mt-1">
        We&apos;ll auto-fill your address details
      </p>

      <style jsx global>{`
        .gmp-autocomplete-container {
          position: relative;
        }
        
        .gmp-autocomplete-container gmp-place-autocomplete {
          width: 100%;
          height: 48px;
        }
        
        .gmp-autocomplete-container input {
          width: 100%;
          padding: 12px 16px 12px 48px !important;
          border: 1px solid #d1d5db !important;
          border-radius: 8px !important;
          font-size: 14px !important;
        }
        
        .gmp-autocomplete-container input:focus {
          outline: none !important;
          border-color: #1C294E !important;
          ring: 2px solid rgba(28, 41, 78, 0.2) !important;
        }
      `}</style>
    </div>
  )
}