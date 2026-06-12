export function formatCOP(amount) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatUSD(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatAmount(amount, currency = 'USD') {
  return currency === 'COP' ? formatCOP(amount) : formatUSD(amount)
}

export function formatDate(dateString) {
  if (!dateString) return ''
  // T12:00:00 keeps us at noon local so the date never flips due to timezone
  return new Date(dateString + 'T12:00:00').toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function formatDateLong(dateString) {
  if (!dateString) return ''
  return new Date(dateString + 'T12:00:00').toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

// Always returns the LOCAL date as YYYY-MM-DD — matches browser date inputs
export function todayISO() {
  const d = new Date()
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-')
}

// Local first and last day of the current month as YYYY-MM-DD
export function currentMonthRange() {
  const d = new Date()
  const y = d.getFullYear()
  const m = d.getMonth() + 1
  const lastDay = new Date(y, m, 0).getDate()
  return {
    from: `${y}-${String(m).padStart(2, '0')}-01`,
    to:   `${y}-${String(m).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`,
  }
}

export function monthLabel(isoDate) {
  if (!isoDate) return ''
  const raw = new Date(isoDate + 'T12:00:00').toLocaleDateString('es-CO', {
    month: 'long',
    year: 'numeric',
  })
  return raw.charAt(0).toUpperCase() + raw.slice(1)
}

// Converts DD/MM/YYYY, MM/DD/YYYY, or already YYYY-MM-DD → YYYY-MM-DD
export function normalizeDate(raw) {
  if (!raw) return null
  const s = String(raw).trim()
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(s)) {
    const [a, b, y] = s.split('/')
    // If first segment > 12 it must be a day (DD/MM/YYYY)
    if (parseInt(a, 10) > 12)
      return `${y}-${b.padStart(2, '0')}-${a.padStart(2, '0')}`
    return `${y}-${a.padStart(2, '0')}-${b.padStart(2, '0')}`
  }
  return null
}
