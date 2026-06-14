import { useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend, PieChart, Pie, Cell,
} from 'recharts'
import { useEarningsStore } from '../../store/earningsStore'
import { useSettingsStore } from '../../store/settingsStore'
import { formatUSD, formatCOP, todayISO, currentMonthRange } from '../../lib/utils'
import Card from '../../components/ui/Card'

const PIE_COLORS = ['#C9A96E', '#E8B4B8', '#60A5FA', '#34D399', '#F59E0B', '#A78BFA', '#F87171', '#38BDF8']

// ── Tooltips ──────────────────────────────────────────────────────────────────

function BarTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="card-glass p-3 text-xs">
      <p className="text-[#C9A96E] font-medium mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.fill }} className="mt-0.5">
          {p.dataKey}: {p.dataKey === 'USD' ? formatUSD(p.value) : formatCOP(p.value)}
        </p>
      ))}
    </div>
  )
}

function PieTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const p = payload[0]
  const fmt = p.payload.currency === 'USD' ? formatUSD : formatCOP
  return (
    <div className="card-glass p-3 text-xs">
      <p className="text-[#C9A96E] font-medium">{p.name}</p>
      <p className="text-[#F5F0E8]">{fmt(p.value)} ({p.payload.pct}%)</p>
    </div>
  )
}

// ── Stat tile ─────────────────────────────────────────────────────────────────

function StatBox({ label, value, sub }) {
  return (
    <Card className="text-center py-4">
      <p className="text-[#6B7280] text-[10px] uppercase tracking-wider mb-1">{label}</p>
      <p className="text-[#C9A96E] text-base sm:text-lg font-semibold leading-tight truncate px-1">{value}</p>
      {sub && <p className="text-[#6B7280] text-[10px] mt-0.5 truncate px-1">{sub}</p>}
    </Card>
  )
}

// ── Pie card ──────────────────────────────────────────────────────────────────

