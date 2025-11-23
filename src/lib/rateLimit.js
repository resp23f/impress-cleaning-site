import { createClient } from '@/lib/supabase/server'

export async function checkRateLimit(identifier, action, maxAttempts = 5, windowMinutes = 15) {
  const supabase = await createClient()
  
  const windowStart = new Date(Date.now() - windowMinutes * 60 * 1000)

  // Check existing rate limit
  const { data: existing } = await supabase
    .from('rate_limits')
    .select('*')
    .eq('ip_address', identifier)
    .eq('action', action)
    .gte('window_start', windowStart.toISOString())
    .single()

  if (existing) {
    if (existing.attempts >= maxAttempts) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: new Date(existing.window_start).getTime() + windowMinutes * 60 * 1000,
      }
    }

    // Increment attempts
    await supabase
      .from('rate_limits')
      .update({ attempts: existing.attempts + 1 })
      .eq('id', existing.id)

    return {
      allowed: true,
      remaining: maxAttempts - existing.attempts - 1,
    }
  }

  // Create new rate limit entry
  await supabase
    .from('rate_limits')
    .insert({
      ip_address: identifier,
      action,
      attempts: 1,
      window_start: new Date().toISOString(),
    })

  return {
    allowed: true,
    remaining: maxAttempts - 1,
  }
}

export function getClientIp(request) {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIp) {
    return realIp
  }
  
  return 'unknown'
}