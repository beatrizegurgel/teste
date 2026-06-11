import { useCallback, useEffect, useState } from 'react'
import {
  Check, X, MessageCircle, Download, Pencil, Trash2, Send, Loader2, Paperclip,
} from 'lucide-react'
import { Drawer } from './ui/Modal'
import { Badge } from './ui/Badge'
import { Button } from './ui/Button'
import { FilePreview } from './FilePreview'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { downloadFile, formatBytes } from '../utils/media'
import { statusStyle, formatIcon, eventStyle, fmtScheduled, fmtEventTime } from '../utils/post'

export function PostDrawer({ postId, onClose, onChanged, onEdit }) {
  const { isAdmin, user } = useAuth()
  const { showToast } = useToast()
  const [post, setPost] = useState(null)
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [mode, setMode] = useState(null) // 'reprovar' | 'comentar' | 'excluir'
  const [text, setText] = useState('')
  const [downloading, setDownloading] = useState(false)

  const load = useCallback(async () => {
    if (!postId) return
    setLoading(true)
    try {
      const { post, events } = await api.getPost(postId)
      setPost(post)
      setEvents(events || [])
    } catch (e) {
      showToast(e.message, 'error')
      onClose()
    } finally {
      setLoading(false)
    }
  }, [postId, onClose, showToast])

  useEffect(() => { load() }, [load])

  if (!postId) return null

  const cfg = post ? statusStyle[post.status] : null
  const FIcon = post ? formatIcon[post.format] || formatIcon.Outro : Paperclip
  const canAct = post && (post.status === 'aguardando' || post.status === 'reprovado')

  const afterChange = (updated) => {
    if (updated) setPost(updated)
    setMode(null)
    setText('')
    load()
    onChanged?.()
  }

  const handleApprove = async () => {
    setBusy(true)
    try {
      const { post: updated } = await api.approvePost(post.id)
      showToast('Post aprovado!')
      afterChange(updated)
    } catch (e) { showToast(e.message, 'error') } finally { setBusy(false) }
  }

  const handleReject = async () => {
    if (!text.trim()) return
    setBusy(true)
    try {
      const { post: updated } = await api.rejectPost(post.id, text.trim())
      showToast('Reprovação enviada à NOMAD', 'warning')
      afterChange(updated)
    } catch (e) { showToast(e.message, 'error') } finally { setBusy(false) }
  }

  const handleComment = async () => {
    if (!text.trim()) return
    setBusy(true)
    try {
      await api.commentPost(post.id, text.trim())
      showToast('Comentário enviado')
      afterChange()
    } catch (e) { showToast(e.message, 'error') } finally { setBusy(false) }
  }

  const handleDelete = async () => {
    setBusy(true)
    try {
      await api.deletePost(post.id)
      showToast('Post excluído', 'info')
      onChanged?.()
      onClose()
    } catch (e) { showToast(e.message, 'error') } finally { setBusy(false) }
  }

  const handleDownload = async () => {
    setDownloading(true)
    try {
      await downloadFile(post.fileId, post.fileName || 'arquivo')
    } catch (e) { showToast(e.message, 'error') } finally { setDownloading(false) }
  }

  const footer = (() => {
    if (!post || mode === 'reprovar' || mode === 'comentar') {
      if (mode === 'reprovar' || mode === 'comentar') {
        return (
          <>
            <Button variant="secondary" onClick={() => { setMode(null); setText('') }}>Cancelar</Button>
            <Button
              variant={mode === 'reprovar' ? 'danger' : 'primary'}
              onClick={mode === 'reprovar' ? handleReject : handleComment}
              disabled={busy || !text.trim()}
            >
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Enviar
            </Button>
          </>
        )
      }
      return null
    }
    if (mode === 'excluir') {
      return (
        <>
          <Button variant="secondary" onClick={() => setMode(null)}>Cancelar</Button>
          <Button variant="danger" onClick={handleDelete} disabled={busy}>
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            Confirmar exclusão
          </Button>
        </>
      )
    }
    if (isAdmin) {
      return (
        <>
          <Button variant="danger" onClick={() => setMode('excluir')}><Trash2 className="w-4 h-4" /> Excluir</Button>
          <Button variant="secondary" onClick={() => setMode('comentar')}><MessageCircle className="w-4 h-4" /> Comentar</Button>
          <Button variant="primary" onClick={() => onEdit?.(post)}><Pencil className="w-4 h-4" /> Editar</Button>
        </>
      )
    }
    // Cliente
    return (
      <>
        {canAct && <Button variant="danger" onClick={() => setMode('reprovar')}><X className="w-4 h-4" /> Reprovar</Button>}
        <Button variant="secondary" onClick={() => setMode('comentar')}><MessageCircle className="w-4 h-4" /> Comentar</Button>
        {canAct && <Button variant="success" onClick={handleApprove} disabled={busy}><Check className="w-4 h-4" /> Aprovar</Button>}
      </>
    )
  })()

  return (
    <Drawer
      open={!!postId}
      onClose={onClose}
      title={loading ? 'Carregando…' : post?.title}
      subtitle={post ? fmtScheduled(post) : ''}
      width="md"
      footer={footer}
    >
      {loading || !post ? (
        <div className="flex items-center justify-center py-20 text-nomad-text-muted">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : (
        <div className="space-y-5">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={cfg.variant} icon={cfg.icon}>{cfg.emoji} {cfg.label}</Badge>
            <Badge variant="gray" icon={FIcon}>{post.format}</Badge>
            {isAdmin && post.clientName && <Badge variant="purple">{post.clientName}</Badge>}
          </div>

          <div>
            <SectionLabel>Criativo</SectionLabel>
            <FilePreview fileId={post.fileId} mimeType={post.fileType} fileName={post.fileName} enabled />
            {post.fileId && (
              <div className="mt-2 flex items-center justify-between gap-2 bg-nomad-bg-2 border border-nomad-border rounded-lg px-3 py-2">
                <div className="min-w-0">
                  <div className="text-sm text-nomad-text truncate">{post.fileName}</div>
                  <div className="text-xs text-nomad-text-muted">{post.fileType}</div>
                </div>
                <Button variant="secondary" onClick={handleDownload} disabled={downloading}>
                  {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  Baixar
                </Button>
              </div>
            )}
          </div>

          <div>
            <SectionLabel>Legenda</SectionLabel>
            <div className="bg-nomad-bg-2 border border-nomad-border rounded-lg p-3 text-sm text-nomad-text-dim whitespace-pre-wrap">
              {post.caption || <span className="text-nomad-text-muted">Sem legenda.</span>}
            </div>
          </div>

          {(mode === 'reprovar' || mode === 'comentar') && (
            <div className="bg-nomad-bg-2 border border-nomad-yellow/40 rounded-lg p-3 space-y-2">
              <label className="block text-xs font-medium text-nomad-text-dim">
                {mode === 'reprovar' ? 'Motivo da reprovação *' : 'Seu comentário / feedback'}
              </label>
              <textarea
                rows={4}
                autoFocus
                className="nomad-input w-full resize-none"
                placeholder={mode === 'reprovar' ? 'Explique o que precisa mudar…' : 'Escreva seu feedback para a NOMAD…'}
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
            </div>
          )}

          <div>
            <SectionLabel>Histórico & comentários</SectionLabel>
            <div className="space-y-3">
              {events.length === 0 && <p className="text-sm text-nomad-text-muted">Sem interações ainda.</p>}
              {events.map((h) => {
                const hStyle = eventStyle[h.type] || eventStyle.criado
                const HIcon = hStyle.icon
                return (
                  <div key={h.id} className="flex items-start gap-3">
                    <div className={`w-7 h-7 rounded-full bg-nomad-bg-2 border border-nomad-border flex items-center justify-center flex-shrink-0 ${hStyle.color}`}>
                      <HIcon className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0 pt-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold text-nomad-text">{h.author || hStyle.label}</span>
                        {h.authorRole && (
                          <span className="text-[10px] uppercase tracking-wide text-nomad-text-muted">
                            {h.authorRole === 'admin' ? 'NOMAD' : 'Cliente'}
                          </span>
                        )}
                        <span className="text-xs text-nomad-text-muted">{fmtEventTime(h.createdAt)}</span>
                      </div>
                      {h.message && <p className="text-sm text-nomad-text-dim mt-0.5">{h.message}</p>}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </Drawer>
  )
}

function SectionLabel({ children }) {
  return (
    <div className="text-[11px] uppercase tracking-wider text-nomad-text-muted font-semibold mb-2">{children}</div>
  )
}