function PieCard({ title, data, currency }) {
  const fmt = currency === 'COP' ? formatCOP : formatUSD
  return (
    <Card>
      <p className="text-[#F5F0E8] text-sm font-medium mb-3">{title}</p>
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="w-full" style={{ height: 180 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={48}
                outerRadius={76}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<PieTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <ul className="w-full sm:w-auto space-y-1.5 flex-shrink-0 sm:min-w-[140px]">
          {data.map((entry, i) => (
            <li key={entry.name} className="flex items-center gap-2 text-xs">
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
              />
              <span className="text-[#F5F0E8] truncate">{entry.name}</span>
              <span className="text-[#6B7280] ml-auto whitespace-nowrap">{entry.pct}%</span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function EarningsCharts() {
  const earnings     = useEarningsStore((s) => s.earnings)
  const exchangeRate = useSettingsStore((s) => s.exchangeRate)

  const usdEarnings = useMemo(() => earnings.filter((e) => e.currency === 'USD'), [earnings])
  const copEarnings = useMemo(() => earnings.filter((e) => e.currency === 'COP'), [earnings])

  const today       = todayISO()
  const { from: monthFrom, to: monthTo } = currentMonthRange()
  const year        = new Date().getFullYear()

  const todayUSD = useMemo(() =>
    usdEarnings.filter((e) => e.date === today).reduce((s, e) => s + Number(e.amount), 0),
    [usdEarnings, today]
  )
  const monthUSD = useMemo(() =>
    usdEarnings.filter((e) => e.date >= monthFrom && e.date <= monthTo)
      .reduce((s, e) => s + Number(e.amount), 0),
    [usdEarnings, monthFrom, monthTo]
  )
  const monthCOP = useMemo(() =>
    copEarnings.filter((e) => e.date >= monthFrom && e.date <= monthTo)
      .reduce((s, e) => s + Number(e.amount), 0),
    [copEarnings, monthFrom, monthTo]
  )
  const yearUSD = useMemo(() =>
    usdEarnings.filter((e) => e.date.startsWith(String(year)))
      .reduce((s, e) => s + Number(e.amount), 0),
    [usdEarnings, year]
  )

  // Top platform this month (in USD equivalent)
  const topPlatform = useMemo(() => {
    const by = {}
    earnings.filter((e) => e.date >= monthFrom && e.date <= monthTo).forEach((e) => {
      const usd = e.currency === 'USD' ? Number(e.amount) : Number(e.amount) / exchangeRate
      by[e.platform] = (by[e.platform] ?? 0) + usd
    })
    const entries = Object.entries(by)
    return entries.length ? entries.sort((a, b) => b[1] - a[1])[0] : null
  }, [earnings, monthFrom, monthTo, exchangeRate])

  // Bar chart — last 6 months, USD + COP bars
  const barData = useMemo(() => {
    const now = new Date()
    return Array.from({ length: 6 }, (_, i) => {
      const d      = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
      const prefix = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const label  = d.toLocaleDateString('es-CO', { month: 'short', year: '2-digit' })
      const usd    = usdEarnings.filter((e) => e.date.startsWith(prefix)).reduce((s, e) => s + Number(e.amount), 0)
      const cop    = copEarnings.filter((e) => e.date.startsWith(prefix)).reduce((s, e) => s + Number(e.amount), 0)
      return { month: label, USD: usd, COP: cop }
    })
  }, [usdEarnings, copEarnings])

  const hasCOPBar = barData.some((d) => d.COP > 0)

  // Pie data — by platform
  const usdPieData = useMemo(() => {
    const by = {}
    usdEarnings.forEach((e) => { by[e.platform] = (by[e.platform] ?? 0) + Number(e.amount) })
    const total = Object.values(by).reduce((s, v) => s + v, 0)
    return Object.entries(by).sort((a, b) => b[1] - a[1]).map(([name, value]) => ({
      name, value, currency: 'USD', pct: total > 0 ? Math.round((value / total) * 100) : 0,
    }))
  }, [usdEarnings])

  const copPieData = useMemo(() => {
    const by = {}
    copEarnings.forEach((e) => { by[e.platform] = (by[e.platform] ?? 0) + Number(e.amount) })
    const total = Object.values(by).reduce((s, v) => s + v, 0)
    return Object.entries(by).sort((a, b) => b[1] - a[1]).map(([name, value]) => ({
      name, value, currency: 'COP', pct: total > 0 ? Math.round((value / total) * 100) : 0,
    }))
  }, [copEarnings])

  if (earnings.length === 0) {
    return (
      <Card className="py-12 text-center">
        <p className="text-[#6B7280] text-sm">Registra tus primeras ganancias para ver las gráficas.</p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Stats — equal-size 2×2 grid on mobile, 4 columns on desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatBox label="Hoy (USD)" value={formatUSD(todayUSD)} />
        <StatBox
          label="Mes (USD)"
          value={formatUSD(monthUSD)}
          sub={topPlatform ? `Top: ${topPlatform[0]}` : undefined}
        />
        <StatBox
          label="Mes (COP)"
          value={monthCOP > 0 ? formatCOP(monthCOP) : '—'}
        />
        <StatBox
          label={`Año ${year}`}
          value={formatUSD(yearUSD)}
          sub="USD"
        />
      </div>

      {/* Bar chart — USD + COP double bars */}
      <Card>
        <p className="text-[#F5F0E8] text-sm font-medium mb-4">Últimos 6 meses</p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={barData} margin={{ top: 4, right: hasCOPBar ? 50 : 4, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.06)" />
            <XAxis
              dataKey="month"
              tick={{ fill: '#6B7280', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              yAxisId="usd"
              orientation="left"
              tick={{ fill: '#6B7280', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `$${v}`}
              width={42}
            />
            {hasCOPBar && (
              <YAxis
                yAxisId="cop"
                orientation="right"
                tick={{ fill: '#6B7280', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) =>
                  v >= 1_000_000 ? `$${(v / 1_000_000).toFixed(1)}M` : `$${Math.round(v / 1000)}K`
                }
                width={46}
              />
            )}
            <Tooltip content={<BarTooltip />} cursor={{ fill: 'rgba(201,169,110,0.06)' }} />
            <Legend
              wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
              formatter={(value) => <span style={{ color: '#9CA3AF' }}>{value}</span>}
            />
            <Bar
              yAxisId="usd"
              dataKey="USD"
              fill="#C9A96E"
              radius={[3, 3, 0, 0]}
              maxBarSize={hasCOPBar ? 18 : 40}
            />
            {hasCOPBar && (
              <Bar
                yAxisId="cop"
                dataKey="COP"
                fill="#E8B4B8"
                radius={[3, 3, 0, 0]}
                maxBarSize={18}
              />
            )}
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Pie charts — by platform */}
      <div className={`grid gap-4 ${usdPieData.length > 0 && copPieData.length > 0 ? 'sm:grid-cols-2' : 'grid-cols-1'}`}>
        {usdPieData.length > 0 && (
          <PieCard title="Por plataforma (USD)" data={usdPieData} currency="USD" />
        )}
        {copPieData.length > 0 && (
          <PieCard title="Por plataforma (COP)" data={copPieData} currency="COP" />
        )}
      </div>
    </div>
  )
}
