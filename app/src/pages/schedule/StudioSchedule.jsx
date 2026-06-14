import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Plus, Calendar, Settings, AlertCircle } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useScheduleStore } from '../../store/scheduleStore'
import AssignShift from './AssignShift'
import ChangeRequests from './ChangeRequests'
import StudioSetup from './StudioSetup'
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

const TABS = [
  { id: 'schedule',  label: 'Programación' },
  { id: 'requests',  label: 'Solicitudes'  },
  { id: 'setup',     label: 'Configuración' },
]

export default function StudioSchedule() {
  const { user } = useAuth()
  const studio          = useScheduleStore((s) => s.studio)
  const studioLoaded    = useScheduleStore((s) => s.studioLoaded)
  const studioShifts    = useScheduleStore((s) => s.studioShifts)
  const rooms           = useScheduleStore((s) => s.rooms)
  const linkedModels    = useScheduleStore((s) => s.linkedModels)
  const pendingRequests = useScheduleStore((s) => s.pendingRequests)
  const loading         = useScheduleStore((s) => s.loading)
  const fetchStudio         = useScheduleStore((s) => s.fetchStudio)
  const fetchStudioShifts   = useScheduleStore((s) => s.fetchStudioShifts)
  const fetchRooms          = useScheduleStore((s) => s.fetchRooms)
  const fetchLinkedModels   = useScheduleStore((s) => s.fetchLinkedModels)
  const fetchPendingRequests = useScheduleStore((s) => s.fetchPendingRequests)

  const [tab, setTab]             = useState('schedule')
  const [weekOffset, setWeekOffset] = useState(0)
  const [showAssign, setShowAssign] = useState(false)

  const { from, to } = getWeekRange(weekOffset)

  useEffect(() => {
    if (user) fetchStudio(user.id)
  }, [user])

  useEffect(() => {
    if (!studio) return
    fetchRooms(studio.id)
    fetchLinkedModels(studio.id)
    fetchPendingRequests()
  }, [studio?.id])

  useEffect(() => {
    if (!studio) return
    fetchStudioShifts(studio.id, from, to)
  }, [studio?.id, weekOffset])

  // Studio not created yet
  if (studioLoaded && !studio) {
    return (
      <PageWrapper>
        <div className="mb-6">
          <h1 className="font-heading text-2xl font-normal text-[#F5F0E8]">Programación</h1>
          <p className="text-[#6B7280] text-sm mt-1">Configura tu estudio para comenzar</p>
        </div>
        <StudioSetup
          studio={null}
          coordinatorId={user?.id}
          onSaved={() => fetchStudio(user.id)}
        />
      </PageWrapper>
    )
  }

  const grouped = groupByDay(studioShifts)
  const days    = Object.keys(grouped).sort()

  return (
    <PageWrapper>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="font-heading text-2xl font-normal text-[#F5F0E8]">Programación</h1>
          {studio && <p className="text-[#6B7280] text-sm mt-1">{studio.name}</p>}
        </div>
        {tab === 'schedule' && studio && (
          <Button variant="primary" size="sm" onClick={() => setShowAssign(true)} className="gap-1">
            <Plus size={16} />
            <span className="hidden sm:inline">Asignar turno</span>
            <span className="sm:hidden">Nuevo</span>
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-white/4 rounded-xl mb-5">
        {TABS.map((t) => {
          const badge = t.id === 'requests' && pendingRequests.length > 0
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1.5 ${
                tab === t.id
                  ? 'bg-[#C9A96E]/15 text-[#C9A96E]'
                  : 'text-[#6B7280] hover:text-[#F5F0E8]'
              }`}
            >
              {t.label}
              {badge && (
                <span className="w-4 h-4 rounded-full bg-amber-500 text-[#0D0D0D] text-[9px] font-bold flex items-center justify-center">
                  {pendingRequests.length}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* SCHEDULE TAB */}
      {tab === 'schedule' && (
        <div>
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

          {loading && (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-2 border-[#C9A96E]/30 border-t-[#C9A96E] rounded-full animate-spin" />
            </div>
          )}

          {!loading && days.length === 0 && (
            <div className="flex flex-col items-center gap-4 py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Calendar size={28} className="text-blue-400" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-[#F5F0E8] font-medium mb-1">Sin turnos esta semana</p>
                <p className="text-[#6B7280] text-sm max-w-xs">
                  Usa el botón "Asignar turno" para programar turnos para tus modelos.
                </p>
              </div>
            </div>
          )}

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
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-[#F5F0E8] text-sm font-medium">
                            {shift.profiles?.display_name}
                          </span>
                          <Badge variant={shift.status}>{STATUS_LABEL[shift.status] ?? shift.status}</Badge>
                        </div>
                        <p className="text-[#6B7280] text-xs">
                          {timeRange(shift.starts_at, shift.ends_at)}
                          {shift.rooms?.name ? ` · ${shift.rooms.name}` : ''}
                        </p>
                        {shift.notes && (
                          <p className="text-[#6B7280] text-xs mt-1 italic">{shift.notes}</p>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* REQUESTS TAB */}
      {tab === 'requests' && <ChangeRequests />}

      {/* SETUP TAB */}
      {tab === 'setup' && (
        <StudioSetup
          studio={studio}
          coordinatorId={user?.id}
          onSaved={() => fetchStudio(user.id)}
        />
      )}

      {/* Assign shift modal */}
      {showAssign && studio && (
        <AssignShift
          studio={studio}
          rooms={rooms}
          linkedModels={linkedModels}
          coordinatorId={user?.id}
          onClose={() => setShowAssign(false)}
          onSuccess={() => {
            setShowAssign(false)
            fetchStudioShifts(studio.id, from, to)
          }}
        />
      )}
    </PageWrapper>
  )
}
