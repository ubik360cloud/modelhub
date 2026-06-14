import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { CheckCircle, XCircle, FileText, ExternalLink, Users, Building2, ChevronDown, ChevronUp } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'
import PageWrapper from '../../components/ui/PageWrapper'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'

// ── Email helper ──────────────────────────────────────────────────────────────

async function sendEmail(to, subject, html) {
  await fetch('/api/send-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ to, subject, html }),
  })
}

// ── Studio Approvals tab ──────────────────────────────────────────────────────

function StudioApprovals() {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded]   = useState(null)
  const [rejectModal, setRejectModal] = useState(null)
  const [rejectNote, setRejectNote]   = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [docUrls, setDocUrls] = useState({})

  useEffect(() => { fetchApplications() }, [])

  async function fetchApplications() {
    setLoading(true)
    const { data } = await supabase
      .from('studio_applications')
      .select('*, profiles(display_name, email)')
      .order('submitted_at', { ascending: false })
    setApplications(data ?? [])
    setLoading(false)
  }

  async function getSignedUrl(path) {
    if (docUrls[path]) { window.open(docUrls[path], '_blank'); return }
    const { data, error } = await supabase.storage
      .from('studio-documents')
      .createSignedUrl(path, 3600)
    if (!error && data?.signedUrl) {
      setDocUrls((prev) => ({ ...prev, [path]: data.signedUrl }))
      window.open(data.signedUrl, '_blank')
    }
  }

  async function handleApprove(app) {
    setActionLoading(true)
    try {
      const slug = app.company_name
        .toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

      // Create studio record
      await supabase.from('studios').insert({
        coordinator_id: app.user_id,
        name: app.company_name,
        slug,
        address: app.address,
        phone: app.phone,
        is_active: true,
      })

      // Update profile role
      await supabase.from('profiles').update({ role: 'studio' }).eq('id', app.user_id)

      // Mark application approved
      await supabase.from('studio_applications')
        .update({ status: 'approved', reviewed_at: new Date().toISOString() })
        .eq('id', app.id)

      // Send approval email
      await sendEmail(
        app.company_email,
        'Tu estudio ha sido aprobado en ModelHub',
        `<p>Hola ${app.manager_name},</p>
         <p>Tu solicitud de registro para <strong>${app.company_name}</strong> ha sido <strong>aprobada</strong>.</p>
         <p>Ya puedes iniciar sesión en <a href="https://app.modelhub.studio">app.modelhub.studio</a> con tu correo y contraseña para comenzar a gestionar tu estudio.</p>
         <p>Bienvenido a ModelHub.</p>`
      )

      setExpanded(null)
      fetchApplications()
    } finally {
      setActionLoading(false)
    }
  }

  async function handleReject() {
    if (!rejectModal) return
    setActionLoading(true)
    try {
      await supabase.from('studio_applications')
        .update({
          status: 'rejected',
          admin_note: rejectNote.trim(),
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', rejectModal.id)

      await sendEmail(
        rejectModal.company_email,
        'Actualización sobre tu solicitud en ModelHub',
        `<p>Hola ${rejectModal.manager_name},</p>
         <p>Lamentamos informarte que tu solicitud de registro para <strong>${rejectModal.company_name}</strong> no pudo ser aprobada en este momento.</p>
         ${rejectNote ? `<p><strong>Motivo:</strong> ${rejectNote}</p>` : ''}
         <p>Si tienes preguntas o deseas más información, escríbenos a <a href="mailto:soporte@modelhub.studio">soporte@modelhub.studio</a>.</p>`
      )

      setRejectModal(null)
      setRejectNote('')
      fetchApplications()
    } finally {
      setActionLoading(false)
    }
  }

  const statusBadge = (s) => {
    if (s === 'approved') return <Badge variant="confirmed">Aprobado</Badge>
    if (s === 'rejected') return <Badge variant="cancelled">Rechazado</Badge>
    return <Badge variant="scheduled">En revisión</Badge>
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-8 h-8 border-2 border-[#C9A96E]/30 border-t-[#C9A96E] rounded-full animate-spin" />
      </div>
    )
  }

  if (applications.length === 0) {
    return (
      <Card className="py-12 text-center">
        <Building2 size={32} className="text-[#6B7280] mx-auto mb-3" strokeWidth={1.5} />
        <p className="text-[#6B7280] text-sm">No hay solicitudes de estudios.</p>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {applications.map((app) => {
        const isOpen = expanded === app.id
        return (
          <Card key={app.id} className="overflow-hidden">
            {/* Row header */}
            <button
              type="button"
              onClick={() => setExpanded(isOpen ? null : app.id)}
              className="w-full flex items-start justify-between gap-3 text-left"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <span className="text-[#F5F0E8] text-sm font-medium">{app.company_name}</span>
                  {statusBadge(app.status)}
                </div>
                <p className="text-[#6B7280] text-xs">{app.company_email}</p>
                <p className="text-[#6B7280] text-[10px] mt-0.5">
                  {new Date(app.submitted_at).toLocaleDateString('es-CO', {
                    day: 'numeric', month: 'short', year: 'numeric',
                  })}
                </p>
              </div>
              {isOpen ? (
                <ChevronUp size={16} className="text-[#6B7280] flex-shrink-0 mt-1" />
              ) : (
                <ChevronDown size={16} className="text-[#6B7280] flex-shrink-0 mt-1" />
              )}
            </button>

            {/* Expanded detail */}
            {isOpen && (
              <div className="mt-4 pt-4 border-t border-white/[0.06] space-y-3">
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                  {[
                    ['Dirección',  app.address],
                    ['Teléfono',   app.phone],
                    ['Gerente',    app.manager_name],
                    ['Contacto gerente', app.manager_contact],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <p className="text-[#6B7280]">{label}</p>
                      <p className="text-[#F5F0E8] mt-0.5">{value || '—'}</p>
                    </div>
                  ))}
                </div>

                {/* Documents */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {app.camara_comercio_path && (
                    <button
                      type="button"
                      onClick={() => getSignedUrl(app.camara_comercio_path)}
                      className="flex items-center gap-1.5 text-[#C9A96E] text-xs hover:text-[#F5F0E8] transition-colors"
                    >
                      <FileText size={13} />
                      Cámara de Comercio
                      <ExternalLink size={11} />
                    </button>
                  )}
                  {app.cedula_path && (
                    <button
                      type="button"
                      onClick={() => getSignedUrl(app.cedula_path)}
                      className="flex items-center gap-1.5 text-[#C9A96E] text-xs hover:text-[#F5F0E8] transition-colors"
                    >
                      <FileText size={13} />
                      Cédula representante
                      <ExternalLink size={11} />
                    </button>
                  )}
                </div>

                {/* Reject note if rejected */}
                {app.status === 'rejected' && app.admin_note && (
                  <div className="bg-red-500/8 border border-red-500/20 rounded-lg p-3">
                    <p className="text-[#6B7280] text-[10px] uppercase tracking-wider mb-1">Motivo de rechazo</p>
                    <p className="text-[#F5F0E8] text-xs">{app.admin_note}</p>
                  </div>
                )}

                {/* Actions — only for pending */}
                {app.status === 'pending' && (
                  <div className="flex gap-2 pt-1">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleApprove(app)}
                      disabled={actionLoading}
                      className="gap-1.5"
                    >
                      <CheckCircle size={14} />
                      Aprobar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => { setRejectModal(app); setRejectNote('') }}
                      disabled={actionLoading}
                      className="gap-1.5 text-red-400 hover:text-red-300"
                    >
                      <XCircle size={14} />
                      Rechazar
                    </Button>
                  </div>
                )}
              </div>
            )}
          </Card>
        )
      })}

      {/* Reject modal */}
      <Modal
        open={!!rejectModal}
        onClose={() => { setRejectModal(null); setRejectNote('') }}
        title={`Rechazar: ${rejectModal?.company_name}`}
        maxWidth="max-w-sm"
      >
        <div className="space-y-4">
          <p className="text-[#6B7280] text-sm">
            Escribe el motivo del rechazo. Se enviará al estudio por correo.
          </p>
          <textarea
            value={rejectNote}
            onChange={(e) => setRejectNote(e.target.value)}
            rows={4}
            className="input-base resize-none"
            placeholder="Motivo (opcional)"
          />
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setRejectModal(null); setRejectNote('') }}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleReject}
              disabled={actionLoading}
              className="flex-1 bg-red-500/80 hover:bg-red-500 border-red-500/50"
            >
              {actionLoading ? 'Enviando...' : 'Confirmar rechazo'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

// ── Users list tab ────────────────────────────────────────────────────────────

function UsersList() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    supabase
      .from('profiles')
      .select('id, display_name, email, role, plan, is_active, created_at')
      .neq('role', 'admin')
      .order('created_at', { ascending: false })
      .then(({ data }) => { setUsers(data ?? []); setLoading(false) })
  }, [])

  async function toggleActive(userId, current) {
    await supabase.from('profiles').update({ is_active: !current }).eq('id', userId)
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, is_active: !current } : u))
    )
  }

  const filtered = filter === 'all'
    ? users
    : users.filter((u) => u.role === filter || (filter === 'studio_pending' && u.role === 'studio_pending'))

  const ROLE_LABEL = { model: 'Modelo', studio: 'Estudio', studio_pending: 'Estudio (pendiente)' }
  const PLAN_LABEL = { basic: 'Básico', premium: 'Premium', free: 'Gratis' }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-8 h-8 border-2 border-[#C9A96E]/30 border-t-[#C9A96E] rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div>
      {/* Filter pills */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {[
          ['all', 'Todos'],
          ['model', 'Modelos'],
          ['studio', 'Estudios'],
          ['studio_pending', 'Pendientes'],
        ].map(([val, label]) => (
          <button
            key={val}
            onClick={() => setFilter(val)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filter === val
                ? 'bg-[#C9A96E]/15 text-[#C9A96E] border border-[#C9A96E]/30'
                : 'bg-white/4 text-[#6B7280] border border-white/8 hover:text-[#F5F0E8]'
            }`}
          >
            {label}
            <span className="ml-1 opacity-60">
              ({val === 'all' ? users.length : users.filter((u) => u.role === val).length})
            </span>
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.map((u) => (
          <Card key={u.id} className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#C9A96E]/15 border border-[#C9A96E]/30 flex items-center justify-center flex-shrink-0">
              <span className="text-[#C9A96E] text-xs font-semibold">
                {u.display_name?.[0]?.toUpperCase() ?? '?'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[#F5F0E8] text-sm truncate">{u.display_name}</p>
              <p className="text-[#6B7280] text-xs truncate">{u.email}</p>
            </div>
            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              <span className="text-[#6B7280] text-[10px]">{ROLE_LABEL[u.role] ?? u.role}</span>
              {u.plan && u.role === 'model' && (
                <span className="text-[#6B7280] text-[10px]">{PLAN_LABEL[u.plan] ?? u.plan}</span>
              )}
            </div>
            <button
              type="button"
              onClick={() => toggleActive(u.id, u.is_active)}
              className={`flex-shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all border ${
                u.is_active
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20'
                  : 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/20'
              }`}
            >
              {u.is_active ? 'Activo' : 'Inactivo'}
            </button>
          </Card>
        ))}
      </div>
    </div>
  )
}

// ── Admin root ────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'approvals', label: 'Solicitudes estudios', icon: Building2 },
  { id: 'users',     label: 'Usuarios',              icon: Users     },
]

export default function Admin() {
  const { profile } = useAuth()
  const [tab, setTab] = useState('approvals')

  if (profile && profile.role !== 'admin') return <Navigate to="/dashboard" replace />

  return (
    <PageWrapper>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-normal text-[#F5F0E8]">Panel de administración</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-white/4 rounded-xl mb-5">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1.5 ${
              tab === t.id
                ? 'bg-[#C9A96E]/15 text-[#C9A96E]'
                : 'text-[#6B7280] hover:text-[#F5F0E8]'
            }`}
          >
            <t.icon size={14} />
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      {tab === 'approvals' && <StudioApprovals />}
      {tab === 'users'     && <UsersList />}
    </PageWrapper>
  )
}
