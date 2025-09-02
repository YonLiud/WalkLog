import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Check if environment variables are configured
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables:', {
    url: !!supabaseUrl,
    key: !!supabaseAnonKey,
    nodeEnv: process.env.NODE_ENV
  })
}

// Helper to check if a string is a valid URL
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Only create the client if we have real credentials
const isConfigured = Boolean(
  supabaseUrl &&
  isValidUrl(supabaseUrl) &&
  typeof supabaseAnonKey === 'string' &&
  supabaseAnonKey.trim().length > 0
);

export const supabase = isConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null

// Export a helper function to check configuration status
export const isSupabaseConfigured = () => isConfigured

export type CageRecord = {
  id: number
  cage_num: number
  cell_side: 'Inner' | 'Outer' | 'Both'
  state: 0 | 1 | 2 // 0 = Not yet, 1 = Walked, 2 = Do not walk
  notes: string | null
  created_at?: string
  updated_at?: string
}
