import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Loader2, Building2, Calendar } from 'lucide-react'
import { api } from '../../api/client'
import { useToast } from '../../context/ToastContext'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { PageHeader } from '../../components/layout/Layout'

export default function AdminClients() {
  const { showToast } = useToast()
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)

  const load = () => {
    setLoading(true)
    api.listClients().then((r) => setClients(r.clients)).catch((e) => showToast(e.message, 'error')).finally(() => setLoading(false))
  }
  useEffect(load, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-5">
      <PageHeader
        title="Clientes"
        subtitle="Empresas atendidas pela NOMAD e seus acessos"
        actions={<Button icon={Plus} onClick={() => setOpen(true)}>Novo cliente</Button>}
      />

      {loading ? (
        <Card className="flex items-center justify-center py-20 text-nomad-text-muted"><Loader2 className="w-6 h-6 animate-spin" /></Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map((c) => (
            <Card key={c.id} hoverable>
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-lg bg-nomad-yellow/15 text-nomad-yellow flex items-center justify-center font-bold text-lg flex-shrink-0">
                  {c.name[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-nomad-text truncate">{c.name}</h3>
                  <p className="text-xs text-nomad-text-muted">{c.niche || 'Sem nicho definido'}</p>
                </div>
              </div>
              <Link to={`/admin/posts?client=${c.id}`} className="mt-4 inline-flex items-center gap-1.5 text-sm text-nomad-yellow hover:underline">
                <Calendar className="w-4 h-4" /> Ver calendário
              </Link>
            </Card>
          ))}
          {clients.length === 0 && (
            <Card className="col-span-full text-center py-12 text-nomad-text-muted">
              <Building2 className="w-8 h-8 mx-auto mb-2" />
              Nenhum cliente cadastrado.
            </Card>
          )}
        </div>
      )}

      <NewClientModal open={open} onClose={() => setOpen(false)} onSaved={load} />
    </div>
  )
}

function NewClientModal({ open, onClose, onSaved }) {
  const { showToast } = useToast()
  const [form, setForm] = useState({ name: '', niche: '', ownerName: '', ownerEmail: '', ownerPassword: '' })
  const [saving, setSaving] = useState(false)
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const submit = async () => {
    if (!form.name.trim()) return showToast('Informe o nome da empresa', 'error')
    setSaving(true)
    try {
      await api.createClient({
        name: form.name.trim(),
        niche: form.niche.trim() || undefined,
        ownerName: form.ownerName.trim() || undefined,
        ownerEmail: form.ownerEmail.trim() || undefined,
        ownerPassword: form.ownerPassword || undefined,
      })
      showToast('Cliente cadastrado')
      setForm({ name: '', niche: '', ownerName: '', ownerEmail: '', ownerPassword: '' })
      onSaved?.()
      onClose()
    } catch (e) {
      showToast(e.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={saving ? () => {} : onClose}
      title="Novo cliente"
      subtitle="Cadastre a empresa e, opcionalmente, o acesso do responsável"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>Cancelar</Button>
          <Button onClick={submit} disabled={saving}>{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Cadastrar</Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Nome da empresa *">
          <input className="nomad-input w-full" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Ex.: Padaria do Bairro" />
        </Field>
        <Field label="Nicho / segmento">
          <input className="nomad-input w-full" value={form.niche} onChange={(e) => set('niche', e.target.value)} placeholder="Ex.: Alimentação" />
        </Field>
        <div className="pt-2 border-t border-nomad-border">
          <p className="text-[11px] uppercase tracking-wider text-nomad-text-muted font-semibold mb-3">Acesso do cliente (opcional)</p>
          <div className="space-y-4">
            <Field label="Nome do responsável">
              <input className="nomad-input w-full" value={form.ownerName} onChange={(e) => set('ownerName', e.target.value)} />
            </Field>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="E-mail de acesso">
                <input type="email" className="nomad-input w-full" value={form.ownerEmail} onChange={(e) => set('ownerEmail', e.target.value)} />
              </Field>
              <Field label="Senha inicial">
                <input type="text" className="nomad-input w-full" value={form.ownerPassword} onChange={(e) => set('ownerPassword', e.target.value)} placeholder="mín. 6 caracteres" />
              </Field>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  )
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-nomad-text-dim mb-1.5">{label}</span>
      {children}
    </label>
  )
}
