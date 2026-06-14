import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/layout/ProtectedRoute'
import AppLayout from './components/layout/AppLayout'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Onboarding from './pages/auth/Onboarding'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword from './pages/auth/ResetPassword'
import Dashboard from './pages/dashboard/Dashboard'
import Earnings from './pages/earnings/Earnings'
import Goals from './pages/goals/Goals'
import Schedule from './pages/schedule/Schedule'

// ── Placeholder pages (replaced step by step) ────────────────────────────────

function Placeholder({ name }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        fontFamily: '"Playfair Display", serif',
        fontSize: '1.5rem',
        color: '#C9A96E',
      }}
    >
      {name}
    </div>
  )
}

// ── App shell ─────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login"           element={<Login />} />
        <Route path="/register"        element={<Register />} />
        <Route path="/onboarding"      element={<Onboarding />} />
        <Route path="/forgot-password"  element={<ForgotPassword />} />
        <Route path="/reset-password"   element={<ResetPassword />} />

        {/* Protected routes — auth check → layout → page */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/earnings"  element={<Earnings />} />
            <Route path="/goals"     element={<Goals />} />
            <Route path="/schedule"  element={<Schedule />} />
            <Route path="/tips"      element={<Placeholder name="Tips" />} />
            <Route path="/forum"     element={<Placeholder name="Foro" />} />
            <Route path="/profile"   element={<Placeholder name="Perfil" />} />
            <Route path="/admin"         element={<Placeholder name="Administración" />} />
            <Route path="/admin/tips"    element={<Placeholder name="Tips (admin)" />} />
            <Route path="/admin/forum"   element={<Placeholder name="Foro (admin)" />} />
            <Route path="/admin/metrics" element={<Placeholder name="Métricas" />} />
            <Route path="/admin/studios" element={<Placeholder name="Estudios" />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="/"  element={<Navigate to="/dashboard" replace />} />
        <Route path="*"  element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
