'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { MapPin, Loader2 } from 'lucide-react'

interface AddressData {
  street_address: string
  city: string
  state: string
  zip_code: string
  place_id: string
  formatted_address: string
  unit?: string
}

interface Suggestion {
  placeId: string
  description: string
  mainText: string
  secondaryText: string
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
  const [isFetching, setIsFetching] = useState(false)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const [useNewApi, setUseNewApi] = useState(true)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const autocompleteServiceRef = useRef<google.maps.places.AutocompleteService | null>(null)
  const placesServiceRef = useRef<google.maps.places.PlacesService | null>(null)
  const sessionTokenRef = useRef<google.maps.places.AutocompleteSessionToken | null>(null)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize Google Maps
  useEffect(() => {
    const loadScript = () => {
      if (window.google?.maps?.places) {
        setIsLoading(false)
        initializeServices()
        return
      }

      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]')
      if (existingScript) {
        // Script tag exists - check if already loaded
        if (window.google?.maps?.places) {
          setIsLoading(false)
          initializeServices()
        } else {
          // Still loading, wait for it
          existingScript.addEventListener('load', () => {
            setIsLoading(false)
            initializeServices()
          })
        }
        return
      }

      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY}&libraries=places&v=weekly&loading=async`
      script.async = true
      script.defer = true

      script.onload = () => {
        setIsLoading(false)
        initializeServices()
      }

      script.onerror = (e) => {
        console.error('Google Maps script failed to load:', e)
        setIsLoading(false)
      }

      document.head.appendChild(script)
    }

    const initializeServices = () => {
      if (window.google?.maps?.places) {
        // Initialize legacy services as fallback
        autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService()
        placesServiceRef.current = new window.google.maps.places.PlacesService(
          document.createElement('div')
        )
        sessionTokenRef.current = new window.google.maps.places.AutocompleteSessionToken()
      }
    }

    loadScript()
  }, [])

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
        setHighlightedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [])

  // Fetch suggestions using NEW API
  const fetchSuggestionsNew = async (input: string): Promise<boolean> => {
    try {
      if (!window.google?.maps?.places?.AutocompleteSuggestion?.fetchAutocompleteSuggestions) {
        return false
      }

      const request = {
        input,
        includedPrimaryTypes: ['street_address', 'subpremise', 'premise'],
        includedRegionCodes: ['us'],
        sessionToken: sessionTokenRef.current || undefined,
      }

      const { suggestions: results } = await window.google.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions(request)

      if (results && results.length > 0) {
        const formattedSuggestions: Suggestion[] = results
          .filter((suggestion: any) => suggestion.placePrediction)
          .map((suggestion: any) => ({
            placeId: suggestion.placePrediction.placeId,
            description: suggestion.placePrediction.text.text,
            mainText: suggestion.placePrediction.mainText?.text || suggestion.placePrediction.text.text,
            secondaryText: suggestion.placePrediction.secondaryText?.text || ''
          }))

        setSuggestions(formattedSuggestions)
        setShowDropdown(formattedSuggestions.length > 0)
        return true
      }
      return false
    } catch (error) {
      console.error('New Places API error, falling back to legacy:', error)
      return false
    }
  }

  // Fetch suggestions using LEGACY API (fallback)
  const fetchSuggestionsLegacy = (input: string): void => {
    if (!autocompleteServiceRef.current) {
      console.error('Legacy AutocompleteService not initialized')
      setIsFetching(false)
      return
    }

    autocompleteServiceRef.current.getPlacePredictions(
      {
        input,
        types: ['address'],
        componentRestrictions: { country: 'us' },
        sessionToken: sessionTokenRef.current || undefined,
      },
      (predictions, status) => {
        setIsFetching(false)

        if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
          const formattedSuggestions: Suggestion[] = predictions.map((prediction) => ({
            placeId: prediction.place_id,
            description: prediction.description,
            mainText: prediction.structured_formatting?.main_text || prediction.description,
            secondaryText: prediction.structured_formatting?.secondary_text || ''
          }))

          setSuggestions(formattedSuggestions)
          setShowDropdown(formattedSuggestions.length > 0)
        } else {
          setSuggestions([])
          setShowDropdown(false)
        }
      }
    )
  }

  // Main fetch function with fallback
  const fetchSuggestions = useCallback(async (input: string) => {
    if (!window.google?.maps?.places || input.length < 3) {
      setSuggestions([])
      setShowDropdown(false)
      return
    }

    setIsFetching(true)

    // Try new API first if enabled
    if (useNewApi) {
      const success = await fetchSuggestionsNew(input)
      if (success) {
        setIsFetching(false)
        return
      }
      // If new API failed, switch to legacy permanently for this session
      setUseNewApi(false)
    }

    // Use legacy API
    fetchSuggestionsLegacy(input)
  }, [useNewApi])

  // Process address components from NEW Place API
  const processAddressComponentsNew = (place: any): AddressData => {
    const addressData: AddressData = {
      street_address: '',
      city: '',
      state: '',
      zip_code: '',
      place_id: sanitizeInput(place.id),
      formatted_address: sanitizeInput(place.formattedAddress),
    }

    let streetNumber = ''
    let route = ''

    if (place.addressComponents) {
      for (const component of place.addressComponents) {
        const types = component.types || []

        if (types.includes('street_number')) {
          streetNumber = sanitizeInput(component.longText)
        }
        if (types.includes('route')) {
          route = sanitizeInput(component.longText)
        }
        if (!addressData.city && (
          types.includes('locality') ||
          types.includes('sublocality_level_1') ||
          types.includes('neighborhood')
        )) {
          addressData.city = sanitizeInput(component.longText)
        }
        if (types.includes('administrative_area_level_1')) {
          addressData.state = sanitizeInput(component.shortText)
        }
        if (types.includes('postal_code')) {
          addressData.zip_code = sanitizeInput(component.longText)
        }
      }

      if (!addressData.city) {
        const countyComponent = place.addressComponents.find((c: any) =>
          c.types?.includes('administrative_area_level_2')
        )
        if (countyComponent) {
          addressData.city = sanitizeInput(countyComponent.longText)
        }
      }
    }

    addressData.street_address = sanitizeInput(`${streetNumber} ${route}`, false)
    return addressData
  }

  // Process address components from LEGACY PlacesService
  const processAddressComponentsLegacy = (place: google.maps.places.PlaceResult): AddressData => {
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

    if (place.address_components) {
      for (const component of place.address_components) {
        const types = component.types || []

        if (types.includes('street_number')) {
          streetNumber = sanitizeInput(component.long_name)
        }
        if (types.includes('route')) {
          route = sanitizeInput(component.long_name)
        }
        if (!addressData.city && (
          types.includes('locality') ||
          types.includes('sublocality_level_1') ||
          types.includes('neighborhood')
        )) {
          addressData.city = sanitizeInput(component.long_name)
        }
        if (types.includes('administrative_area_level_1')) {
          addressData.state = sanitizeInput(component.short_name)
        }
        if (types.includes('postal_code')) {
          addressData.zip_code = sanitizeInput(component.long_name)
        }
      }

      if (!addressData.city) {
        const countyComponent = place.address_components.find((c) =>
          c.types?.includes('administrative_area_level_2')
        )
        if (countyComponent) {
          addressData.city = sanitizeInput(countyComponent.long_name)
        }
      }
    }

    addressData.street_address = sanitizeInput(`${streetNumber} ${route}`, false)
    return addressData
  }

  // Handle place selection using NEW API
  const handleSelectPlaceNew = async (suggestion: Suggestion): Promise<boolean> => {
    try {
      if (!window.google?.maps?.places?.Place) {
        return false
      }

      const place = new window.google.maps.places.Place({
        id: suggestion.placeId,
      })

      await place.fetchFields({
        fields: ['addressComponents', 'formattedAddress', 'id'],
      })

      const addressData = processAddressComponentsNew(place)
      const displayValue = place.formattedAddress || suggestion.description
      setInputValue(displayValue)

      if (window.google.maps.places.AutocompleteSessionToken) {
        sessionTokenRef.current = new window.google.maps.places.AutocompleteSessionToken()
      }

      onSelect(addressData)
      return true
    } catch (error) {
      console.error('New Place API getDetails error, falling back to legacy:', error)
      return false
    }
  }

  // Handle place selection using LEGACY API
  const handleSelectPlaceLegacy = (suggestion: Suggestion): void => {
    if (!placesServiceRef.current) {
      console.error('Legacy PlacesService not initialized')
      handleFallbackSelect(suggestion)
      setIsFetching(false)
      return
    }

    placesServiceRef.current.getDetails(
      {
        placeId: suggestion.placeId,
        fields: ['address_components', 'formatted_address', 'place_id'],
        sessionToken: sessionTokenRef.current || undefined,
      },
      (place, status) => {
        setIsFetching(false)
        setHighlightedIndex(-1)

        if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
          const addressData = processAddressComponentsLegacy(place)
          const displayValue = place.formatted_address || suggestion.description
          setInputValue(displayValue)

          if (window.google?.maps?.places?.AutocompleteSessionToken) {
            sessionTokenRef.current = new window.google.maps.places.AutocompleteSessionToken()
          }

          onSelect(addressData)
        } else {
          // Fallback to suggestion data
          handleFallbackSelect(suggestion)
        }
      }
    )
  }

  // Fallback when both APIs fail
  const handleFallbackSelect = (suggestion: Suggestion): void => {
    setInputValue(suggestion.description)

    const basicAddressData: AddressData = {
      street_address: suggestion.mainText,
      city: '',
      state: '',
      zip_code: '',
      place_id: suggestion.placeId,
      formatted_address: suggestion.description,
    }

    if (suggestion.secondaryText) {
      const parts = suggestion.secondaryText.split(', ')
      if (parts.length >= 2) {
        basicAddressData.city = sanitizeInput(parts[0])
        const stateMatch = parts[1].match(/^([A-Z]{2})\b/)
        if (stateMatch) {
          basicAddressData.state = stateMatch[1]
        }
      }
    }

    onSelect(basicAddressData)
  }

  // Main select handler with fallback
  const handleSelectPlace = async (suggestion: Suggestion) => {
    if (!window.google?.maps?.places) return

    setIsFetching(true)
    setShowDropdown(false)

    // Try new API first if enabled
    if (useNewApi) {
      const success = await handleSelectPlaceNew(suggestion)
      if (success) {
        setIsFetching(false)
        setHighlightedIndex(-1)
        return
      }
      setUseNewApi(false)
    }

    // Use legacy API
    handleSelectPlaceLegacy(suggestion)
  }

  // Debounced input handler
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)
    setHighlightedIndex(-1)

    if (onInputChange) {
      onInputChange(value)
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(() => {
      fetchSuggestions(value)
    }, 300)
  }

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown || suggestions.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightedIndex(prev =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightedIndex(prev =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        )
        break
      case 'Enter':
        e.preventDefault()
        if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
          handleSelectPlace(suggestions[highlightedIndex])
        }
        break
      case 'Escape':
        setShowDropdown(false)
        setHighlightedIndex(-1)
        break
    }
  }

  return (
    <div className="relative" ref={containerRef}>
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
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowDropdown(true)
            }
          }}
          placeholder={isLoading ? "Loading..." : "Start typing your address..."}
          className="w-full pl-12 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1C294E] focus:border-transparent"
          required
          disabled={isLoading}
          autoComplete="off"
          aria-expanded={showDropdown}
          aria-haspopup="listbox"
          aria-autocomplete="list"
        />
        {isFetching && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
          </div>
        )}
      </div>
      <p className="text-xs text-gray-500 mt-1">
        We&apos;ll auto-fill your address details
      </p>

      {/* Suggestions Dropdown */}
      {showDropdown && suggestions.length > 0 && (
        <ul
          className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto z-50"
          role="listbox"
        >
          {suggestions.map((suggestion, index) => (
            <li
              key={suggestion.placeId}
              role="option"
              aria-selected={index === highlightedIndex}
              className={`px-4 py-3 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors ${
                index === highlightedIndex
                  ? 'bg-gray-100'
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => handleSelectPlace(suggestion)}
              onMouseEnter={() => setHighlightedIndex(index)}
            >
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {suggestion.mainText}
                  </p>
                  {suggestion.secondaryText && (
                    <p className="text-xs text-gray-500 truncate">
                      {suggestion.secondaryText}
                    </p>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
