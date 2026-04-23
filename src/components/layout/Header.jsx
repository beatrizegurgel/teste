import { useState } from 'react'
import { Menu, ChevronDown, Bell, RefreshCw } from 'lucide-react'
import { useApp } from '../../store/AppContext'
import { formatMonthLabel } from '../../utils/format'

export function Header({ onOpenSidebar }) {
  const { clients, selectedClient, setSelectedClientId, resetData } = useApp()
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const today = new Date()

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
          <div className="relative inline-block">
            <button
              onClick={() => setDropdownOpen((v) => !v)}
              className="flex items-center gap-2 text-left hover:bg-nomad-card px-2 py-1.5 rounded-lg transition-colors group"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-nomad-text truncate">
                    {selectedClient.name}
                  </span>
                  <ChevronDown className="w-4 h-4 text-nomad-text-muted group-hover:text-nomad-text flex-shrink-0" />
                </div>
                <div className="text-xs text-nomad-text-muted flex items-center gap-2 mt-0.5">
                  <span className="capitalize">{formatMonthLabel(today)}</span>
                  <span className="w-1 h-1 rounded-full bg-nomad-text-muted" />
                  <span>CS: {selectedClient.csManager}</span>
                </div>
              </div>
            </button>

            {dropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setDropdownOpen(false)}
                />
                <div className="absolute left-0 top-full mt-2 w-72 bg-nomad-card border border-nomad-border rounded-xl shadow-xl z-40 overflow-hidden animate-slide-up">
                  <div className="px-3 py-2 text-[11px] uppercase tracking-wider text-nomad-text-muted font-semibold border-b border-nomad-border">
                    Trocar cliente
                  </div>
                  {clients.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        setSelectedClientId(c.id)
                        setDropdownOpen(false)
                      }}
                      className={`w-full text-left px-3 py-3 hover:bg-nomad-card-hover transition-colors ${
                        c.id === selectedClient.id ? 'bg-nomad-yellow/5' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                            c.id === selectedClient.id
                              ? 'bg-nomad-yellow text-nomad-bg'
                              : 'bg-nomad-bg-2 text-nomad-text-dim'
                          }`}
                        >
                          {c.name[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-nomad-text truncate">
                            {c.name}
                          </div>
                          <div className="text-xs text-nomad-text-muted">{c.niche}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <button
          onClick={resetData}
          title="Restaurar dados iniciais"
          className="hidden sm:flex text-nomad-text-muted hover:text-nomad-text hover:bg-nomad-card p-2 rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
        <button className="relative text-nomad-text-dim hover:text-nomad-text hover:bg-nomad-card p-2 rounded-lg transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-nomad-yellow rounded-full" />
        </button>
      </div>
    </header>
  )
}
