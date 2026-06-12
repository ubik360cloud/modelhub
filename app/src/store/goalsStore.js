import { create } from 'zustand'
import { supabase } from '../lib/supabase'

export const useGoalsStore = create((set) => ({
  goals: [],
  loading: false,
  error: null,

  fetchGoals: async (modelId) => {
    set({ loading: true, error: null })
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('model_id', modelId)
      .order('created_at', { ascending: false })

    if (error) {
      set({ error: error.message, loading: false })
    } else {
      set({ goals: data ?? [], loading: false })
    }
  },

  addGoal: async (modelId, formData) => {
    const { data, error } = await supabase
      .from('goals')
      .insert({
        model_id:      modelId,
        name:          formData.name.trim(),
        type:          formData.type,
        target_amount: parseFloat(formData.target_amount),
        currency:      formData.currency,
        savings_pct:   parseInt(formData.savings_pct, 10),
        manual_income: formData.manual_income ? parseFloat(formData.manual_income) : null,
        notes:         formData.notes?.trim() || null,
      })
      .select()
      .single()

    if (error) return { success: false, error: error.message }
    set((state) => ({ goals: [data, ...state.goals] }))
    return { success: true }
  },

  updateGoal: async (id, formData) => {
    const { data, error } = await supabase
      .from('goals')
      .update({
        name:          formData.name.trim(),
        type:          formData.type,
        target_amount: parseFloat(formData.target_amount),
        currency:      formData.currency,
        savings_pct:   parseInt(formData.savings_pct, 10),
        manual_income: formData.manual_income ? parseFloat(formData.manual_income) : null,
        notes:         formData.notes?.trim() || null,
        updated_at:    new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) return { success: false, error: error.message }
    set((state) => ({
      goals: state.goals.map((g) => (g.id === id ? data : g)),
    }))
    return { success: true }
  },

  markComplete: async (id) => {
    const { data, error } = await supabase
      .from('goals')
      .update({ is_completed: true, completed_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) return { success: false, error: error.message }
    set((state) => ({
      goals: state.goals.map((g) => (g.id === id ? data : g)),
    }))
    return { success: true }
  },

  deleteGoal: async (id) => {
    const { error } = await supabase.from('goals').delete().eq('id', id)
    if (error) return { success: false, error: error.message }
    set((state) => ({ goals: state.goals.filter((g) => g.id !== id) }))
    return { success: true }
  },
}))
