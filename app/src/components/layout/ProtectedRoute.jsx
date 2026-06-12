import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

function FullScreenSpinner() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#0D0D0D',
      }}
    >
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

export default function ProtectedRoute() {
  const { user, profile, loading } = useAuth()
  const location = useLocation()

  if (loading && !user) return <FullScreenSpinner />

  if (!user) return <Navigate to="/login" replace />

  // profile may still be fetching briefly after signUp
  if (!profile) return <FullScreenSpinner />

  if (!profile.onboarding_done) return <Navigate to="/onboarding" replace />

  // Admins can only access /admin/* and /profile
  if (
    profile.role === 'admin' &&
    !location.pathname.startsWith('/admin') &&
    location.pathname !== '/profile'
  ) {
    return <Navigate to="/admin" replace />
  }

  // Studios land on /schedule, not /dashboard
  if (profile.role === 'studio' && location.pathname === '/dashboard') {
    return <Navigate to="/schedule" replace />
  }

  return <Outlet />
}
