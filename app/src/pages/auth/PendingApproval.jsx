import { useEffect, useState } from 'react'
import { Clock, CheckCircle, XCircle, Mail } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'

export default function PendingApproval() {
  const { user, profile, signOut } = useAuth()
  const [application, setApplication] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    supabase
      .from('studio_applications')
      .select('*')
      .eq('user_id', user.id)
      .order('submitted_at', { ascending: false })
      .limit(1)
      .single()
      .then(({ data }) => {
        setApplication(data)
        setLoading(false)
      })
  }, [user])

  const status = application?.status ?? 'pending'

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-heading text-3xl font-normal text-[#C9A96E]">ModelHub</h1>
        </div>

        <div className="card-glass p-8 text-center">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-2 border-[#C9A96E]/30 border-t-[#C9A96E] rounded-full animate-spin" />
            </div>
          ) : status === 'rejected' ? (
            <>
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                <XCircle size={32} className="text-red-400" strokeWidth={1.5} />
              </div>
              <h2 className="font-heading text-xl font-normal text-[#F5F0E8] mb-2">
                Solicitud no aprobada
              </h2>
              <p className="text-[#6B7280] text-sm leading-relaxed mb-4">
                Tu solicitud de registro como estudio no fue aprobada.
              </p>
              {application?.admin_note && (
                <div className="bg-red-500/8 border border-red-500/20 rounded-xl p-4 mb-6 text-left">
                  <p className="text-[#6B7280] text-xs uppercase tracking-wider mb-1">Motivo</p>
                  <p className="text-[#F5F0E8] text-sm">{application.admin_note}</p>
                </div>
              )}
              <p className="text-[#6B7280] text-xs leading-relaxed mb-6">
                Si crees que es un error o tienes preguntas, escríbenos a{' '}
                <span className="text-[#C9A96E]">soporte@modelhub.studio</span>
              </p>
            </>
          ) : status === 'approved' ? (
            <>
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-emerald-400" strokeWidth={1.5} />
              </div>
              <h2 className="font-heading text-xl font-normal text-[#F5F0E8] mb-2">
                Solicitud aprobada
              </h2>
              <p className="text-[#6B7280] text-sm">
                Tu estudio fue aprobado. Recarga la página para continuar.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="btn-gold-filled mt-6 px-6 h-10"
              >
                Continuar
              </button>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-full bg-[#C9A96E]/10 flex items-center justify-center mx-auto mb-4">
                <Clock size={32} className="text-[#C9A96E]" strokeWidth={1.5} />
              </div>
              <h2 className="font-heading text-xl font-normal text-[#F5F0E8] mb-2">
                Solicitud en revisión
              </h2>
              <p className="text-[#6B7280] text-sm leading-relaxed mb-6">
                Hemos recibido tu solicitud para{' '}
                <span className="text-[#F5F0E8]">{application?.company_name}</span>.
                Nuestro equipo la revisará en las próximas 24–48 horas hábiles.
              </p>

              <div className="bg-white/4 border border-white/8 rounded-xl p-4 text-left space-y-2 mb-6">
                <div className="flex justify-between text-xs">
                  <span className="text-[#6B7280]">Empresa</span>
                  <span className="text-[#F5F0E8]">{application?.company_name}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#6B7280]">Enviada el</span>
                  <span className="text-[#F5F0E8]">
                    {application?.submitted_at
                      ? new Date(application.submitted_at).toLocaleDateString('es-CO', {
                          day: 'numeric', month: 'long', year: 'numeric',
                        })
                      : '—'}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#6B7280]">Estado</span>
                  <span className="text-amber-400 font-medium">En revisión</span>
                </div>
              </div>

              <div className="flex items-center gap-2 justify-center text-[#6B7280] text-xs">
                <Mail size={13} />
                <span>
                  Te notificaremos a{' '}
                  <span className="text-[#F5F0E8]">{user?.email}</span>
                </span>
              </div>
            </>
          )}

          <button
            onClick={signOut}
            className="mt-8 text-[#6B7280] hover:text-[#F5F0E8] text-xs transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  )
}
