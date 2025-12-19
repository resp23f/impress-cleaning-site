// Type declarations for new Google Maps Places API
// These extend the existing @types/google.maps with the new Place and AutocompleteSuggestion APIs

declare global {
  namespace google.maps.places {
    // New AutocompleteSuggestion API
    interface AutocompleteSuggestionRequest {
      input: string
      includedPrimaryTypes?: string[]
      includedRegionCodes?: string[]
      sessionToken?: AutocompleteSessionToken
      origin?: google.maps.LatLng | google.maps.LatLngLiteral
      locationBias?: google.maps.LatLng | google.maps.LatLngLiteral | google.maps.LatLngBounds
      locationRestriction?: google.maps.LatLngBounds
    }

    interface AutocompleteSuggestionResponse {
      suggestions: PlacePredictionSuggestion[]
    }

    interface PlacePredictionSuggestion {
      placePrediction?: PlacePrediction
    }

    interface PlacePrediction {
      placeId: string
      text: FormattableText
      mainText?: FormattableText
      secondaryText?: FormattableText
      types?: string[]
      distanceMeters?: number
    }

    interface FormattableText {
      text: string
      matches?: StringRange[]
    }

    interface StringRange {
      startOffset: number
      endOffset: number
    }

    // Static method on AutocompleteSuggestion class
    class AutocompleteSuggestion {
      static fetchAutocompleteSuggestions(
        request: AutocompleteSuggestionRequest
      ): Promise<AutocompleteSuggestionResponse>
    }

    // New Place class
    interface PlaceOptions {
      id: string
      requestedLanguage?: string
    }

    interface FetchFieldsRequest {
      fields: string[]
    }

    interface AddressComponent {
      longText: string
      shortText: string
      types: string[]
    }

    class Place {
      constructor(options: PlaceOptions)
      
      id: string
      formattedAddress?: string
      addressComponents?: AddressComponent[]
      displayName?: string
      
      fetchFields(request: FetchFieldsRequest): Promise<void>
    }
  }
}

export {}
