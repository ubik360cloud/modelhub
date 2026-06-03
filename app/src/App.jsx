import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'

// ── Placeholder pages ───────────────────────────────────────────────────────

function PlaceholderPage({ name }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        color: '#C9A96E',
        fontFamily: '"Playfair Display", serif',
        fontSize: '1.5rem',
      }}
    >
      {name}
    </div>
  )
}

const Login = () => <PlaceholderPage name="Iniciar sesión" />
const Register = () => <PlaceholderPage name="Registro" />
const Onboarding = () => <PlaceholderPage name="Bienvenida" />
const Dashboard = () => <PlaceholderPage name="Panel principal" />
const Earnings = () => <PlaceholderPage name="Ganancias" />
const Goals = () => <PlaceholderPage name="Metas" />
const Schedule = () => <PlaceholderPage name="Horario" />
const Tips = () => <PlaceholderPage name="Tips" />
const Forum = () => <PlaceholderPage name="Foro" />
const Profile = () => <PlaceholderPage name="Perfil" />
const Admin = () => <PlaceholderPage name="Administración" />

// ── Auth guard ──────────────────────────────────────────────────────────────

function ProtectedRoute({ children, session, loading }) {
  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          backgroundColor: '#0D0D0D',
          color: '#6B7280',
          fontFamily: '"DM Sans", sans-serif',
        }}
      >
        Cargando...
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/login" replace />
  }

  return children
}

// ── App shell ───────────────────────────────────────────────────────────────

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes */}
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute session={session} loading={loading}>
              <Onboarding />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute session={session} loading={loading}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/earnings"
          element={
            <ProtectedRoute session={session} loading={loading}>
              <Earnings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/goals"
          element={
            <ProtectedRoute session={session} loading={loading}>
              <Goals />
            </ProtectedRoute>
          }
        />
        <Route
          path="/schedule"
          element={
            <ProtectedRoute session={session} loading={loading}>
              <Schedule />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tips"
          element={
            <ProtectedRoute session={session} loading={loading}>
              <Tips />
            </ProtectedRoute>
          }
        />
        <Route
          path="/forum"
          element={
            <ProtectedRoute session={session} loading={loading}>
              <Forum />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute session={session} loading={loading}>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute session={session} loading={loading}>
              <Admin />
            </ProtectedRoute>
          }
        />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
