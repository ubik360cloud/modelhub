import { useState, useEffect } from 'react'
import { CheckCircle } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useEarningsStore } from '../../store/earningsStore'
import { supabase } from '../../lib/supabase'
import { todayISO } from '../../lib/utils'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'

const STANDARD_PLATFORMS = [
  'Chaturbate',
  'BongaCams',
  'LiveJasmin',
  'OnlyFans',
  'Streamate',
  'Stripchat',
]

export default function EarningsForm({ onSuccess }) {
  const { user } = useAuth()
  const addEarning = useEarningsStore((s) => s.addEarning)

  const [userPlatforms, setUserPlatforms] = useState([])
  const [form, setForm] = useState({
    date: todayISO(),
    platform: '',
    customPlatform: '',
    amount: '',
    currency: 'USD',
    notes: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!user) return
    supabase
      .from('model_platforms')
      .select('platform_name')
      .eq('model_id', user.id)
      .eq('is_active', true)
      .then(({ data }) => {
        if (data) setUserPlatforms(data.map((p) => p.platform_name))
      })
  }, [user])

  // Build the platform list: user's platforms first, then standard ones not already listed, then Otra
  const allPlatforms = [
    ...userPlatforms,
    ...STANDARD_PLATFORMS.filter((p) => !userPlatforms.includes(p)),
    'Otra',
  ]

  const set = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (submitting) return

    const platform =
      form.platform === 'Otra' ? form.customPlatform.trim() : form.platform

    if (!form.date) return setError('Selecciona una fecha.')
    if (!form.platform) return setError('Selecciona una plataforma.')
    if (form.platform === 'Otra' && !platform)
      return setError('Escribe el nombre de la plataforma.')
    if (!form.amount || isNaN(parseFloat(form.amount)) || parseFloat(form.amount) <= 0)
      return setError('Ingresa un monto válido.')

    setSubmitting(true)
    const result = await addEarning(user.id, { ...form, platform })
    setSubmitting(false)

    if (result.success) {
      setSaved(true)
      setForm({ date: todayISO(), platform: '', customPlatform: '', amount: '', currency: 'USD', notes: '' })
      setTimeout(() => {
        setSaved(false)
        onSuccess?.()
      }, 1800)
    } else {
      setError(result.error ?? 'No se pudo guardar el registro.')
    }
  }

  if (saved) {
    return (
      <Card className="flex flex-col items-center gap-3 py-10 text-center">
        <CheckCircle size={40} className="text-emerald-400" strokeWidth={1.5} />
        <p className="text-[#F5F0E8] font-medium">Ganancia registrada</p>
        <p className="text-[#6B7280] text-sm">Redirigiendo al historial...</p>
      </Card>
    )
  }

  return (
    <Card>
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Fecha */}
        <Input
          label="Fecha"
          id="date"
          type="date"
          value={form.date}
          onChange={(e) => set('date', e.target.value)}
          max={todayISO()}
          required
        />

        {/* Plataforma */}
        <div className="space-y-1.5">
          <label htmlFor="platform" className="block text-[#F5F0E8] text-sm font-medium">
            Plataforma
          </label>
          <select
            id="platform"
            value={form.platform}
            onChange={(e) => set('platform', e.target.value)}
            className="input-base"
            required
          >
            <option value="">Selecciona una plataforma...</option>
            {allPlatforms.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        {form.platform === 'Otra' && (
          <Input
            label="Nombre de la plataforma"
            id="customPlatform"
            type="text"
            value={form.customPlatform}
            onChange={(e) => set('customPlatform', e.target.value)}
            placeholder="Ej: Fancentro"
          />
        )}

        {/* Monto + moneda */}
        <div className="space-y-1.5">
          <label className="block text-[#F5F0E8] text-sm font-medium">Monto</label>
          <div className="flex gap-2">
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.amount}
              onChange={(e) => set('amount', e.target.value)}
              placeholder="0.00"
              className="input-base flex-1"
              required
            />
            <div className="flex rounded-md border border-white/[0.08] overflow-hidden flex-shrink-0">
              {['USD', 'COP'].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => set('currency', c)}
                  className={`px-3 h-10 text-sm font-medium transition-colors ${
                    form.currency === c
                      ? 'bg-[#C9A96E] text-[#0D0D0D]'
                      : 'bg-[#111118] text-[#6B7280] hover:text-[#F5F0E8]'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Notas */}
        <div className="space-y-1.5">
          <label htmlFor="notes" className="block text-[#F5F0E8] text-sm font-medium">
            Notas{' '}
            <span className="text-[#6B7280] font-normal">(opcional)</span>
          </label>
          <textarea
            id="notes"
            rows={2}
            value={form.notes}
            onChange={(e) => set('notes', e.target.value)}
            placeholder="Ej: show especial, token show..."
            className="input-base resize-none"
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={submitting}
          className="w-full"
        >
          {submitting ? 'Guardando...' : 'Registrar ganancia'}
        </Button>
      </form>
    </Card>
  )
}
