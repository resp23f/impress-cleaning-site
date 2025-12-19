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
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const sessionTokenRef = useRef<google.maps.places.AutocompleteSessionToken | null>(null)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  // Load Google Maps script
  useEffect(() => {
    let mounted = true
    let pollInterval: NodeJS.Timeout | null = null

    const initializeToken = () => {
      if (window.google?.maps?.places?.AutocompleteSessionToken) {
        sessionTokenRef.current = new window.google.maps.places.AutocompleteSessionToken()
        return true
      }
      return false
    }

    const checkReady = () => {
      if (!mounted) return
      
      // Check if new Places API is available
      if (window.google?.maps?.places?.AutocompleteSuggestion) {
        initializeToken()
        setIsLoading(false)
        setError(null)
        if (pollInterval) clearInterval(pollInterval)
      }
    }

    const loadScript = () => {
      // Already loaded
      if (window.google?.maps?.places?.AutocompleteSuggestion) {
        initializeToken()
        setIsLoading(false)
        return
      }

      // Check for existing script
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]')
      
      if (existingScript) {
        pollInterval = setInterval(checkReady, 100)
        setTimeout(() => {
          if (pollInterval) clearInterval(pollInterval)
          if (mounted && isLoading) {
            setError('Google Places API failed to load')
            setIsLoading(false)
          }
        }, 10000)
        return
      }

      // Load fresh
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY}&libraries=places&v=weekly&loading=async`
      script.async = true
      script.defer = true

      script.onload = () => {
        pollInterval = setInterval(checkReady, 100)
        setTimeout(() => {
          if (pollInterval) clearInterval(pollInterval)
          if (mounted && isLoading) {
            setError('Google Places API failed to initialize')
            setIsLoading(false)
          }
        }, 10000)
      }

      script.onerror = () => {
        if (mounted) {
          setError('Failed to load Google Maps script')
          setIsLoading(false)
        }
      }

      document.head.appendChild(script)
    }

    loadScript()

    return () => {
      mounted = false
      if (pollInterval) clearInterval(pollInterval)
    }
  }, [isLoading])

  // Handle click outside
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

  // Cleanup debounce
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [])

  // Fetch suggestions using NEW Places API only
  const fetchSuggestions = useCallback(async (input: string) => {
    if (input.length < 3) {
      setSuggestions([])
      setShowDropdown(false)
      return
    }

    if (!window.google?.maps?.places?.AutocompleteSuggestion?.fetchAutocompleteSuggestions) {
      setError('Places API not available')
      return
    }

    setIsFetching(true)
    setError(null)

    try {
      const request = {
        input,
        includedPrimaryTypes: ['street_address', 'subpremise', 'premise'],
        includedRegionCodes: ['us'],
        sessionToken: sessionTokenRef.current || undefined,
      }

      const { suggestions: results } = await window.google.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions(request)

      if (results && results.length > 0) {
        const formattedSuggestions: Suggestion[] = results
          .filter((s: any) => s.placePrediction)
          .map((s: any) => ({
            placeId: s.placePrediction.placeId,
            description: s.placePrediction.text.text,
            mainText: s.placePrediction.mainText?.text || s.placePrediction.text.text,
            secondaryText: s.placePrediction.secondaryText?.text || ''
          }))

        setSuggestions(formattedSuggestions)
        setShowDropdown(formattedSuggestions.length > 0)
      } else {
        setSuggestions([])
        setShowDropdown(false)
      }
    } catch (err: any) {
      // Show user-friendly error instead of console spam
      setError('Address lookup failed. Please try again.')
      setSuggestions([])
      setShowDropdown(false)
    } finally {
      setIsFetching(false)
    }
  }, [])

  // Handle place selection using NEW Places API only
  const handleSelectPlace = async (suggestion: Suggestion) => {
    if (!window.google?.maps?.places?.Place) {
      setError('Places API not available')
      return
    }

    setIsFetching(true)
    setShowDropdown(false)
    setError(null)

    try {
      const place = new window.google.maps.places.Place({
        id: suggestion.placeId,
      })

      await place.fetchFields({
        fields: ['addressComponents', 'formattedAddress', 'id'],
      })

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

        // Fallback for city from county
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

      // Update input
      setInputValue(place.formattedAddress || suggestion.description)

      // Reset session token
      if (window.google.maps.places.AutocompleteSessionToken) {
        sessionTokenRef.current = new window.google.maps.places.AutocompleteSessionToken()
      }

      onSelect(addressData)

    } catch (err: any) {
      // Show user-friendly error instead of console spam
      setError('Failed to get address details')
      
      // Still set the input value
      setInputValue(suggestion.description)
    } finally {
      setIsFetching(false)
      setHighlightedIndex(-1)
    }
  }

  // Input handler with debounce
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)
    setHighlightedIndex(-1)
    setError(null)

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
        setHighlightedIndex(prev => prev < suggestions.length - 1 ? prev + 1 : 0)
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : suggestions.length - 1)
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
            if (suggestions.length > 0) setShowDropdown(true)
          }}
          placeholder={isLoading ? "Loading..." : "Start typing your address..."}
          className={`w-full pl-12 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-[#1C294E] focus:border-transparent ${
            error ? 'border-red-300' : 'border-gray-300'
          }`}
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
      
      {error ? (
        <p className="text-xs text-red-500 mt-1">{error}</p>
      ) : (
        <p className="text-xs text-gray-500 mt-1">
          We&apos;ll auto-fill your address details
        </p>
      )}

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
                index === highlightedIndex ? 'bg-gray-100' : 'hover:bg-gray-50'
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
