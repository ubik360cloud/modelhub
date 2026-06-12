import { useState, useRef } from 'react'
import Papa from 'papaparse'
import * as XLSX from 'xlsx'
import { Upload, CheckCircle, AlertCircle, FileText } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useEarningsStore } from '../../store/earningsStore'
import { normalizeDate } from '../../lib/utils'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'

const COLUMN_OPTIONS = [
  { value: 'date',     label: 'Fecha' },
  { value: 'platform', label: 'Plataforma' },
  { value: 'amount',   label: 'Monto' },
  { value: 'currency', label: 'Moneda' },
  { value: 'notes',    label: 'Notas' },
  { value: '',         label: 'Ignorar columna' },
]

function detectMapping(headers) {
  const map = {}
  headers.forEach((h) => {
    const lower = h.toLowerCase().trim()
    if (['date', 'fecha', 'day', 'dia', 'día'].includes(lower)) map[h] = 'date'
    else if (['platform', 'plataforma', 'site', 'sitio'].includes(lower)) map[h] = 'platform'
    else if (['amount', 'monto', 'total', 'earnings', 'ganancias', 'revenue'].includes(lower)) map[h] = 'amount'
    else if (['currency', 'moneda'].includes(lower)) map[h] = 'currency'
    else if (['notes', 'notas', 'note', 'nota', 'comments', 'comentarios'].includes(lower)) map[h] = 'notes'
    else map[h] = ''
  })
  return map
}

function parseFile(file) {
  return new Promise((resolve, reject) => {
    const ext = file.name.split('.').pop().toLowerCase()
    if (ext === 'csv') {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => resolve({ headers: results.meta.fields ?? [], rows: results.data }),
        error: reject,
      })
    } else if (['xlsx', 'xls'].includes(ext)) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const wb = XLSX.read(e.target.result, { type: 'array' })
          const ws = wb.Sheets[wb.SheetNames[0]]
          const data = XLSX.utils.sheet_to_json(ws, { raw: false, defval: '' })
          const headers = data.length > 0 ? Object.keys(data[0]) : []
          resolve({ headers, rows: data })
        } catch (err) {
          reject(err)
        }
      }
      reader.readAsArrayBuffer(file)
    } else {
      reject(new Error('Formato no soportado. Usa .csv o .xlsx'))
    }
  })
}

