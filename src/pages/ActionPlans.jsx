import { useMemo, useState } from 'react'
import { Plus, Filter, Trash2, Edit2, User, Calendar } from 'lucide-react'
import { useApp } from '../store/AppContext'
import { Card } from '../components/ui/Card'
import { Badge, statusToVariant, statusLabel } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { PageHeader } from '../components/layout/Layout'
import { fmtDate } from '../utils/format'

const statusOptions = [
  { value: 'planejado', label: 'Planejado' },
  { value: 'em_execucao', label: 'Em execução' },
  { value: 'concluido', label: 'Concluído' },
  { value: 'pausado', label: 'Pausado' },
]

const priorityOptions = [
  { value: 'alta', label: 'Alta' },
  { value: 'media', label: 'Média' },
  { value: 'baixa', label: 'Baixa' },
]

function PlanForm({ initial, onSubmit, onCancel }) {
  const [form, setForm] = useState(
    initial || {
      title: '',
      description: '',
      responsible: '',
      deadline: '',
      status: 'planejado',
      priority: 'media',
      progress: 0,
    }
  )

  const update = (patch) => setForm((f) => ({ ...f, ...patch }))

  const submit = (e) => {
    e.preventDefault()
    if (!form.title.trim()) return
    onSubmit(form)
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-nomad-text-dim mb-1.5">Título *</label>
        <input
          className="nomad-input w-full"
          value={form.title}
          onChange={(e) => update({ title: e.target.value })}
          required
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-nomad-text-dim mb-1.5">Descrição</label>
        <textarea
          rows={3}
          className="nomad-input w-full resize-none"
          value={form.description}
          onChange={(e) => update({ description: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-nomad-text-dim mb-1.5">Responsável</label>
          <input
            className="nomad-input w-full"
            value={form.responsible}
            onChange={(e) => update({ responsible: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-nomad-text-dim mb-1.5">Prazo</label>
          <input
            type="date"
            className="nomad-input w-full"
            value={form.deadline ? form.deadline.substring(0, 10) : ''}
            onChange={(e) =>
              update({
                deadline: e.target.value ? new Date(e.target.value).toISOString() : '',
              })
            }
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-nomad-text-dim mb-1.5">Status</label>
          <select
            className="nomad-input w-full"
            value={form.status}
            onChange={(e) => update({ status: e.target.value })}
          >
            {statusOptions.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-nomad-text-dim mb-1.5">Prioridade</label>
          <select
            className="nomad-input w-full"
            value={form.priority}
            onChange={(e) => update({ priority: e.target.value })}
          >
            {priorityOptions.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-nomad-text-dim mb-1.5">
            Progresso: {form.progress}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={form.progress}
            onChange={(e) => update({ progress: Number(e.target.value) })}
            className="w-full accent-nomad-yellow"
          />
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-3 border-t border-nomad-border">
        <Button variant="secondary" onClick={onCancel} type="button">
          Cancelar
        </Button>
        <Button type="submit">Salvar</Button>
      </div>
    </form>
  )
}

export default function ActionPlans() {
  const { actionPlans, addActionPlan, updateActionPlan, deleteActionPlan } = useApp()
  const [statusFilter, setStatusFilter] = useState('todos')
  const [priorityFilter, setPriorityFilter] = useState('todos')
  const [modal, setModal] = useState({ open: false, plan: null })
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const filtered = useMemo(() => {
    return actionPlans.filter((p) => {
      if (statusFilter !== 'todos' && p.status !== statusFilter) return false
      if (priorityFilter !== 'todos' && p.priority !== priorityFilter) return false
      return true
    })
  }, [actionPlans, statusFilter, priorityFilter])

  const handleSubmit = (form) => {
    if (modal.plan) {
      updateActionPlan(modal.plan.id, form)
    } else {
      addActionPlan(form)
    }
    setModal({ open: false, plan: null })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Planos de Ação"
        subtitle={`${filtered.length} ${filtered.length === 1 ? 'plano encontrado' : 'planos encontrados'}`}
        actions={
          <Button icon={Plus} onClick={() => setModal({ open: true, plan: null })}>
            Novo Plano de Ação
          </Button>
        }
      />

      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-3">
          <Filter className="w-4 h-4 text-nomad-text-muted" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="nomad-input py-2"
          >
            <option value="todos">Todos os status</option>
            {statusOptions.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="nomad-input py-2"
          >
            <option value="todos">Todas as prioridades</option>
            {priorityOptions.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
          {(statusFilter !== 'todos' || priorityFilter !== 'todos') && (
            <button
              onClick={() => {
                setStatusFilter('todos')
                setPriorityFilter('todos')
              }}
              className="text-xs text-nomad-yellow hover:underline ml-auto"
            >
              Limpar filtros
            </button>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.length === 0 && (
          <Card className="md:col-span-2 text-center py-16 text-nomad-text-muted">
            Nenhum plano encontrado com os filtros aplicados.
          </Card>
        )}
        {filtered.map((plan) => (
          <Card key={plan.id} hoverable className="flex flex-col">
            <div className="flex items-start justify-between gap-3 mb-3">
              <h3 className="font-semibold text-nomad-text flex-1">{plan.title}</h3>
              <div className="flex gap-1 flex-shrink-0">
                <button
                  onClick={() => setModal({ open: true, plan })}
                  className="text-nomad-text-muted hover:text-nomad-text p-1.5 rounded-lg hover:bg-nomad-bg-2"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteConfirm(plan)}
                  className="text-nomad-text-muted hover:text-red-400 p-1.5 rounded-lg hover:bg-nomad-bg-2"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-3">
              <Badge variant={statusToVariant[plan.status]}>{statusLabel[plan.status]}</Badge>
              <Badge variant={statusToVariant[plan.priority]}>
                Prioridade {statusLabel[plan.priority]}
              </Badge>
            </div>

            {plan.description && (
              <p className="text-sm text-nomad-text-dim mb-4 leading-relaxed">
                {plan.description}
              </p>
            )}

            <div className="space-y-2 text-sm">
              {plan.responsible && (
                <div className="flex items-center gap-2 text-nomad-text-muted">
                  <User className="w-3.5 h-3.5" />
                  <span>{plan.responsible}</span>
                </div>
              )}
              {plan.deadline && (
                <div className="flex items-center gap-2 text-nomad-text-muted">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Prazo: {fmtDate(plan.deadline, { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                </div>
              )}
            </div>

            <div className="mt-auto pt-4">
              <div className="flex items-center justify-between mb-1.5 text-xs">
                <span className="text-nomad-text-muted">Progresso</span>
                <span className="text-nomad-yellow font-semibold">{plan.progress || 0}%</span>
              </div>
              <div className="w-full bg-nomad-bg-2 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-nomad-yellow h-full rounded-full transition-all"
                  style={{ width: `${plan.progress || 0}%` }}
                />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Modal
        open={modal.open}
        onClose={() => setModal({ open: false, plan: null })}
        title={modal.plan ? 'Editar plano de ação' : 'Novo plano de ação'}
        subtitle="Preencha os detalhes do plano"
        size="lg"
      >
        <PlanForm
          initial={modal.plan}
          onSubmit={handleSubmit}
          onCancel={() => setModal({ open: false, plan: null })}
        />
      </Modal>

      <Modal
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Remover plano de ação?"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteConfirm(null)}>
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                deleteActionPlan(deleteConfirm.id)
                setDeleteConfirm(null)
              }}
            >
              Remover
            </Button>
          </>
        }
      >
        <p className="text-sm text-nomad-text-dim">
          Tem certeza que deseja remover o plano <strong>{deleteConfirm?.title}</strong>?
          Esta ação não pode ser desfeita.
        </p>
      </Modal>
    </div>
  )
}
