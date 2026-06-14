import {
  LayoutDashboard,
  DollarSign,
  Target,
  Calendar,
  User,
  Lightbulb,
  MessageSquare,
  BarChart2,
  Building2,
  Users,
} from 'lucide-react'

export function getNavItems(profile) {
  if (!profile) return []

  if (profile.role === 'admin') {
    return [
      { label: 'Administración', path: '/admin',   icon: Building2 },
      { label: 'Perfil',         path: '/profile', icon: User      },
    ]
  }

  if (profile.role === 'studio') {
    return [
      { label: 'Programación', path: '/schedule', icon: Calendar },
    ]
  }

  // model — basic or premium
  const items = [
    { label: 'Panel',      path: '/dashboard', icon: LayoutDashboard },
    { label: 'Ganancias',  path: '/earnings',  icon: DollarSign      },
    { label: 'Mis Metas',  path: '/goals',     icon: Target          },
    { label: 'Mi Turno',   path: '/schedule',  icon: Calendar        },
  ]

  if (profile.plan === 'premium') {
    items.push({ label: 'Tips', path: '/tips', icon: Lightbulb     })
    items.push({ label: 'Foro', path: '/forum', icon: MessageSquare })
  }

  items.push({ label: 'Perfil', path: '/profile', icon: User })

  return items
}
