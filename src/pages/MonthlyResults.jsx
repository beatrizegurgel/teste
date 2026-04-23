import { useState, useMemo } from 'react'
import {
  Download,
  CheckCircle2,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  Users,
  Target,
  Banknote,
  Percent,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  LineChart,
  Line,
} from 'recharts'
import { useApp } from '../store/AppContext'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { PageHeader } from '../components/layout/Layout'
import { brl, num, pct } from '../utils/format'

function KpiRow({ icon: Icon, label, value, meta, accent }) {
  const delta = ((value - meta) / meta) * 100
  const positive = delta >= 0

  return (
    <Card>
      <div className="flex items-start justify-between">
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            accent || 'bg-nomad-yellow/10 text-nomad-yellow'
          }`}
        >
          <Icon className="w-5 h-5" />
        </div>
        <span
          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            positive
              ? 'bg-emerald-500/10 text-emerald-400'
              : 'bg-red-500/10 text-red-400'
          }`}
        >
          {positive ? '+' : ''}
          {delta.toFixed(1)}%
        </span>
      </div>
      <p className="text-xs uppercase tracking-wider text-nomad-text-muted mt-3">{label}</p>
      <p className="text-xl font-bold text-nomad-text mt-1">{value}</p>
      <p className="text-xs text-nomad-text-muted mt-1">Meta: {meta}</p>
    </Card>
  )
}

export default function MonthlyResults() {
  const { monthlyResults } = useApp()
  const availableMonths = Object.keys(monthlyResults).sort().reverse()
  const [selectedMonth, setSelectedMonth] = useState(availableMonths[0])

  const report = monthlyResults[selectedMonth]

  const comparisonData = useMemo(() => {
    if (!report) return []
    const k = report.kpis
    return [
      { name: 'Investimento', Meta: k.investimento.meta, Realizado: k.investimento.realizado },
      { name: 'Faturamento', Meta: k.faturamento.meta, Realizado: k.faturamento.realizado },
      { name: 'Leads', Meta: k.leads.meta, Realizado: k.leads.realizado },
      {
        name: 'ROAS',
        Meta: k.roas.meta * 1000,
        Realizado: k.roas.realizado * 1000,
      },
    ]
  }, [report])

  if (!report) return <div>Nenhum resultado disponível.</div>
  const k = report.kpis

  return (
    <div className="space-y-6">
      <div className="no-print">
        <PageHeader
          title="Resultados do Mês"
          subtitle="Acompanhe o desempenho detalhado das campanhas"
          actions={
            <>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="nomad-input py-2"
              >
                {availableMonths.map((m) => (
                  <option key={m} value={m}>
                    {monthlyResults[m].label}
                  </option>
                ))}
              </select>
              <Button icon={Download} variant="secondary" onClick={() => window.print()}>
                Exportar relatório
              </Button>
            </>
          }
        />
      </div>

      <div className="hidden print:block mb-6">
        <h1 className="text-3xl font-bold">Relatório — {report.label}</h1>
        <p className="text-sm mt-1">Clínica Estética Bella • NOMAD</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <KpiRow
          icon={DollarSign}
          label="Investimento"
          value={brl(k.investimento.realizado)}
          meta={brl(k.investimento.meta)}
        />
        <KpiRow
          icon={Banknote}
          label="Faturamento gerado"
          value={brl(k.faturamento.realizado)}
          meta={brl(k.faturamento.meta)}
          accent="bg-emerald-500/10 text-emerald-400"
        />
        <KpiRow
          icon={TrendingUp}
          label="ROAS"
          value={`${k.roas.realizado.toFixed(1)}x`}
          meta={`${k.roas.meta.toFixed(1)}x`}
          accent="bg-purple-500/10 text-purple-400"
        />
        <KpiRow
          icon={Users}
          label="Leads gerados"
          value={num(k.leads.realizado)}
          meta={num(k.leads.meta)}
          accent="bg-blue-500/10 text-blue-400"
        />
        <KpiRow
          icon={Target}
          label="CPL"
          value={brl(k.cpl.realizado)}
          meta={brl(k.cpl.meta)}
          accent="bg-orange-500/10 text-orange-400"
        />
        <KpiRow
          icon={Percent}
          label="Taxa de conversão"
          value={pct(k.conversao.realizado)}
          meta={pct(k.conversao.meta)}
          accent="bg-pink-500/10 text-pink-400"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <h3 className="font-semibold text-nomad-text mb-4">Meta x Realizado</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
                <XAxis dataKey="name" stroke="#888" tick={{ fontSize: 11 }} tickLine={false} />
                <YAxis stroke="#888" tick={{ fontSize: 11 }} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: '#1E1E1E',
                    border: '1px solid #2A2A2A',
                    borderRadius: 8,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="Meta" fill="#4a4a4a" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Realizado" fill="#F5C842" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold text-nomad-text mb-4">Evolução semanal</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={report.weeklyEvolution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
                <XAxis dataKey="semana" stroke="#888" tick={{ fontSize: 11 }} tickLine={false} />
                <YAxis
                  yAxisId="left"
                  stroke="#F5C842"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#60a5fa"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: '#1E1E1E',
                    border: '1px solid #2A2A2A',
                    borderRadius: 8,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="leads"
                  stroke="#F5C842"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="investimento"
                  stroke="#60a5fa"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="font-semibold text-nomad-text mb-3">Análise do CS</h3>
        <p className="text-sm text-nomad-text-dim leading-relaxed whitespace-pre-line">
          {report.csAnalysis}
        </p>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-nomad-text">Principais conquistas</h3>
          </div>
          <ul className="space-y-3">
            {report.achievements.map((a, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-nomad-text-dim">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>{a}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-400 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-nomad-text">Próximos passos</h3>
          </div>
          <ul className="space-y-3">
            {report.nextSteps.map((a, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-nomad-text-dim">
                <AlertTriangle className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                <span>{a}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  )
}
