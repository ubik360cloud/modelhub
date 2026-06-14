import { useRef, useState, useEffect } from 'react'
import { Bell, Check } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useNotifications } from '../../hooks/useNotifications'
import { getNavItems } from '../../lib/nav'

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1)  return 'Ahora'
  if (m < 60) return `Hace ${m} min`
  const h = Math.floor(m / 60)
  if (h < 24) return `Hace ${h}h`
  return `Hace ${Math.floor(h / 24)}d`
}

export default function TopBar() {
  const { profile } = useAuth()
  const location = useLocation()
  const { notifications, unreadCount, markAllRead } = useNotifications()

  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  const navItems  = getNavItems(profile)
  const current   = navItems.find((item) => item.path === location.pathname)
  const pageTitle = current?.label ?? 'ModelHub'
  const initial   = profile?.display_name?.[0]?.toUpperCase() ?? '?'

  // Close dropdown on outside click
  useEffect(() => {
    if (!open) return
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  function handleBell() {
    if (!open && unreadCount > 0) markAllRead()
    setOpen((v) => !v)
  }

  const recent = notifications.slice(0, 6)

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between h-16 px-4 sm:px-6 bg-[#0D0D0D]/90 backdrop-blur-md border-b border-white/[0.06]">
      <h2 className="font-heading text-lg font-normal text-[#F5F0E8]">
        {pageTitle}
      </h2>

      <div className="flex items-center gap-2">
        {/* Notification bell */}
        <div className="relative" ref={ref}>
          <button
            type="button"
            onClick={handleBell}
            className="w-9 h-9 flex items-center justify-center rounded-lg text-[#6B7280] hover:text-[#F5F0E8] hover:bg-white/[0.06] transition-all relative"
            aria-label="Notificaciones"
          >
            <Bell size={18} strokeWidth={1.75} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#C9A96E]" />
            )}
          </button>

          {/* Dropdown */}
          {open && (
            <div className="absolute right-0 top-11 w-80 max-w-[calc(100vw-2rem)] card-glass rounded-xl shadow-2xl border border-white/10 overflow-hidden z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/8">
                <span className="text-[#F5F0E8] text-sm font-medium">Notificaciones</span>
                {notifications.length > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-[10px] text-[#C9A96E] hover:text-[#F5F0E8] flex items-center gap-1 transition-colors"
                  >
                    <Check size={10} /> Marcar todas leídas
                  </button>
                )}
              </div>

              {recent.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <Bell size={20} className="text-[#6B7280] mx-auto mb-2" strokeWidth={1.5} />
                  <p className="text-[#6B7280] text-sm">Sin notificaciones</p>
                </div>
              ) : (
                <ul className="max-h-72 overflow-y-auto">
                  {recent.map((n) => (
                    <li
                      key={n.id}
                      className={`px-4 py-3 border-b border-white/5 last:border-0 ${
                        !n.read ? 'bg-[#C9A96E]/4' : ''
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {!n.read && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#C9A96E] flex-shrink-0 mt-1.5" />
                        )}
                        <div className={!n.read ? '' : 'pl-3.5'}>
                          <p className="text-[#F5F0E8] text-xs font-medium leading-snug">{n.title}</p>
                          {n.body && (
                            <p className="text-[#6B7280] text-xs mt-0.5 leading-snug">{n.body}</p>
                          )}
                          <p className="text-[#6B7280] text-[10px] mt-1">{timeAgo(n.created_at)}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-[#C9A96E]/20 border border-[#C9A96E]/40 flex items-center justify-center">
          <span className="text-[#C9A96E] text-xs font-semibold">{initial}</span>
        </div>
      </div>
    </header>
  )
}
