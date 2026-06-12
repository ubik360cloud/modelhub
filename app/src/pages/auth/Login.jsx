import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

export default function Login() {
  const { signIn, loading, error, clearError } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    clearError()
    const result = await signIn(email, password)
    if (result?.success) {
      navigate('/dashboard')
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
          <p className="text-[#6B7280] text-sm mt-2">
            Plataforma para modelos y estudios
          </p>
        </div>

        {/* Card */}
        <div className="card-glass p-8">
          <h2 className="font-heading text-xl text-[#F5F0E8] mb-6 font-normal">
            Iniciar sesión
          </h2>

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
                  autoComplete="current-password"
                  className="input-base pr-10"
                  placeholder="••••••••"
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

            <div className="text-right">
              <Link
                to="/forgot-password"
                className="text-[#C9A96E] text-sm hover:opacity-75 transition-opacity"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-gold-filled w-full h-11"
            >
              {loading ? 'Cargando...' : 'Iniciar sesión'}
            </button>
          </form>

          <p className="text-center text-[#6B7280] text-sm mt-6">
            ¿No tienes cuenta?{' '}
            <Link
              to="/register"
              className="text-[#C9A96E] hover:opacity-75 transition-opacity"
            >
              Regístrate
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
