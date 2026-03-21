import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || 'dummykey'

// We use service role to bypass RLS and see all shops across the platform
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
})
