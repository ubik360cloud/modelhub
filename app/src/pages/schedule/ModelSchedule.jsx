import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Calendar, Clock } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useScheduleStore } from '../../store/scheduleStore'
import ShiftChangeRequest from './ShiftChangeRequest'
import PageWrapper from '../../components/ui/PageWrapper'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'

function getWeekRange(offset = 0) {
  const now = new Date()
  const day = now.getDay()
  const monday = new Date(now)
  monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1) + offset * 7)
  monday.setHours(0, 0, 0, 0)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  sunday.setHours(23, 59, 59, 999)
  return { from: monday, to: sunday }
}

function weekLabel(from, to) {
  const f = from.toLocaleDateString('es-CO', { day: 'numeric' })
  const t = to.toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })
  return `${f} – ${t}`
}

function groupByDay(shifts) {
  const groups = {}
  for (const s of shifts) {
    const d = new Date(s.starts_at)
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
    if (!groups[key]) groups[key] = []
    groups[key].push(s)
  }
  return groups
}

function timeRange(starts_at, ends_at) {
  const o = { hour: '2-digit', minute: '2-digit', hour12: false }
  return `${new Date(starts_at).toLocaleTimeString('es-CO', o)} – ${new Date(ends_at).toLocaleTimeString('es-CO', o)}`
}

function dayHeading(key) {
  const raw = new Date(key + 'T12:00:00').toLocaleDateString('es-CO', {
    weekday: 'long', day: 'numeric', month: 'long',
  })
  return raw.charAt(0).toUpperCase() + raw.slice(1)
}

const STATUS_LABEL = {
  scheduled:        'Programado',
  confirmed:        'Confirmado',
  change_requested: 'Cambio pendiente',
  cancelled:        'Cancelado',
  completed:        'Completado',
}

export default function ModelSchedule() {
  const { user } = useAuth()
  const myShifts    = useScheduleStore((s) => s.myShifts)
  const loading     = useScheduleStore((s) => s.loading)
  const fetchMyShifts = useScheduleStore((s) => s.fetchMyShifts)

  const [weekOffset, setWeekOffset]       = useState(0)
  const [selectedShift, setSelectedShift] = useState(null)

  const { from, to } = getWeekRange(weekOffset)

  useEffect(() => {
    if (user) fetchMyShifts(user.id, from, to)
  }, [user, weekOffset])

  const grouped = groupByDay(myShifts)
  const days    = Object.keys(grouped).sort()

  return (
    <PageWrapper>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl font-normal text-[#F5F0E8]">Mi Turno</h1>
          <p className="text-[#6B7280] text-sm mt-1">
            {myShifts.length > 0
              ? `${myShifts.length} turno${myShifts.length !== 1 ? 's' : ''} esta semana`
              : 'Sin turnos esta semana'}
          </p>
        </div>
      </div>

      {/* Week navigator */}
      <div className="flex items-center justify-between mb-5 p-3 rounded-xl bg-white/4 border border-white/8">
        <button
          onClick={() => setWeekOffset((w) => w - 1)}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-[#6B7280] hover:text-[#F5F0E8] hover:bg-white/8 transition-all"
        >
          <ChevronLeft size={18} />
        </button>
        <span className="text-[#F5F0E8] text-sm font-medium">{weekLabel(from, to)}</span>
        <button
          onClick={() => setWeekOffset((w) => w + 1)}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-[#6B7280] hover:text-[#F5F0E8] hover:bg-white/8 transition-all"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-[#C9A96E]/30 border-t-[#C9A96E] rounded-full animate-spin" />
        </div>
      )}

      {/* Empty state */}
      {!loading && days.length === 0 && (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center">
            <Calendar size={28} className="text-blue-400" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-[#F5F0E8] font-medium mb-1">Sin turnos esta semana</p>
            <p className="text-[#6B7280] text-sm max-w-xs">
              Cuando un estudio te asigne un turno, aparecerá aquí. Navega a la semana siguiente para ver turnos futuros.
            </p>
          </div>
        </div>
      )}

      {/* Shifts grouped by day */}
      {!loading && days.map((day) => (
        <div key={day} className="mb-6">
          <h3 className="text-[#6B7280] text-xs uppercase tracking-wider mb-3">
            {dayHeading(day)}
          </h3>
          <div className="space-y-3">
            {grouped[day].map((shift) => (
              <Card key={shift.id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <Badge variant={shift.status}>{STATUS_LABEL[shift.status] ?? shift.status}</Badge>
                    </div>
                    <p className="text-[#F5F0E8] font-medium text-sm mb-0.5">
                      {shift.studios?.name ?? 'Estudio'}
                    </p>
                    <div className="flex items-center gap-1 text-[#6B7280] text-xs">
                      <Clock size={12} strokeWidth={1.75} />
                      <span>{timeRange(shift.starts_at, shift.ends_at)}</span>
                    </div>
                    {shift.rooms?.name && (
                      <p className="text-[#6B7280] text-xs mt-0.5">Sala: {shift.rooms.name}</p>
                    )}
                    {shift.notes && (
                      <p className="text-[#6B7280] text-xs mt-1 italic">{shift.notes}</p>
                    )}
                  </div>

                  {shift.status !== 'cancelled' && shift.status !== 'completed' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedShift(shift)}
                      className="flex-shrink-0 text-[10px]"
                    >
                      Solicitar cambio
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      ))}

      {/* Change request modal */}
      {selectedShift && (
        <ShiftChangeRequest
          shift={selectedShift}
          onClose={() => setSelectedShift(null)}
          onSuccess={() => setSelectedShift(null)}
        />
      )}
    </PageWrapper>
  )
}
