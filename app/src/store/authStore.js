import { create } from 'zustand'
import { supabase } from '../lib/supabase'

const useAuthStore = create((set, get) => {
  supabase.auth.getSession().then(async ({ data: { session } }) => {
    if (session?.user) {
      set({ user: session.user })
      await get().fetchProfile(session.user.id)
    }
    set({ loading: false })
  })

  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' && session?.user) {
      set({ user: session.user, loading: false })
      if (!get().profile) {
        get().fetchProfile(session.user.id)
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

    updateProfile: async (fields) => {
      const { user } = get()
      if (!user) return { success: false, error: 'No session' }
      const { error } = await supabase
        .from('profiles')
        .update(fields)
        .eq('id', user.id)
      if (error) return { success: false, error: error.message }
      await get().fetchProfile(user.id)
      return { success: true }
    },

    uploadAvatar: async (file) => {
      const { user } = get()
      if (!user) return { success: false, error: 'No session' }
      const ext = file.name.split('.').pop()
      const path = `${user.id}/avatar.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true })
      if (uploadError) return { success: false, error: uploadError.message }
      const { data } = supabase.storage.from('avatars').getPublicUrl(path)
      const avatarUrl = data.publicUrl + `?t=${Date.now()}`
      const result = await get().updateProfile({ avatar_url: avatarUrl })
      return result
    },

    sendPasswordReset: async () => {
      const { user } = get()
      if (!user) return { success: false }
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      if (error) return { success: false, error: error.message }
      return { success: true }
    },

    signIn: async (email, password) => {
      set({ loading: true, error: null })
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
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
          options: { data: { role, display_name: displayName } },
        })
        if (error) throw error

        let session = null
        for (let attempt = 0; attempt < 3; attempt++) {
          const { data: sessionData } = await supabase.auth.getSession()
          if (sessionData?.session) { session = sessionData.session; break }
          if (attempt < 2) await new Promise((r) => setTimeout(r, 500))
        }

        if (session?.user) {
          set({ user: session.user })
          await get().fetchProfile(session.user.id)
        } else {
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
