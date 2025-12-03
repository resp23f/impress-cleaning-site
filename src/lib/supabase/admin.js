import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const missingEnv = []

if (!supabaseUrl) missingEnv.push('NEXT_PUBLIC_SUPABASE_URL')
if (!serviceRoleKey) missingEnv.push('SUPABASE_SERVICE_ROLE_KEY')

if (missingEnv.length > 0) {
  console.error(
    `❌ Supabase admin client missing env vars: ${missingEnv.join(', ')}`
  )
}

if (
  serviceRoleKey &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
  serviceRoleKey === process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
) {
  console.warn(
    '⚠️ SUPABASE_SERVICE_ROLE_KEY matches the anon key. Admin client will not bypass RLS.'
  )
}

// Admin client with service role - bypasses RLS
export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})
