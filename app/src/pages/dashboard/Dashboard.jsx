import { useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { TrendingUp, Clock, Target, Zap, Calendar, ChevronRight } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useEarningsStore } from '../../store/earningsStore'
import { todayISO, currentMonthRange, formatUSD, monthLabel } from '../../lib/utils'
import PageWrapper from '../../components/ui/PageWrapper'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Buenos días'
  if (h < 18) return 'Buenas tardes'
  return 'Buenas noches'
}

function getDateLabel() {
  const raw = new Date().toLocaleDateString('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  return raw.charAt(0).toUpperCase() + raw.slice(1)
}

function StatCard({ icon: Icon, label, value, sub, iconColor, iconBg }) {
  return (
    <Card className="flex items-start gap-4">
      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBg}`}
      >
        <Icon size={20} className={iconColor} strokeWidth={1.75} />
      </div>
      <div className="min-w-0">
        <p className="text-[#6B7280] text-xs mb-1">{label}</p>
        <p className="text-[#F5F0E8] text-xl font-semibold truncate">{value}</p>
        {sub && <p className="text-[#6B7280] text-xs mt-0.5">{sub}</p>}
      </div>
    </Card>
  )
}

export default function Dashboard() {
  const { user, profile } = useAuth()
  const isPremium = profile?.plan === 'premium'

  const earnings = useEarningsStore((s) => s.earnings)
  const earningsLoading = useEarningsStore((s) => s.loading)
  const fetchEarnings = useEarningsStore((s) => s.fetchEarnings)

  useEffect(() => {
    if (user && earnings.length === 0 && !earningsLoading) {
      fetchEarnings(user.id)
    }
  }, [user])

  const today = todayISO()
  const { from: monthFrom, to: monthTo } = currentMonthRange()

  const todayUSD = useMemo(
    () =>
      earnings
        .filter((e) => e.date === today && e.currency === 'USD')
        .reduce((sum, e) => sum + Number(e.amount), 0),
    [earnings, today]
  )

  const monthUSD = useMemo(
    () =>
      earnings
        .filter((e) => e.date >= monthFrom && e.date <= monthTo && e.currency === 'USD')
        .reduce((sum, e) => sum + Number(e.amount), 0),
    [earnings, monthFrom, monthTo]
  )

  const currentMonth = monthLabel(today)

  return (
    <PageWrapper>
      {/* Welcome header */}
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-normal text-[#F5F0E8]">
          {getGreeting()}, {profile?.display_name}
        </h1>
        <p className="text-[#6B7280] text-sm mt-1">{getDateLabel()}</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard
          icon={TrendingUp}
          label="Ganancias hoy"
          value={todayUSD > 0 ? formatUSD(todayUSD) : '$0'}
          sub={todayUSD > 0 ? 'USD registrados hoy' : 'Sin registros hoy'}
          iconColor="text-emerald-400"
          iconBg="bg-emerald-500/10"
        />
        <StatCard
          icon={TrendingUp}
          label="Ganancias del mes"
          value={monthUSD > 0 ? formatUSD(monthUSD) : '$0'}
          sub={currentMonth}
          iconColor="text-[#C9A96E]"
          iconBg="bg-[#C9A96E]/10"
        />
        <StatCard
          icon={Clock}
          label="Turno activo"
          value="Ninguno"
          sub="Sin turno en curso"
          iconColor="text-blue-400"
          iconBg="bg-blue-500/10"
        />
        <StatCard
          icon={Target}
          label="Meta del mes"
          value="—"
          sub="Sin meta activa"
          iconColor="text-[#E8B4B8]"
          iconBg="bg-[#E8B4B8]/10"
        />
      </div>

      {/* Two-column section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Próximo turno */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading text-base font-normal text-[#F5F0E8]">
              Próximo turno
            </h3>
            <Link to="/schedule">
              <Button variant="ghost" size="sm">
                Ver todos
                <ChevronRight size={14} />
              </Button>
            </Link>
          </div>
          <div className="flex flex-col items-center gap-3 py-4">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
              <Calendar size={18} className="text-blue-400" strokeWidth={1.75} />
            </div>
            <p className="text-[#6B7280] text-sm text-center">
              Sin turnos programados
            </p>
            <Link to="/schedule">
              <Button variant="secondary" size="sm">
                Programar turno
              </Button>
            </Link>
          </div>
        </Card>

        {/* Meta activa */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading text-base font-normal text-[#F5F0E8]">
              Meta activa
            </h3>
            <Link to="/goals">
              <Button variant="ghost" size="sm">
                Ver metas
                <ChevronRight size={14} />
              </Button>
            </Link>
          </div>
          <div className="flex flex-col items-center gap-3 py-4">
            <div className="w-10 h-10 rounded-full bg-[#E8B4B8]/10 flex items-center justify-center">
              <Target size={18} className="text-[#E8B4B8]" strokeWidth={1.75} />
            </div>
            <p className="text-[#6B7280] text-sm text-center">
              No tienes metas activas
            </p>
            <Link to="/goals">
              <Button variant="secondary" size="sm">
                Crear meta
              </Button>
            </Link>
          </div>
        </Card>
      </div>

      {/* Bottom CTA */}
      {!isPremium ? (
        <Card className="border-[#C9A96E]/30 bg-gradient-to-br from-[#C9A96E]/8 to-transparent">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-[#C9A96E]/15 flex items-center justify-center flex-shrink-0">
              <Zap size={20} className="text-[#C9A96E]" strokeWidth={1.75} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-heading text-base font-normal text-[#F5F0E8] mb-1">
                Pasa a Premium
              </h3>
              <p className="text-[#6B7280] text-sm leading-relaxed">
                Accede a tips de expertos, el foro de modelos y análisis
                avanzados de tus ganancias.
              </p>
            </div>
            <Button variant="primary" size="sm" className="flex-shrink-0">
              Ver planes
            </Button>
          </div>
        </Card>
      ) : (
        <Card>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-heading text-base font-normal text-[#F5F0E8]">
              Tip del día
            </h3>
            <Badge variant="premium">Premium</Badge>
          </div>
          <p className="text-[#6B7280] text-sm leading-relaxed">
            Los tips aparecerán aquí una vez que explores el módulo de contenido.
          </p>
          <Link to="/tips" className="mt-3 inline-block">
            <Button variant="ghost" size="sm" className="pl-0">
              Ver todos los tips
              <ChevronRight size={14} />
            </Button>
          </Link>
        </Card>
      )}
    </PageWrapper>
  )
}
