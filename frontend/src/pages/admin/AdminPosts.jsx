import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight, LayoutGrid, List as ListIcon, Plus, Loader2, Pencil } from 'lucide-react'
import { api } from '../../api/client'
import { useToast } from '../../context/ToastContext'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { PageHeader } from '../../components/layout/Layout'
import { CalendarGrid } from '../../components/CalendarGrid'
import { PostDrawer } from '../../components/PostDrawer'
import { PostFormModal } from '../../components/PostFormModal'
import { statusStyle, formatIcon, parseDate } from '../../utils/post'

export default function AdminPosts() {
  const { showToast } = useToast()
  const [searchParams, setSearchParams] = useSearchParams()
  const now = new Date()
  const [cursor, setCursor] = useState({ year: now.getFullYear(), month: now.getMonth() })
  const [view, setView] = useState('calendar')
  const [clients, setClients] = useState([])
  const [clientFilter, setClientFilter] = useState(searchParams.get('client') || 'all')
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState(null)
  const [formOpen, setFormOpen] = useState(false)
  const [formInitial, setFormInitial] = useState(null)

  useEffect(() => {
    api.listClients().then((r) => setClients(r.clients)).catch((e) => showToast(e.message, 'error'))
  }, [showToast])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { posts } = await api.listPosts({ clientId: clientFilter === 'all' ? undefined : clientFilter })
      setPosts(posts)
    } catch (e) {
      showToast(e.message, 'error')
    } finally {
      setLoading(false)
    }
  }, [clientFilter, showToast])

  useEffect(() => { load() }, [load])

  const onFilterChange = (v) => {
    setClientFilter(v)
    if (v === 'all') setSearchParams({})
    else setSearchParams({ client: v })
  }

  const monthPosts = useMemo(
    () => posts.filter((p) => {
      const d = parseDate(p.scheduledDate)
      return d && d.getFullYear() === cursor.year && d.getMonth() === cursor.month
    }),
    [posts, cursor]
  )

  const monthLabel = new Date(cursor.year, cursor.month, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
  const goPrev = () => setCursor((c) => { const d = new Date(c.year, c.month - 1, 1); return { year: d.getFullYear(), month: d.getMonth() } })
  const goNext = () => setCursor((c) => { const d = new Date(c.year, c.month + 1, 1); return { year: d.getFullYear(), month: d.getMonth() } })

  const openNew = (dateStr) => {
    setFormInitial(dateStr ? { scheduledDate: dateStr } : null)
    setFormOpen(true)
  }
  const openEdit = (post) => {
    setSelectedId(null)
    setFormInitial(post)
    setFormOpen(true)
  }

  const defaultClientId = clientFilter !== 'all' ? clientFilter : undefined

  return (
    <div className="space-y-5">
      <PageHeader
        title="Posts & Calendário"
        subtitle="Suba, edite e associe artes, vídeos e PDFs às datas de cada cliente"
        actions={<Button icon={Plus} onClick={() => openNew()}>Novo post</Button>}
      />

      <Card className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <NavBtn onClick={goPrev}><ChevronLeft className="w-4 h-4" /></NavBtn>
            <span className="font-semibold text-nomad-text capitalize min-w-[170px] text-center">{monthLabel}</span>
            <NavBtn onClick={goNext}><ChevronRight className="w-4 h-4" /></NavBtn>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
            <select value={clientFilter} onChange={(e) => onFilterChange(e.target.value)} className="nomad-input py-2">
              <option value="all">Todos os clientes</option>
              {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <div className="flex bg-nomad-bg-2 border border-nomad-border rounded-lg p-0.5">
              <ViewBtn active={view === 'calendar'} onClick={() => setView('calendar')}><LayoutGrid className="w-4 h-4" /></ViewBtn>
              <ViewBtn active={view === 'list'} onClick={() => setView('list')}><ListIcon className="w-4 h-4" /></ViewBtn>
            </div>
          </div>
        </div>
      </Card>

      {loading ? (
        <Card className="flex items-center justify-center py-20 text-nomad-text-muted"><Loader2 className="w-6 h-6 animate-spin" /></Card>
      ) : view === 'calendar' ? (
        <Card className="p-4 overflow-visible">
          <CalendarGrid year={cursor.year} month={cursor.month} posts={monthPosts} onSelectPost={(p) => setSelectedId(p.id)} onAddOnDay={openNew} />
        </Card>
      ) : (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead className="bg-nomad-bg-2 border-b border-nomad-border">
                <tr>
                  {['Data', 'Cliente', 'Formato', 'Título', 'Status', ''].map((h) => (
                    <th key={h} className="text-left text-[11px] uppercase tracking-wider text-nomad-text-muted font-semibold px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...monthPosts].sort((a, b) => (a.scheduledDate + a.scheduledTime).localeCompare(b.scheduledDate + b.scheduledTime)).map((p) => {
                  const cfg = statusStyle[p.status]
                  const FIcon = formatIcon[p.format] || formatIcon.Outro
                  const d = parseDate(p.scheduledDate)
                  return (
                    <tr key={p.id} className="border-b border-nomad-border hover:bg-nomad-bg-2/60 cursor-pointer" onClick={() => setSelectedId(p.id)}>
                      <td className="px-4 py-3 text-sm text-nomad-text whitespace-nowrap">
                        {d?.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}<span className="text-nomad-text-muted ml-2">{p.scheduledTime}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-nomad-text-dim">{p.clientName}</td>
                      <td className="px-4 py-3"><Badge variant="gray" icon={FIcon} size="sm">{p.format}</Badge></td>
                      <td className="px-4 py-3 text-sm text-nomad-text-dim max-w-xs truncate">{p.title}</td>
                      <td className="px-4 py-3"><Badge variant={cfg.variant} size="sm">{cfg.emoji} {cfg.label}</Badge></td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={(e) => { e.stopPropagation(); openEdit(p) }} className="text-nomad-text-muted hover:text-nomad-yellow"><Pencil className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  )
                })}
                {monthPosts.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-12 text-center text-nomad-text-muted text-sm">Nenhum post neste mês. Clique em “Novo post”.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <PostDrawer postId={selectedId} onClose={() => setSelectedId(null)} onChanged={load} onEdit={openEdit} />
      <PostFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSaved={load}
        clients={clients}
        initial={formInitial}
        defaultClientId={defaultClientId}
      />
    </div>
  )
}

function NavBtn({ onClick, children }) {
  return <button onClick={onClick} className="p-2 rounded-lg bg-nomad-bg-2 hover:bg-nomad-card text-nomad-text-dim hover:text-nomad-text transition-colors">{children}</button>
}
function ViewBtn({ active, onClick, children }) {
  return <button onClick={onClick} className={`p-2 rounded-md transition-colors ${active ? 'bg-nomad-yellow text-nomad-bg' : 'text-nomad-text-dim hover:text-nomad-text'}`}>{children}</button>
}
