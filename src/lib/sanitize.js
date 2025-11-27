// XSS Protection Utilities
// Use these when displaying user-generated content

/**
 * Sanitize text input by removing dangerous characters
 * Use for: names, addresses, notes, descriptions
 */
export function sanitizeText(input) {
  if (!input) return ''
  
  return String(input)
    .replace(/[<>]/g, '') // Remove angle brackets (prevents HTML injection)
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers (onclick=, onload=, etc.)
    .trim()
}

/**
 * Sanitize email addresses
 */
export function sanitizeEmail(email) {
  if (!email) return ''
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const sanitized = String(email).trim().toLowerCase()
  
  return emailRegex.test(sanitized) ? sanitized : ''
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
  
  // Must start with http:// or https://
  if (!/^https?:\/\//i.test(sanitized)) {
    return ''
  }
  
  // Block javascript: and data: protocols
  if (/^(javascript|data):/i.test(sanitized)) {
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