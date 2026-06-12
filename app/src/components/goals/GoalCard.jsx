import { Home, Car, Plane, GraduationCap, Star, CheckCircle, Pencil, Trash2 } from 'lucide-react'
import { calculateGoal } from '../../lib/goalCalculator'
import { useSettingsStore } from '../../store/settingsStore'
import { formatCOP, formatUSD } from '../../lib/utils'
import Card from '../ui/Card'
import Button from '../ui/Button'

const TYPE_CONFIG = {
  housing:   { icon: Home,          label: 'Vivienda',  color: 'text-blue-400',    bg: 'bg-blue-500/10'    },
  vehicle:   { icon: Car,           label: 'Vehículo',  color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  travel:    { icon: Plane,         label: 'Viaje',     color: 'text-purple-400',  bg: 'bg-purple-500/10'  },
  education: { icon: GraduationCap, label: 'Educación', color: 'text-amber-400',   bg: 'bg-amber-500/10'   },
  other:     { icon: Star,          label: 'Otro',      color: 'text-[#E8B4B8]',   bg: 'bg-[#E8B4B8]/10'  },
}

export default function GoalCard({ goal, monthlyIncomeUSD = 0, onEdit, onComplete, onDelete, confirmDeleteId, setConfirmDeleteId }) {
  const exchangeRate = useSettingsStore((s) => s.exchangeRate)
  const cfg  = TYPE_CONFIG[goal.type] ?? TYPE_CONFIG.other
  const Icon = cfg.icon

  const projection = calculateGoal({
    target_amount:          goal.target_amount,
    currency:               goal.currency,
    savings_pct:            goal.savings_pct,
    avg_monthly_income_usd: goal.manual_income ?? monthlyIncomeUSD,
    current_saved:          goal.current_saved ?? 0,
    exchange_rate:          exchangeRate,
  })

  const targetDisplay = goal.currency === 'COP'
    ? formatCOP(goal.target_amount)
    : formatUSD(goal.target_amount)

  const monthlySavingDisplay = goal.currency === 'COP'
    ? formatCOP(projection.monthly_saving_cop)
    : formatUSD(projection.monthly_saving_usd)

  const isConfirming = confirmDeleteId === goal.id

  return (
    <Card className={goal.is_completed ? 'opacity-70' : ''}>
      {/* Header row */}
      <div className="flex items-start gap-3 mb-4">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
          <Icon size={20} className={cfg.color} strokeWidth={1.75} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-wider text-[#6B7280]">{cfg.label}</span>
            {goal.is_completed && (
              <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                <CheckCircle size={10} /> Completada
              </span>
            )}
          </div>
          <h3 className="text-[#F5F0E8] font-medium text-sm mt-0.5 truncate">{goal.name}</h3>
        </div>
      </div>

      {/* Target */}
      <div className="mb-3">
        <p className="text-[#6B7280] text-xs mb-1">Meta</p>
        <p className="text-[#C9A96E] font-semibold text-lg leading-tight">{targetDisplay}</p>
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-[#6B7280] mb-1.5">
          <span>Progreso</span>
          <span>{projection.pct_complete}%</span>
        </div>
        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#C9A96E] to-[#E8B4B8] transition-all duration-500"
            style={{ width: `${projection.pct_complete}%` }}
          />
        </div>
      </div>

      {/* Stats */}
      {!goal.is_completed && (
        <div className="grid grid-cols-2 gap-3 mb-4 p-3 rounded-lg bg-white/3">
          <div>
            <p className="text-[#6B7280] text-xs mb-0.5">Ahorro/mes</p>
            <p className="text-[#F5F0E8] text-sm font-medium">{monthlySavingDisplay}</p>
          </div>
          <div>
            <p className="text-[#6B7280] text-xs mb-0.5">Plazo est.</p>
            <p className="text-[#F5F0E8] text-sm font-medium">
              {projection.months_to_complete != null
                ? `${projection.months_to_complete} mes${projection.months_to_complete !== 1 ? 'es' : ''}`
                : '—'}
            </p>
          </div>
        </div>
      )}

      {/* Actions */}
      {!goal.is_completed && (
        <div className="flex gap-2 pt-3 border-t border-white/5">
          {isConfirming ? (
            <>
              <span className="text-red-400 text-xs flex-1 flex items-center">¿Eliminar?</span>
              <Button variant="danger" size="sm" onClick={() => { onDelete(goal.id); setConfirmDeleteId(null) }}>
                Sí
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setConfirmDeleteId(null)}>
                No
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => onEdit(goal)} className="flex-1 justify-center gap-1">
                <Pencil size={13} /> Editar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onComplete(goal.id)}
                className="flex-1 justify-center gap-1 !text-emerald-400 hover:!text-emerald-300"
              >
                <CheckCircle size={13} /> Completar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setConfirmDeleteId(goal.id)}
                className="!text-red-400 hover:!text-red-300"
              >
                <Trash2 size={13} />
              </Button>
            </>
          )}
        </div>
      )}
    </Card>
  )
}
