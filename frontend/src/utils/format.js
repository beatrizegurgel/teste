export const brl = (v) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0)

export const num = (v) =>
  new Intl.NumberFormat('pt-BR').format(v || 0)

export const pct = (v, digits = 1) =>
  `${Number(v || 0).toFixed(digits)}%`

export const fmtDate = (iso, opts = { day: '2-digit', month: 'short' }) => {
  if (!iso) return '-'
  return new Date(iso).toLocaleDateString('pt-BR', opts)
}

export const fmtDateTime = (iso) => {
  if (!iso) return '-'
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const fmtLongDate = (iso) => {
  if (!iso) return '-'
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

export const monthKey = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

export const formatMonthLabel = (date) =>
  date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
