import { Target, Users2, Radio, CheckCircle2, Clock, CircleDot } from 'lucide-react'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts'
import { useApp } from '../store/AppContext'
import { Card } from '../components/ui/Card'
import { Badge, statusToVariant, statusLabel } from '../components/ui/Badge'
import { PageHeader } from '../components/layout/Layout'
import { brl } from '../utils/format'

const statusIcon = {
  concluido: CheckCircle2,
  em_execucao: CircleDot,
  planejado: Clock,
}

export default function MarketingPlan() {
  const { marketingPlan } = useApp()
  const {
    posicionamento,
    publicoAlvo,
    trimestreAtual,
    mesAtual,
    totalMeses,
    meses,
    budgetByChannel,
  } = marketingPlan

  const totalBudget = budgetByChannel.reduce((sum, c) => sum + c.value, 0)
  const progressPct = Math.round((mesAtual / totalMeses) * 100)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Plano de Marketing do Trimestre"
        subtitle={`${trimestreAtual} • Estratégia completa`}
        actions={
          <Badge variant="yellow" size="lg">
            Mês {mesAtual} de {totalMeses} em execução
          </Badge>
        }
      />

      {/* Progresso do trimestre */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-nomad-text">Progresso do trimestre</h3>
          <span className="text-sm text-nomad-yellow font-semibold">{progressPct}%</span>
        </div>
        <div className="w-full bg-nomad-bg-2 rounded-full h-2 overflow-hidden">
          <div
            className="bg-nomad-yellow h-full rounded-full transition-all"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-nomad-text-muted">
          <span>M1</span>
          <span>M2</span>
          <span>M3</span>
        </div>
      </Card>

      {/* Posicionamento e Público */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-nomad-yellow/10 text-nomad-yellow flex items-center justify-center flex-shrink-0">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-nomad-text">Posicionamento</h3>
              <p className="text-xs text-nomad-text-muted">Como a marca se apresenta</p>
            </div>
          </div>
          <p className="text-sm text-nomad-text-dim leading-relaxed">{posicionamento}</p>
        </Card>
        <Card>
          <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center flex-shrink-0">
              <Users2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-nomad-text">Público-alvo</h3>
              <p className="text-xs text-nomad-text-muted">Persona definida</p>
            </div>
          </div>
          <p className="text-sm text-nomad-text-dim leading-relaxed">{publicoAlvo}</p>
        </Card>
      </div>

      {/* Timeline M1 / M2 / M3 */}
      <div>
        <h3 className="font-semibold text-nomad-text mb-3">Timeline do trimestre</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {meses.map((m) => {
            const Icon = statusIcon[m.status]
            const variant = statusToVariant[m.status]
            const isActive = m.status === 'em_execucao'
            return (
              <Card
                key={m.mes}
                className={`relative ${isActive ? 'border-nomad-yellow/40' : ''}`}
              >
                {isActive && (
                  <div className="absolute -top-2 -right-2 w-3 h-3 bg-nomad-yellow rounded-full animate-pulse" />
                )}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="text-xs text-nomad-text-muted font-semibold uppercase tracking-wider">
                      {m.mes}
                    </div>
                    <div className="text-lg font-bold text-nomad-text capitalize mt-0.5">
                      {m.titulo}
                    </div>
                  </div>
                  <Badge variant={variant} icon={Icon}>
                    {statusLabel[m.status]}
                  </Badge>
                </div>

                <div className="space-y-4 mt-5">
                  <div>
                    <div className="text-[11px] uppercase tracking-wider text-nomad-text-muted font-semibold mb-1.5">
                      Objetivo
                    </div>
                    <p className="text-sm text-nomad-text-dim">{m.objetivo}</p>
                  </div>

                  <div>
                    <div className="text-[11px] uppercase tracking-wider text-nomad-text-muted font-semibold mb-1.5">
                      Canais ativos
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {m.canais.map((c) => (
                        <Badge key={c} variant="gray" size="sm">
                          {c}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] uppercase tracking-wider text-nomad-text-muted font-semibold mb-1.5">
                      Campanhas planejadas
                    </div>
                    <ul className="space-y-1">
                      {m.campanhas.map((c) => (
                        <li key={c} className="text-sm text-nomad-text-dim flex items-center gap-2">
                          <Radio className="w-3 h-3 text-nomad-yellow flex-shrink-0" />
                          {c}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-3 border-t border-nomad-border">
                    <div className="text-[11px] uppercase tracking-wider text-nomad-text-muted font-semibold mb-1">
                      Meta
                    </div>
                    <p className="text-sm font-semibold text-nomad-yellow">{m.meta}</p>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Verba por canal */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-nomad-text">Verba por canal</h3>
            <p className="text-xs text-nomad-text-muted">
              Total mensal: <span className="text-nomad-yellow font-semibold">{brl(totalBudget)}</span>
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={budgetByChannel}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                >
                  {budgetByChannel.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: '#1E1E1E',
                    border: '1px solid #2A2A2A',
                    borderRadius: 8,
                  }}
                  formatter={(v) => brl(v)}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2">
            {budgetByChannel.map((c) => {
              const pct = ((c.value / totalBudget) * 100).toFixed(0)
              return (
                <div
                  key={c.name}
                  className="flex items-center justify-between p-3 rounded-lg bg-nomad-bg-2 border border-nomad-border"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ background: c.color }}
                    />
                    <span className="text-sm text-nomad-text">{c.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-nomad-text">{brl(c.value)}</div>
                    <div className="text-xs text-nomad-text-muted">{pct}%</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </Card>
    </div>
  )
}
