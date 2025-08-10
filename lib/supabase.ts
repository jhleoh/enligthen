import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      epiphanies: {
        Row: {
          id: string
          title: string
          content: string
          author_id: string
          author_name: string
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
