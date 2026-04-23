import { useMemo, useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  LayoutGrid,
  List as ListIcon,
  Check,
  X,
  MessageCircle,
  Clock,
  CheckCircle2,
  XCircle,
  Send,
  FileText as FileIcon,
  Film,
  Image as ImageIcon,
  Images,
  Camera,
  ExternalLink,
} from 'lucide-react'
import { useApp } from '../store/AppContext'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Drawer, Modal } from '../components/ui/Modal'
import { PageHeader } from '../components/layout/Layout'
import { fmtDateTime } from '../utils/format'

const statusStyle = {
  aguardando: { variant: 'yellow', label: 'Aguardando', emoji: '🟡', icon: Clock },
  aprovado: { variant: 'green', label: 'Aprovado', emoji: '✅', icon: CheckCircle2 },
  reprovado: { variant: 'red', label: 'Reprovado', emoji: '🔴', icon: XCircle },
  publicado: { variant: 'blue', label: 'Publicado', emoji: '🔵', icon: Send },
  rascunho: { variant: 'gray', label: 'Rascunho', emoji: '⚪', icon: FileIcon },
}

const formatIcon = {
  Reels: Film,
  Feed: ImageIcon,
  Carrossel: Images,
  Stories: Camera,
}

const historyStyle = {
  enviado: { icon: Send, color: 'text-blue-400' },
  aprovado: { icon: CheckCircle2, color: 'text-emerald-400' },
  reprovado: { icon: XCircle, color: 'text-red-400' },
  ajuste: { icon: MessageCircle, color: 'text-orange-400' },
  publicado: { icon: Send, color: 'text-blue-400' },
}

const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

