import { create } from 'zustand'
import { supabase } from '../lib/supabase'

const useAuthStore = create((set, get) => {
  // Bootstrap: read session from Supabase storage on store creation
  supabase.auth.getSession().then(async ({ data: { session } }) => {
    if (session?.user) {
      set({ user: session.user })
      await get().fetchProfile(session.user.id)
    }
    set({ loading: false })
  })

  // Keep session in sync across all auth events.
  // IMPORTANT: callback must be synchronous — Supabase awaits it before returning
  // from signUp/signIn, so any awaited async work here blocks those callers.
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' && session?.user) {
      set({ user: session.user, loading: false })
      if (!get().profile) {
        get().fetchProfile(session.user.id) // fire-and-forget
      }
    } else if (event === 'SIGNED_OUT') {
      set({ user: null, profile: null, loading: false })
    } else if (event === 'TOKEN_REFRESHED' && session?.user) {
      set({ user: session.user })
    } else {
      set({ loading: false })
    }
  })

  return {
    user: null,
    profile: null,
    loading: true,
    error: null,

    fetchProfile: async (userId) => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single()
        if (error) throw error
        set({ profile: data })
      } catch (err) {
        set({ error: err.message })
      }
    },

    signIn: async (email, password) => {
      set({ loading: true, error: null })
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        set({ user: data.user })
        await get().fetchProfile(data.user.id)
        set({ loading: false })
        return { success: true }
      } catch (err) {
        set({ error: err.message, loading: false })
        return { success: false }
      }
    },

    signUp: async (email, password, role, displayName) => {
      set({ loading: true, error: null })
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              role,
              display_name: displayName,
            },
          },
        })
        if (error) throw error

        // Poll until the session cookie is written (max 3 × 500 ms = 1.5 s)
        let session = null
        for (let attempt = 0; attempt < 3; attempt++) {
          const { data: sessionData } = await supabase.auth.getSession()
          if (sessionData?.session) {
            session = sessionData.session
            break
          }
          if (attempt < 2) {
            await new Promise((resolve) => setTimeout(resolve, 500))
          }
        }

        if (session?.user) {
          set({ user: session.user })
          await get().fetchProfile(session.user.id)
        } else {
          // Email confirmation required — session won't exist yet
          set({ user: data.user })
        }

        set({ loading: false })
        return { success: true }
      } catch (err) {
        set({ error: err.message, loading: false })
        return { success: false }
      }
    },

    signOut: async () => {
      set({ loading: true })
      try {
        const { error } = await supabase.auth.signOut()
        if (error) throw error
        set({ user: null, profile: null, loading: false, error: null })
      } catch (err) {
        set({ error: err.message, loading: false })
      }
    },

    clearError: () => set({ error: null }),
  }
})

export default useAuthStore
