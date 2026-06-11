import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { UserPlus, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { AuthShell } from './AuthShell'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', companyName: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(form)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell title="Cadastrar empresa" subtitle="Crie sua conta de cliente para acompanhar seus posts">
      <form onSubmit={submit} className="space-y-4">
        {error && <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-sm rounded-lg px-3 py-2">{error}</div>}
        <Field label="Seu nome">
          <input required className="nomad-input w-full" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Ex.: Marina Souza" />
        </Field>
        <Field label="Nome da empresa">
          <input required className="nomad-input w-full" value={form.companyName} onChange={(e) => set('companyName', e.target.value)} placeholder="Ex.: Clínica Estética Bella" />
        </Field>
        <Field label="E-mail">
          <input type="email" required className="nomad-input w-full" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="voce@empresa.com" />
        </Field>
        <Field label="Senha (mín. 6 caracteres)">
          <input type="password" required minLength={6} className="nomad-input w-full" value={form.password} onChange={(e) => set('password', e.target.value)} placeholder="••••••••" />
        </Field>
        <button type="submit" disabled={loading} className="nomad-button-primary w-full">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
          Criar conta
        </button>
      </form>
      <p className="text-sm text-nomad-text-muted text-center mt-5">
        Já tem conta?{' '}
        <Link to="/login" className="text-nomad-yellow hover:underline font-medium">Entrar</Link>
      </p>
    </AuthShell>
  )
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-nomad-text-dim mb-1.5">{label}</span>
      {children}
    </label>
  )
}
