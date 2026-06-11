import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Calendar, Users, X, ShieldCheck } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const adminNav = [
  { to: '/admin', label: 'Painel de Controle', icon: LayoutDashboard, end: true },
  { to: '/admin/posts', label: 'Posts & Calendário', icon: Calendar },
  { to: '/admin/clients', label: 'Clientes', icon: Users },
]

const clientNav = [{ to: '/', label: 'Meu Calendário', icon: Calendar, end: true }]

export function Sidebar({ mobileOpen, onCloseMobile }) {
  const { isAdmin } = useAuth()
  const nav = isAdmin ? adminNav : clientNav

  return (
    <>
      {mobileOpen && <div className="fixed inset-0 bg-black/60 z-30 lg:hidden" onClick={onCloseMobile} />}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-64 bg-nomad-bg-2 border-r border-nomad-border flex flex-col transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-5 flex items-center justify-between border-b border-nomad-border">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-nomad-yellow flex items-center justify-center font-extrabold text-nomad-bg text-lg">
              N
            </div>
            <div>
              <div className="font-bold text-nomad-text leading-tight">NOMAD</div>
              <div className="text-[11px] text-nomad-text-muted leading-tight">
                {isAdmin ? 'Painel da Agência' : 'Área do Cliente'}
              </div>
            </div>
          </div>
          <button onClick={onCloseMobile} className="lg:hidden text-nomad-text-muted hover:text-nomad-text p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
          {nav.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-nomad-yellow/10 text-nomad-yellow'
                      : 'text-nomad-text-dim hover:bg-nomad-card hover:text-nomad-text'
                  }`
                }
              >
                <Icon className="w-[18px] h-[18px] flex-shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            )
          })}
        </nav>

        {isAdmin && (
          <div className="p-3 border-t border-nomad-border">
            <div className="flex items-center gap-2 px-3 py-2 text-[11px] text-nomad-text-muted">
              <ShieldCheck className="w-4 h-4 text-nomad-yellow" />
              Acesso total da equipe
            </div>
          </div>
        )}
      </aside>
    </>
  )
}
