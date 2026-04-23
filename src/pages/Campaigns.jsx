import { useMemo, useState } from 'react'
import { Filter, Megaphone } from 'lucide-react'
import { useApp } from '../store/AppContext'
import { Card } from '../components/ui/Card'
import { Badge, statusToVariant, statusLabel } from '../components/ui/Badge'
import { Sparkline } from '../components/ui/Sparkline'
import { PageHeader } from '../components/layout/Layout'
import { brl, num } from '../utils/format'

const channelStyle = {
  Meta: { variant: 'blue', label: 'Meta Ads' },
  Google: { variant: 'red', label: 'Google Ads' },
  TikTok: { variant: 'pink', label: 'TikTok Ads' },
}

export default function Campaigns() {
  const { campaigns } = useApp()
  const [channelFilter, setChannelFilter] = useState('todos')
  const [statusFilter, setStatusFilter] = useState('todos')

  const filtered = useMemo(() => {
    return campaigns.filter((c) => {
      if (channelFilter !== 'todos' && c.channel !== channelFilter) return false
      if (statusFilter !== 'todos' && c.status !== statusFilter) return false
      return true
    })
  }, [campaigns, channelFilter, statusFilter])

  const totals = useMemo(() => {
    return filtered.reduce(
      (acc, c) => ({
        inv: acc.inv + c.investment,
        leads: acc.leads + c.leads,
      }),
      { inv: 0, leads: 0 }
    )
  }, [filtered])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Campanhas Ativas"
        subtitle={`${filtered.length} campanhas • ${brl(totals.inv)} investidos • ${num(totals.leads)} leads`}
      />

      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-3">
          <Filter className="w-4 h-4 text-nomad-text-muted" />
          <select
            value={channelFilter}
            onChange={(e) => setChannelFilter(e.target.value)}
            className="nomad-input py-2"
          >
            <option value="todos">Todos os canais</option>
            <option value="Meta">Meta Ads</option>
            <option value="Google">Google Ads</option>
            <option value="TikTok">TikTok Ads</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="nomad-input py-2"
          >
            <option value="todos">Todos os status</option>
            <option value="ativa">Ativa</option>
            <option value="pausada">Pausada</option>
          </select>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-3">
        {filtered.length === 0 && (
          <Card className="text-center py-16 text-nomad-text-muted">
            Nenhuma campanha encontrada.
          </Card>
        )}
        {filtered.map((c) => {
          const ch = channelStyle[c.channel] || { variant: 'gray', label: c.channel }
          return (
            <Card key={c.id} hoverable>
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-nomad-yellow/10 text-nomad-yellow flex items-center justify-center flex-shrink-0">
                    <Megaphone className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-nomad-text truncate">{c.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={ch.variant} size="sm">
                        {ch.label}
                      </Badge>
                      <Badge variant={statusToVariant[c.status]} size="sm">
                        {statusLabel[c.status]}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-6 lg:gap-8 flex-shrink-0">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-nomad-text-muted font-medium">
                      Investimento
                    </p>
                    <p className="text-sm font-semibold text-nomad-text mt-1">
                      {brl(c.investment)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-nomad-text-muted font-medium">
                      Leads
                    </p>
                    <p className="text-sm font-semibold text-nomad-text mt-1">{num(c.leads)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-nomad-text-muted font-medium">
                      ROAS
                    </p>
                    <p
                      className={`text-sm font-semibold mt-1 ${
                        c.roas >= 4
                          ? 'text-emerald-400'
                          : c.roas >= 3
                          ? 'text-nomad-yellow'
                          : 'text-orange-400'
                      }`}
                    >
                      {c.roas.toFixed(1)}x
                    </p>
                  </div>
                </div>

                <div className="w-full lg:w-32 h-12 flex-shrink-0">
                  <Sparkline
                    data={c.spark}
                    color={c.roas >= 4 ? '#34d399' : c.roas >= 3 ? '#F5C842' : '#fb923c'}
                  />
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
