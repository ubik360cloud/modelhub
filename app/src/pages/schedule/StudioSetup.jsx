import { useState, useEffect } from 'react'
import { Plus, ToggleLeft, ToggleRight } from 'lucide-react'
import { useScheduleStore } from '../../store/scheduleStore'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'

export default function StudioSetup({ studio, coordinatorId, onSaved }) {
  const updateStudio = useScheduleStore((s) => s.updateStudio)
  const createStudio = useScheduleStore((s) => s.createStudio)
  const rooms        = useScheduleStore((s) => s.rooms)
  const fetchRooms   = useScheduleStore((s) => s.fetchRooms)
  const addRoom      = useScheduleStore((s) => s.addRoom)
  const toggleRoom   = useScheduleStore((s) => s.toggleRoom)

  const [tab, setTab]           = useState('info')
  const [form, setForm]         = useState({
    name: '', city: '', address: '', phone: '', website: '', description: '',
  })
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState('')
  const [saved, setSaved]       = useState(false)
  const [newRoom, setNewRoom]   = useState('')
  const [addingRoom, setAddingRoom] = useState(false)

  useEffect(() => {
    if (studio) {
      setForm({
        name:        studio.name        ?? '',
        city:        studio.city        ?? '',
        address:     studio.address     ?? '',
        phone:       studio.phone       ?? '',
        website:     studio.website     ?? '',
        description: studio.description ?? '',
      })
      fetchRooms(studio.id)
    }
  }, [studio?.id])

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }))

  async function handleSaveStudio(e) {
    e.preventDefault()
    if (!form.name.trim()) return setError('El nombre del estudio es obligatorio.')
    setSaving(true)
    setError('')
    const result = studio
      ? await updateStudio(studio.id, form)
      : await createStudio(coordinatorId, form)
    setSaving(false)
    if (!result.success) return setError(result.error ?? 'Error al guardar.')
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    if (onSaved) onSaved()
  }

  async function handleAddRoom(e) {
    e.preventDefault()
    if (!newRoom.trim() || !studio) return
    setAddingRoom(true)
    await addRoom(studio.id, newRoom)
    setNewRoom('')
    setAddingRoom(false)
  }

  async function handleToggleRoom(room) {
    await toggleRoom(room.id, !room.is_active)
  }

  const TABS = [
    { id: 'info',  label: 'Estudio' },
    { id: 'rooms', label: `Salas (${rooms.length})` },
  ]

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-white/4 rounded-xl mb-5">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
              tab === t.id
                ? 'bg-[#C9A96E]/15 text-[#C9A96E]'
                : 'text-[#6B7280] hover:text-[#F5F0E8]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Studio info tab */}
      {tab === 'info' && (
        <form onSubmit={handleSaveStudio} className="space-y-4">
          <Input
            label="Nombre del estudio"
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            required
          />
          <Input
            label="Ciudad"
            placeholder="Medellín"
            value={form.city}
            onChange={(e) => set('city', e.target.value)}
          />
          <Input
            label="Dirección"
            placeholder="Calle 123 #45-67"
            value={form.address}
            onChange={(e) => set('address', e.target.value)}
          />
          <Input
            label="Teléfono / WhatsApp"
            placeholder="+57 300 000 0000"
            value={form.phone}
            onChange={(e) => set('phone', e.target.value)}
          />
          <Input
            label="Sitio web (opcional)"
            placeholder="https://…"
            value={form.website}
            onChange={(e) => set('website', e.target.value)}
          />
          <div>
            <p className="text-xs text-[#6B7280] mb-1.5">Descripción (opcional)</p>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              className="input-base w-full resize-none text-sm"
              placeholder="Describe tu estudio…"
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <Button type="submit" variant="primary" disabled={saving} className="w-full">
            {saving ? 'Guardando…' : saved ? '¡Guardado!' : studio ? 'Guardar cambios' : 'Crear estudio'}
          </Button>
        </form>
      )}

      {/* Rooms tab */}
      {tab === 'rooms' && (
        <div>
          {!studio ? (
            <p className="text-[#6B7280] text-sm text-center py-8">
              Primero guarda la información del estudio.
            </p>
          ) : (
            <>
              {/* Add room */}
              <form onSubmit={handleAddRoom} className="flex gap-2 mb-4">
                <input
                  type="text"
                  placeholder="Nombre de la sala…"
                  value={newRoom}
                  onChange={(e) => setNewRoom(e.target.value)}
                  className="input-base flex-1 text-sm"
                />
                <Button type="submit" variant="primary" size="sm" disabled={addingRoom || !newRoom.trim()}>
                  <Plus size={16} />
                </Button>
              </form>

              {/* Rooms list */}
              {rooms.length === 0 ? (
                <p className="text-[#6B7280] text-sm text-center py-8">
                  Aún no hay salas. Agrega la primera.
                </p>
              ) : (
                <div className="space-y-2">
                  {rooms.map((room) => (
                    <Card key={room.id} className="flex items-center justify-between gap-3 !p-3">
                      <span className={`text-sm ${room.is_active ? 'text-[#F5F0E8]' : 'text-[#6B7280] line-through'}`}>
                        {room.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleToggleRoom(room)}
                        className={`flex-shrink-0 transition-colors ${room.is_active ? 'text-emerald-400' : 'text-[#6B7280]'}`}
                        title={room.is_active ? 'Desactivar sala' : 'Activar sala'}
                      >
                        {room.is_active
                          ? <ToggleRight size={22} strokeWidth={1.75} />
                          : <ToggleLeft  size={22} strokeWidth={1.75} />
                        }
                      </button>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
