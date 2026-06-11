// Layout centralizado e responsivo das telas de login/cadastro.
export function AuthShell({ title, subtitle, children }) {
  return (
    <div className="min-h-screen bg-nomad-bg text-nomad-text flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-3 mb-6 justify-center">
          <div className="w-11 h-11 rounded-xl bg-nomad-yellow flex items-center justify-center font-extrabold text-nomad-bg text-2xl">N</div>
          <div>
            <div className="font-bold text-lg leading-tight">NOMAD</div>
            <div className="text-xs text-nomad-text-muted leading-tight">Plataforma de Conteúdo</div>
          </div>
        </div>
        <div className="nomad-card p-6 sm:p-8 animate-slide-up">
          <h1 className="text-xl font-bold text-nomad-text">{title}</h1>
          {subtitle && <p className="text-sm text-nomad-text-muted mt-1 mb-5">{subtitle}</p>}
          {children}
        </div>
        <p className="text-center text-xs text-nomad-text-muted mt-6">© {new Date().getFullYear()} NOMAD · Aprovação de conteúdo</p>
      </div>
    </div>
  )
}
