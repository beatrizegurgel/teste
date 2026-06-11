import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAuth } from './context/AuthContext'
import { Layout } from './components/layout/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import ClientCalendar from './pages/client/ClientCalendar'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminPosts from './pages/admin/AdminPosts'
import AdminClients from './pages/admin/AdminClients'

const homeFor = (user) => (user?.role === 'admin' ? '/admin' : '/')

function FullScreenLoader() {
  return (
    <div className="min-h-screen bg-nomad-bg flex items-center justify-center text-nomad-text-muted">
      <Loader2 className="w-7 h-7 animate-spin" />
    </div>
  )
}

// Só permite acesso autenticado; senão volta ao login.
function RequireAuth() {
  const { user, loading } = useAuth()
  if (loading) return <FullScreenLoader />
  if (!user) return <Navigate to="/login" replace />
  return <Outlet />
}

// Garante que o papel do usuário corresponde à rota.
function RoleRoute({ role, children }) {
  const { user } = useAuth()
  if (user?.role !== role) return <Navigate to={homeFor(user)} replace />
  return children
}

// Páginas públicas (login/cadastro): redireciona se já autenticado.
function PublicOnly({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <FullScreenLoader />
  if (user) return <Navigate to={homeFor(user)} replace />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<PublicOnly><Login /></PublicOnly>} />
      <Route path="/register" element={<PublicOnly><Register /></PublicOnly>} />

      <Route element={<RequireAuth />}>
        <Route element={<Layout />}>
          <Route path="/" element={<RoleRoute role="client"><ClientCalendar /></RoleRoute>} />
          <Route path="/admin" element={<RoleRoute role="admin"><AdminDashboard /></RoleRoute>} />
          <Route path="/admin/posts" element={<RoleRoute role="admin"><AdminPosts /></RoleRoute>} />
          <Route path="/admin/clients" element={<RoleRoute role="admin"><AdminClients /></RoleRoute>} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
