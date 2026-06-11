export function Card({ children, className = '', hoverable = false, ...rest }) {
  return (
    <div
      className={`nomad-card p-5 ${hoverable ? 'nomad-card-hover' : ''} ${className}`}
      {...rest}
    >
      {children}
    </div>
  )
}

export function CardHeader({ title, subtitle, action, icon: Icon }) {
  return (
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-start gap-3">
        {Icon && (
          <div className="w-10 h-10 rounded-lg bg-nomad-yellow/10 text-nomad-yellow flex items-center justify-center flex-shrink-0">
            <Icon className="w-5 h-5" />
          </div>
        )}
        <div>
          <h3 className="text-base font-semibold text-nomad-text">{title}</h3>
          {subtitle && <p className="text-sm text-nomad-text-muted mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  )
}
