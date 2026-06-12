import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useEarningsStore } from '../../store/earningsStore'
import PageWrapper from '../../components/ui/PageWrapper'
import EarningsForm from './EarningsForm'
import EarningsTable from './EarningsTable'
import EarningsImport from './EarningsImport'
import EarningsCharts from './EarningsCharts'

const TABS = [
  { id: 'register', label: 'Registrar' },
  { id: 'import',   label: 'Importar' },
  { id: 'history',  label: 'Historial' },
  { id: 'charts',   label: 'Gráficas'  },
]

export default function Earnings() {
  const { user } = useAuth()
  const fetchEarnings = useEarningsStore((s) => s.fetchEarnings)
  const earnings = useEarningsStore((s) => s.earnings)
  const loading = useEarningsStore((s) => s.loading)

  const [tab, setTab] = useState('register')

  useEffect(() => {
    if (user && earnings.length === 0 && !loading) {
      fetchEarnings(user.id)
    }
  }, [user])

  return (
    <PageWrapper>
      {/* Tab bar */}
      <div className="flex border-b border-white/[0.06] mb-6 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`flex-1 min-w-[80px] pb-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              tab === t.id
                ? 'border-[#C9A96E] text-[#C9A96E]'
                : 'border-transparent text-[#6B7280] hover:text-[#F5F0E8]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'register' && (
        <EarningsForm onSuccess={() => setTab('history')} />
      )}
      {tab === 'import' && (
        <EarningsImport onSuccess={() => setTab('history')} />
      )}
      {tab === 'history' && <EarningsTable />}
      {tab === 'charts'  && <EarningsCharts />}
    </PageWrapper>
  )
}
