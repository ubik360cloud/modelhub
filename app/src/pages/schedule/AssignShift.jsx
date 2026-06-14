import { useState } from 'react'
import { useScheduleStore } from '../../store/scheduleStore'
import Modal from '../../components/ui/Modal'
import Button from '../../components/ui/Button'

export default function AssignShift({ studio, rooms, linkedModels, coordinatorId, onClose, onSuccess }) {
  const assignShift = useScheduleStore((s) => s.assignShift)

  const activeRooms  = rooms.filter((r) => r.is_active)
  const today = new Date().toISOString().slice(0, 10)

  const [form, setForm]     = useState({
    model_id: linkedModels[0]?.profiles?.id ?? '',
    room_id:  activeRooms[0]?.id ?? '',
    date:     today,
    start:    '08:00',
    end:      '16:00',
    notes:    '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }))

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.model_id) return setError('Selecciona una modelo.')
    if (!form.room_id)  return setError('Selecciona una sala.')

    const starts_at = new Date(`${form.date}T${form.start}:00`).toISOString()
    const ends_at   = new Date(`${form.date}T${form.end}:00`).toISOString()

    if (ends_at <= starts_at) return setError('La hora de fin debe ser mayor a la de inicio.')

    setSaving(true)
    setError('')
    const result = await assignShift(studio.id, coordinatorId, {
      model_id: form.model_id,
      room_id:  form.room_id,
      starts_at,
      ends_at,
      notes:    form.notes,
    })
    setSaving(false)
    if (!result.success) return setError(result.error ?? 'Error al asignar turno.')
    onSuccess()
  }

  return (
    <Modal open onClose={onClose} title="Asignar turno">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Model select */}
        <div>
          <p className="text-xs text-[#6B7280] mb-1.5">Modelo</p>
          {linkedModels.length === 0 ? (
            <p className="text-[#6B7280] text-sm">No hay modelos vinculadas al estudio.</p>
          ) : (
            <select
              value={form.model_id}
              onChange={(e) => set('model_id', e.target.value)}
              className="input-base w-full text-sm"
              required
            >
              <option value="">Seleccionar modelo…</option>
              {linkedModels.map((sm) => (
                <option key={sm.profiles?.id} value={sm.profiles?.id}>
                  {sm.profiles?.display_name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Room select */}
        <div>
          <p className="text-xs text-[#6B7280] mb-1.5">Sala</p>
          {activeRooms.length === 0 ? (
            <p className="text-[#6B7280] text-sm">No hay salas activas. Agrégalas en Configuración.</p>
          ) : (
            <select
              value={form.room_id}
              onChange={(e) => set('room_id', e.target.value)}
              className="input-base w-full text-sm"
              required
            >
              <option value="">Seleccionar sala…</option>
              {activeRooms.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          )}
        </div>

        {/* Date */}
        <div>
          <p className="text-xs text-[#6B7280] mb-1.5">Fecha</p>
          <input
            type="date"
            value={form.date}
            min={today}
            onChange={(e) => set('date', e.target.value)}
            className="input-base w-full text-sm"
            required
          />
        </div>

        {/* Times */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-[#6B7280] mb-1.5">Inicio</p>
            <input
              type="time"
              value={form.start}
              onChange={(e) => set('start', e.target.value)}
              className="input-base w-full text-sm"
              required
            />
          </div>
          <div>
            <p className="text-xs text-[#6B7280] mb-1.5">Fin</p>
            <input
              type="time"
              value={form.end}
              onChange={(e) => set('end', e.target.value)}
              className="input-base w-full text-sm"
              required
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <p className="text-xs text-[#6B7280] mb-1.5">Notas (opcional)</p>
          <textarea
            rows={2}
            value={form.notes}
            onChange={(e) => set('notes', e.target.value)}
            className="input-base w-full resize-none text-sm"
            placeholder="Instrucciones especiales…"
          />
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <div className="flex gap-3">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={saving || linkedModels.length === 0 || activeRooms.length === 0}
            className="flex-1"
          >
            {saving ? 'Guardando…' : 'Asignar turno'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
