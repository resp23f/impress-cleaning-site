// XSS Protection Utilities
// Use these when displaying user-generated content
/**
 * Sanitize text input by removing dangerous characters
 * Use for: names, addresses, notes, descriptions
 */
export function sanitizeText(input) {
  if (!input) return ''
  
  let result = String(input)
  
  // Loop until no more dangerous patterns (handles nested cases like <<script>>)
  let previous = ''
  while (previous !== result) {
    previous = result
    result = result
      .replace(/[<>]/g, '') // Remove angle brackets
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/data:/gi, '') // Remove data: protocol
      .replace(/vbscript:/gi, '') // Remove vbscript: protocol
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
  }
  
  return result.trim()
}

/**
 * Sanitize email addresses
 * Includes length check to prevent ReDoS attacks
 */
export function sanitizeEmail(email) {
  if (!email) return ''
  
  const sanitized = String(email).trim().toLowerCase()
  
  // RFC 5321: Max email length is 254 characters
  // Length check prevents ReDoS attacks on malicious input
  if (sanitized.length > 254) return ''
  
  // Simple email validation (no backtracking vulnerability)
  const atIndex = sanitized.indexOf('@')
  const lastDotIndex = sanitized.lastIndexOf('.')
  
  // Must have @ and . in correct positions
  if (atIndex < 1 || lastDotIndex < atIndex + 2 || lastDotIndex >= sanitized.length - 1) {
    return ''
  }
  
  // No spaces allowed
  if (sanitized.includes(' ')) return ''
  
  return sanitized
}

/**
 * Sanitize phone numbers (keep only digits, spaces, hyphens, parentheses)
 */
export function sanitizePhone(phone) {
  if (!phone) return ''
  
  return String(phone)
    .replace(/[^\d\s\-()]/g, '')
    .trim()
}

/**
 * Sanitize URLs (ensure they start with http:// or https://)
 */
export function sanitizeUrl(url) {
  if (!url) return ''
  
  const sanitized = String(url).trim()
  
  // Must start with http:// or https:// (case insensitive, strict check)
  if (!/^https?:\/\//i.test(sanitized)) {
    return ''
  }
  
  // Block dangerous protocols anywhere in the URL
  const dangerous = /(?:javascript|data|vbscript|file|about|blob):/i
  if (dangerous.test(sanitized)) {
    return ''
  }
  
  // Block encoded versions
  try {
    const decoded = decodeURIComponent(sanitized).toLowerCase()
    if (dangerous.test(decoded)) {
      return ''
    }
  } catch (e) {
    // If decoding fails, reject the URL
    return ''
  }
  
  return sanitized
}
/**
 * Escape HTML entities for safe display
 * Use when you MUST display user content that might contain HTML
 */
export function escapeHtml(text) {
  if (!text) return ''
  
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  }
  
  return String(text).replace(/[&<>"'/]/g, (char) => map[char])
}

/**
 * Sanitize money amounts (keep only numbers and decimal point)
 */
export function sanitizeMoney(amount) {
  if (!amount) return '0.00'
  
  const sanitized = String(amount).replace(/[^\d.]/g, '')
  const parsed = parseFloat(sanitized)
  
  return isNaN(parsed) ? '0.00' : parsed.toFixed(2)
}

/**
 * Sanitize invoice/reference numbers (alphanumeric + dashes only)
 */
export function sanitizeReference(ref) {
  if (!ref) return ''
  
  return String(ref)
    .replace(/[^a-zA-Z0-9\-]/g, '')
    .toUpperCase()
    .trim()
}

/**
 * Validate a name (first or last)
 * Rules: 2+ characters, letters/hyphens/apostrophes/spaces only
 * Returns { valid: boolean, error?: string }
 */
export function validateName(name, fieldLabel = 'Name') {
  if (!name || typeof name !== 'string') {
    return { valid: false, error: `${fieldLabel} is required` }
  }
  
  const trimmed = name.trim()
  
  if (trimmed.length < 2) {
    return { valid: false, error: `${fieldLabel} must be at least 2 characters` }
  }
  
  if (trimmed.length > 50) {
    return { valid: false, error: `${fieldLabel} must be less than 50 characters` }
  }
  
  // Allow letters (including accented), hyphens, apostrophes, spaces
  // This handles names like: Mary-Ann, O'Brien, José, Müller
  const validPattern = /^[a-zA-ZÀ-ÿ][a-zA-ZÀ-ÿ'\-\s]*$/
  if (!validPattern.test(trimmed)) {
    return { valid: false, error: `${fieldLabel} can only contain letters, hyphens, and apostrophes` }
  }
  
  return { valid: true }
}

/**
 * Validate phone number
 * Rules: Must be 10 digits, cannot be obviously fake
 * Returns { valid: boolean, error?: string }
 */
export function validatePhone(phone) {
  if (!phone || typeof phone !== 'string') {
    return { valid: false, error: 'Phone number is required' }
  }
  
  // Extract just the digits
  const digits = phone.replace(/\D/g, '')
  
  if (digits.length !== 10) {
    return { valid: false, error: 'Please enter a valid 10-digit phone number' }
  }
  
  // Block fake patterns
  const fakePatterns = [
    /^555/, // 555 prefix (reserved for fiction)
    /^(\d)\1{9}$/, // All same digit: 0000000000, 1111111111, etc.
    /^0123456789$/, // Sequential ascending
    /^9876543210$/, // Sequential descending
    /^1234567890$/, // Common fake
    /^0987654321$/, // Common fake
    /^(\d{3})\1\1/, // Repeating groups: 123123123x
  ]
  
  for (const pattern of fakePatterns) {
    if (pattern.test(digits)) {
      return { valid: false, error: 'Please enter a valid phone number' }
    }
  }
  
  // Check for obviously fake area codes
  const areaCode = digits.substring(0, 3)
  const invalidAreaCodes = ['000', '111', '555', '999', '123']
  if (invalidAreaCodes.includes(areaCode)) {
    return { valid: false, error: 'Please enter a valid phone number' }
  }
  
  return { valid: true }
}

// Export all as a single object for easy importing
export default {
  sanitizeText,
  sanitizeEmail,
  sanitizePhone,
  sanitizeUrl,
  escapeHtml,
  sanitizeMoney,
  sanitizeReference,
  validateName,
  validatePhone,
}