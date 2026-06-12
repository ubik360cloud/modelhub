import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, User, Building2 } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

const ROLES = [
  {
    value: 'model',
    label: 'Soy modelo',
    description: 'Gestiona tus ingresos, horarios y metas',
    Icon: User,
  },
  {
    value: 'studio',
    label: 'Soy estudio',
    description: 'Administra modelos, salas y coordinadores',
    Icon: Building2,
  },
]

export default function Register() {
  const { signUp, error, clearError } = useAuth()
  const navigate = useNavigate()

  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState('model')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [localError, setLocalError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (submitting) return

    setLocalError('')
    clearError()

    if (password.length < 8) {
      setLocalError('La contraseña debe tener al menos 8 caracteres.')
      return
    }
    if (password !== confirmPassword) {
      setLocalError('Las contraseñas no coinciden.')
      return
    }

    setSubmitting(true)
    const result = await signUp(email, password, role, displayName)
    if (result?.success) {
      navigate('/onboarding')
      // submitting stays true — component unmounts on navigation
    } else {
      setSubmitting(false)
    }
  }

  const displayedError = localError || error
  const emailAlreadyExists =
    typeof displayedError === 'string' &&
    displayedError.toLowerCase().includes('already registered')

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Wordmark */}
        <div className="text-center mb-8">
          <h1 className="font-heading text-4xl font-normal text-[#C9A96E]">
            ModelHub
          </h1>
          <p className="text-[#6B7280] text-sm mt-2">
            Plataforma para modelos y estudios
          </p>
        </div>

        {/* Card */}
        <div className="card-glass p-8">
          <h2 className="font-heading text-xl text-[#F5F0E8] mb-6 font-normal">
            Crear cuenta
          </h2>

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {displayedError && !emailAlreadyExists && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
                {displayedError}
              </div>
            )}

            {emailAlreadyExists && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-sm space-y-2">
                <p className="text-red-400 font-medium">
                  Este correo ya tiene una cuenta registrada.
                </p>
                <div className="flex flex-col gap-1.5">
                  <Link
                    to="/login"
                    className="text-[#C9A96E] hover:opacity-75 transition-opacity underline underline-offset-2"
                  >
                    Iniciar sesión con este correo
                  </Link>
                  <Link
                    to="/forgot-password"
                    className="text-[#6B7280] hover:text-[#F5F0E8] transition-colors underline underline-offset-2"
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
              </div>
            )}

            {/* Role selector */}
            <div>
              <p className="text-[#F5F0E8] text-sm font-medium mb-3">
                ¿Cómo vas a usar ModelHub?
              </p>
              <div className="grid grid-cols-2 gap-3">
                {ROLES.map(({ value, label, description, Icon }) => {
                  const selected = role === value
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setRole(value)}
                      className={[
                        'flex flex-col items-center gap-2 p-4 rounded-lg border text-center transition-all',
                        selected
                          ? 'border-[#C9A96E] bg-[#C9A96E]/10 text-[#C9A96E]'
                          : 'border-[rgba(255,255,255,0.08)] text-[#6B7280] hover:border-[rgba(255,255,255,0.2)]',
                      ].join(' ')}
                    >
                      <Icon size={24} strokeWidth={1.5} />
                      <span className="text-sm font-medium">{label}</span>
                      <span
                        className={[
                          'text-xs leading-snug',
                          selected ? 'text-[#C9A96E]/70' : 'text-[#6B7280]',
                        ].join(' ')}
                      >
                        {description}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Display name */}
            <div>
              <label
                htmlFor="displayName"
                className="block text-[#F5F0E8] text-sm font-medium mb-1.5"
              >
                Nombre o apodo
              </label>
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                autoComplete="name"
                className="input-base"
                placeholder="Como quieres que te llamen"
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-[#F5F0E8] text-sm font-medium mb-1.5"
              >
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="input-base"
                placeholder="correo@ejemplo.com"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-[#F5F0E8] text-sm font-medium mb-1.5"
              >
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  className="input-base pr-10"
                  placeholder="Mínimo 8 caracteres"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#F5F0E8] transition-colors"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-[#F5F0E8] text-sm font-medium mb-1.5"
              >
                Confirmar contraseña
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  className="input-base pr-10"
                  placeholder="Repite tu contraseña"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#F5F0E8] transition-colors"
                  aria-label={showConfirm ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-gold-filled w-full h-11 flex items-center justify-center gap-2"
            >
              {submitting && (
                <svg
                  className="animate-spin h-4 w-4 shrink-0"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
              )}
              {submitting ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>
          </form>

          <p className="text-center text-[#6B7280] text-sm mt-6">
            ¿Ya tienes cuenta?{' '}
            <Link
              to="/login"
              className="text-[#C9A96E] hover:opacity-75 transition-opacity"
            >
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
