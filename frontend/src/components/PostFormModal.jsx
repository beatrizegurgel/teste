import { useEffect, useRef, useState } from 'react'
import { UploadCloud, Loader2, Paperclip, FileText } from 'lucide-react'
import { Modal } from './ui/Modal'
import { Button } from './ui/Button'
import { api } from '../api/client'
import { useToast } from '../context/ToastContext'
import { FORMATS } from '../utils/post'
import { formatBytes } from '../utils/media'

const empty = {
  clientId: '',
  title: '',
  caption: '',
  format: 'Feed',
  scheduledDate: '',
  scheduledTime: '09:00',
  status: 'aguardando',
}

export function PostFormModal({ open, onClose, onSaved, clients, initial, defaultClientId }) {
  const { showToast } = useToast()
  const [form, setForm] = useState(empty)
  const [file, setFile] = useState(null) // novo arquivo selecionado
  const [existing, setExisting] = useState(null) // { fileId, fileName, fileType }
  const [saving, setSaving] = useState(false)
  const fileRef = useRef(null)
  const isEdit = !!initial?.id

  useEffect(() => {
    if (!open) return
    setFile(null)
    if (initial?.id) {
      setForm({
        clientId: initial.clientId,
        title: initial.title || '',
        caption: initial.caption || '',
        format: initial.format || 'Feed',
        scheduledDate: initial.scheduledDate || '',
        scheduledTime: initial.scheduledTime || '09:00',
        status: initial.status || 'aguardando',
      })
      setExisting(initial.fileId ? { fileId: initial.fileId, fileName: initial.fileName, fileType: initial.fileType } : null)
    } else {
      setForm({ ...empty, clientId: defaultClientId || clients[0]?.id || '', scheduledDate: initial?.scheduledDate || '' })
      setExisting(null)
    }
  }, [open, initial, defaultClientId, clients])

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const submit = async () => {
    if (!form.clientId) return showToast('Selecione a empresa do cliente', 'error')
    if (!form.title.trim()) return showToast('Informe um título', 'error')
    if (!form.scheduledDate) return showToast('Escolha a data do post', 'error')

    setSaving(true)
    try {
      let attachment = existing
      // 1) Upload do arquivo, se houver um novo.
      if (file) {
        const fd = new FormData()
        fd.append('file', file)
        fd.append('clientId', form.clientId)
        const { file: uploaded } = await api.uploadFile(fd)
        attachment = { fileId: uploaded.id, fileName: uploaded.originalName, fileType: uploaded.mimeType }
      }
      const clientName = clients.find((c) => c.id === form.clientId)?.name
      const payload = {
        ...form,
        title: form.title.trim(),
        clientName,
        fileId: attachment?.fileId || null,
        fileName: attachment?.fileName || null,
        fileType: attachment?.fileType || null,
      }
      // 2) Cria ou atualiza o post.
      if (isEdit) {
        await api.updatePost(initial.id, payload)
        showToast('Post atualizado')
      } else {
        await api.createPost(payload)
        showToast('Post criado e associado à data')
      }
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
      title={isEdit ? 'Editar post' : 'Novo post'}
      subtitle="Associe uma arte, vídeo ou PDF a uma data do calendário"
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>Cancelar</Button>
          <Button onClick={submit} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {isEdit ? 'Salvar alterações' : 'Criar post'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Empresa (cliente) *">
            <select className="nomad-input w-full" value={form.clientId} onChange={(e) => set('clientId', e.target.value)}>
              <option value="">Selecione…</option>
              {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Field>
          <Field label="Formato">
            <select className="nomad-input w-full" value={form.format} onChange={(e) => set('format', e.target.value)}>
              {FORMATS.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </Field>
        </div>

        <Field label="Título *">
          <input className="nomad-input w-full" value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="Ex.: Reels — Dica de skincare" />
        </Field>

        <div className="grid sm:grid-cols-3 gap-4">
          <Field label="Data *">
            <input type="date" className="nomad-input w-full" value={form.scheduledDate} onChange={(e) => set('scheduledDate', e.target.value)} />
          </Field>
          <Field label="Horário">
            <input type="time" className="nomad-input w-full" value={form.scheduledTime} onChange={(e) => set('scheduledTime', e.target.value)} />
          </Field>
          <Field label="Status">
            <select className="nomad-input w-full" value={form.status} onChange={(e) => set('status', e.target.value)}>
              <option value="rascunho">Rascunho (oculto do cliente)</option>
              <option value="aguardando">Enviar p/ aprovação</option>
              <option value="aprovado">Aprovado</option>
              <option value="publicado">Publicado</option>
            </select>
          </Field>
        </div>

        <Field label="Legenda">
          <textarea rows={3} className="nomad-input w-full resize-none" value={form.caption} onChange={(e) => set('caption', e.target.value)} placeholder="Escreva a legenda do post…" />
        </Field>

        <Field label="Arquivo (arte / vídeo / PDF)">
          <input ref={fileRef} type="file" className="hidden" accept="image/*,video/*,application/pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="w-full border-2 border-dashed border-nomad-border hover:border-nomad-yellow/50 rounded-lg p-4 flex items-center gap-3 text-left transition-colors"
          >
            <UploadCloud className="w-6 h-6 text-nomad-yellow flex-shrink-0" />
            <div className="min-w-0">
              {file ? (
                <>
                  <div className="text-sm text-nomad-text truncate">{file.name}</div>
                  <div className="text-xs text-nomad-text-muted">{formatBytes(file.size)} — clique para trocar</div>
                </>
              ) : existing ? (
                <>
                  <div className="text-sm text-nomad-text flex items-center gap-1.5 truncate"><Paperclip className="w-3.5 h-3.5" /> {existing.fileName}</div>
                  <div className="text-xs text-nomad-text-muted">Anexo atual — clique para substituir</div>
                </>
              ) : (
                <>
                  <div className="text-sm text-nomad-text">Clique para enviar um arquivo</div>
                  <div className="text-xs text-nomad-text-muted">Imagens, vídeos ou PDF (até 50MB)</div>
                </>
              )}
            </div>
            {(file || existing) && <FileText className="w-4 h-4 text-nomad-text-muted ml-auto flex-shrink-0" />}
          </button>
        </Field>
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
