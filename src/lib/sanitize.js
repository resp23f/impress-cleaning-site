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

// Export all as a single object for easy importing
export default {
  sanitizeText,
  sanitizeEmail,
  sanitizePhone,
  sanitizeUrl,
  escapeHtml,
  sanitizeMoney,
  sanitizeReference,
}