import { useMemo, useState } from 'react'
import {
  Search,
  Upload,
  Folder,
  FileText,
  FileArchive,
  FileImage,
  File as FileIcon,
  Trash2,
  Download,
} from 'lucide-react'
import { useApp } from '../store/AppContext'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { PageHeader } from '../components/layout/Layout'
import { fmtDate } from '../utils/format'

const categories = ['Estratégia', 'Criativos', 'Relatórios', 'Contratos', 'Outros']

const iconForType = (type) => {
  if (type === 'pdf') return FileText
  if (type === 'zip') return FileArchive
  if (['png', 'jpg', 'jpeg', 'webp', 'svg'].includes(type)) return FileImage
  return FileIcon
}

const colorForCategory = {
  Estratégia: 'yellow',
  Criativos: 'pink',
  Relatórios: 'blue',
  Contratos: 'green',
  Outros: 'gray',
}

export default function Documents() {
  const { documents, addDocument, deleteDocument } = useApp()
  const [category, setCategory] = useState('Todas')
  const [search, setSearch] = useState('')
  const [uploadModal, setUploadModal] = useState(false)
  const [form, setForm] = useState({ name: '', category: 'Estratégia', type: 'pdf', size: '' })

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return documents.filter(
      (d) =>
        (category === 'Todas' || d.category === category) &&
        (q === '' || d.name.toLowerCase().includes(q))
    )
  }, [documents, category, search])

  const submit = (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    addDocument({
      name: form.name,
      category: form.category,
      type: form.type,
      size: form.size || '—',
    })
    setForm({ name: '', category: 'Estratégia', type: 'pdf', size: '' })
    setUploadModal(false)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Documentos"
        subtitle={`${filtered.length} arquivos disponíveis`}
        actions={
          <Button icon={Upload} onClick={() => setUploadModal(true)}>
            Adicionar arquivo
          </Button>
        }
      />

      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-nomad-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              placeholder="Buscar documento..."
              className="nomad-input w-full pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto">
            <button
              onClick={() => setCategory('Todas')}
              className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                category === 'Todas'
                  ? 'bg-nomad-yellow text-nomad-bg'
                  : 'bg-nomad-bg-2 text-nomad-text-dim hover:bg-nomad-card'
              }`}
            >
              Todas
            </button>
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  category === c
                    ? 'bg-nomad-yellow text-nomad-bg'
                    : 'bg-nomad-bg-2 text-nomad-text-dim hover:bg-nomad-card'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 && (
          <Card className="sm:col-span-2 lg:col-span-3 text-center py-16 text-nomad-text-muted">
            <Folder className="w-12 h-12 mx-auto mb-3 text-nomad-text-muted/50" />
            Nenhum documento encontrado.
          </Card>
        )}
        {filtered.map((doc) => {
          const Icon = iconForType(doc.type)
          const catColor = colorForCategory[doc.category] || 'gray'
          return (
            <Card key={doc.id} hoverable className="group">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-11 h-11 rounded-lg bg-nomad-bg-2 border border-nomad-border flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-nomad-yellow" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-medium text-sm text-nomad-text truncate" title={doc.name}>
                    {doc.name}
                  </h4>
                  <p className="text-xs text-nomad-text-muted mt-0.5">
                    {doc.size} • {fmtDate(doc.uploadedAt)}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Badge variant={catColor} size="sm">
                  {doc.category}
                </Badge>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-1.5 rounded hover:bg-nomad-bg-2 text-nomad-text-muted hover:text-nomad-text">
                    <Download className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => deleteDocument(doc.id)}
                    className="p-1.5 rounded hover:bg-nomad-bg-2 text-nomad-text-muted hover:text-red-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      <Modal
        open={uploadModal}
        onClose={() => setUploadModal(false)}
        title="Adicionar documento"
        subtitle="Upload simulado — metadados salvos localmente"
      >
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-nomad-text-dim mb-1.5">
              Nome do arquivo *
            </label>
            <input
              className="nomad-input w-full"
              placeholder="Ex: Relatório Mensal.pdf"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-nomad-text-dim mb-1.5">Categoria</label>
              <select
                className="nomad-input w-full"
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-nomad-text-dim mb-1.5">Tipo</label>
              <select
                className="nomad-input w-full"
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
              >
                <option value="pdf">PDF</option>
                <option value="zip">ZIP</option>
                <option value="png">Imagem</option>
                <option value="other">Outro</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-nomad-text-dim mb-1.5">Tamanho</label>
            <input
              className="nomad-input w-full"
              placeholder="Ex: 2.4 MB"
              value={form.size}
              onChange={(e) => setForm((f) => ({ ...f, size: e.target.value }))}
            />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-nomad-border">
            <Button variant="secondary" onClick={() => setUploadModal(false)} type="button">
              Cancelar
            </Button>
            <Button type="submit">Adicionar</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
