import { useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import { useEarningsStore } from '../../store/earningsStore'
import { formatUSD, formatCOP, todayISO, currentMonthRange } from '../../lib/utils'
import Card from '../../components/ui/Card'

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="card-glass p-3 text-sm">
      <p className="text-[#C9A96E] font-medium mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="text-[#F5F0E8]">
          {p.name}: {formatUSD(p.value)}
        </p>
      ))}
    </div>
  )
}

function StatBox({ label, value, sub }) {
  return (
    <Card className="text-center py-5">
      <p className="text-[#6B7280] text-xs mb-1">{label}</p>
      <p className="text-[#C9A96E] text-2xl font-semibold">{value}</p>
      {sub && <p className="text-[#6B7280] text-xs mt-0.5">{sub}</p>}
    </Card>
  )
}

export default function EarningsCharts() {
  const earnings = useEarningsStore((s) => s.earnings)

  const usdEarnings = useMemo(
    () => earnings.filter((e) => e.currency === 'USD'),
    [earnings]
  )

  // Last 6 months bar chart data
  const chartData = useMemo(() => {
    const now = new Date()
    const months = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const from = d.toISOString().slice(0, 7) // YYYY-MM
      const label = d.toLocaleDateString('es-CO', { month: 'short', year: '2-digit' })
      const total = usdEarnings
        .filter((e) => e.date.startsWith(from))
        .reduce((sum, e) => sum + Number(e.amount), 0)
      months.push({ month: label, USD: total })
    }
    return months
  }, [usdEarnings])

  // Summary stats
  const today = todayISO()
  const { from: monthFrom, to: monthTo } = currentMonthRange()
  const currentYear = new Date().getFullYear()

  const todayTotal = useMemo(
    () => usdEarnings.filter((e) => e.date === today).reduce((s, e) => s + Number(e.amount), 0),
    [usdEarnings, today]
  )
  const monthTotal = useMemo(
    () =>
      usdEarnings
        .filter((e) => e.date >= monthFrom && e.date <= monthTo)
        .reduce((s, e) => s + Number(e.amount), 0),
    [usdEarnings, monthFrom, monthTo]
  )
  const yearTotal = useMemo(
    () =>
      usdEarnings
        .filter((e) => e.date.startsWith(String(currentYear)))
        .reduce((s, e) => s + Number(e.amount), 0),
    [usdEarnings, currentYear]
  )

  // Top platform this month
  const topPlatform = useMemo(() => {
    const byPlatform = {}
    usdEarnings
      .filter((e) => e.date >= monthFrom && e.date <= monthTo)
      .forEach((e) => {
        byPlatform[e.platform] = (byPlatform[e.platform] ?? 0) + Number(e.amount)
      })
    const entries = Object.entries(byPlatform)
    if (!entries.length) return null
    return entries.sort((a, b) => b[1] - a[1])[0]
  }, [usdEarnings, monthFrom, monthTo])

  const copTotal = useMemo(
    () =>
      earnings
        .filter((e) => e.currency === 'COP' && e.date >= monthFrom && e.date <= monthTo)
        .reduce((s, e) => s + Number(e.amount), 0),
    [earnings, monthFrom, monthTo]
  )

  if (earnings.length === 0) {
    return (
      <Card className="py-12 text-center">
        <p className="text-[#6B7280] text-sm">
          Registra tus primeras ganancias para ver las gráficas.
        </p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <StatBox label="Hoy (USD)" value={formatUSD(todayTotal)} />
        <StatBox
          label="Este mes (USD)"
          value={formatUSD(monthTotal)}
          sub={topPlatform ? `Top: ${topPlatform[0]}` : undefined}
        />
        <StatBox
          label={`Año ${currentYear} (USD)`}
          value={formatUSD(yearTotal)}
          sub={`${usdEarnings.filter((e) => e.date.startsWith(String(currentYear))).length} registros`}
        />
      </div>

      {copTotal > 0 && (
        <StatBox
          label="Este mes (COP)"
          value={formatCOP(copTotal)}
          sub="Ganancias en pesos colombianos"
        />
      )}

      {/* Bar chart */}
      <Card>
        <p className="text-[#F5F0E8] text-sm font-medium mb-4">
          Ganancias USD — últimos 6 meses
        </p>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="rgba(255,255,255,0.06)"
            />
            <XAxis
              dataKey="month"
              tick={{ fill: '#6B7280', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#6B7280', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `$${v}`}
              width={45}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(201,169,110,0.06)' }} />
            <Bar dataKey="USD" fill="#C9A96E" radius={[4, 4, 0, 0]} maxBarSize={48} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  )
}
