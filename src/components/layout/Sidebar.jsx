import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Target,
  ListChecks,
  BarChart3,
  Megaphone,
  Calendar,
  FileText,
  Users,
  X,
  LogOut,
} from 'lucide-react'
import { useApp } from '../../store/AppContext'

const nav = [
  { to: '/', label: 'Visão Geral', icon: LayoutDashboard, end: true },
  { to: '/plano', label: 'Plano de Marketing', icon: Target },
  { to: '/planos-acao', label: 'Planos de Ação', icon: ListChecks },
  { to: '/resultados', label: 'Resultados do Mês', icon: BarChart3 },
  { to: '/campanhas', label: 'Campanhas Ativas', icon: Megaphone },
  { to: '/reunioes', label: 'Reuniões & Comunicados', icon: Users },
  { to: '/documentos', label: 'Documentos', icon: FileText },
  { to: '/calendario', label: 'Calendário de Conteúdo', icon: Calendar, hasBadge: true },
]

export function Sidebar({ mobileOpen, onCloseMobile }) {
  const { calendarPosts } = useApp()
  const pendingCount = calendarPosts.filter((p) => p.status === 'aguardando').length

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          onClick={onCloseMobile}
        />
      )}
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
              <div className="text-[11px] text-nomad-text-muted leading-tight">Área do Cliente</div>
            </div>
          </div>
          <button
            onClick={onCloseMobile}
            className="lg:hidden text-nomad-text-muted hover:text-nomad-text p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
          {nav.map((item) => {
            const Icon = item.icon
            const showBadge = item.hasBadge && pendingCount > 0
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-nomad-yellow/10 text-nomad-yellow'
                      : 'text-nomad-text-dim hover:bg-nomad-card hover:text-nomad-text'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-[18px] h-[18px] flex-shrink-0" />
                  <span>{item.label}</span>
                </div>
                {showBadge && (
                  <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                    {pendingCount}
                  </span>
                )}
              </NavLink>
            )
          })}
        </nav>

        <div className="p-3 border-t border-nomad-border">
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-nomad-text-muted hover:bg-nomad-card hover:text-nomad-text transition-colors">
            <LogOut className="w-[18px] h-[18px]" />
            Sair
          </button>
        </div>
      </aside>
    </>
  )
}
