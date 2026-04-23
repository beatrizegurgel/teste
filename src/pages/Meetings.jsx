import { useState } from 'react'
import { Video, Megaphone, Calendar, Send } from 'lucide-react'
import { useApp } from '../store/AppContext'
import { Card } from '../components/ui/Card'
import { Badge, statusToVariant } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { PageHeader } from '../components/layout/Layout'
import { fmtLongDate } from '../utils/format'

export default function Meetings() {
  const { meetings, announcements, requestMeeting } = useApp()
  const [form, setForm] = useState({ subject: '', date: '', notes: '' })

  const submit = (e) => {
    e.preventDefault()
    if (!form.subject.trim() || !form.date) return
    requestMeeting(form)
    setForm({ subject: '', date: '', notes: '' })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reuniões & Comunicados"
        subtitle="Histórico de alinhamentos e comunicações da agência"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <h3 className="font-semibold text-nomad-text mb-4">Timeline de reuniões</h3>
            <div className="space-y-4">
              {meetings.map((m, idx) => (
                <div key={m.id} className="relative pl-8">
                  <div className="absolute left-0 top-0 w-6 h-6 rounded-full bg-nomad-yellow/15 border-2 border-nomad-yellow flex items-center justify-center">
                    <Video className="w-3 h-3 text-nomad-yellow" />
                  </div>
                  {idx < meetings.length - 1 && (
                    <div className="absolute left-[11px] top-6 bottom-[-16px] w-0.5 bg-nomad-border" />
                  )}
                  <div className="bg-nomad-bg-2 border border-nomad-border rounded-lg p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <Badge variant="yellow">{m.type}</Badge>
                      <span className="text-xs text-nomad-text-muted">{fmtLongDate(m.date)}</span>
                    </div>
                    <div className="space-y-3 mt-3">
                      <div>
                        <div className="text-[10px] uppercase tracking-wider text-nomad-text-muted font-semibold mb-1">
                          Pauta
                        </div>
                        <p className="text-sm text-nomad-text-dim">{m.pauta}</p>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase tracking-wider text-nomad-text-muted font-semibold mb-1">
                          Principais decisões
                        </div>
                        <p className="text-sm text-nomad-text-dim">{m.decisions}</p>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase tracking-wider text-nomad-text-muted font-semibold mb-1">
                          Próximas ações
                        </div>
                        <p className="text-sm text-nomad-text-dim">{m.nextActions}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                <Megaphone className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-nomad-text">Comunicados da agência</h3>
            </div>
            <div className="space-y-3">
              {announcements.map((a) => (
                <div
                  key={a.id}
                  className="border border-nomad-border rounded-lg p-4 bg-nomad-bg-2 relative"
                >
                  {a.priority === 'alta' && (
                    <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                  )}
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h4 className="font-medium text-nomad-text">{a.title}</h4>
                    <span className="text-xs text-nomad-text-muted whitespace-nowrap">
                      {fmtLongDate(a.date)}
                    </span>
                  </div>
                  <p className="text-sm text-nomad-text-dim">{a.message}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div>
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-nomad-yellow/10 text-nomad-yellow flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-nomad-text">Solicitar reunião</h3>
            </div>
            <form onSubmit={submit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-nomad-text-dim mb-1.5">
                  Assunto *
                </label>
                <input
                  className="nomad-input w-full"
                  placeholder="Ex: Ajustes na estratégia de verão"
                  value={form.subject}
                  onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-nomad-text-dim mb-1.5">
                  Data sugerida *
                </label>
                <input
                  type="date"
                  className="nomad-input w-full"
                  value={form.date}
                  onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-nomad-text-dim mb-1.5">
                  Observações
                </label>
                <textarea
                  rows={4}
                  className="nomad-input w-full resize-none"
                  placeholder="Detalhes adicionais..."
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                />
              </div>
              <Button type="submit" icon={Send} className="w-full">
                Enviar solicitação
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  )
}
