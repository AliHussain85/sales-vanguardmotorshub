import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://abwgpqzrewjsjpxlkoml.supabase.co'
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFid2dwcXpyZXdqc2pweGxrb21sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM4NjIyMDAsImV4cCI6MjA5OTQzODIwMH0.UcTDKzEujfqrzW1mhQyvdZqQdFg6DeFPDKCc9_cuCU4'

/** Login / session management */
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

/**
 * Data reads always use the anon key (same as the original HTML/PHP tools).
 * The auth client attaches the logged-in JWT, which can be blocked by RLS.
 */
export const supabaseData = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storageKey: 'vanguard-motors-data',
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
})
