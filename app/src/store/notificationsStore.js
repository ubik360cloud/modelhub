import { create } from 'zustand'
import { supabase } from '../lib/supabase'

export const useNotificationsStore = create((set) => ({
  notifications: [],
  unreadCount:   0,
  loaded:        false,

  fetchNotifications: async (userId) => {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(30)

    const items = data ?? []
    set({
      notifications: items,
      unreadCount:   items.filter((n) => !n.read).length,
      loaded:        true,
    })
  },

  prependNotification: (notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount:   state.unreadCount + (notification.read ? 0 : 1),
    }))
  },

  markRead: async (id) => {
    await supabase.from('notifications').update({ read: true }).eq('id', id)
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }))
  },

  markAllRead: async (userId) => {
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false)
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount:   0,
    }))
  },
}))
