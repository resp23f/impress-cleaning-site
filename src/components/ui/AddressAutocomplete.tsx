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
  const [isLoading, setIsLoading] = useState(true)
  const inputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<any>(null)
  const sessionTokenRef = useRef<any>(null)

  useEffect(() => {
    // Load Google Maps script if not loaded
    const loadScript = () => {
      if (window.google?.maps?.places) {
        setIsLoading(false)
        initAutocomplete()
        return
      }

      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places&v=weekly`
      script.async = true
      script.defer = true

      script.onload = () => {
        setIsLoading(false)
        initAutocomplete()
      }

      document.head.appendChild(script)
    }

    const initAutocomplete = () => {
      if (!inputRef.current || !window.google?.maps?.places) return

      // Create session token for billing optimization
      const AutocompleteSessionToken = window.google.maps.places.AutocompleteSessionToken
      sessionTokenRef.current = new AutocompleteSessionToken()

      // Use AutocompleteService + PlacesService for full control
      const autocompleteService = new window.google.maps.places.AutocompleteService()
      const placesService = new window.google.maps.places.PlacesService(
        document.createElement('div')
      )

      // Create predictions container
      const predictionsContainer = document.createElement('div')
      predictionsContainer.className = 'predictions-dropdown'
      predictionsContainer.style.display = 'none'
      inputRef.current.parentElement?.appendChild(predictionsContainer)

      // Handle input changes
      const handleInput = () => {
        const value = inputRef.current?.value || ''

        if (value.length < 3) {
          predictionsContainer.style.display = 'none'
          return
        }

        autocompleteService.getPlacePredictions(
          {
            input: value,
            types: ['address'],
            componentRestrictions: { country: 'us' },
            sessionToken: sessionTokenRef.current
          },
          (predictions, status) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
              predictionsContainer.innerHTML = ''
              predictionsContainer.style.display = 'block'

              predictions.forEach(prediction => {
                const item = document.createElement('div')
                item.className = 'prediction-item'
                item.textContent = prediction.description
                item.onclick = () => {
                  // Get place details
                  placesService.getDetails(
                    {
                      placeId: prediction.place_id,
                      fields: ['address_components', 'formatted_address', 'place_id'],
                      sessionToken: sessionTokenRef.current
                    },
                    (place, status) => {
                      if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
                        processPlace(place)
                        predictionsContainer.style.display = 'none'
                        // Reset session token after selection
                        sessionTokenRef.current = new AutocompleteSessionToken()
                      }
                    }
                  )
                }
                predictionsContainer.appendChild(item)
              })
            }
          }
        )
      }

      const processPlace = (place: any) => {
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

        place.address_components?.forEach((component: any) => {
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

        if (!addressData.city && place.address_components) {
          const countyComponent = place.address_components.find((c: any) =>
            c.types.includes('administrative_area_level_2'))
          if (countyComponent) {
            addressData.city = sanitizeInput(countyComponent.long_name)
          }
        }

        addressData.street_address = sanitizeInput(`${streetNumber} ${route}`, false)
        setInputValue(place.formatted_address || '')
        if (inputRef.current) {
          inputRef.current.value = place.formatted_address || ''
        }
        onSelect(addressData)
      }

      // Add event listeners
      inputRef.current.addEventListener('input', handleInput)

      // Hide predictions on click outside
      document.addEventListener('click', (e) => {
        if (!inputRef.current?.parentElement?.contains(e.target as Node)) {
          predictionsContainer.style.display = 'none'
        }
      })
    }

    loadScript()
  }, [onSelect])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)
    if (onInputChange) {
      onInputChange(value)
    }
  }

  return (
    <div className="relative">
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        Service Address *
      </label>
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10">
          <MapPin className="w-5 h-5" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder={isLoading ? "Loading..." : "Start typing your address..."}
          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1C294E] focus:border-transparent"
          required
          disabled={isLoading}
          autoComplete="off"
        />
      </div>
      <p className="text-xs text-gray-500 mt-1">
        We&apos;ll auto-fill your address details
      </p>

      <style jsx global>{`
        .predictions-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: white;
          border: 1px solid #d1d5db;
          border-top: none;
          border-radius: 0 0 8px 8px;
          max-height: 200px;
          overflow-y: auto;
          z-index: 1000;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        
        .prediction-item {
          padding: 12px 16px;
          cursor: pointer;
          font-size: 14px;
          border-bottom: 1px solid #f3f4f6;
        }
        
        .prediction-item:hover {
          background: #f9fafb;
        }
        
        .prediction-item:last-child {
          border-bottom: none;
        }
      `}</style>
    </div>
  )
}