import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

// Only create the client if we have real credentials
const isConfigured = supabaseUrl !== 'https://placeholder.supabase.co' && 
                    supabaseAnonKey !== 'placeholder-key' &&
                    supabaseUrl.includes('supabase.co')

export const supabase = isConfigured ? createClient(supabaseUrl, supabaseAnonKey) : null

export type CageRecord = {
  id: number
  cage_num: number
  cell_side: 'Inner' | 'Outer' | 'Both'
  state: 0 | 1 | 2 // 0 = Not yet, 1 = Walked, 2 = Do not walk
  notes: string | null
  created_at?: string
  updated_at?: string
}
