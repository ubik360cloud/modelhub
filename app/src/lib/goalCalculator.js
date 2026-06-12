export const USD_TO_COP = 4100

export function toUSD(amount, currency) {
  return currency === 'COP' ? amount / USD_TO_COP : Number(amount)
}

export function toCurrency(amountUSD, currency) {
  return currency === 'COP' ? amountUSD * USD_TO_COP : amountUSD
}

/**
 * Pure projection calculator for a goal.
 *
 * @param {object} params
 * @param {number} params.target_amount       - Goal target (in goal's currency)
 * @param {string} params.currency            - 'COP' or 'USD'
 * @param {number} params.savings_pct         - % of income to save (10–80)
 * @param {number} params.avg_monthly_income_usd - Average monthly USD income
 * @param {number} [params.current_saved]     - Amount already saved (in goal's currency)
 */
export function calculateGoal({
  target_amount,
  currency,
  savings_pct,
  avg_monthly_income_usd,
  current_saved = 0,
}) {
  const targetUSD   = toUSD(target_amount, currency)
  const savedUSD    = toUSD(current_saved,  currency)
  const remainingUSD = Math.max(targetUSD - savedUSD, 0)

  const monthlySavingUSD = avg_monthly_income_usd * (savings_pct / 100)

  const pct_complete =
    targetUSD > 0 ? Math.min(Math.round((savedUSD / targetUSD) * 100), 100) : 0

  if (monthlySavingUSD <= 0 || remainingUSD <= 0) {
    return {
      monthly_saving_usd: monthlySavingUSD,
      monthly_saving_cop: monthlySavingUSD * USD_TO_COP,
      months_to_complete: remainingUSD <= 0 ? 0 : null,
      completion_date:    remainingUSD <= 0 ? null : null,
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
    monthly_saving_cop: monthlySavingUSD * USD_TO_COP,
    months_to_complete: months,
    completion_date,
    pct_complete,
  }
}
