import { useEffect, useState } from 'react'
import { Target, Plus, ChevronDown, ChevronUp } from 'lucide-react'
import { useGoalsStore } from '../../store/goalsStore'
import { useAuth } from '../../hooks/useAuth'
import GoalCard from '../../components/goals/GoalCard'
import GoalForm from './GoalForm'
import Modal from '../../components/ui/Modal'
import Button from '../../components/ui/Button'
import PageWrapper from '../../components/ui/PageWrapper'

export default function Goals() {
  const { user, profile } = useAuth()
  const goals         = useGoalsStore((s) => s.goals)
  const loading       = useGoalsStore((s) => s.loading)
  const fetchGoals    = useGoalsStore((s) => s.fetchGoals)
  const markComplete  = useGoalsStore((s) => s.markComplete)
  const deleteGoal    = useGoalsStore((s) => s.deleteGoal)

  const [showForm, setShowForm]           = useState(false)
  const [editingGoal, setEditingGoal]     = useState(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)
  const [showCompleted, setShowCompleted] = useState(false)

  useEffect(() => {
    if (user) fetchGoals(user.id)
  }, [user])

  const active    = goals.filter((g) => !g.is_completed)
  const completed = goals.filter((g) => g.is_completed)

  const profileIncomeUSD = profile?.monthly_income_usd ?? 0

  function openNew() {
    setEditingGoal(null)
    setShowForm(true)
  }

  function openEdit(goal) {
    setEditingGoal(goal)
    setShowForm(true)
  }

  async function handleComplete(id) {
    await markComplete(id)
  }

  async function handleDelete(id) {
    await deleteGoal(id)
  }

  return (
    <PageWrapper>
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl font-normal text-[#F5F0E8]">Mis Metas</h1>
          <p className="text-[#6B7280] text-sm mt-1">
            {active.length > 0
              ? `${active.length} meta${active.length !== 1 ? 's' : ''} activa${active.length !== 1 ? 's' : ''}`
              : 'Sin metas activas'}
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={openNew} className="gap-2">
          <Plus size={16} />
          <span className="hidden sm:inline">Nueva meta</span>
          <span className="sm:hidden">Nueva</span>
        </Button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-[#C9A96E]/30 border-t-[#C9A96E] rounded-full animate-spin" />
        </div>
      )}

      {/* Empty state */}
      {!loading && active.length === 0 && completed.length === 0 && (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-[#E8B4B8]/10 flex items-center justify-center">
            <Target size={28} className="text-[#E8B4B8]" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-[#F5F0E8] font-medium mb-1">Aún no tienes metas</p>
            <p className="text-[#6B7280] text-sm max-w-xs">
              Crea tu primera meta financiera y calcula cuánto tiempo necesitas para alcanzarla.
            </p>
          </div>
          <Button variant="primary" onClick={openNew} className="gap-2">
            <Plus size={16} /> Crear primera meta
          </Button>
        </div>
      )}

      {/* Active goals */}
      {!loading && active.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {active.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              monthlyIncomeUSD={profileIncomeUSD}
              onEdit={openEdit}
              onComplete={handleComplete}
              onDelete={handleDelete}
              confirmDeleteId={confirmDeleteId}
              setConfirmDeleteId={setConfirmDeleteId}
            />
          ))}
        </div>
      )}

      {/* Completed goals toggle */}
      {!loading && completed.length > 0 && (
        <div>
          <button
            onClick={() => setShowCompleted((v) => !v)}
            className="flex items-center gap-2 text-[#6B7280] text-sm hover:text-[#F5F0E8] transition-colors mb-4"
          >
            {showCompleted ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            Metas completadas ({completed.length})
          </button>

          {showCompleted && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {completed.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  monthlyIncomeUSD={profileIncomeUSD}
                  onEdit={openEdit}
                  onComplete={handleComplete}
                  onDelete={handleDelete}
                  confirmDeleteId={confirmDeleteId}
                  setConfirmDeleteId={setConfirmDeleteId}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal — create / edit */}
      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={editingGoal ? 'Editar meta' : 'Nueva meta'}
      >
        <GoalForm
          goal={editingGoal}
          userId={user?.id}
          profileIncomeUSD={profileIncomeUSD}
          onSuccess={() => setShowForm(false)}
          onCancel={() => setShowForm(false)}
        />
      </Modal>
    </PageWrapper>
  )
}
