import { createClient } from '@supabase/supabase-js'
import type { Profile } from '@/types/profile'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? ''

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'id' | 'created_at' | 'approved_at' | 'approved_by' | 'profile_id'> & {
          id?: string
          profile_id?: number | null
          created_at?: string
          approved_at?: string | null
          approved_by?: string | null
        }
        Update: Partial<Profile>
      }
    }
  }
}

