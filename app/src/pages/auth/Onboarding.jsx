import { useState, useEffect } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Check, ChevronRight, ChevronLeft, FileText as FileIcon } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'

// ── Constants ────────────────────────────────────────────────────────────────

const PLATFORMS = [
  'Chaturbate',
  'BongaCams',
  'LiveJasmin',
  'OnlyFans',
  'Streamate',
  'Stripchat',
]

const PLANS = [
  {
    id: 'basic',
    name: 'Básico',
    price: '$20',
    period: '/mes',
    badge: '30 días gratis',
    features: [
      'Panel de ganancias',
      'Control de horarios',
      'Seguimiento de metas',
      'Foro de la comunidad',
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '$35',
    period: '/mes',
    badge: '30 días gratis',
    features: [
      'Todo lo de Básico',
      'Análisis avanzados',
      'Soporte prioritario',
      'Tips y recursos exclusivos',
    ],
    highlighted: true,
  },
]

// ── Shared UI helpers ────────────────────────────────────────────────────────

function PageShell({ children }) {
  return (
    <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="font-heading text-3xl font-normal text-[#C9A96E]">
            ModelHub
          </h1>
        </div>
        {children}
      </div>
    </div>
  )
}

function FullScreenSpinner() {
  return (
    <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          border: '2px solid rgba(201,169,110,0.2)',
          borderTopColor: '#C9A96E',
          animation: 'spin 0.8s linear infinite',
        }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

function StepIndicator({ current, total }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={[
            'rounded-full transition-all',
            i < current
              ? 'w-2 h-2 bg-[#C9A96E]'
              : i === current
              ? 'w-6 h-2 bg-[#C9A96E]'
              : 'w-2 h-2 bg-[rgba(255,255,255,0.15)]',
          ].join(' ')}
        />
      ))}
      <span className="text-[#6B7280] text-xs ml-1">
        Paso {current + 1} de {total}
      </span>
    </div>
  )
}

// ── Model onboarding (3 steps) ───────────────────────────────────────────────

