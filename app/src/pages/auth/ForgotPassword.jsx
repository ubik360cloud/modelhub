import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { supabase } from '../../lib/supabase'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      if (error) throw error
      setSent(true)
    } catch (err) {
      setError(err.message || 'Ocurrió un error. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Wordmark */}
        <div className="text-center mb-8">
          <h1 className="font-heading text-4xl font-normal text-[#C9A96E]">
            ModelHub
          </h1>
        </div>

        <div className="card-glass p-8">
          <h2 className="font-heading text-xl text-[#F5F0E8] mb-2 font-normal">
            Recuperar contraseña
          </h2>
          <p className="text-[#6B7280] text-sm mb-6">
            Te enviaremos un enlace para restablecer tu contraseña.
          </p>

          {sent ? (
            <div className="space-y-4">
              <div className="bg-[#C9A96E]/10 border border-[#C9A96E]/30 rounded-lg p-4 text-[#C9A96E] text-sm">
                Revisa tu correo electrónico. Si existe una cuenta con ese correo,
                recibirás el enlace de recuperación en unos minutos.
              </div>
              <Link
                to="/login"
                className="btn-gold w-full h-11 flex items-center justify-center gap-2"
              >
                <ArrowLeft size={16} />
                Volver al inicio de sesión
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
                  {error}
                </div>
              )}

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

              <button
                type="submit"
                disabled={loading}
                className="btn-gold-filled w-full h-11"
              >
                {loading ? 'Enviando...' : 'Enviar enlace de recuperación'}
              </button>
            </form>
          )}

          {!sent && (
            <p className="text-center mt-6">
              <Link
                to="/login"
                className="text-[#6B7280] text-sm hover:text-[#F5F0E8] transition-colors inline-flex items-center gap-1.5"
              >
                <ArrowLeft size={14} />
                Volver al inicio de sesión
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