export default function EarningsImport({ onSuccess }) {
  const { user } = useAuth()
  const importEarnings = useEarningsStore((s) => s.importEarnings)

  const [step, setStep] = useState(1) // 1: upload, 2: mapping, 3: result
  const [file, setFile] = useState(null)
  const [headers, setHeaders] = useState([])
  const [preview, setPreview] = useState([])
  const [mapping, setMapping] = useState({})
  const [dragging, setDragging] = useState(false)
  const [parsing, setParsing] = useState(false)
  const [importing, setImporting] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const inputRef = useRef()

  const handleFile = async (f) => {
    if (!f) return
    setError('')
    setParsing(true)
    try {
      const { headers: h, rows } = await parseFile(f)
      setFile(f)
      setHeaders(h)
      setPreview(rows.slice(0, 5))
      setMapping(detectMapping(h))
      setStep(2)
    } catch (err) {
      setError(err.message ?? 'No se pudo leer el archivo.')
    } finally {
      setParsing(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  const handleImport = async () => {
    const dateCol = Object.keys(mapping).find((h) => mapping[h] === 'date')
    const amountCol = Object.keys(mapping).find((h) => mapping[h] === 'amount')
    const platformCol = Object.keys(mapping).find((h) => mapping[h] === 'platform')

    if (!dateCol) return setError('Debes indicar cuál columna es la fecha.')
    if (!amountCol) return setError('Debes indicar cuál columna es el monto.')
    if (!platformCol) return setError('Debes indicar cuál columna es la plataforma.')

    const currencyCol = Object.keys(mapping).find((h) => mapping[h] === 'currency')
    const notesCol = Object.keys(mapping).find((h) => mapping[h] === 'notes')

    const rows = []
    for (const row of preview.concat(/* all rows from parse — stored in ref */ [])) {
      const date = normalizeDate(row[dateCol])
      const amount = parseFloat(String(row[amountCol]).replace(/[^0-9.]/g, ''))
      if (!date || isNaN(amount) || amount <= 0) continue
      rows.push({
        date,
        platform: String(row[platformCol] ?? '').trim() || 'Desconocida',
        amount,
        currency: currencyCol ? String(row[currencyCol] ?? 'USD').toUpperCase() : 'USD',
        notes: notesCol ? String(row[notesCol] ?? '').trim() || null : null,
      })
    }

    if (rows.length === 0) {
      return setError('No se encontraron filas válidas con los datos mapeados.')
    }

    setImporting(true)
    const res = await importEarnings(user.id, rows, file.name)
    setImporting(false)

    if (res.success) {
      setResult(res)
      setStep(3)
    } else {
      setError(res.error ?? 'Error al importar.')
    }
  }

  // Step 2 uses full parsed rows — keep them in state
  const [allRows, setAllRows] = useState([])

  const handleFileWithRows = async (f) => {
    if (!f) return
    setError('')
    setParsing(true)
    try {
      const { headers: h, rows } = await parseFile(f)
      setFile(f)
      setHeaders(h)
      setPreview(rows.slice(0, 5))
      setAllRows(rows)
      setMapping(detectMapping(h))
      setStep(2)
    } catch (err) {
      setError(err.message ?? 'No se pudo leer el archivo.')
    } finally {
      setParsing(false)
    }
  }

  const handleImportFull = async () => {
    const dateCol = Object.keys(mapping).find((h) => mapping[h] === 'date')
    const amountCol = Object.keys(mapping).find((h) => mapping[h] === 'amount')
    const platformCol = Object.keys(mapping).find((h) => mapping[h] === 'platform')

    if (!dateCol) return setError('Debes indicar cuál columna es la fecha.')
    if (!amountCol) return setError('Debes indicar cuál columna es el monto.')
    if (!platformCol) return setError('Debes indicar cuál columna es la plataforma.')

    const currencyCol = Object.keys(mapping).find((h) => mapping[h] === 'currency')
    const notesCol = Object.keys(mapping).find((h) => mapping[h] === 'notes')

    const rows = []
    for (const row of allRows) {
      const date = normalizeDate(row[dateCol])
      const amount = parseFloat(String(row[amountCol]).replace(/[^0-9.]/g, ''))
      if (!date || isNaN(amount) || amount <= 0) continue
      const cur = currencyCol
        ? String(row[currencyCol] ?? 'USD').toUpperCase()
        : 'USD'
      rows.push({
        date,
        platform: String(row[platformCol] ?? '').trim() || 'Desconocida',
        amount,
        currency: ['USD', 'COP'].includes(cur) ? cur : 'USD',
        notes: notesCol ? String(row[notesCol] ?? '').trim() || null : null,
      })
    }

    if (rows.length === 0) {
      return setError('No se encontraron filas válidas con los datos mapeados.')
    }

    setImporting(true)
    const res = await importEarnings(user.id, rows, file.name)
    setImporting(false)

    if (res.success) {
      setResult(res)
      setStep(3)
    } else {
      setError(res.error ?? 'Error al importar.')
    }
  }

  // ── Step 1: Upload ────────────────────────────────────────────────────────

  if (step === 1) {
    return (
      <div className="space-y-4">
        {error && (
          <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        <Card padding={false}>
          <div
            className={`flex flex-col items-center justify-center gap-4 p-10 rounded-lg border-2 border-dashed transition-colors cursor-pointer ${
              dragging
                ? 'border-[#C9A96E] bg-[#C9A96E]/5'
                : 'border-white/[0.12] hover:border-white/[0.24]'
            }`}
            onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              className="hidden"
              onChange={(e) => handleFileWithRows(e.target.files[0])}
            />
            <Upload size={32} className="text-[#6B7280]" strokeWidth={1.5} />
            <div className="text-center">
              <p className="text-[#F5F0E8] text-sm font-medium">
                {parsing ? 'Leyendo archivo...' : 'Arrastra tu archivo aquí'}
              </p>
              <p className="text-[#6B7280] text-xs mt-1">
                o toca para seleccionar · .csv o .xlsx
              </p>
            </div>
          </div>
        </Card>

        <p className="text-[#6B7280] text-xs text-center px-4">
          Tu archivo debe tener columnas para fecha, plataforma y monto. Puedes
          asignar las columnas en el siguiente paso.
        </p>
      </div>
    )
  }

  // ── Step 2: Column mapping ────────────────────────────────────────────────

  if (step === 2) {
    return (
      <div className="space-y-4">
        {error && (
          <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        <Card>
          <div className="flex items-center gap-3 mb-4">
            <FileText size={18} className="text-[#C9A96E]" strokeWidth={1.75} />
            <p className="text-[#F5F0E8] text-sm font-medium truncate">{file?.name}</p>
            <p className="text-[#6B7280] text-xs flex-shrink-0">
              {allRows.length} filas
            </p>
          </div>

          <h3 className="text-[#F5F0E8] text-sm font-medium mb-3">
            Asigna las columnas
          </h3>
          <div className="space-y-2">
            {headers.map((h) => (
              <div key={h} className="flex items-center gap-3">
                <span className="text-[#6B7280] text-sm w-32 flex-shrink-0 truncate">
                  {h}
                </span>
                <select
                  value={mapping[h] ?? ''}
                  onChange={(e) =>
                    setMapping((prev) => ({ ...prev, [h]: e.target.value }))
                  }
                  className="input-base text-sm h-9 flex-1"
                >
                  {COLUMN_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </Card>

        {/* Preview */}
        <Card padding={false} className="overflow-x-auto">
          <p className="text-[#6B7280] text-xs px-4 pt-3 pb-2">
            Vista previa (primeras {preview.length} filas)
          </p>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {headers.map((h) => (
                  <th
                    key={h}
                    className="px-3 py-2 text-left text-[#6B7280] whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {preview.map((row, i) => (
                <tr key={i} className="border-b border-white/[0.04]">
                  {headers.map((h) => (
                    <td key={h} className="px-3 py-2 text-[#F5F0E8] whitespace-nowrap">
                      {String(row[h] ?? '')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <div className="flex gap-3">
          <Button
            variant="ghost"
            size="md"
            onClick={() => { setStep(1); setError('') }}
          >
            Volver
          </Button>
          <Button
            variant="primary"
            size="md"
            className="flex-1"
            disabled={importing}
            onClick={handleImportFull}
          >
            {importing ? 'Importando...' : `Importar ${allRows.length} registros`}
          </Button>
        </div>
      </div>
    )
  }

  // ── Step 3: Result ────────────────────────────────────────────────────────

  return (
    <Card className="flex flex-col items-center gap-4 py-10 text-center">
      <CheckCircle size={44} className="text-emerald-400" strokeWidth={1.5} />
      <div>
        <p className="text-[#F5F0E8] font-medium text-lg">Importación completa</p>
        <p className="text-[#6B7280] text-sm mt-1">
          {result?.imported ?? 0} registros importados ·{' '}
          {result?.skipped ?? 0} duplicados omitidos
        </p>
      </div>
      <Button
        variant="secondary"
        size="md"
        onClick={() => { setStep(1); setFile(null); setResult(null); onSuccess?.() }}
      >
        Ver historial
      </Button>
    </Card>
  )
}