function buildCalendarGrid(year, month) {
  const firstDay = new Date(year, month, 1)
  const startDay = firstDay.getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells = []
  for (let i = 0; i < startDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

function PostDrawer({ post, onClose }) {
  const { approvePost, rejectPost, requestAdjustment } = useApp()
  const [action, setAction] = useState(null) // 'reprovar' | 'ajuste' | null
  const [feedback, setFeedback] = useState('')

  if (!post) return null
  const cfg = statusStyle[post.status]
  const FIcon = formatIcon[post.format] || ImageIcon

  const submitFeedback = () => {
    if (!feedback.trim()) return
    if (action === 'reprovar') rejectPost(post.id, feedback)
    else requestAdjustment(post.id, feedback)
    setAction(null)
    setFeedback('')
    onClose()
  }

  const handleApprove = () => {
    approvePost(post.id)
    onClose()
  }

  const isImageUrl = post.mediaUrl && /\.(jpg|jpeg|png|webp|gif)/i.test(post.mediaUrl)
  const canAct = post.status === 'aguardando' || post.status === 'reprovado'

  return (
    <Drawer
      open={!!post}
      onClose={onClose}
      title={`Post • ${post.format}`}
      subtitle={fmtDateTime(post.scheduledAt) + ' às ' + post.scheduledTime}
      width="md"
      footer={
        canAct && !action ? (
          <>
            <Button variant="danger" onClick={() => setAction('reprovar')}>
              <X className="w-4 h-4" /> Reprovar
            </Button>
            <Button variant="secondary" onClick={() => setAction('ajuste')}>
              <MessageCircle className="w-4 h-4" /> Pedir ajuste
            </Button>
            <Button variant="success" onClick={handleApprove}>
              <Check className="w-4 h-4" /> Aprovar
            </Button>
          </>
        ) : action ? (
          <>
            <Button variant="secondary" onClick={() => setAction(null)}>
              Cancelar
            </Button>
            <Button variant={action === 'reprovar' ? 'danger' : 'primary'} onClick={submitFeedback}>
              Enviar feedback
            </Button>
          </>
        ) : null
      }
    >
      <div className="space-y-5">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant={cfg.variant} icon={cfg.icon}>
            {cfg.emoji} {cfg.label}
          </Badge>
          <Badge variant="gray" icon={FIcon}>
            {post.format}
          </Badge>
        </div>

        <div>
          <div className="text-[11px] uppercase tracking-wider text-nomad-text-muted font-semibold mb-2">
            Preview do criativo
          </div>
          {isImageUrl ? (
            <img
              src={post.mediaUrl}
              alt="Preview"
              className="w-full aspect-square object-cover rounded-lg bg-nomad-bg-2 border border-nomad-border"
            />
          ) : (
            <div className="w-full aspect-video rounded-lg bg-nomad-bg-2 border border-nomad-border flex flex-col items-center justify-center text-nomad-text-muted gap-2">
              <FIcon className="w-10 h-10" />
              <span className="text-sm">Sem preview disponível</span>
              {post.creativeLink && (
                <a
                  href={post.creativeLink}
                  target="_blank"
                  rel="noreferrer"
                  className="text-nomad-yellow text-sm flex items-center gap-1 hover:underline"
                >
                  Ver arquivo <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          )}
        </div>

        <div>
          <div className="text-[11px] uppercase tracking-wider text-nomad-text-muted font-semibold mb-2">
            Legenda
          </div>
          <div className="bg-nomad-bg-2 border border-nomad-border rounded-lg p-3 text-sm text-nomad-text-dim whitespace-pre-wrap">
            {post.caption}
          </div>
        </div>

        <div>
          <div className="text-[11px] uppercase tracking-wider text-nomad-text-muted font-semibold mb-2">
            Link do criativo
          </div>
          {post.creativeLink ? (
            <a
              href={post.creativeLink}
              target="_blank"
              rel="noreferrer"
              className="text-nomad-yellow text-sm flex items-center gap-1 hover:underline break-all"
            >
              {post.creativeLink}
              <ExternalLink className="w-3 h-3 flex-shrink-0" />
            </a>
          ) : (
            <p className="text-sm text-nomad-text-muted">Nenhum link anexado.</p>
          )}
        </div>

        {action && (
          <div className="bg-nomad-bg-2 border border-nomad-yellow/40 rounded-lg p-3 space-y-2">
            <label className="block text-xs font-medium text-nomad-text-dim">
              {action === 'reprovar'
                ? 'Motivo da reprovação *'
                : 'Ajuste solicitado *'}
            </label>
            <textarea
              rows={4}
              autoFocus
              required
              className="nomad-input w-full resize-none"
              placeholder={
                action === 'reprovar'
                  ? 'Explique por que este post foi reprovado...'
                  : 'Descreva o ajuste desejado...'
              }
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            />
          </div>
        )}

        {post.clientFeedback && !action && (
          <div className="bg-red-500/5 border border-red-500/30 rounded-lg p-3">
            <div className="text-[11px] uppercase tracking-wider text-red-400 font-semibold mb-1">
              Feedback do cliente
            </div>
            <p className="text-sm text-nomad-text-dim">{post.clientFeedback}</p>
          </div>
        )}

        <div>
          <div className="text-[11px] uppercase tracking-wider text-nomad-text-muted font-semibold mb-2">
            Histórico de interações
          </div>
          <div className="space-y-3">
            {post.history.map((h, i) => {
              const hStyle = historyStyle[h.type] || historyStyle.enviado
              const HIcon = hStyle.icon
              return (
                <div key={i} className="flex items-start gap-3">
                  <div
                    className={`w-7 h-7 rounded-full bg-nomad-bg-2 border border-nomad-border flex items-center justify-center flex-shrink-0 ${hStyle.color}`}
                  >
                    <HIcon className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold text-nomad-text">{h.author}</span>
                      <span className="text-xs text-nomad-text-muted">{fmtDateTime(h.date)}</span>
                    </div>
                    <p className="text-sm text-nomad-text-dim mt-0.5">{h.message}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </Drawer>
  )
}

export default function ContentCalendar() {
  const { calendarPosts, approveAllPending } = useApp()
  const now = new Date()
  const [cursor, setCursor] = useState({ year: now.getFullYear(), month: now.getMonth() })
  const [view, setView] = useState('calendar') // calendar | list
  const [statusFilter, setStatusFilter] = useState('todos')
  const [formatFilter, setFormatFilter] = useState('todos')
  const [selectedPost, setSelectedPost] = useState(null)
  const [confirmBulk, setConfirmBulk] = useState(false)

  const postsOfMonth = useMemo(
    () =>
      calendarPosts.filter((p) => {
        const d = new Date(p.scheduledAt)
        return d.getFullYear() === cursor.year && d.getMonth() === cursor.month
      }),
    [calendarPosts, cursor]
  )

  const filtered = useMemo(() => {
    return postsOfMonth.filter((p) => {
      if (statusFilter !== 'todos' && p.status !== statusFilter) return false
      if (formatFilter !== 'todos' && p.format !== formatFilter) return false
      return true
    })
  }, [postsOfMonth, statusFilter, formatFilter])

  const postsByDay = useMemo(() => {
    const map = {}
    filtered.forEach((p) => {
      const d = new Date(p.scheduledAt).getDate()
      if (!map[d]) map[d] = []
      map[d].push(p)
    })
    return map
  }, [filtered])

  const summary = useMemo(() => {
    const total = postsOfMonth.length
    const aprovado = postsOfMonth.filter((p) => p.status === 'aprovado' || p.status === 'publicado').length
    const aguardando = postsOfMonth.filter((p) => p.status === 'aguardando').length
    const reprovado = postsOfMonth.filter((p) => p.status === 'reprovado').length
    return { total, aprovado, aguardando, reprovado }
  }, [postsOfMonth])

  const progress = summary.total > 0 ? Math.round((summary.aprovado / summary.total) * 100) : 0

  const cells = buildCalendarGrid(cursor.year, cursor.month)
  const monthLabel = new Date(cursor.year, cursor.month, 1).toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  })

  const goPrev = () => {
    setCursor((c) => {
      const d = new Date(c.year, c.month - 1, 1)
      return { year: d.getFullYear(), month: d.getMonth() }
    })
  }
  const goNext = () => {
    setCursor((c) => {
      const d = new Date(c.year, c.month + 1, 1)
      return { year: d.getFullYear(), month: d.getMonth() }
    })
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Calendário de Conteúdo"
        subtitle="Aprove e acompanhe os posts do mês"
        actions={
          summary.aguardando > 0 ? (
            <Button icon={Check} onClick={() => setConfirmBulk(true)}>
              Aprovar todos pendentes
            </Button>
          ) : null
        }
      />

      {/* Summary bar */}
      <Card>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 items-center">
          <div>
            <p className="text-xs text-nomad-text-muted uppercase tracking-wider">Total</p>
            <p className="text-2xl font-bold text-nomad-text">{summary.total}</p>
          </div>
          <div>
            <p className="text-xs text-nomad-text-muted uppercase tracking-wider">Aprovados</p>
            <p className="text-2xl font-bold text-emerald-400">{summary.aprovado}</p>
          </div>
          <div>
            <p className="text-xs text-nomad-text-muted uppercase tracking-wider">Aguardando</p>
            <p className="text-2xl font-bold text-nomad-yellow">{summary.aguardando}</p>
          </div>
          <div>
            <p className="text-xs text-nomad-text-muted uppercase tracking-wider">Reprovados</p>
            <p className="text-2xl font-bold text-red-400">{summary.reprovado}</p>
          </div>
          <div className="col-span-2 lg:col-span-1">
            <p className="text-xs text-nomad-text-muted uppercase tracking-wider mb-1.5">Aprovação</p>
            <div className="w-full bg-nomad-bg-2 rounded-full h-2 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-nomad-text-muted mt-1">
              {summary.aprovado} de {summary.total} — {progress}%
            </p>
          </div>
        </div>
      </Card>

      {/* Controls */}
      <Card className="p-4">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={goPrev}
              className="p-2 rounded-lg bg-nomad-bg-2 hover:bg-nomad-card text-nomad-text-dim hover:text-nomad-text"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold text-nomad-text capitalize min-w-[180px] text-center">
              {monthLabel}
            </span>
            <button
              onClick={goNext}
              className="p-2 rounded-lg bg-nomad-bg-2 hover:bg-nomad-card text-nomad-text-dim hover:text-nomad-text"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 lg:ml-auto">
            <Filter className="w-4 h-4 text-nomad-text-muted" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="nomad-input py-2"
            >
              <option value="todos">Todos os status</option>
              <option value="aguardando">Aguardando</option>
              <option value="aprovado">Aprovado</option>
              <option value="reprovado">Reprovado</option>
              <option value="publicado">Publicado</option>
              <option value="rascunho">Rascunho</option>
            </select>
            <select
              value={formatFilter}
              onChange={(e) => setFormatFilter(e.target.value)}
              className="nomad-input py-2"
            >
              <option value="todos">Todos os formatos</option>
              <option value="Feed">Feed</option>
              <option value="Reels">Reels</option>
              <option value="Stories">Stories</option>
              <option value="Carrossel">Carrossel</option>
            </select>

            <div className="flex bg-nomad-bg-2 border border-nomad-border rounded-lg p-0.5">
              <button
                onClick={() => setView('calendar')}
                className={`p-2 rounded-md transition-colors ${
                  view === 'calendar'
                    ? 'bg-nomad-yellow text-nomad-bg'
                    : 'text-nomad-text-dim hover:text-nomad-text'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setView('list')}
                className={`p-2 rounded-md transition-colors ${
                  view === 'list'
                    ? 'bg-nomad-yellow text-nomad-bg'
                    : 'text-nomad-text-dim hover:text-nomad-text'
                }`}
              >
                <ListIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </Card>

      {view === 'calendar' ? (
        <Card className="p-4">
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map((d) => (
              <div
                key={d}
                className="text-[11px] uppercase tracking-wider text-nomad-text-muted font-semibold text-center py-2"
              >
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {cells.map((day, idx) => {
              const dayPosts = day ? postsByDay[day] || [] : []
              const isToday =
                day &&
                day === now.getDate() &&
                cursor.month === now.getMonth() &&
                cursor.year === now.getFullYear()
              return (
                <div
                  key={idx}
                  className={`min-h-[90px] rounded-lg border p-1.5 ${
                    day
                      ? 'border-nomad-border bg-nomad-bg-2/40'
                      : 'border-transparent'
                  } ${isToday ? 'border-nomad-yellow/60 bg-nomad-yellow/5' : ''}`}
                >
                  {day && (
                    <>
                      <div
                        className={`text-[11px] font-semibold mb-1 ${
                          isToday ? 'text-nomad-yellow' : 'text-nomad-text-muted'
                        }`}
                      >
                        {day}
                      </div>
                      <div className="space-y-1">
                        {dayPosts.map((p) => {
                          const cfg = statusStyle[p.status]
                          const FIcon = formatIcon[p.format] || ImageIcon
                          return (
                            <button
                              key={p.id}
                              onClick={() => setSelectedPost(p)}
                              className={`w-full text-left text-[10px] px-1.5 py-1 rounded border truncate flex items-center gap-1 hover:brightness-110 transition-all ${
                                cfg.variant === 'green'
                                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                                  : cfg.variant === 'yellow'
                                  ? 'bg-nomad-yellow/10 border-nomad-yellow/30 text-nomad-yellow'
                                  : cfg.variant === 'red'
                                  ? 'bg-red-500/10 border-red-500/30 text-red-300'
                                  : cfg.variant === 'blue'
                                  ? 'bg-blue-500/10 border-blue-500/30 text-blue-300'
                                  : 'bg-nomad-border/40 border-nomad-border text-nomad-text-dim'
                              }`}
                            >
                              <FIcon className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">{p.caption.slice(0, 24)}</span>
                            </button>
                          )
                        })}
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </Card>
      ) : (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead className="bg-nomad-bg-2 border-b border-nomad-border">
                <tr>
                  <th className="text-left text-[11px] uppercase tracking-wider text-nomad-text-muted font-semibold px-4 py-3">
                    Data
                  </th>
                  <th className="text-left text-[11px] uppercase tracking-wider text-nomad-text-muted font-semibold px-4 py-3">
                    Formato
                  </th>
                  <th className="text-left text-[11px] uppercase tracking-wider text-nomad-text-muted font-semibold px-4 py-3">
                    Legenda
                  </th>
                  <th className="text-left text-[11px] uppercase tracking-wider text-nomad-text-muted font-semibold px-4 py-3">
                    Status
                  </th>
                  <th className="text-right text-[11px] uppercase tracking-wider text-nomad-text-muted font-semibold px-4 py-3">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered
                  .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt))
                  .map((p) => {
                    const cfg = statusStyle[p.status]
                    const FIcon = formatIcon[p.format] || ImageIcon
                    return (
                      <tr
                        key={p.id}
                        className="border-b border-nomad-border hover:bg-nomad-bg-2/60 transition-colors cursor-pointer"
                        onClick={() => setSelectedPost(p)}
                      >
                        <td className="px-4 py-3 text-sm text-nomad-text whitespace-nowrap">
                          {new Date(p.scheduledAt).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: 'short',
                          })}
                          <span className="text-nomad-text-muted ml-2">{p.scheduledTime}</span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <Badge variant="gray" icon={FIcon} size="sm">
                            {p.format}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-sm text-nomad-text-dim max-w-xs truncate">
                          {p.caption}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={cfg.variant} size="sm">
                            {cfg.emoji} {cfg.label}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedPost(p)
                            }}
                            className="text-nomad-yellow text-xs hover:underline"
                          >
                            Ver detalhes
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-12 text-center text-nomad-text-muted text-sm"
                    >
                      Nenhum post encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <PostDrawer post={selectedPost} onClose={() => setSelectedPost(null)} />

      <Modal
        open={confirmBulk}
        onClose={() => setConfirmBulk(false)}
        title="Aprovar todos os pendentes?"
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmBulk(false)}>
              Cancelar
            </Button>
            <Button
              variant="success"
              onClick={() => {
                approveAllPending()
                setConfirmBulk(false)
              }}
            >
              Aprovar {summary.aguardando} posts
            </Button>
          </>
        }
      >
        <p className="text-sm text-nomad-text-dim">
          Você está prestes a aprovar <strong>{summary.aguardando} posts</strong> que estão aguardando sua
          aprovação. Esta ação não pode ser desfeita individualmente.
        </p>
      </Modal>
    </div>
  )
}
