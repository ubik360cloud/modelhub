import { Bell } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { getNavItems } from '../../lib/nav'

export default function TopBar() {
  const { profile } = useAuth()
  const location = useLocation()

  const navItems = getNavItems(profile)
  const current = navItems.find((item) => item.path === location.pathname)
  const pageTitle = current?.label ?? 'ModelHub'

  const initial = profile?.display_name?.[0]?.toUpperCase() ?? '?'

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between h-16 px-4 sm:px-6 bg-[#0D0D0D]/90 backdrop-blur-md border-b border-white/[0.06]">
      <h2 className="font-heading text-lg font-normal text-[#F5F0E8]">
        {pageTitle}
      </h2>

      <div className="flex items-center gap-2">
        {/* Notification bell — wired to Realtime in Step 7 */}
        <button
          type="button"
          className="w-9 h-9 flex items-center justify-center rounded-lg text-[#6B7280] hover:text-[#F5F0E8] hover:bg-white/[0.06] transition-all"
          aria-label="Notificaciones"
        >
          <Bell size={18} strokeWidth={1.75} />
        </button>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-[#C9A96E]/20 border border-[#C9A96E]/40 flex items-center justify-center">
          <span className="text-[#C9A96E] text-xs font-semibold">{initial}</span>
        </div>
      </div>
    </header>
  )
}
