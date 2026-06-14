import { useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'
import { useNotificationsStore } from '../store/notificationsStore'

export function useNotifications() {
  const { user } = useAuth()
  const fetchNotifications  = useNotificationsStore((s) => s.fetchNotifications)
  const prependNotification = useNotificationsStore((s) => s.prependNotification)
  const markRead            = useNotificationsStore((s) => s.markRead)
  const markAllRead         = useNotificationsStore((s) => s.markAllRead)
  const loaded              = useNotificationsStore((s) => s.loaded)

  useEffect(() => {
    if (!user?.id) return

    if (!loaded) fetchNotifications(user.id)

    const channel = supabase
      .channel(`notifications-${user.id}`)
      .on(
        'postgres_changes',
        {
          event:  'INSERT',
          schema: 'public',
          table:  'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => { prependNotification(payload.new) }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [user?.id])

  return {
    notifications: useNotificationsStore((s) => s.notifications),
    unreadCount:   useNotificationsStore((s) => s.unreadCount),
    markRead,
    markAllRead: () => markAllRead(user?.id),
  }
}
