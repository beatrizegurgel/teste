import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Loader2, Clock, CheckCircle2, XCircle, FileText, Layers, Plus, ArrowRight } from 'lucide-react'
import { api } from '../../api/client'
import { useToast } from '../../context/ToastContext'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { PageHeader } from '../../components/layout/Layout'

export default function AdminDashboard() {
  const { showToast } = useToast()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.stats().then(setData).catch((e) => showToast(e.message, 'error')).finally(() => setLoading(false))
  }, [showToast])

  if (loading) {
    return <div className="flex items-center justify-center py-24 text-nomad-text-muted"><Loader2 className="w-6 h-6 animate-spin" /></div>
  }

  const c = data?.counts || {}
  const cards = [
    { label: 'Total de posts', value: data?.total || 0, icon: Layers, color: 'text-nomad-text' },
    { label: 'Aguardando cliente', value: c.aguardando || 0, icon: Clock, color: 'text-nomad-yellow' },
    { label: 'Aprovados', value: (c.aprovado || 0) + (c.publicado || 0), icon: CheckCircle2, color: 'text-emerald-400' },
    { label: 'Reprovados', value: c.reprovado || 0, icon: XCircle, color: 'text-red-400' },
    { label: 'Rascunhos', value: c.rascunho || 0, icon: FileText, color: 'text-nomad-text-muted' },
  ]

  return (
    <div className="space-y-5">
      <PageHeader
        title="Painel de Controle"
        subtitle="Visão geral de todos os clientes e posts gerenciados pela NOMAD"
        actions={<Link to="/admin/posts"><Button icon={Plus}>Novo post</Button></Link>}
      />

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <Card key={card.label}>
              <div className="flex items-center gap-2 text-nomad-text-muted text-xs uppercase tracking-wider">
                <Icon className="w-4 h-4" /> {card.label}
              </div>
              <p className={`text-3xl font-bold mt-2 ${card.color}`}>{card.value}</p>
            </Card>
          )
        })}
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="p-5 border-b border-nomad-border flex items-center justify-between">
          <h3 className="font-semibold text-nomad-text">Clientes</h3>
          <Link to="/admin/clients" className="text-nomad-yellow text-sm hover:underline flex items-center gap-1">
            Gerenciar <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead className="bg-nomad-bg-2 border-b border-nomad-border">
              <tr>
                {['Empresa', 'Total', 'Aguardando', 'Aprovados', 'Reprovados', ''].map((h) => (
                  <th key={h} className="text-left text-[11px] uppercase tracking-wider text-nomad-text-muted font-semibold px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(data?.perClient || []).map((row) => (
                <tr key={row.clientId} className="border-b border-nomad-border hover:bg-nomad-bg-2/60">
                  <td className="px-4 py-3 text-sm font-medium text-nomad-text">{row.clientName || '—'}</td>
                  <td className="px-4 py-3 text-sm text-nomad-text-dim">{row.total}</td>
                  <td className="px-4 py-3">{row.aguardando > 0 ? <Badge variant="yellow" size="sm">{row.aguardando}</Badge> : <span className="text-nomad-text-muted text-sm">0</span>}</td>
                  <td className="px-4 py-3 text-sm text-emerald-400">{row.aprovados}</td>
                  <td className="px-4 py-3 text-sm text-red-400">{row.reprovados}</td>
                  <td className="px-4 py-3 text-right">
                    <Link to={`/admin/posts?client=${row.clientId}`} className="text-nomad-yellow text-xs hover:underline">Ver calendário</Link>
                  </td>
                </tr>
              ))}
              {(!data?.perClient || data.perClient.length === 0) && (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-nomad-text-muted text-sm">Nenhum post cadastrado ainda.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
