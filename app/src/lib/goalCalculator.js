// Fallback rate — overridden by the value stored in Supabase app_settings
export const USD_TO_COP = 3490

export function toUSD(amount, currency, exchangeRate = USD_TO_COP) {
  return currency === 'COP' ? amount / exchangeRate : Number(amount)
}

export function toCurrency(amountUSD, currency, exchangeRate = USD_TO_COP) {
  return currency === 'COP' ? amountUSD * exchangeRate : amountUSD
}

/**
 * Pure projection calculator for a goal.
 *
 * @param {object} params
 * @param {number} params.target_amount
 * @param {string} params.currency            'COP' | 'USD'
 * @param {number} params.savings_pct         10–80
 * @param {number} params.avg_monthly_income_usd
 * @param {number} [params.current_saved]
 * @param {number} [params.exchange_rate]     COP per 1 USD (from app_settings)
 */
export function calculateGoal({
  target_amount,
  currency,
  savings_pct,
  avg_monthly_income_usd,
  current_saved  = 0,
  exchange_rate  = USD_TO_COP,
}) {
  const targetUSD    = toUSD(target_amount, currency, exchange_rate)
  const savedUSD     = toUSD(current_saved,  currency, exchange_rate)
  const remainingUSD = Math.max(targetUSD - savedUSD, 0)

  const monthlySavingUSD = avg_monthly_income_usd * (savings_pct / 100)

  const pct_complete =
    targetUSD > 0 ? Math.min(Math.round((savedUSD / targetUSD) * 100), 100) : 0

  if (monthlySavingUSD <= 0 || remainingUSD <= 0) {
    return {
      monthly_saving_usd: monthlySavingUSD,
      monthly_saving_cop: monthlySavingUSD * exchange_rate,
      months_to_complete: remainingUSD <= 0 ? 0 : null,
      completion_date:    null,
      pct_complete,
    }
  }

  const months = Math.ceil(remainingUSD / monthlySavingUSD)

  const d = new Date()
  d.setMonth(d.getMonth() + months)
  const completion_date = [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-')

  return {
    monthly_saving_usd: monthlySavingUSD,
    monthly_saving_cop: monthlySavingUSD * exchange_rate,
    months_to_complete: months,
    completion_date,
    pct_complete,
  }
}