function ModelOnboarding({ user, fetchProfile }) {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [selectedPlatforms, setSelectedPlatforms] = useState([])
  const [otherPlatform, setOtherPlatform] = useState('')
  const [income, setIncome] = useState('')
  const [incomeCurrency, setIncomeCurrency] = useState('USD')
  const [selectedPlan, setSelectedPlan] = useState('basic')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const togglePlatform = (platform) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform]
    )
  }

  const handleFinish = async () => {
    setError('')
    setLoading(true)
    try {
      // Insert selected platforms
      const allPlatforms = [...selectedPlatforms]
      if (otherPlatform.trim()) allPlatforms.push(otherPlatform.trim())

      if (allPlatforms.length > 0) {
        const rows = allPlatforms.map((platform) => ({
          model_id: user.id,
          platform_name: platform,
        }))
        const { error: platformError } = await supabase
          .from('model_platforms')
          .insert(rows)
        if (platformError) throw platformError
      }

      // Update profile
      const planStarted = new Date()
      const planEnds = new Date(planStarted.getTime() + 30 * 24 * 60 * 60 * 1000)

      // Convert income to USD if entered in COP (rough conversion using fixed rate;
      // settingsStore is not available here so use a safe fallback)
      const USD_FALLBACK = 3490
      const incomeUSD = income
        ? incomeCurrency === 'COP'
          ? parseFloat(income) / USD_FALLBACK
          : parseFloat(income)
        : 0

      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          onboarding_done: true,
          plan: selectedPlan,
          plan_started_at: planStarted.toISOString(),
          plan_ends_at: planEnds.toISOString(),
          monthly_income_usd: incomeUSD,
        })
        .eq('id', user.id)
      if (profileError) throw profileError

      await fetchProfile(user.id)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Ocurrió un error. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageShell>
      <StepIndicator current={step} total={3} />

      <div className="card-glass p-8">
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm mb-6">
            {error}
          </div>
        )}

        {/* Step 0 — Platforms */}
        {step === 0 && (
          <div>
            <h2 className="font-heading text-xl text-[#F5F0E8] font-normal mb-1">
              ¿En qué plataformas trabajas?
            </h2>
            <p className="text-[#6B7280] text-sm mb-6">
              Selecciona todas las que uses.
            </p>

            <div className="grid grid-cols-2 gap-3 mb-4">
              {PLATFORMS.map((platform) => {
                const selected = selectedPlatforms.includes(platform)
                return (
                  <button
                    key={platform}
                    type="button"
                    onClick={() => togglePlatform(platform)}
                    className={[
                      'flex items-center gap-3 p-3 rounded-lg border text-left transition-all',
                      selected
                        ? 'border-[#C9A96E] bg-[#C9A96E]/10'
                        : 'border-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.2)]',
                    ].join(' ')}
                  >
                    <div
                      className={[
                        'w-4 h-4 rounded flex items-center justify-center flex-shrink-0 border transition-colors',
                        selected
                          ? 'bg-[#C9A96E] border-[#C9A96E]'
                          : 'border-[rgba(255,255,255,0.2)]',
                      ].join(' ')}
                    >
                      {selected && <Check size={10} strokeWidth={3} className="text-[#0D0D0D]" />}
                    </div>
                    <span
                      className={[
                        'text-sm font-medium',
                        selected ? 'text-[#C9A96E]' : 'text-[#F5F0E8]',
                      ].join(' ')}
                    >
                      {platform}
                    </span>
                  </button>
                )
              })}
            </div>

            <div>
              <label className="block text-[#6B7280] text-sm mb-1.5">
                Otra plataforma (opcional)
              </label>
              <input
                type="text"
                value={otherPlatform}
                onChange={(e) => setOtherPlatform(e.target.value)}
                className="input-base"
                placeholder="Nombre de la plataforma"
              />
            </div>
          </div>
        )}

        {/* Step 1 — Income */}
        {step === 1 && (
          <div>
            <h2 className="font-heading text-xl text-[#F5F0E8] font-normal mb-1">
              ¿Cuánto ganas al mes aproximadamente?
            </h2>
            <p className="text-[#6B7280] text-sm mb-1">
              Solo para calcular tus metas.
            </p>
            <p className="text-[#6B7280] text-xs mb-6">
              Solo tú puedes ver esto.
            </p>

            <div className="flex gap-3 mb-4">
              {/* Currency toggle */}
              <div className="flex rounded-lg border border-[rgba(255,255,255,0.08)] overflow-hidden flex-shrink-0">
                {['USD', 'COP'].map((currency) => (
                  <button
                    key={currency}
                    type="button"
                    onClick={() => setIncomeCurrency(currency)}
                    className={[
                      'px-4 py-2.5 text-sm font-medium transition-colors',
                      incomeCurrency === currency
                        ? 'bg-[#C9A96E] text-[#0D0D0D]'
                        : 'text-[#6B7280] hover:text-[#F5F0E8]',
                    ].join(' ')}
                  >
                    {currency}
                  </button>
                ))}
              </div>

              <input
                type="number"
                value={income}
                onChange={(e) => setIncome(e.target.value)}
                className="input-base"
                placeholder={incomeCurrency === 'USD' ? '0.00' : '0'}
                min="0"
              />
            </div>

            <p className="text-[#6B7280] text-xs">
              Puedes actualizar este valor en cualquier momento desde tu perfil.
            </p>
          </div>
        )}

        {/* Step 2 — Plan */}
        {step === 2 && (
          <div>
            <h2 className="font-heading text-xl text-[#F5F0E8] font-normal mb-1">
              Elige tu plan
            </h2>
            <p className="text-[#6B7280] text-sm mb-6">
              Los dos planes incluyen 30 días gratis.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
              {PLANS.map((plan) => {
                const selected = selectedPlan === plan.id
                return (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => setSelectedPlan(plan.id)}
                    className={[
                      'flex flex-col p-5 rounded-xl border text-left transition-all relative',
                      selected
                        ? 'border-[#C9A96E] bg-[#C9A96E]/10'
                        : 'border-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.2)]',
                    ].join(' ')}
                  >
                    {plan.highlighted && (
                      <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-[#C9A96E] text-[#0D0D0D] text-xs font-semibold px-3 py-0.5 rounded-full">
                        Popular
                      </span>
                    )}

                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p
                          className={[
                            'font-medium text-base',
                            selected ? 'text-[#C9A96E]' : 'text-[#F5F0E8]',
                          ].join(' ')}
                        >
                          {plan.name}
                        </p>
                        <p className="text-[#6B7280] text-xs">{plan.badge}</p>
                      </div>
                      <div className="text-right">
                        <span
                          className={[
                            'text-xl font-semibold',
                            selected ? 'text-[#C9A96E]' : 'text-[#F5F0E8]',
                          ].join(' ')}
                        >
                          {plan.price}
                        </span>
                        <span className="text-[#6B7280] text-xs">{plan.period}</span>
                      </div>
                    </div>

                    <ul className="space-y-1.5">
                      {plan.features.map((feat) => (
                        <li
                          key={feat}
                          className="flex items-center gap-2 text-xs text-[#6B7280]"
                        >
                          <Check
                            size={12}
                            strokeWidth={2.5}
                            className={selected ? 'text-[#C9A96E]' : 'text-[#6B7280]'}
                          />
                          {feat}
                        </li>
                      ))}
                    </ul>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className={['flex mt-8', step > 0 ? 'justify-between' : 'justify-end'].join(' ')}>
          {step > 0 && (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              disabled={loading}
              className="btn-gold h-10 px-5 gap-1.5"
            >
              <ChevronLeft size={16} />
              Atrás
            </button>
          )}

          {step < 2 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s + 1)}
              className="btn-gold-filled h-10 px-5 gap-1.5"
            >
              Continuar
              <ChevronRight size={16} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              disabled={loading}
              className="btn-gold-filled h-10 px-5"
            >
              {loading ? 'Guardando...' : 'Comenzar'}
            </button>
          )}
        </div>
      </div>
    </PageShell>
  )
}

// ── Studio application form ───────────────────────────────────────────────────

function StudioOnboarding({ user, fetchProfile }) {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    company_name: '', company_email: '', address: '',
    phone: '', manager_name: '', manager_contact: '',
  })
  const [camaraFile, setCamaraFile]   = useState(null)
  const [cedulaFile, setCedulaFile]   = useState(null)
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState('')

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!camaraFile || !cedulaFile) {
      setError('Debes subir los dos documentos requeridos.')
      return
    }

    setLoading(true)
    try {
      // Upload documents to private storage
      const uploadFile = async (file, name) => {
        const path = `${user.id}/${name}.pdf`
        const { error: upErr } = await supabase.storage
          .from('studio-documents')
          .upload(path, file, { upsert: true })
        if (upErr) throw upErr
        return path
      }

      const [camaraPath, cedulaPath] = await Promise.all([
        uploadFile(camaraFile, 'camara_comercio'),
        uploadFile(cedulaFile, 'cedula'),
      ])

      // Insert application record
      const { error: appErr } = await supabase.from('studio_applications').insert({
        user_id:              user.id,
        company_name:         form.company_name.trim(),
        company_email:        form.company_email.trim(),
        address:              form.address.trim(),
        phone:                form.phone.trim(),
        manager_name:         form.manager_name.trim(),
        manager_contact:      form.manager_contact.trim(),
        camara_comercio_path: camaraPath,
        cedula_path:          cedulaPath,
        status:               'pending',
      })
      if (appErr) throw appErr

      // Mark profile as studio_pending + onboarding done
      const { error: profErr } = await supabase
        .from('profiles')
        .update({ role: 'studio_pending', onboarding_done: true })
        .eq('id', user.id)
      if (profErr) throw profErr

      // Send confirmation email (best-effort)
      fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: form.company_email,
          subject: 'Hemos recibido tu solicitud en ModelHub',
          html: `<p>Hola ${form.manager_name},</p>
                 <p>Hemos recibido tu solicitud de registro para <strong>${form.company_name}</strong>.</p>
                 <p>Nuestro equipo la revisará en las próximas 24–48 horas hábiles y te notificaremos a este correo.</p>
                 <p>Puedes revisar el estado de tu solicitud en <a href="https://app.modelhub.studio">app.modelhub.studio</a>.</p>`,
        }),
      }).catch(() => {})

      await fetchProfile(user.id)
      navigate('/pending')
    } catch (err) {
      setError(err.message || 'Ocurrió un error. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageShell>
      <div className="card-glass p-6 sm:p-8">
        <h2 className="font-heading text-xl text-[#F5F0E8] font-normal mb-1">
          Solicitud de registro de estudio
        </h2>
        <p className="text-[#6B7280] text-sm mb-6">
          Solo trabajamos con estudios legalmente constituidos. Tu solicitud será revisada por nuestro equipo.
        </p>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-[#F5F0E8] text-sm font-medium mb-1.5">
              Razón social / Nombre del estudio
            </label>
            <input type="text" value={form.company_name} onChange={set('company_name')}
              required className="input-base" placeholder="Mi Estudio S.A.S." />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#F5F0E8] text-sm font-medium mb-1.5">
                Correo de la empresa
              </label>
              <input type="email" value={form.company_email} onChange={set('company_email')}
                required className="input-base" placeholder="info@miestudio.com" />
            </div>
            <div>
              <label className="block text-[#F5F0E8] text-sm font-medium mb-1.5">
                Teléfono
              </label>
              <input type="tel" value={form.phone} onChange={set('phone')}
                required className="input-base" placeholder="+57 300 000 0000" />
            </div>
          </div>

          <div>
            <label className="block text-[#F5F0E8] text-sm font-medium mb-1.5">
              Dirección
            </label>
            <input type="text" value={form.address} onChange={set('address')}
              required className="input-base" placeholder="Calle 10 # 43-20, Medellín" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#F5F0E8] text-sm font-medium mb-1.5">
                Nombre del representante legal
              </label>
              <input type="text" value={form.manager_name} onChange={set('manager_name')}
                required className="input-base" placeholder="Nombre completo" />
            </div>
            <div>
              <label className="block text-[#F5F0E8] text-sm font-medium mb-1.5">
                Contacto del representante
              </label>
              <input type="text" value={form.manager_contact} onChange={set('manager_contact')}
                required className="input-base" placeholder="Correo o celular" />
            </div>
          </div>

          {/* Document uploads */}
          <div className="pt-2 border-t border-white/[0.06]">
            <p className="text-[#F5F0E8] text-sm font-medium mb-3">Documentos requeridos</p>
            <div className="space-y-3">
              {[
                {
                  label: 'Certificado Cámara de Comercio',
                  file: camaraFile,
                  setter: setCamaraFile,
                  id: 'camara',
                },
                {
                  label: 'Cédula del representante legal',
                  file: cedulaFile,
                  setter: setCedulaFile,
                  id: 'cedula',
                },
              ].map(({ label, file, setter, id }) => (
                <div key={id}>
                  <label className="block text-[#6B7280] text-xs mb-1.5">{label} (PDF, máx. 10 MB)</label>
                  <label
                    htmlFor={id}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                      file
                        ? 'border-[#C9A96E]/50 bg-[#C9A96E]/8'
                        : 'border-white/8 hover:border-white/20 bg-white/4'
                    }`}
                  >
                    <FileIcon size={16} className={file ? 'text-[#C9A96E]' : 'text-[#6B7280]'} />
                    <span className={`text-sm truncate ${file ? 'text-[#C9A96E]' : 'text-[#6B7280]'}`}>
                      {file ? file.name : 'Seleccionar archivo PDF'}
                    </span>
                    <input
                      id={id}
                      type="file"
                      accept="application/pdf"
                      className="hidden"
                      onChange={(e) => setter(e.target.files?.[0] ?? null)}
                    />
                  </label>
                </div>
              ))}
            </div>
          </div>

          <p className="text-[#6B7280] text-xs leading-relaxed">
            Al enviar esta solicitud confirmas que la información es veraz y que el estudio opera dentro del marco legal colombiano.
          </p>

          <button
            type="submit"
            disabled={loading}
            className="btn-gold-filled w-full h-11"
          >
            {loading ? 'Enviando solicitud...' : 'Enviar solicitud'}
          </button>
        </form>
      </div>
    </PageShell>
  )
}

// ── Root export ──────────────────────────────────────────────────────────────

export default function Onboarding() {
  const { user, profile, fetchProfile } = useAuth()
  const navigate = useNavigate()
  const [profileLoading, setProfileLoading] = useState(false)

  useEffect(() => {
    if (user && !profile) {
      setProfileLoading(true)
      fetchProfile(user.id).finally(() => setProfileLoading(false))
    }
  }, [user, profile])

  if (!user) return <Navigate to="/login" replace />
  if (profileLoading || !profile) return <FullScreenSpinner />

  if (profile.onboarding_done) {
    if (profile.role === 'admin') return <Navigate to="/admin" replace />
    if (profile.role === 'studio') return <Navigate to="/schedule" replace />
    return <Navigate to="/dashboard" replace />
  }

  if (profile.role === 'studio') {
    return <StudioOnboarding user={user} fetchProfile={fetchProfile} />
  }

  return <ModelOnboarding user={user} fetchProfile={fetchProfile} />
}
