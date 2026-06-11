const variants = {
  primary: 'nomad-button-primary',
  secondary: 'nomad-button-secondary',
  ghost: 'nomad-button-ghost',
  danger: 'bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-colors rounded-lg px-4 py-2.5 text-sm font-medium flex items-center justify-center gap-2',
  success: 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition-colors rounded-lg px-4 py-2.5 text-sm font-medium flex items-center justify-center gap-2',
}

export function Button({
  children,
  variant = 'primary',
  icon: Icon,
  iconRight: IconRight,
  className = '',
  type = 'button',
  ...rest
}) {
  return (
    <button type={type} className={`${variants[variant] || variants.primary} ${className}`} {...rest}>
      {Icon && <Icon className="w-4 h-4" />}
      {children}
      {IconRight && <IconRight className="w-4 h-4" />}
    </button>
  )
}
