import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LogIn, Loader2, Mail, Lock } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { AuthShell } from './AuthShell'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await login(email, password)
      navigate(user.role === 'admin' ? '/admin' : '/', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fill = (em) => { setEmail(em); setPassword(em.includes('nomad') ? 'nomad123' : 'cliente123') }

  return (
    <AuthShell title="Entrar na plataforma" subtitle="Acesse o calendário de conteúdo da sua empresa">
      <form onSubmit={submit} className="space-y-4">
        {error && <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-sm rounded-lg px-3 py-2">{error}</div>}
        <label className="block">
          <span className="block text-xs font-medium text-nomad-text-dim mb-1.5">E-mail</span>
          <div className="relative">
            <Mail className="w-4 h-4 text-nomad-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input type="email" required className="nomad-input w-full pl-9" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@empresa.com" />
          </div>
        </label>
        <label className="block">
          <span className="block text-xs font-medium text-nomad-text-dim mb-1.5">Senha</span>
          <div className="relative">
            <Lock className="w-4 h-4 text-nomad-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input type="password" required className="nomad-input w-full pl-9" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
        </label>
        <button type="submit" disabled={loading} className="nomad-button-primary w-full">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
          Entrar
        </button>
      </form>

      <p className="text-sm text-nomad-text-muted text-center mt-5">
        Não tem conta?{' '}
        <Link to="/register" className="text-nomad-yellow hover:underline font-medium">Cadastre sua empresa</Link>
      </p>

      <div className="mt-6 pt-5 border-t border-nomad-border">
        <p className="text-[11px] uppercase tracking-wider text-nomad-text-muted font-semibold mb-2">Contas de demonstração</p>
        <div className="space-y-1.5">
          <DemoBtn onClick={() => fill('admin@nomad.studio')} label="Time NOMAD (admin)" email="admin@nomad.studio" />
          <DemoBtn onClick={() => fill('cliente@bella.com')} label="Clínica Estética Bella" email="cliente@bella.com" />
          <DemoBtn onClick={() => fill('cliente@verde.com')} label="Mercado Verde Orgânicos" email="cliente@verde.com" />
        </div>
      </div>
    </AuthShell>
  )
}

function DemoBtn({ onClick, label, email }) {
  return (
    <button onClick={onClick} type="button" className="w-full flex items-center justify-between text-left px-3 py-2 rounded-lg bg-nomad-bg-2 border border-nomad-border hover:border-nomad-yellow/40 transition-colors">
      <span className="text-sm text-nomad-text">{label}</span>
      <span className="text-xs text-nomad-text-muted">{email}</span>
    </button>
  )
}
