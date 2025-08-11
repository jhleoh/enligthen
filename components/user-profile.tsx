'use client'

import { useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { createClient } from '@/lib/supabase'
import { Database } from '@/lib/supabase'

type Profile = Database['public']['Tables']['profiles']['Row']

export function UserProfile() {
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      createOrUpdateProfile()
    }
  }, [user])

  const createOrUpdateProfile = async () => {
    if (!user) return

    try {
      // Use the authenticated client for RLS to work properly
      const supabase = createClient()
      
      // Check if profile exists - use maybeSingle() to handle no rows gracefully
      const { data: existingProfile, error: selectError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()

      if (selectError) {
        console.error('Error checking profile:', selectError)
        return
      }

      if (!existingProfile) {
        // Create new profile
        const { error } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email!,
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Anonymous',
            avatar_url: user.user_metadata?.avatar_url || null,
          })

        if (error) {
          console.error('Error creating profile:', error)
        }
      } else {
        // Update existing profile if needed
        const { error } = await supabase
          .from('profiles')
          .update({
            email: user.email!,
            full_name: user.user_metadata?.full_name || existingProfile.full_name,
            avatar_url: user.user_metadata?.avatar_url || existingProfile.avatar_url,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id)

        if (error) {
          console.error('Error updating profile:', error)
        }
      }
    } catch (error) {
      console.error('Error handling profile:', error)
    }
  }

  return null // This component doesn't render anything
}
