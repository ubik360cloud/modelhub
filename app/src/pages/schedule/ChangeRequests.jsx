import { useState } from 'react'
import { Clock, CheckCircle, XCircle } from 'lucide-react'
import { useScheduleStore } from '../../store/scheduleStore'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'

const TYPE_LABEL = {
  cancel:     'Cancelación',
  extend:     'Extensión de horas',
  reschedule: 'Cambio de horario',
}

function fmtDatetime(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('es-CO', {
    weekday: 'short', day: 'numeric', month: 'short',
    hour: '2-digit', minute: '2-digit', hour12: false,
  })
}

export default function ChangeRequests() {
  const pendingRequests = useScheduleStore((s) => s.pendingRequests)
  const resolveRequest  = useScheduleStore((s) => s.resolveRequest)

  const [rejectingId, setRejectingId] = useState(null)
  const [rejectNote, setRejectNote]   = useState('')
  const [saving, setSaving]           = useState(false)

  async function handle(request, decision) {
    setSaving(true)
    await resolveRequest(request, decision, decision === 'rejected' ? rejectNote : '')
    setSaving(false)
    setRejectingId(null)
    setRejectNote('')
  }

  if (pendingRequests.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center">
          <CheckCircle size={24} className="text-emerald-400" strokeWidth={1.5} />
        </div>
        <p className="text-[#F5F0E8] font-medium">Sin solicitudes pendientes</p>
        <p className="text-[#6B7280] text-sm">Todas las solicitudes están al día.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {pendingRequests.map((req) => {
        const shift = req.shifts
        const model = req.profiles

        return (
          <Card key={req.id}>
            {/* Header */}
            <div className="flex items-start gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                <Clock size={16} className="text-amber-400" strokeWidth={1.75} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[#F5F0E8] text-sm font-medium">
                    {model?.display_name ?? 'Modelo'}
                  </span>
                  <Badge variant="pending">{TYPE_LABEL[req.type] ?? req.type}</Badge>
                </div>
                <p className="text-[#6B7280] text-xs mt-0.5">
                  Turno: {fmtDatetime(shift?.starts_at)} – {fmtDatetime(shift?.ends_at)}
                  {shift?.rooms?.name ? ` · ${shift.rooms.name}` : ''}
                </p>
              </div>
            </div>

            {/* Model note */}
            {req.model_note && (
              <div className="mb-3 p-3 rounded-lg bg-white/4 border border-white/8">
                <p className="text-xs text-[#6B7280] mb-0.5">Nota de la modelo</p>
                <p className="text-[#F5F0E8] text-sm">{req.model_note}</p>
              </div>
            )}

            {/* Requested times */}
            {req.type !== 'cancel' && req.requested_start && (
              <div className="mb-3 p-3 rounded-lg bg-white/4 border border-white/8">
                <p className="text-xs text-[#6B7280] mb-0.5">Propone</p>
                <p className="text-[#F5F0E8] text-sm">
                  {fmtDatetime(req.requested_start)} – {fmtDatetime(req.requested_end)}
                </p>
              </div>
            )}

            {/* Reject note field */}
            {rejectingId === req.id && (
              <textarea
                rows={2}
                placeholder="Motivo del rechazo (opcional)…"
                value={rejectNote}
                onChange={(e) => setRejectNote(e.target.value)}
                className="input-base w-full resize-none text-sm mb-3"
              />
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-3 border-t border-white/5">
              {rejectingId === req.id ? (
                <>
                  <Button
                    variant="danger"
                    size="sm"
                    disabled={saving}
                    onClick={() => handle(req, 'rejected')}
                    className="flex-1 gap-1"
                  >
                    <XCircle size={14} /> Confirmar rechazo
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => { setRejectingId(null); setRejectNote('') }}
                  >
                    Volver
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={saving}
                    onClick={() => handle(req, 'approved')}
                    className="flex-1 gap-1 !text-emerald-400 hover:!text-emerald-300"
                  >
                    <CheckCircle size={14} /> Aprobar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={saving}
                    onClick={() => setRejectingId(req.id)}
                    className="flex-1 gap-1 !text-red-400 hover:!text-red-300"
                  >
                    <XCircle size={14} /> Rechazar
                  </Button>
                </>
              )}
            </div>
          </Card>
        )
      })}
    </div>
  )
}
