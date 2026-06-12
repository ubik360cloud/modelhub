import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import { USD_TO_COP as FALLBACK_RATE } from '../lib/goalCalculator'

export const useSettingsStore = create((set, get) => ({
  exchangeRate:   FALLBACK_RATE,
  rateUpdatedAt:  null,
  loaded:         false,

  fetchSettings: async () => {
    if (get().loaded) return
    const { data } = await supabase
      .from('app_settings')
      .select('key, value, updated_at')

    if (data) {
      const rateSetting = data.find((s) => s.key === 'usd_to_cop')
      if (rateSetting) {
        set({
          exchangeRate:  parseInt(rateSetting.value, 10),
          rateUpdatedAt: rateSetting.updated_at,
          loaded:        true,
        })
        return
      }
    }
    set({ loaded: true })
  },
}))
