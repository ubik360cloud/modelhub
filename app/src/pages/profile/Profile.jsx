import { useState, useEffect, useRef } from 'react'
import { Camera, Copy, Check, LogOut, ShieldCheck, ChevronRight } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useSettingsStore } from '../../store/settingsStore'
import { supabase } from '../../lib/supabase'
import PageWrapper from '../../components/ui/PageWrapper'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'

const PLATFORMS = [
  'Chaturbate', 'BongaCams', 'LiveJasmin',
  'OnlyFans', 'Streamate', 'Stripchat',
]

const PLAN_LABEL = { basic: 'Básico', premium: 'Premium', free: 'Gratis' }

function formatPlanDate(iso) {
  if (!iso) return null
  return new Date(iso).toLocaleDateString('es-CO', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}

export default function Profile() {
  const { user, profile, updateProfile, uploadAvatar, sendPasswordReset, signOut } = useAuth()
  const exchangeRate = useSettingsStore((s) => s.exchangeRate)
  const fileRef = useRef(null)

  // Form state
  const [displayName, setDisplayName]   = useState('')
  const [phone, setPhone]               = useState('')
  const [income, setIncome]             = useState('')
  const [incomeCurrency, setIncomeCurrency] = useState('USD')
  const [platforms, setPlatforms]       = useState([])
  const [otherPlatform, setOtherPlatform] = useState('')

  // UI state
  const [saving, setSaving]             = useState(false)
  const [avatarLoading, setAvatarLoading] = useState(false)
  const [passwordSent, setPasswordSent] = useState(false)
  const [copied, setCopied]             = useState(false)
  const [saveMsg, setSaveMsg]           = useState('')
  const [error, setError]               = useState('')

  // Load profile data and platforms on mount
  useEffect(() => {
    if (!profile) return
    setDisplayName(profile.display_name ?? '')
    setPhone(profile.phone ?? '')
    if (profile.monthly_income_usd) {
      setIncome(String(profile.monthly_income_usd))
      setIncomeCurrency('USD')
    }
  }, [profile])

  useEffect(() => {
    if (!user) return
    supabase
      .from('model_platforms')
      .select('platform_name')
      .eq('model_id', user.id)
      .eq('is_active', true)
      .then(({ data }) => {
        if (data) setPlatforms(data.map((r) => r.platform_name))
      })
  }, [user])

  // ── Avatar upload ─────────────────────────────────────────────────────────

  async function handleAvatarChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarLoading(true)
    setError('')
    const result = await uploadAvatar(file)
    if (!result.success) setError(result.error ?? 'Error subiendo foto')
    setAvatarLoading(false)
  }

  // ── Copy email ────────────────────────────────────────────────────────────

  function copyEmail() {
    navigator.clipboard.writeText(user?.email ?? '')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // ── Save personal info ────────────────────────────────────────────────────

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSaveMsg('')

    const incomeUSD = income
      ? incomeCurrency === 'COP'
        ? parseFloat(income) / exchangeRate
        : parseFloat(income)
      : 0

    const result = await updateProfile({
      display_name:        displayName.trim(),
      phone:               phone.trim() || null,
      monthly_income_usd:  incomeUSD,
    })

    if (!result.success) {
      setError(result.error ?? 'Error guardando cambios')
    } else {
      setSaveMsg('Cambios guardados')
      setTimeout(() => setSaveMsg(''), 3000)
    }
    setSaving(false)
  }

  // ── Platform toggle ───────────────────────────────────────────────────────

  async function togglePlatform(platform) {
    const isActive = platforms.includes(platform)
    if (isActive) {
      await supabase
        .from('model_platforms')
        .update({ is_active: false })
        .eq('model_id', user.id)
        .eq('platform_name', platform)
      setPlatforms((prev) => prev.filter((p) => p !== platform))
    } else {
      await supabase
        .from('model_platforms')
        .upsert({ model_id: user.id, platform_name: platform, is_active: true })
      setPlatforms((prev) => [...prev, platform])
    }
  }

  async function addOtherPlatform() {
    const name = otherPlatform.trim()
    if (!name) return
    await supabase
      .from('model_platforms')
      .upsert({ model_id: user.id, platform_name: name, is_active: true })
    setPlatforms((prev) => [...prev, name])
    setOtherPlatform('')
  }

  // ── Password reset ────────────────────────────────────────────────────────

  async function handlePasswordReset() {
    const result = await sendPasswordReset()
    if (result.success) setPasswordSent(true)
    else setError(result.error ?? 'Error enviando correo')
  }

  if (!profile) return null

  const avatarSrc = profile.avatar_url
  const initial   = profile.display_name?.[0]?.toUpperCase() ?? '?'
  const planEnds  = formatPlanDate(profile.plan_ends_at)

  return (
    <PageWrapper>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-normal text-[#F5F0E8]">Mi perfil</h1>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm mb-4">
          {error}
        </div>
      )}

      {/* ── Avatar + ID ──────────────────────────────────────────────────── */}
      <Card className="flex flex-col items-center gap-3 py-6 mb-4">
        {/* Avatar */}
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-[#C9A96E]/20 border-2 border-[#C9A96E]/40 flex items-center justify-center overflow-hidden">
            {avatarSrc ? (
              <img src={avatarSrc} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-[#C9A96E] text-2xl font-semibold">{initial}</span>
            )}
            {avatarLoading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full">
                <div className="w-5 h-5 border-2 border-[#C9A96E]/30 border-t-[#C9A96E] rounded-full animate-spin" />
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#C9A96E] flex items-center justify-center shadow-lg"
          >
            <Camera size={13} className="text-[#0D0D0D]" strokeWidth={2} />
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>

        <div className="text-center">
          <p className="text-[#F5F0E8] font-medium">{profile.display_name}</p>
          <Badge variant={profile.plan === 'premium' ? 'premium' : 'scheduled'} className="mt-1">
            {PLAN_LABEL[profile.plan] ?? profile.plan}
          </Badge>
        </div>

        {/* Email as model ID */}
        <div className="w-full max-w-xs">
          <p className="text-[#6B7280] text-[10px] text-center uppercase tracking-wider mb-1.5">
            Tu ID de modelo
          </p>
          <div className="flex items-center gap-2 bg-white/4 rounded-lg px-3 py-2 border border-white/8">
            <span className="text-[#F5F0E8] text-sm flex-1 truncate">{user?.email}</span>
            <button type="button" onClick={copyEmail} className="flex-shrink-0 text-[#6B7280] hover:text-[#C9A96E] transition-colors">
              {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            </button>
          </div>
          <p className="text-[#6B7280] text-[10px] text-center mt-1.5">
            Comparte este correo con tu estudio para recibir invitaciones.
          </p>
        </div>
      </Card>

      {/* ── Personal info form ────────────────────────────────────────────── */}
      <Card className="mb-4">
        <h2 className="font-heading text-base font-normal text-[#F5F0E8] mb-4">
          Datos personales
        </h2>
        <form onSubmit={handleSave} noValidate className="space-y-4">
          <div>
            <label className="block text-[#6B7280] text-xs mb-1.5">Nombre artístico</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              className="input-base"
              placeholder="Tu nombre"
            />
          </div>

          <div>
            <label className="block text-[#6B7280] text-xs mb-1.5">Teléfono (opcional)</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="input-base"
              placeholder="+57 300 000 0000"
            />
          </div>

          <div>
            <label className="block text-[#6B7280] text-xs mb-1.5">
              Ingreso mensual aproximado
            </label>
            <div className="flex gap-2">
              <div className="flex rounded-lg border border-[rgba(255,255,255,0.08)] overflow-hidden flex-shrink-0">
                {['USD', 'COP'].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setIncomeCurrency(c)}
                    className={`px-3 py-2.5 text-sm font-medium transition-colors ${
                      incomeCurrency === c
                        ? 'bg-[#C9A96E] text-[#0D0D0D]'
                        : 'text-[#6B7280] hover:text-[#F5F0E8]'
                    }`}
                  >
                    {c}
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
            <p className="text-[#6B7280] text-[10px] mt-1.5">
              Solo tú puedes ver esto. Se usa para calcular tus metas.
            </p>
          </div>

          {saveMsg && (
            <p className="text-emerald-400 text-sm flex items-center gap-1.5">
              <Check size={14} /> {saveMsg}
            </p>
          )}

          <Button type="submit" variant="primary" className="w-full" disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </form>
      </Card>

      {/* ── Plataformas ───────────────────────────────────────────────────── */}
      <Card className="mb-4">
        <h2 className="font-heading text-base font-normal text-[#F5F0E8] mb-4">
          Plataformas
        </h2>
        <div className="grid grid-cols-2 gap-2 mb-3">
          {PLATFORMS.map((p) => {
            const active = platforms.includes(p)
            return (
              <button
                key={p}
                type="button"
                onClick={() => togglePlatform(p)}
                className={`flex items-center gap-2 p-2.5 rounded-lg border text-left text-sm transition-all ${
                  active
                    ? 'border-[#C9A96E] bg-[#C9A96E]/10 text-[#C9A96E]'
                    : 'border-white/8 text-[#6B7280] hover:border-white/20 hover:text-[#F5F0E8]'
                }`}
              >
                <div className={`w-3.5 h-3.5 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${
                  active ? 'bg-[#C9A96E] border-[#C9A96E]' : 'border-white/20'
                }`}>
                  {active && <Check size={9} strokeWidth={3} className="text-[#0D0D0D]" />}
                </div>
                {p}
              </button>
            )
          })}
        </div>

        {/* Add custom platform */}
        <div className="flex gap-2">
          <input
            type="text"
            value={otherPlatform}
            onChange={(e) => setOtherPlatform(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addOtherPlatform())}
            className="input-base text-sm"
            placeholder="Otra plataforma..."
          />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={addOtherPlatform}
            disabled={!otherPlatform.trim()}
            className="flex-shrink-0"
          >
            Agregar
          </Button>
        </div>

        {/* Custom platforms already added */}
        {platforms.filter((p) => !PLATFORMS.includes(p)).length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {platforms.filter((p) => !PLATFORMS.includes(p)).map((p) => (
              <span
                key={p}
                className="flex items-center gap-1.5 bg-[#C9A96E]/10 border border-[#C9A96E]/30 rounded-full px-3 py-1 text-[#C9A96E] text-xs"
              >
                {p}
                <button
                  type="button"
                  onClick={() => togglePlatform(p)}
                  className="hover:text-white transition-colors leading-none"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </Card>

      {/* ── Plan ──────────────────────────────────────────────────────────── */}
      <Card className="mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-heading text-base font-normal text-[#F5F0E8] mb-0.5">
              Plan actual
            </h2>
            <p className="text-[#C9A96E] text-sm font-medium">
              {PLAN_LABEL[profile.plan] ?? profile.plan}
            </p>
            {planEnds && (
              <p className="text-[#6B7280] text-xs mt-0.5">Vence el {planEnds}</p>
            )}
          </div>
          {profile.plan !== 'premium' && (
            <Button variant="primary" size="sm">
              Mejorar plan
              <ChevronRight size={14} />
            </Button>
          )}
        </div>
      </Card>

      {/* ── Seguridad ─────────────────────────────────────────────────────── */}
      <Card className="mb-4">
        <h2 className="font-heading text-base font-normal text-[#F5F0E8] mb-4">Seguridad</h2>

        <div className="space-y-3">
          {/* Change password */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#F5F0E8] text-sm">Cambiar contraseña</p>
              {passwordSent && (
                <p className="text-emerald-400 text-xs mt-0.5 flex items-center gap-1">
                  <Check size={11} /> Correo enviado a {user?.email}
                </p>
              )}
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={handlePasswordReset}
              disabled={passwordSent}
            >
              <ShieldCheck size={14} />
              {passwordSent ? 'Enviado' : 'Enviar enlace'}
            </Button>
          </div>

          {/* Change email note */}
          <div className="pt-3 border-t border-white/[0.06]">
            <p className="text-[#6B7280] text-xs leading-relaxed">
              Para cambiar tu correo electrónico, escribe a{' '}
              <span className="text-[#C9A96E]">soporte@modelhub.studio</span>{' '}
              desde tu correo actual y verificaremos tu identidad manualmente.
            </p>
          </div>
        </div>
      </Card>

      {/* ── Cerrar sesión ─────────────────────────────────────────────────── */}
      <Card className="border-red-500/10">
        <button
          type="button"
          onClick={signOut}
          className="w-full flex items-center justify-center gap-2 text-red-400 hover:text-red-300 transition-colors py-1 text-sm font-medium"
        >
          <LogOut size={15} strokeWidth={1.75} />
          Cerrar sesión
        </button>
      </Card>
    </PageWrapper>
  )
}
