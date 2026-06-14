import { useState } from 'react'
import { Clock } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useScheduleStore } from '../../store/scheduleStore'
import Modal from '../../components/ui/Modal'
import Button from '../../components/ui/Button'

const TYPE_OPTIONS = [
  { value: 'cancel',     label: 'Cancelar turno'       },
  { value: 'extend',     label: 'Extender horas'        },
  { value: 'reschedule', label: 'Cambiar fecha u hora'  },
]

function fmt(isoStr) {
  return new Date(isoStr).toLocaleDateString('es-CO', {
    weekday: 'long', day: 'numeric', month: 'long',
  })
}

function timeStr(isoStr) {
  return new Date(isoStr).toLocaleTimeString('es-CO', {
    hour: '2-digit', minute: '2-digit', hour12: false,
  })
}

function toLocalDatetimeValue(isoStr) {
  const d = new Date(isoStr)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function ShiftChangeRequest({ shift, onClose, onSuccess }) {
  const { user } = useAuth()
  const requestChange = useScheduleStore((s) => s.requestChange)

  const [form, setForm]     = useState({
    type:             'cancel',
    requested_start:  toLocalDatetimeValue(shift.starts_at),
    requested_end:    toLocalDatetimeValue(shift.ends_at),
    note:             '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')
  const [done, setDone]     = useState(false)

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }))

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')

    const payload = {
      type: form.type,
      note: form.note,
      requested_start: form.type !== 'cancel'
        ? new Date(form.requested_start).toISOString() : null,
      requested_end: form.type !== 'cancel'
        ? new Date(form.requested_end).toISOString() : null,
    }

    const result = await requestChange(shift, user.id, payload)
    setSaving(false)

    if (!result.success) return setError(result.error ?? 'Error al enviar solicitud.')
    setDone(true)
    setTimeout(onSuccess, 1500)
  }

  return (
    <Modal open onClose={onClose} title="Solicitar cambio de turno">
      {/* Shift info */}
      <div className="flex items-center gap-3 p-3 rounded-xl bg-white/4 border border-white/8 mb-5">
        <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
          <Clock size={16} className="text-blue-400" strokeWidth={1.75} />
        </div>
        <div>
          <p className="text-[#F5F0E8] text-sm font-medium">{shift.studios?.name}</p>
          <p className="text-[#6B7280] text-xs">
            {fmt(shift.starts_at)} · {timeStr(shift.starts_at)} – {timeStr(shift.ends_at)}
          </p>
          {shift.rooms?.name && (
            <p className="text-[#6B7280] text-xs">Sala: {shift.rooms.name}</p>
          )}
        </div>
      </div>

      {done ? (
        <div className="text-center py-4">
          <p className="text-emerald-400 font-medium">¡Solicitud enviada!</p>
          <p className="text-[#6B7280] text-sm mt-1">El coordinador recibirá tu solicitud.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type */}
          <div>
            <p className="text-xs text-[#6B7280] mb-2">Tipo de solicitud</p>
            <div className="space-y-2">
              {TYPE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => set('type', opt.value)}
                  className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all ${
                    form.type === opt.value
                      ? 'border-[#C9A96E] bg-[#C9A96E]/10 text-[#C9A96E]'
                      : 'border-white/10 text-[#6B7280] hover:border-white/20'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* New datetime pickers (not for cancellation) */}
          {form.type !== 'cancel' && (
            <div className="space-y-3">
              <div>
                <p className="text-xs text-[#6B7280] mb-1.5">
                  {form.type === 'extend' ? 'Nueva hora de inicio' : 'Nueva fecha y hora de inicio'}
                </p>
                <input
                  type="datetime-local"
                  value={form.requested_start}
                  onChange={(e) => set('requested_start', e.target.value)}
                  className="input-base w-full text-sm"
                  required
                />
              </div>
              <div>
                <p className="text-xs text-[#6B7280] mb-1.5">
                  {form.type === 'extend' ? 'Nueva hora de fin' : 'Nueva fecha y hora de fin'}
                </p>
                <input
                  type="datetime-local"
                  value={form.requested_end}
                  onChange={(e) => set('requested_end', e.target.value)}
                  className="input-base w-full text-sm"
                  required
                />
              </div>
            </div>
          )}

          {/* Note */}
          <div>
            <p className="text-xs text-[#6B7280] mb-1.5">Nota (opcional)</p>
            <textarea
              rows={3}
              placeholder="Explica el motivo de tu solicitud…"
              value={form.note}
              onChange={(e) => set('note', e.target.value)}
              className="input-base w-full resize-none text-sm"
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <div className="flex gap-3">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={saving} className="flex-1">
              {saving ? 'Enviando…' : 'Enviar solicitud'}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  )
}
