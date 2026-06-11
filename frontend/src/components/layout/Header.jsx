import { Menu, LogOut, Building2, ShieldCheck } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export function Header({ onOpenSidebar }) {
  const { user, isAdmin, logout } = useAuth()
  const today = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })

  return (
    <header className="sticky top-0 z-20 bg-nomad-bg/80 backdrop-blur-md border-b border-nomad-border">
      <div className="px-4 sm:px-6 py-3 flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="lg:hidden text-nomad-text-dim hover:text-nomad-text p-1.5 rounded-lg hover:bg-nomad-card transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {isAdmin ? (
              <ShieldCheck className="w-4 h-4 text-nomad-yellow flex-shrink-0" />
            ) : (
              <Building2 className="w-4 h-4 text-nomad-yellow flex-shrink-0" />
            )}
            <span className="font-semibold text-nomad-text truncate">
              {isAdmin ? 'Time NOMAD' : user?.clientName || 'Minha Empresa'}
            </span>
          </div>
          <div className="text-xs text-nomad-text-muted mt-0.5 capitalize">{today}</div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-sm font-medium text-nomad-text leading-tight">{user?.name}</div>
            <div className="text-[11px] text-nomad-text-muted leading-tight">
              {isAdmin ? 'Administrador' : 'Cliente'}
            </div>
          </div>
          <div className="w-9 h-9 rounded-full bg-nomad-yellow/15 border border-nomad-yellow/30 text-nomad-yellow flex items-center justify-center font-bold text-sm">
            {(user?.name || '?')[0].toUpperCase()}
          </div>
          <button
            onClick={logout}
            title="Sair"
            className="text-nomad-text-muted hover:text-red-400 hover:bg-nomad-card p-2 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  )
}
