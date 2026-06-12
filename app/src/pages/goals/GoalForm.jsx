import { useState, useEffect, useMemo } from 'react'
import { Home, Car, Plane, GraduationCap, Star } from 'lucide-react'
import { useGoalsStore } from '../../store/goalsStore'
import { calculateGoal, USD_TO_COP } from '../../lib/goalCalculator'
import { formatCOP, formatUSD } from '../../lib/utils'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'

const TYPES = [
  { id: 'housing',   Icon: Home,          label: 'Vivienda'  },
  { id: 'vehicle',   Icon: Car,           label: 'Vehículo'  },
  { id: 'travel',    Icon: Plane,         label: 'Viaje'     },
  { id: 'education', Icon: GraduationCap, label: 'Educación' },
  { id: 'other',     Icon: Star,          label: 'Otro'      },
]

const EMPTY = {
  name:          '',
  type:          'travel',
  target_amount: '',
  currency:      'COP',
  savings_pct:   30,
  manual_income: '',
  notes:         '',
}

export default function GoalForm({ goal, userId, profileIncomeUSD = 0, onSuccess, onCancel }) {
  const addGoal    = useGoalsStore((s) => s.addGoal)
  const updateGoal = useGoalsStore((s) => s.updateGoal)

  const isEdit = Boolean(goal)

  const [form, setForm]     = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')

  useEffect(() => {
    if (goal) {
      setForm({
        name:          goal.name,
        type:          goal.type,
        target_amount: String(goal.target_amount),
        currency:      goal.currency,
        savings_pct:   goal.savings_pct,
        manual_income: goal.manual_income != null ? String(goal.manual_income) : '',
        notes:         goal.notes ?? '',
      })
    } else {
      setForm(EMPTY)
    }
  }, [goal])

  const set = (k, v) => setForm((prev) => ({ ...prev, [k]: v }))

  const incomeUSD = form.manual_income
    ? parseFloat(form.manual_income)
    : profileIncomeUSD

  const projection = useMemo(() => {
    const amt = parseFloat(form.target_amount)
    if (!amt || !incomeUSD) return null
    return calculateGoal({
      target_amount:          amt,
      currency:               form.currency,
      savings_pct:            form.savings_pct,
      avg_monthly_income_usd: incomeUSD,
    })
  }, [form.target_amount, form.currency, form.savings_pct, incomeUSD])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim())          return setError('Escribe un nombre para la meta.')
    if (!parseFloat(form.target_amount)) return setError('Ingresa un monto mayor a 0.')

    setSaving(true)
    setError('')

    const result = isEdit
      ? await updateGoal(goal.id, form)
      : await addGoal(userId, form)

    setSaving(false)
    if (!result.success) return setError(result.error ?? 'Error al guardar la meta.')
    onSuccess()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Name */}
      <Input
        label="Nombre de la meta"
        placeholder="Ej: Comprar moto, Viaje a Cartagena…"
        value={form.name}
        onChange={(e) => set('name', e.target.value)}
        required
      />

      {/* Type */}
      <div>
        <p className="text-xs text-[#6B7280] mb-2">Tipo</p>
        <div className="grid grid-cols-5 gap-2">
          {TYPES.map(({ id, Icon, label }) => {
            const active = form.type === id
            return (
              <button
                key={id}
                type="button"
                onClick={() => set('type', id)}
                className={`
                  flex flex-col items-center gap-1.5 py-3 px-1 rounded-xl border transition-all
                  ${active
                    ? 'border-[#C9A96E] bg-[#C9A96E]/10 text-[#C9A96E]'
                    : 'border-white/10 bg-white/3 text-[#6B7280] hover:border-white/20'}
                `}
              >
                <Icon size={18} strokeWidth={1.75} />
                <span className="text-[10px] leading-tight text-center">{label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Target amount + currency */}
      <div>
        <p className="text-xs text-[#6B7280] mb-2">Monto objetivo</p>
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              placeholder="0"
              type="number"
              min="1"
              step="any"
              value={form.target_amount}
              onChange={(e) => set('target_amount', e.target.value)}
              required
            />
          </div>
          <div className="flex rounded-xl border border-white/10 overflow-hidden h-10">
            {['COP', 'USD'].map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => set('currency', c)}
                className={`px-4 text-sm font-medium transition-all ${
                  form.currency === c
                    ? 'bg-[#C9A96E] text-[#0D0D0D]'
                    : 'text-[#6B7280] hover:text-[#F5F0E8]'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Savings pct slider */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <p className="text-xs text-[#6B7280]">% de ingresos que destinarás</p>
          <span className="text-sm font-semibold text-[#C9A96E]">{form.savings_pct}%</span>
        </div>
        <input
          type="range"
          min={10}
          max={80}
          step={5}
          value={form.savings_pct}
          onChange={(e) => set('savings_pct', Number(e.target.value))}
          className="w-full h-1.5 rounded-full appearance-none cursor-pointer
            bg-white/10 accent-[#C9A96E]"
        />
        <div className="flex justify-between text-[10px] text-[#6B7280] mt-1">
          <span>10%</span><span>80%</span>
        </div>
      </div>

      {/* Manual income */}
      <Input
        label={`Ingresos mensuales en USD${profileIncomeUSD ? ` (tu perfil: $${profileIncomeUSD})` : ''}`}
        placeholder={profileIncomeUSD ? `Vacío = usar $${profileIncomeUSD}` : 'Ej: 800'}
        type="number"
        min="0"
        step="any"
        value={form.manual_income}
        onChange={(e) => set('manual_income', e.target.value)}
        helper={profileIncomeUSD && !form.manual_income ? `Se usarán los ingresos de tu perfil ($${profileIncomeUSD}/mes)` : ''}
      />

      {/* Live projection */}
      {projection ? (
        <div className="rounded-xl bg-[#C9A96E]/8 border border-[#C9A96E]/20 p-4">
          <p className="text-xs uppercase tracking-wider text-[#C9A96E] mb-3">Proyección</p>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-[10px] text-[#6B7280] mb-1">Ahorro/mes</p>
              <p className="text-[#F5F0E8] text-sm font-semibold">
                {form.currency === 'COP'
                  ? formatCOP(projection.monthly_saving_cop)
                  : formatUSD(projection.monthly_saving_usd)}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-[#6B7280] mb-1">Meses</p>
              <p className="text-[#F5F0E8] text-sm font-semibold">
                {projection.months_to_complete ?? '—'}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-[#6B7280] mb-1">Fecha est.</p>
              <p className="text-[#F5F0E8] text-sm font-semibold">
                {projection.completion_date
                  ? new Date(projection.completion_date + 'T12:00:00').toLocaleDateString('es-CO', {
                      month: 'short',
                      year:  'numeric',
                    })
                  : '—'}
              </p>
            </div>
          </div>
        </div>
      ) : (
        !incomeUSD && (
          <p className="text-xs text-[#6B7280] text-center py-2">
            Ingresa tus ingresos mensuales para ver la proyección.
          </p>
        )
      )}

      {/* Notes */}
      <div>
        <p className="text-xs text-[#6B7280] mb-1.5">Notas (opcional)</p>
        <textarea
          rows={2}
          placeholder="Detalles adicionales…"
          value={form.notes}
          onChange={(e) => set('notes', e.target.value)}
          className="input-base w-full resize-none text-sm"
        />
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <div className="flex gap-3 pt-1">
        <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">
          Cancelar
        </Button>
        <Button type="submit" variant="primary" disabled={saving} className="flex-1">
          {saving ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear meta'}
        </Button>
      </div>
    </form>
  )
}
