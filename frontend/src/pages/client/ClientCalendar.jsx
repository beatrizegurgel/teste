import { useCallback, useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, LayoutGrid, List as ListIcon, Loader2, Download } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { api } from '../../api/client'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { PageHeader } from '../../components/layout/Layout'
import { CalendarGrid } from '../../components/CalendarGrid'
import { PostDrawer } from '../../components/PostDrawer'
import { statusStyle, formatIcon, parseDate } from '../../utils/post'
import { downloadFile } from '../../utils/media'

export default function ClientCalendar() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const now = new Date()
  const [cursor, setCursor] = useState({ year: now.getFullYear(), month: now.getMonth() })
  const [view, setView] = useState('calendar')
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { posts } = await api.listPosts()
      // O cliente não vê rascunhos da agência.
      setPosts(posts.filter((p) => p.status !== 'rascunho'))
    } catch (e) {
      showToast(e.message, 'error')
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => { load() }, [load])

  const monthPosts = useMemo(
    () => posts.filter((p) => {
      const d = parseDate(p.scheduledDate)
      return d && d.getFullYear() === cursor.year && d.getMonth() === cursor.month
    }),
    [posts, cursor]
  )

  const summary = useMemo(() => {
    const total = monthPosts.length
    const aprovado = monthPosts.filter((p) => p.status === 'aprovado' || p.status === 'publicado').length
    const aguardando = monthPosts.filter((p) => p.status === 'aguardando').length
    const reprovado = monthPosts.filter((p) => p.status === 'reprovado').length
    return { total, aprovado, aguardando, reprovado }
  }, [monthPosts])

  const progress = summary.total ? Math.round((summary.aprovado / summary.total) * 100) : 0
  const monthLabel = new Date(cursor.year, cursor.month, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
  const goPrev = () => setCursor((c) => { const d = new Date(c.year, c.month - 1, 1); return { year: d.getFullYear(), month: d.getMonth() } })
  const goNext = () => setCursor((c) => { const d = new Date(c.year, c.month + 1, 1); return { year: d.getFullYear(), month: d.getMonth() } })

  return (
    <div className="space-y-5">
      <PageHeader title="Meu Calendário de Conteúdo" subtitle={`Posts de ${user?.clientName || 'sua empresa'} — aprove, comente ou baixe`} />

      <Card>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 items-center">
          <Stat label="Total no mês" value={summary.total} />
          <Stat label="Aprovados" value={summary.aprovado} color="text-emerald-400" />
          <Stat label="Aguardando você" value={summary.aguardando} color="text-nomad-yellow" />
          <Stat label="Reprovados" value={summary.reprovado} color="text-red-400" />
          <div className="col-span-2 lg:col-span-1">
            <p className="text-xs text-nomad-text-muted uppercase tracking-wider mb-1.5">Aprovação</p>
            <div className="w-full bg-nomad-bg-2 rounded-full h-2 overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-xs text-nomad-text-muted mt-1">{summary.aprovado} de {summary.total} — {progress}%</p>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <NavBtn onClick={goPrev}><ChevronLeft className="w-4 h-4" /></NavBtn>
            <span className="font-semibold text-nomad-text capitalize min-w-[170px] text-center">{monthLabel}</span>
            <NavBtn onClick={goNext}><ChevronRight className="w-4 h-4" /></NavBtn>
          </div>
          <div className="flex bg-nomad-bg-2 border border-nomad-border rounded-lg p-0.5 sm:ml-auto">
            <ViewBtn active={view === 'calendar'} onClick={() => setView('calendar')}><LayoutGrid className="w-4 h-4" /></ViewBtn>
            <ViewBtn active={view === 'list'} onClick={() => setView('list')}><ListIcon className="w-4 h-4" /></ViewBtn>
          </div>
        </div>
      </Card>

      {loading ? (
        <Card className="flex items-center justify-center py-20 text-nomad-text-muted"><Loader2 className="w-6 h-6 animate-spin" /></Card>
      ) : view === 'calendar' ? (
        <Card className="p-4 overflow-visible">
          <CalendarGrid year={cursor.year} month={cursor.month} posts={monthPosts} onSelectPost={(p) => setSelectedId(p.id)} />
        </Card>
      ) : (
        <ListView posts={monthPosts} onSelect={(p) => setSelectedId(p.id)} onError={(m) => showToast(m, 'error')} />
      )}

      <PostDrawer postId={selectedId} onClose={() => setSelectedId(null)} onChanged={load} />
    </div>
  )
}

function ListView({ posts, onSelect, onError }) {
  const sorted = [...posts].sort((a, b) => (a.scheduledDate + a.scheduledTime).localeCompare(b.scheduledDate + b.scheduledTime))
  const download = async (e, p) => {
    e.stopPropagation()
    try { await downloadFile(p.fileId, p.fileName) } catch (err) { onError(err.message) }
  }
  return (
    <Card className="p-0 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead className="bg-nomad-bg-2 border-b border-nomad-border">
            <tr>
              {['Data', 'Formato', 'Título', 'Status', 'Ações'].map((h) => (
                <th key={h} className="text-left text-[11px] uppercase tracking-wider text-nomad-text-muted font-semibold px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((p) => {
              const cfg = statusStyle[p.status]
              const FIcon = formatIcon[p.format] || formatIcon.Outro
              const d = parseDate(p.scheduledDate)
              return (
                <tr key={p.id} className="border-b border-nomad-border hover:bg-nomad-bg-2/60 cursor-pointer" onClick={() => onSelect(p)}>
                  <td className="px-4 py-3 text-sm text-nomad-text whitespace-nowrap">
                    {d?.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                    <span className="text-nomad-text-muted ml-2">{p.scheduledTime}</span>
                  </td>
                  <td className="px-4 py-3"><Badge variant="gray" icon={FIcon} size="sm">{p.format}</Badge></td>
                  <td className="px-4 py-3 text-sm text-nomad-text-dim max-w-xs truncate">{p.title}</td>
                  <td className="px-4 py-3"><Badge variant={cfg.variant} size="sm">{cfg.emoji} {cfg.label}</Badge></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <button onClick={() => onSelect(p)} className="text-nomad-yellow text-xs hover:underline">Ver</button>
                      {p.fileId && (
                        <button onClick={(e) => download(e, p)} title="Baixar" className="text-nomad-text-muted hover:text-nomad-text"><Download className="w-4 h-4" /></button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
            {sorted.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-12 text-center text-nomad-text-muted text-sm">Nenhum post neste mês.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

function Stat({ label, value, color = 'text-nomad-text' }) {
  return (
    <div>
      <p className="text-xs text-nomad-text-muted uppercase tracking-wider">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  )
}
function NavBtn({ onClick, children }) {
  return <button onClick={onClick} className="p-2 rounded-lg bg-nomad-bg-2 hover:bg-nomad-card text-nomad-text-dim hover:text-nomad-text transition-colors">{children}</button>
}
function ViewBtn({ active, onClick, children }) {
  return <button onClick={onClick} className={`p-2 rounded-md transition-colors ${active ? 'bg-nomad-yellow text-nomad-bg' : 'text-nomad-text-dim hover:text-nomad-text'}`}>{children}</button>
}
