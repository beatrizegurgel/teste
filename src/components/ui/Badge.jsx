const variants = {
  yellow: 'bg-nomad-yellow/15 text-nomad-yellow border-nomad-yellow/30',
  green: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  red: 'bg-red-500/15 text-red-400 border-red-500/30',
  blue: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  gray: 'bg-nomad-border/30 text-nomad-text-dim border-nomad-border-light',
  purple: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  orange: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  pink: 'bg-pink-500/15 text-pink-400 border-pink-500/30',
}

const sizes = {
  sm: 'text-[10px] px-2 py-0.5',
  md: 'text-xs px-2.5 py-1',
  lg: 'text-sm px-3 py-1.5',
}

export function Badge({ children, variant = 'gray', size = 'md', icon: Icon, className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium border rounded-full whitespace-nowrap ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {Icon && <Icon className="w-3 h-3" />}
      {children}
    </span>
  )
}

// Mapas semânticos
export const statusToVariant = {
  no_prazo: 'green',
  atencao: 'orange',
  em_atraso: 'red',
  planejado: 'blue',
  em_execucao: 'yellow',
  concluido: 'green',
  pausado: 'gray',
  ativa: 'green',
  pausada: 'gray',
  alta: 'red',
  media: 'orange',
  baixa: 'blue',
  aprovado: 'green',
  aguardando: 'yellow',
  reprovado: 'red',
  publicado: 'blue',
  rascunho: 'gray',
}

export const statusLabel = {
  no_prazo: 'No prazo',
  atencao: 'Atenção',
  em_atraso: 'Em atraso',
  planejado: 'Planejado',
  em_execucao: 'Em execução',
  concluido: 'Concluído',
  pausado: 'Pausado',
  ativa: 'Ativa',
  pausada: 'Pausada',
  alta: 'Alta',
  media: 'Média',
  baixa: 'Baixa',
  aprovado: 'Aprovado',
  aguardando: 'Aguardando aprovação',
  reprovado: 'Reprovado',
  publicado: 'Publicado',
  rascunho: 'Rascunho',
}
