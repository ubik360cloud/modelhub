import { useState, useMemo } from 'react'
import { Trash2, ChevronUp, ChevronDown } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useEarningsStore } from '../../store/earningsStore'
import { formatDate, formatAmount } from '../../lib/utils'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'

function SortIcon({ field, sortField, sortDir }) {
  if (sortField !== field) return <ChevronUp size={12} className="opacity-20" />
  return sortDir === 'asc' ? (
    <ChevronUp size={12} className="text-[#C9A96E]" />
  ) : (
    <ChevronDown size={12} className="text-[#C9A96E]" />
  )
}

export default function EarningsTable() {
  const { user } = useAuth()
  const earnings = useEarningsStore((s) => s.earnings)
  const deleteEarning = useEarningsStore((s) => s.deleteEarning)
  const loading = useEarningsStore((s) => s.loading)

  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [platformFilter, setPlatformFilter] = useState('')
  const [currencyFilter, setCurrencyFilter] = useState('')
  const [sortField, setSortField] = useState('date')
  const [sortDir, setSortDir] = useState('desc')
  const [deletingId, setDeletingId] = useState(null)
  const [confirmId, setConfirmId] = useState(null)

  const platforms = useMemo(() => {
    const unique = [...new Set(earnings.map((e) => e.platform))].sort()
    return unique
  }, [earnings])

  const filtered = useMemo(() => {
    let rows = [...earnings]
    if (fromDate) rows = rows.filter((e) => e.date >= fromDate)
    if (toDate) rows = rows.filter((e) => e.date <= toDate)
    if (platformFilter) rows = rows.filter((e) => e.platform === platformFilter)
    if (currencyFilter) rows = rows.filter((e) => e.currency === currencyFilter)

    rows.sort((a, b) => {
      let va = a[sortField]
      let vb = b[sortField]
      if (sortField === 'amount') {
        va = Number(va)
        vb = Number(vb)
      }
      if (va < vb) return sortDir === 'asc' ? -1 : 1
      if (va > vb) return sortDir === 'asc' ? 1 : -1
      return 0
    })
    return rows
  }, [earnings, fromDate, toDate, platformFilter, currencyFilter, sortField, sortDir])

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDir('desc')
    }
  }

  const handleDelete = async (id) => {
    setDeletingId(id)
    await deleteEarning(id)
    setDeletingId(null)
    setConfirmId(null)
  }

  const clearFilters = () => {
    setFromDate('')
    setToDate('')
    setPlatformFilter('')
    setCurrencyFilter('')
  }

  const hasFilters = fromDate || toDate || platformFilter || currencyFilter

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-[#6B7280] text-sm">
        Cargando historial...
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-[#6B7280] text-xs mb-1">Desde</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="input-base text-sm h-9 px-2"
            />
          </div>
          <div>
            <label className="block text-[#6B7280] text-xs mb-1">Hasta</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="input-base text-sm h-9 px-2"
            />
          </div>
          <div>
            <label className="block text-[#6B7280] text-xs mb-1">Plataforma</label>
            <select
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value)}
              className="input-base text-sm h-9 px-2"
            >
              <option value="">Todas</option>
              {platforms.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[#6B7280] text-xs mb-1">Moneda</label>
            <select
              value={currencyFilter}
              onChange={(e) => setCurrencyFilter(e.target.value)}
              className="input-base text-sm h-9 px-2"
            >
              <option value="">Todas</option>
              <option value="USD">USD</option>
              <option value="COP">COP</option>
            </select>
          </div>
        </div>
        {hasFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="mt-2 text-xs text-[#6B7280] hover:text-[#F5F0E8] transition-colors"
          >
            Limpiar filtros
          </button>
        )}
      </Card>

      {/* Results count */}
      <p className="text-[#6B7280] text-sm px-1">
        {filtered.length} {filtered.length === 1 ? 'registro' : 'registros'}
      </p>

      {filtered.length === 0 ? (
        <Card className="py-12 text-center">
          <p className="text-[#6B7280] text-sm">
            {earnings.length === 0
              ? 'Aún no tienes ganancias registradas.'
              : 'Ningún resultado con los filtros aplicados.'}
          </p>
        </Card>
      ) : (
        <>
          {/* Mobile cards */}
          <div className="lg:hidden space-y-2">
            {filtered.map((e) => (
              <Card key={e.id} padding={false} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[#F5F0E8] font-medium truncate">{e.platform}</p>
                    <p className="text-[#6B7280] text-xs mt-0.5">{formatDate(e.date)}</p>
                    {e.notes && (
                      <p className="text-[#6B7280] text-xs mt-1 truncate">{e.notes}</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <p className="text-[#C9A96E] font-semibold">
                      {formatAmount(e.amount, e.currency)}
                    </p>
                    <Badge variant={e.currency === 'USD' ? 'basic' : 'scheduled'}>
                      {e.currency}
                    </Badge>
                  </div>
                </div>
                <div className="mt-3 flex justify-end">
                  {confirmId === e.id ? (
                    <div className="flex items-center gap-2">
                      <span className="text-[#6B7280] text-xs">¿Eliminar?</span>
                      <Button
                        variant="danger"
                        size="sm"
                        disabled={deletingId === e.id}
                        onClick={() => handleDelete(e.id)}
                      >
                        {deletingId === e.id ? '...' : 'Sí'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setConfirmId(null)}
                      >
                        No
                      </Button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmId(e.id)}
                      className="text-[#6B7280] hover:text-red-400 transition-colors p-1"
                    >
                      <Trash2 size={15} strokeWidth={1.75} />
                    </button>
                  )}
                </div>
              </Card>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden lg:block">
            <Card padding={false} className="overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    {[
                      { label: 'Fecha', field: 'date' },
                      { label: 'Plataforma', field: 'platform' },
                      { label: 'Monto', field: 'amount' },
                      { label: 'Moneda', field: 'currency' },
                      { label: 'Notas', field: null },
                    ].map(({ label, field }) => (
                      <th
                        key={label}
                        className={`px-4 py-3 text-left text-xs font-medium text-[#6B7280] ${
                          field ? 'cursor-pointer select-none hover:text-[#F5F0E8]' : ''
                        }`}
                        onClick={() => field && toggleSort(field)}
                      >
                        <span className="inline-flex items-center gap-1">
                          {label}
                          {field && (
                            <SortIcon
                              field={field}
                              sortField={sortField}
                              sortDir={sortDir}
                            />
                          )}
                        </span>
                      </th>
                    ))}
                    <th className="px-4 py-3 w-10" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {filtered.map((e) => (
                    <tr
                      key={e.id}
                      className="hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-4 py-3 text-[#6B7280] whitespace-nowrap">
                        {formatDate(e.date)}
                      </td>
                      <td className="px-4 py-3 text-[#F5F0E8]">{e.platform}</td>
                      <td className="px-4 py-3 text-[#C9A96E] font-medium whitespace-nowrap">
                        {formatAmount(e.amount, e.currency)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={e.currency === 'USD' ? 'basic' : 'scheduled'}>
                          {e.currency}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-[#6B7280] max-w-[200px] truncate">
                        {e.notes ?? '—'}
                      </td>
                      <td className="px-4 py-3">
                        {confirmId === e.id ? (
                          <div className="flex items-center gap-1">
                            <Button
                              variant="danger"
                              size="sm"
                              disabled={deletingId === e.id}
                              onClick={() => handleDelete(e.id)}
                            >
                              {deletingId === e.id ? '...' : 'Eliminar'}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setConfirmId(null)}
                            >
                              No
                            </Button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmId(e.id)}
                            className="text-[#6B7280] hover:text-red-400 transition-colors p-1"
                          >
                            <Trash2 size={15} strokeWidth={1.75} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
