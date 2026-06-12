import { NavLink } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { getNavItems } from '../../lib/nav'

export default function Sidebar() {
  const { profile, signOut } = useAuth()
  const navItems = getNavItems(profile)

  const planLabel =
    profile?.plan === 'premium'
      ? 'Premium'
      : profile?.role === 'studio'
      ? 'Estudio'
      : profile?.role === 'admin'
      ? 'Admin'
      : 'Básico'

  return (
    <aside className="hidden lg:flex flex-col w-60 bg-[#0D0D0D] border-r border-white/[0.06] sticky top-0 h-screen overflow-y-auto flex-shrink-0">
      {/* Wordmark */}
      <div className="flex items-center h-16 px-6 border-b border-white/[0.06] flex-shrink-0">
        <span className="font-heading text-xl text-[#C9A96E] tracking-wide">
          ModelHub
        </span>
      </div>

      {/* Nav items */}
      <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
        {navItems.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            end
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-[#C9A96E]/12 text-[#C9A96E]'
                  : 'text-[#6B7280] hover:text-[#F5F0E8] hover:bg-white/[0.04]'
              }`
            }
          >
            <Icon size={18} strokeWidth={1.75} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User info + sign out */}
      <div className="p-3 border-t border-white/[0.06] flex-shrink-0">
        {profile && (
          <div className="flex items-center gap-3 px-3 py-2 mb-1 min-w-0">
            <div className="w-7 h-7 rounded-full bg-[#C9A96E]/20 border border-[#C9A96E]/40 flex items-center justify-center flex-shrink-0">
              <span className="text-[#C9A96E] text-xs font-semibold">
                {profile.display_name?.[0]?.toUpperCase() ?? '?'}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-[#F5F0E8] text-sm font-medium truncate">
                {profile.display_name}
              </p>
              <p className="text-[#6B7280] text-xs">{planLabel}</p>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={signOut}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-[#6B7280] hover:text-red-400 hover:bg-red-500/8 transition-all"
        >
          <LogOut size={18} strokeWidth={1.75} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
