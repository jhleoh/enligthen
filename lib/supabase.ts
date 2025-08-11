import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey)

// Client component client for auth
export const createClient = () => createClientComponentClient<Database>()

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      epiphanies: {
        Row: {
          id: string
          title: string
          content: string
          author_id: string
          author_name: string
          author_avatar: string | null
          created_at: string
          updated_at: string
          likes_count: number
          tags: string[]
        }
        Insert: {
          id?: string
          title: string
          content: string
          author_id: string
          author_name: string
          author_avatar?: string | null
          created_at?: string
          updated_at?: string
          likes_count?: number
          tags?: string[]
        }
        Update: {
          id?: string
          title?: string
          content?: string
          author_id?: string
          author_name?: string
          author_avatar?: string | null
          created_at?: string
          updated_at?: string
          likes_count?: number
          tags?: string[]
        }
      }
      likes: {
        Row: {
          id: string
          epiphany_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          epiphany_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          epiphany_id?: string
          user_id?: string
          created_at?: string
        }
      }
    }
  }
}
