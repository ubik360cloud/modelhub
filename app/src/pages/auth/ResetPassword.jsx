import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react'
import { supabase } from '../../lib/supabase'

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

export default function ResetPassword() {
  const navigate = useNavigate()

  const [ready, setReady] = useState(false)
  const [hasSession, setHasSession] = useState(false)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    // Supabase JS v2 parses the URL hash and fires PASSWORD_RECOVERY
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'PASSWORD_RECOVERY' && session) {
          setHasSession(true)
          setReady(true)
        }
      }
    )

    // Fallback: session may already be set before the listener fires
    supabase.auth.getSession().then(({ data }) => {
      if (data?.session) setHasSession(true)
      setReady(true)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      return setError('La contraseña debe tener al menos 8 caracteres.')
    }
    if (password !== confirm) {
      return setError('Las contraseñas no coinciden.')
    }

    setLoading(true)
    const { error: updateError } = await supabase.auth.updateUser({ password })
    setLoading(false)

    if (updateError) {
      setError(updateError.message || 'No se pudo actualizar la contraseña.')
    } else {
      setSuccess(true)
      await supabase.auth.signOut()
      setTimeout(() => navigate('/login'), 2500)
    }
  }

  if (!ready) return <FullScreenSpinner />

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-heading text-4xl font-normal text-[#C9A96E]">
            ModelHub
          </h1>
        </div>

        <div className="card-glass p-8">
          {/* Link expired */}
          {!hasSession && (
            <div className="space-y-4 text-center">
              <div className="flex justify-center">
                <AlertCircle size={40} className="text-red-400" strokeWidth={1.5} />
              </div>
              <h2 className="font-heading text-xl text-[#F5F0E8] font-normal">
                Enlace expirado
              </h2>
              <p className="text-[#6B7280] text-sm">
                Este enlace ya no es válido. Solicita uno nuevo.
              </p>
              <Link
                to="/forgot-password"
                className="btn-gold-filled w-full h-11 flex items-center justify-center"
              >
                Solicitar nuevo enlace
              </Link>
            </div>
          )}

          {/* Success */}
          {hasSession && success && (
            <div className="space-y-4 text-center">
              <div className="flex justify-center">
                <CheckCircle size={40} className="text-emerald-400" strokeWidth={1.5} />
              </div>
              <h2 className="font-heading text-xl text-[#F5F0E8] font-normal">
                Contraseña actualizada
              </h2>
              <p className="text-[#6B7280] text-sm">
                Tu contraseña fue cambiada. Redirigiendo al inicio de sesión...
              </p>
            </div>
          )}

          {/* Password form */}
          {hasSession && !success && (
            <>
              <h2 className="font-heading text-xl text-[#F5F0E8] mb-2 font-normal">
                Nueva contraseña
              </h2>
              <p className="text-[#6B7280] text-sm mb-6">
                Elige una contraseña segura de al menos 8 caracteres.
              </p>

              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <div>
                  <label
                    htmlFor="password"
                    className="block text-[#F5F0E8] text-sm font-medium mb-1.5"
                  >
                    Nueva contraseña
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
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="confirm"
                    className="block text-[#F5F0E8] text-sm font-medium mb-1.5"
                  >
                    Confirmar contraseña
                  </label>
                  <div className="relative">
                    <input
                      id="confirm"
                      type={showConfirm ? 'text' : 'password'}
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      required
                      autoComplete="new-password"
                      className="input-base pr-10"
                      placeholder="Repite tu contraseña"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#F5F0E8] transition-colors"
                    >
                      {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-gold-filled w-full h-11"
                >
                  {loading ? 'Guardando...' : 'Guardar nueva contraseña'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
