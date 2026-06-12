import { create } from 'zustand'
import { supabase } from '../lib/supabase'

export const useEarningsStore = create((set, get) => ({
  earnings: [],
  loading: false,
  error: null,

  fetchEarnings: async (modelId) => {
    set({ loading: true, error: null })
    const { data, error } = await supabase
      .from('earnings')
      .select('*')
      .eq('model_id', modelId)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) {
      set({ error: error.message, loading: false })
    } else {
      set({ earnings: data ?? [], loading: false })
    }
  },

  addEarning: async (modelId, formData) => {
    const { data, error } = await supabase
      .from('earnings')
      .insert({
        model_id: modelId,
        date: formData.date,
        platform: formData.platform,
        amount: parseFloat(formData.amount),
        currency: formData.currency,
        notes: formData.notes?.trim() || null,
        source: 'manual',
      })
      .select()
      .single()

    if (error) return { success: false, error: error.message }

    set((state) => ({ earnings: [data, ...state.earnings] }))
    return { success: true }
  },

  importEarnings: async (modelId, rows, filename) => {
    const { data: importRecord, error: importError } = await supabase
      .from('earnings_imports')
      .insert({ model_id: modelId, filename, status: 'pending' })
      .select()
      .single()

    if (importError) return { success: false, error: importError.message }

    const existingKeys = new Set(
      get().earnings.map((e) => `${e.date}|${e.platform.toLowerCase()}`)
    )

    const toInsert = []
    let skipped = 0

    for (const row of rows) {
      const key = `${row.date}|${(row.platform ?? '').toLowerCase()}`
      if (existingKeys.has(key)) {
        skipped++
      } else {
        toInsert.push({
          model_id: modelId,
          date: row.date,
          platform: row.platform,
          amount: parseFloat(row.amount),
          currency: row.currency ?? 'USD',
          notes: row.notes ?? null,
          source: 'import',
          import_batch: importRecord.id,
        })
      }
    }

    let imported = 0
    if (toInsert.length > 0) {
      const { data: inserted, error: insertError } = await supabase
        .from('earnings')
        .insert(toInsert)
        .select()

      if (insertError) {
        await supabase
          .from('earnings_imports')
          .update({ status: 'failed' })
          .eq('id', importRecord.id)
        return { success: false, error: insertError.message }
      }

      imported = inserted?.length ?? 0
      set((state) => ({
        earnings: [
          ...(inserted ?? []),
          ...state.earnings,
        ].sort((a, b) => (a.date < b.date ? 1 : -1)),
      }))
    }

    await supabase
      .from('earnings_imports')
      .update({ status: 'completed', rows_imported: imported, rows_skipped: skipped })
      .eq('id', importRecord.id)

    return { success: true, imported, skipped }
  },

  deleteEarning: async (id) => {
    const { error } = await supabase.from('earnings').delete().eq('id', id)
    if (error) return { success: false, error: error.message }
    set((state) => ({ earnings: state.earnings.filter((e) => e.id !== id) }))
    return { success: true }
  },

  clear: () => set({ earnings: [], loading: false, error: null }),
}))
