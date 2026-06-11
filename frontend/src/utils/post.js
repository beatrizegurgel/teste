import { Clock, CheckCircle2, XCircle, Send, FileText, Film, Image as ImageIcon, Images, Camera, MessageCircle, Pencil } from 'lucide-react'

export const statusStyle = {
  rascunho: { variant: 'gray', label: 'Rascunho', emoji: '⚪', icon: FileText },
  aguardando: { variant: 'yellow', label: 'Aguardando', emoji: '🟡', icon: Clock },
  aprovado: { variant: 'green', label: 'Aprovado', emoji: '✅', icon: CheckCircle2 },
  reprovado: { variant: 'red', label: 'Reprovado', emoji: '🔴', icon: XCircle },
  publicado: { variant: 'blue', label: 'Publicado', emoji: '🔵', icon: Send },
}

export const formatIcon = {
  Reels: Film,
  Feed: ImageIcon,
  Carrossel: Images,
  Stories: Camera,
  Outro: FileText,
}

export const eventStyle = {
  criado: { icon: Pencil, color: 'text-nomad-text-muted', label: 'Criado' },
  editado: { icon: Pencil, color: 'text-blue-400', label: 'Editado' },
  enviado: { icon: Send, color: 'text-blue-400', label: 'Enviado' },
  aprovado: { icon: CheckCircle2, color: 'text-emerald-400', label: 'Aprovado' },
  reprovado: { icon: XCircle, color: 'text-red-400', label: 'Reprovado' },
  comentario: { icon: MessageCircle, color: 'text-orange-400', label: 'Comentário' },
  publicado: { icon: Send, color: 'text-blue-400', label: 'Publicado' },
}

export const FORMATS = ['Feed', 'Reels', 'Stories', 'Carrossel', 'Outro']

// Converte "YYYY-MM-DD" para uma data local estável (sem fuso surpresa).
export function parseDate(ymd) {
  if (!ymd) return null
  const [y, m, d] = ymd.split('-').map(Number)
  return new Date(y, (m || 1) - 1, d || 1)
}

export function fmtScheduled(post) {
  const d = parseDate(post.scheduledDate)
  if (!d) return '—'
  const date = d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
  return post.scheduledTime ? `${date} às ${post.scheduledTime}` : date
}

export function fmtEventTime(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}
