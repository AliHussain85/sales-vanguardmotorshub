import { Navigate, Route, Routes } from 'react-router-dom'
import { AUTH_ENABLED } from './config/auth'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { DashboardLayout } from './components/DashboardLayout'
import { LoginPage } from './pages/LoginPage'
import { HomePage } from './pages/HomePage'
import { CloseDealPage } from './pages/CloseDealPage'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route
          path="/login"
          element={AUTH_ENABLED ? <LoginPage /> : <Navigate to="/" replace />}
        />

        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route index element={<HomePage />} />
            <Route path="close-deal" element={<CloseDealPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}
