import { NavLink } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { getNavItems } from '../../lib/nav'

export default function BottomTabBar() {
  const { profile } = useAuth()
  const navItems = getNavItems(profile).slice(0, 5)

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#0D0D0D]/95 backdrop-blur-md border-t border-white/[0.06]">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            end
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all min-w-0 flex-1 ${
                isActive ? 'text-[#C9A96E]' : 'text-[#6B7280] hover:text-[#F5F0E8]'
              }`
            }
          >
            <Icon size={20} strokeWidth={1.75} />
            <span className="text-[10px] font-medium truncate">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
