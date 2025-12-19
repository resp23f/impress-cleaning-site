'use client'
import { useState, useRef, useEffect } from 'react'
import { MapPin } from 'lucide-react'
import Script from 'next/script'

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

// Extend Window to include Google Maps types
declare global {
  interface Window {
    google: typeof google
  }
}

// Custom element type
interface PlaceAutocompleteElement extends HTMLElement {
  value?: string
}

interface PlaceSelectEvent extends CustomEvent {
  detail: {
    place: {
      id: string
      displayName?: string
      formattedAddress?: string
    }
  }
}

// XSS sanitization
function sanitizeInput(input: string | undefined, preserveSpaces = true): string {
  if (!input) return ''
  let sanitized = String(input).replace(/[<>]/g, '')
  return preserveSpaces ? sanitized : sanitized.trim()
}

export default function AddressAutocomplete({
  onSelect,
  onInputChange,
  defaultValue = ''
}: AddressAutocompleteProps) {
  const [inputValue, setInputValue] = useState(defaultValue)
  const [mapsLoaded, setMapsLoaded] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const autocompleteRef = useRef<PlaceAutocompleteElement | null>(null)
  const placesServiceRef = useRef<google.maps.places.PlacesService | null>(null)

  useEffect(() => {
    if (!mapsLoaded || typeof window === 'undefined' || !window.google?.maps?.places) return

    // Create the PlaceAutocompleteElement
    const autocomplete = document.createElement('gmp-place-autocomplete') as PlaceAutocompleteElement
    autocomplete.setAttribute('placeholder', 'Start typing your address...')
    autocomplete.setAttribute('type', 'address')
    autocomplete.setAttribute('country', 'us')

    autocomplete.style.width = '100%'
    autocomplete.style.height = '48px'

    if (containerRef.current) {
      containerRef.current.innerHTML = ''
      containerRef.current.appendChild(autocomplete)
    }

    autocompleteRef.current = autocomplete

    // Initialize Places Service
    placesServiceRef.current = new window.google.maps.places.PlacesService(
      document.createElement('div')
    )

    if (defaultValue) {
      autocomplete.value = defaultValue
      setInputValue(defaultValue)
    }

    // Check if place has required components
    const hasRequiredComponents = (place: google.maps.places.PlaceResult): boolean => {
      if (!place?.address_components?.length) return false
      const types = place.address_components.flatMap(c => c.types)
      const hasStreet = types.includes('street_number') || types.includes('route')
      const hasCity = types.includes('locality') || types.includes('sublocality_level_1') ||
        types.includes('neighborhood') || types.includes('administrative_area_level_2')
      const hasState = types.includes('administrative_area_level_1')
      const hasZip = types.includes('postal_code')
      return hasStreet && hasCity && hasState && hasZip
    }

    // Extract address data
    const extractAddressData = (place: google.maps.places.PlaceResult): AddressData => {
      const addressData: AddressData = {
        street_address: '',
        city: '',
        state: '',
        zip_code: '',
        place_id: sanitizeInput(place.place_id),
        formatted_address: sanitizeInput(place.formatted_address),
      }

      let streetNumber = ''
      let route = ''

      place.address_components?.forEach((component) => {
        const types = component.types

        if (types.includes('street_number')) {
          streetNumber = sanitizeInput(component.long_name)
        }
        if (types.includes('route')) {
          route = sanitizeInput(component.long_name)
        }
        if (!addressData.city && (types.includes('locality') ||
          types.includes('sublocality_level_1') ||
          types.includes('neighborhood'))) {
          addressData.city = sanitizeInput(component.long_name)
        }
        if (types.includes('administrative_area_level_1')) {
          addressData.state = sanitizeInput(component.short_name)
        }
        if (types.includes('postal_code')) {
          addressData.zip_code = sanitizeInput(component.long_name)
        }
      })

      // County fallback
      if (!addressData.city && place.address_components) {
        const countyComponent = place.address_components.find(c =>
          c.types.includes('administrative_area_level_2'))
        if (countyComponent) {
          addressData.city = sanitizeInput(countyComponent.long_name)
        }
      }

      addressData.street_address = sanitizeInput(`${streetNumber} ${route}`, false)
      return addressData
    }

    // Handle place selection
    const handlePlaceSelect = (event: Event) => {
      const placeEvent = event as PlaceSelectEvent
      const place = placeEvent.detail?.place

      if (!place?.id || !placesServiceRef.current) return

      placesServiceRef.current.getDetails(
        {
          placeId: place.id,
          fields: ['address_components', 'formatted_address', 'place_id', 'geometry']
        },
        (fullPlace, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && fullPlace) {
            if (hasRequiredComponents(fullPlace)) {
              const addressData = extractAddressData(fullPlace)
              setInputValue(addressData.formatted_address || '')
              onSelect(addressData)
            } else {
              // Retry logic with exponential backoff
              let retryCount = 0
              const maxRetries = 6
              const delays = [50, 100, 150, 250, 400, 600]

              const attemptRetry = () => {
                if (!placesServiceRef.current) return

                placesServiceRef.current.getDetails(
                  {
                    placeId: place.id,
                    fields: ['address_components', 'formatted_address', 'place_id', 'geometry']
                  },
                  (retryPlace, retryStatus) => {
                    if (retryStatus === window.google.maps.places.PlacesServiceStatus.OK &&
                      retryPlace && hasRequiredComponents(retryPlace)) {
                      const addressData = extractAddressData(retryPlace)
                      setInputValue(addressData.formatted_address || '')
                      onSelect(addressData)
                    } else {
                      retryCount++
                      if (retryCount < maxRetries) {
                        setTimeout(attemptRetry, delays[retryCount])
                      } else if (retryPlace?.address_components?.length) {
                        const addressData = extractAddressData(retryPlace)
                        setInputValue(addressData.formatted_address || '')
                        onSelect(addressData)
                      }
                    }
                  }
                )
              }

              setTimeout(attemptRetry, delays[0])
            }
          }
        }
      )
    }

    // Handle input changes
    const handleInput = (e: Event) => {
      const target = e.target as HTMLInputElement
      const value = target.value || ''
      setInputValue(value)
      if (onInputChange) {
        onInputChange(value)
      }
    }

    autocomplete.addEventListener('gmp-placeselect', handlePlaceSelect)
    autocomplete.addEventListener('input', handleInput)

    // Cleanup
    return () => {
      if (autocomplete) {
        autocomplete.removeEventListener('gmp-placeselect', handlePlaceSelect)
        autocomplete.removeEventListener('input', handleInput)
      }
    }
  }, [mapsLoaded, onSelect, onInputChange, defaultValue])

  return (
    <>
      {/* Load Google Maps API */}
      <Script
        id="google-maps-api"
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places,marker&v=beta&loading=async`}
        strategy="afterInteractive"
        onLoad={() => setMapsLoaded(true)}
      />

      <div className="relative">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Service Address *
        </label>
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10">
            <MapPin className="w-5 h-5" />
          </div>
          {mapsLoaded ? (
            <div
              ref={containerRef}
              className="address-autocomplete-container"
            />
          ) : (
            <input
              type="text"
              placeholder="Loading address search..."
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
              disabled
            />
          )}
        </div>
        <p className="text-xs text-gray-500 mt-1">
          We&apos;ll auto-fill your address details
        </p>

        <style jsx global>{`
          .address-autocomplete-container {
            position: relative;
          }
          
          .address-autocomplete-container gmp-place-autocomplete {
            --gmpx-color-surface: white;
            --gmpx-color-on-surface: #374151;
            --gmpx-color-on-surface-variant: #6b7280;
            --gmpx-color-primary: #1C294E;
            --gmpx-color-outline: #d1d5db;
            --gmpx-font-family: inherit;
            --gmpx-font-size-base: 14px;
            --gmpx-border-radius: 8px;
          }
          
          .address-autocomplete-container gmp-place-autocomplete::part(input) {
            padding-left: 48px !important;
            padding-right: 16px !important;
            padding-top: 12px !important;
            padding-bottom: 12px !important;
            border: 1px solid #d1d5db !important;
            border-radius: 8px !important;
            font-size: 14px !important;
          }
          
          .address-autocomplete-container gmp-place-autocomplete::part(input):focus {
            outline: none !important;
            border-color: transparent !important;
            box-shadow: 0 0 0 2px #1C294E !important;
          }
          
          .address-autocomplete-container gmp-place-autocomplete::part(input):hover {
            border-color: #9ca3af !important;
          }
          
          .address-autocomplete-container gmp-place-autocomplete::part(overlay) {
            margin-top: 8px !important;
            border-radius: 8px !important;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
          }
        `}</style>
      </div>
    </>
  )
}