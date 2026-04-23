import {
  TrendingUp,
  Users,
  DollarSign,
  Target,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  Plus,
  Video,
  Pause,
  FileText,
} from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Area,
  AreaChart,
} from 'recharts'
import { useApp } from '../store/AppContext'
import { Card } from '../components/ui/Card'
import { Badge, statusToVariant, statusLabel } from '../components/ui/Badge'
import { PageHeader } from '../components/layout/Layout'
import { brl, num, fmtDate } from '../utils/format'

const iconByName = {
  plus: Plus,
  check: CheckCircle2,
  video: Video,
  pause: Pause,
  file: FileText,
}

function KpiCard({ label, value, delta, deltaPositive = true, icon: Icon, accent }) {
  return (
    <Card className="relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-nomad-text-muted font-medium">
            {label}
          </p>
          <p className="text-2xl font-bold mt-2 text-nomad-text">{value}</p>
          {delta && (
            <p
              className={`text-xs mt-2 font-medium ${
                deltaPositive ? 'text-emerald-400' : 'text-red-400'
              }`}
            >
              {deltaPositive ? '▲' : '▼'} {delta}
            </p>
          )}
        </div>
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            accent || 'bg-nomad-yellow/10 text-nomad-yellow'
          }`}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </Card>
  )
}

export default function Dashboard() {
  const {
    selectedClient,
    evolutionData,
    recentActivities,
    upcomingDeliverables,
  } = useApp()

  const statusVariant = statusToVariant[selectedClient.monthStatus]
  const statusText = statusLabel[selectedClient.monthStatus]

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Olá, ${selectedClient.name.split(' ')[0]}!`}
        subtitle="Confira um resumo completo do que está acontecendo este mês."
      />

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Investimento em tráfego"
          value={brl(selectedClient.monthInvestment)}
          delta="4.2% vs mês anterior"
          icon={DollarSign}
        />
        <KpiCard
          label="ROAS médio"
          value={`${selectedClient.avgRoas.toFixed(1)}x`}
          delta="0.3x vs mês anterior"
          icon={TrendingUp}
          accent="bg-emerald-500/10 text-emerald-400"
        />
        <KpiCard
          label="Leads gerados"
          value={num(selectedClient.leads)}
          delta="14.5% vs mês anterior"
          icon={Users}
          accent="bg-blue-500/10 text-blue-400"
        />
        <KpiCard
          label="CPL médio"
          value={brl(selectedClient.cpl)}
          delta="R$ 4,20 vs mês anterior"
          deltaPositive
          icon={Target}
          accent="bg-purple-500/10 text-purple-400"
        />
      </div>

      {/* Evolução + Status do mês */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-nomad-text">Evolução dos últimos 3 meses</h3>
              <p className="text-xs text-nomad-text-muted mt-0.5">Leads gerados e investimento</p>
            </div>
            <div className="flex gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-nomad-text-dim">
                <span className="w-2 h-2 bg-nomad-yellow rounded-full" /> Leads
              </span>
              <span className="flex items-center gap-1.5 text-nomad-text-dim">
                <span className="w-2 h-2 bg-blue-400 rounded-full" /> Investimento
              </span>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={evolutionData}>
                <defs>
                  <linearGradient id="leadsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F5C842" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#F5C842" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="investGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
                <XAxis
                  dataKey="mes"
                  stroke="#888"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  className="capitalize"
                />
                <YAxis stroke="#888" tick={{ fontSize: 12 }} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: '#1E1E1E',
                    border: '1px solid #2A2A2A',
                    borderRadius: 8,
                  }}
                  labelStyle={{ color: '#fff', textTransform: 'capitalize' }}
                />
                <Area
                  type="monotone"
                  dataKey="leads"
                  stroke="#F5C842"
                  fill="url(#leadsGrad)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="investimento"
                  stroke="#60a5fa"
                  fill="url(#investGrad)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold text-nomad-text mb-4">Status do mês</h3>
          <div className="flex flex-col items-center justify-center py-6">
            <div
              className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${
                statusVariant === 'green'
                  ? 'bg-emerald-500/10'
                  : statusVariant === 'orange'
                  ? 'bg-orange-500/10'
                  : 'bg-red-500/10'
              }`}
            >
              {statusVariant === 'green' ? (
                <CheckCircle2 className="w-10 h-10 text-emerald-400" />
              ) : statusVariant === 'orange' ? (
                <AlertCircle className="w-10 h-10 text-orange-400" />
              ) : (
                <Clock className="w-10 h-10 text-red-400" />
              )}
            </div>
            <Badge variant={statusVariant} size="lg">
              {statusText}
            </Badge>
            <p className="text-sm text-nomad-text-muted text-center mt-4">
              {statusVariant === 'green'
                ? 'Todos os entregáveis do mês estão no prazo.'
                : statusVariant === 'orange'
                ? 'Alguns entregáveis precisam de atenção.'
                : 'Há entregáveis em atraso.'}
            </p>
          </div>
        </Card>
      </div>

      {/* Atividades + Entregáveis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-nomad-text">Últimas atualizações</h3>
            <span className="text-xs text-nomad-text-muted">
              {recentActivities.length} eventos
            </span>
          </div>
          <div className="space-y-3">
            {recentActivities.map((a) => {
              const Icon = iconByName[a.icon] || CheckCircle2
              return (
                <div
                  key={a.id}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-nomad-bg-2 transition-colors"
                >
                  <div className="w-9 h-9 rounded-lg bg-nomad-yellow/10 text-nomad-yellow flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-nomad-text">{a.title}</p>
                    <p className="text-xs text-nomad-text-muted mt-0.5">{a.description}</p>
                  </div>
                  <span className="text-xs text-nomad-text-muted whitespace-nowrap">
                    {fmtDate(a.date)}
                  </span>
                </div>
              )
            })}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-nomad-text">Próximos entregáveis</h3>
            <span className="text-xs text-nomad-text-muted">Próximas 2 semanas</span>
          </div>
          <div className="space-y-3">
            {upcomingDeliverables.map((d) => (
              <div
                key={d.id}
                className="flex items-start gap-3 p-3 rounded-lg border border-nomad-border hover:border-nomad-border-light transition-colors"
              >
                <div className="w-11 h-11 rounded-lg bg-nomad-bg-2 flex flex-col items-center justify-center flex-shrink-0 border border-nomad-border">
                  <span className="text-[10px] uppercase text-nomad-text-muted leading-none">
                    {new Date(d.date)
                      .toLocaleDateString('pt-BR', { month: 'short' })
                      .replace('.', '')}
                  </span>
                  <span className="text-base font-bold text-nomad-yellow leading-none mt-0.5">
                    {new Date(d.date).getDate()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-nomad-text">{d.title}</p>
                  <p className="text-xs text-nomad-text-muted mt-0.5">{d.type}</p>
                </div>
                <Calendar className="w-4 h-4 text-nomad-text-muted flex-shrink-0 mt-1" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
