import { FileText, Film, ImageOff, Loader2 } from 'lucide-react'
import { useObjectUrl, isImage, isVideo, isPdf } from '../utils/media'

// Renderiza o preview de um anexo (arte/vídeo/PDF) buscando o binário
// autenticado. `enabled` evita carregar antes da hora (ex.: drawer fechado).
export function FilePreview({ fileId, mimeType, fileName, enabled = true, className = '' }) {
  const { url, loading, error } = useObjectUrl(fileId, enabled && !!fileId)

  const box = `w-full rounded-lg bg-nomad-bg-2 border border-nomad-border flex flex-col items-center justify-center text-nomad-text-muted gap-2 ${className}`

  if (!fileId) {
    return (
      <div className={`${box} aspect-video`}>
        <ImageOff className="w-9 h-9" />
        <span className="text-sm">Sem arquivo anexado</span>
      </div>
    )
  }
  if (loading) {
    return (
      <div className={`${box} aspect-square`}>
        <Loader2 className="w-7 h-7 animate-spin" />
        <span className="text-xs">Carregando preview…</span>
      </div>
    )
  }
  if (error || !url) {
    return (
      <div className={`${box} aspect-video`}>
        <ImageOff className="w-9 h-9" />
        <span className="text-sm">Preview indisponível</span>
      </div>
    )
  }
  if (isImage(mimeType)) {
    return (
      <img
        src={url}
        alt={fileName || 'Preview'}
        className={`w-full rounded-lg bg-nomad-bg-2 border border-nomad-border object-contain max-h-[60vh] ${className}`}
      />
    )
  }
  if (isVideo(mimeType)) {
    return <video src={url} controls className={`w-full rounded-lg bg-black border border-nomad-border max-h-[60vh] ${className}`} />
  }
  if (isPdf(mimeType)) {
    return <iframe src={url} title={fileName || 'PDF'} className={`w-full rounded-lg border border-nomad-border h-[60vh] bg-white ${className}`} />
  }
  return (
    <div className={`${box} aspect-video`}>
      <FileText className="w-9 h-9" />
      <span className="text-sm">{fileName || 'Arquivo'}</span>
      <span className="text-xs">Pré-visualização não suportada — baixe para abrir</span>
    </div>
  )
}
