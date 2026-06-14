import { create } from 'zustand'
import { supabase } from '../lib/supabase'

export const useScheduleStore = create((set, get) => ({
  myShifts:        [],
  studio:          null,
  rooms:           [],
  linkedModels:    [],
  studioShifts:    [],
  pendingRequests: [],
  loading:         false,
  studioLoaded:    false,

  // ── MODEL: fetch own shifts for a date range ─────────────────────────────
  fetchMyShifts: async (userId, from, to) => {
    set({ loading: true })
    const { data } = await supabase
      .from('shifts')
      .select(`
        id, starts_at, ends_at, status, notes,
        studios!studio_id (id, name, city, coordinator_id),
        rooms!room_id (id, name)
      `)
      .eq('model_id', userId)
      .gte('starts_at', from.toISOString())
      .lte('starts_at', to.toISOString())
      .order('starts_at')

    set({ myShifts: data ?? [], loading: false })
  },

  // ── MODEL: submit a change request ───────────────────────────────────────
  requestChange: async (shift, userId, formData) => {
    const { data, error } = await supabase
      .from('shift_change_requests')
      .insert({
        shift_id:          shift.id,
        model_id:          userId,
        type:              formData.type,
        requested_start:   formData.requested_start || null,
        requested_end:     formData.requested_end   || null,
        model_note:        formData.note?.trim()    || null,
        status:            'pending',
      })
      .select()
      .single()

    if (error) return { success: false, error: error.message }

    // Notify studio coordinator
    if (shift.studios?.coordinator_id) {
      const typeLabel =
        formData.type === 'cancel'    ? 'cancelación'   :
        formData.type === 'extend'    ? 'extensión'     : 'cambio de horario'
      await supabase.rpc('notify_user', {
        p_user_id: shift.studios.coordinator_id,
        p_type:    'change_request',
        p_title:   'Solicitud de cambio de turno',
        p_body:    `Solicitud de ${typeLabel} para el turno del ${new Date(shift.starts_at).toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })}`,
        p_data:    { shift_id: shift.id, request_id: data.id },
      })
    }

    return { success: true }
  },

  // ── STUDIO: fetch coordinator's studio ───────────────────────────────────
  fetchStudio: async (coordinatorId) => {
    set({ loading: true })
    const { data } = await supabase
      .from('studios')
      .select('*')
      .eq('coordinator_id', coordinatorId)
      .maybeSingle()

    set({ studio: data ?? null, studioLoaded: true, loading: false })
    return data
  },

  createStudio: async (coordinatorId, formData) => {
    const base = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    const slug = `${base}-${Date.now().toString(36)}`
    const { data, error } = await supabase
      .from('studios')
      .insert({
        coordinator_id: coordinatorId,
        name:           formData.name.trim(),
        slug,
        city:           formData.city?.trim()        || null,
        address:        formData.address?.trim()     || null,
        phone:          formData.phone?.trim()       || null,
        website:        formData.website?.trim()     || null,
        description:    formData.description?.trim() || null,
      })
      .select()
      .single()

    if (error) return { success: false, error: error.message }
    set({ studio: data, studioLoaded: true })
    return { success: true }
  },

  updateStudio: async (studioId, formData) => {
    const { data, error } = await supabase
      .from('studios')
      .update({
        name:        formData.name.trim(),
        city:        formData.city?.trim()        || null,
        address:     formData.address?.trim()     || null,
        phone:       formData.phone?.trim()       || null,
        website:     formData.website?.trim()     || null,
        description: formData.description?.trim() || null,
        updated_at:  new Date().toISOString(),
      })
      .eq('id', studioId)
      .select()
      .single()

    if (error) return { success: false, error: error.message }
    set({ studio: data })
    return { success: true }
  },

  // ── STUDIO: rooms ─────────────────────────────────────────────────────────
  fetchRooms: async (studioId) => {
    const { data } = await supabase
      .from('rooms')
      .select('*')
      .eq('studio_id', studioId)
      .order('name')
    set({ rooms: data ?? [] })
  },

  addRoom: async (studioId, name) => {
    const { data, error } = await supabase
      .from('rooms')
      .insert({ studio_id: studioId, name: name.trim() })
      .select()
      .single()

    if (error) return { success: false, error: error.message }
    set((state) => ({ rooms: [...state.rooms, data] }))
    return { success: true }
  },

  toggleRoom: async (roomId, isActive) => {
    const { data, error } = await supabase
      .from('rooms')
      .update({ is_active: isActive })
      .eq('id', roomId)
      .select()
      .single()

    if (error) return { success: false, error: error.message }
    set((state) => ({ rooms: state.rooms.map((r) => (r.id === roomId ? data : r)) }))
    return { success: true }
  },

  // ── STUDIO: linked models ─────────────────────────────────────────────────
  fetchLinkedModels: async (studioId) => {
    const { data } = await supabase
      .from('studio_models')
      .select(`
        id, status,
        profiles!model_id (id, display_name)
      `)
      .eq('studio_id', studioId)
      .eq('status', 'active')

    set({ linkedModels: data ?? [] })
  },

  // ── STUDIO: week shifts ───────────────────────────────────────────────────
  fetchStudioShifts: async (studioId, from, to) => {
    set({ loading: true })
    const { data } = await supabase
      .from('shifts')
      .select(`
        id, starts_at, ends_at, status, notes,
        profiles!model_id (id, display_name),
        rooms!room_id (id, name)
      `)
      .eq('studio_id', studioId)
      .gte('starts_at', from.toISOString())
      .lte('starts_at', to.toISOString())
      .order('starts_at')

    set({ studioShifts: data ?? [], loading: false })
  },

  // ── STUDIO: assign shift ──────────────────────────────────────────────────
  assignShift: async (studioId, coordinatorId, formData) => {
    const { data, error } = await supabase
      .from('shifts')
      .insert({
        studio_id:  studioId,
        model_id:   formData.model_id,
        room_id:    formData.room_id,
        starts_at:  formData.starts_at,
        ends_at:    formData.ends_at,
        notes:      formData.notes?.trim() || null,
        status:     'scheduled',
        created_by: coordinatorId,
      })
      .select(`
        id, starts_at, ends_at, status, notes,
        profiles!model_id (id, display_name),
        rooms!room_id (id, name)
      `)
      .single()

    if (error) return { success: false, error: error.message }

    // Notify model
    await supabase.rpc('notify_user', {
      p_user_id: formData.model_id,
      p_type:    'shift_assigned',
      p_title:   'Nuevo turno asignado',
      p_body:    `Tienes un turno el ${new Date(formData.starts_at).toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })}`,
      p_data:    { shift_id: data.id },
    })

    set((state) => ({ studioShifts: [...state.studioShifts, data] }))
    return { success: true }
  },

  // ── STUDIO: change requests inbox ─────────────────────────────────────────
  fetchPendingRequests: async () => {
    const { data } = await supabase
      .from('shift_change_requests')
      .select(`
        id, shift_id, model_id, type, model_note, status, created_at,
        requested_start, requested_end,
        profiles!shift_change_requests_model_id_fkey (id, display_name),
        shifts!shift_change_requests_shift_id_fkey (
          id, starts_at, ends_at,
          rooms!shifts_room_id_fkey (name)
        )
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    set({ pendingRequests: data ?? [] })
  },

  resolveRequest: async (request, decision, coordinatorNote) => {
    const { error } = await supabase
      .from('shift_change_requests')
      .update({
        status:           decision, // 'approved' | 'rejected'
        coordinator_note: coordinatorNote?.trim() || null,
        resolved_at:      new Date().toISOString(),
      })
      .eq('id', request.id)

    if (error) return { success: false, error: error.message }

    // If approved cancellation → cancel the shift
    if (decision === 'approved' && request.type === 'cancel') {
      await supabase.from('shifts').update({ status: 'cancelled' }).eq('id', request.shift_id)
    }
    // If approved reschedule → update shift times
    if (decision === 'approved' && request.type !== 'cancel' && request.requested_start) {
      await supabase.from('shifts').update({
        starts_at: request.requested_start,
        ends_at:   request.requested_end,
        status:    'scheduled',
      }).eq('id', request.shift_id)
    }

    // Notify model
    const actionLabel = decision === 'approved' ? 'aprobada' : 'rechazada'
    const typeLabel   =
      request.type === 'cancel'  ? 'cancelación'       :
      request.type === 'extend'  ? 'extensión de turno' : 'cambio de horario'
    await supabase.rpc('notify_user', {
      p_user_id: request.model_id,
      p_type:    'request_resolved',
      p_title:   `Solicitud ${actionLabel}`,
      p_body:    `Tu solicitud de ${typeLabel} fue ${actionLabel}${coordinatorNote ? ': ' + coordinatorNote : ''}`,
      p_data:    { shift_id: request.shift_id, request_id: request.id },
    })

    set((state) => ({
      pendingRequests: state.pendingRequests.filter((r) => r.id !== request.id),
    }))
    return { success: true }
  },
}))
