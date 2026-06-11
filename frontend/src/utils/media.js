import { useEffect, useState } from 'react'
import { api } from '../api/client'

export const isImage = (mime = '') => mime.startsWith('image/')
export const isVideo = (mime = '') => mime.startsWith('video/')
export const isPdf = (mime = '') => mime === 'application/pdf'

export function formatBytes(bytes) {
  if (!bytes && bytes !== 0) return '—'
  if (bytes < 1024) return `${bytes} B`
  const kb = bytes / 1024
  if (kb < 1024) return `${kb.toFixed(0)} KB`
  return `${(kb / 1024).toFixed(1)} MB`
}

// Baixa o arquivo autenticado e dispara o download no browser.
export async function downloadFile(fileId, fileName = 'arquivo') {
  const blob = await api.fileBlob(fileId)
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

// Hook: carrega o binário de um arquivo como object URL para preview.
// Só dispara quando `enabled` é verdadeiro (ex.: ao abrir o drawer / hover).
export function useObjectUrl(fileId, enabled = true) {
  const [state, setState] = useState({ url: null, loading: false, error: null })

  useEffect(() => {
    if (!fileId || !enabled) {
      setState({ url: null, loading: false, error: null })
      return
    }
    let revoked = false
    let objectUrl = null
    setState({ url: null, loading: true, error: null })
    api
      .fileBlob(fileId)
      .then((blob) => {
        if (revoked) return
        objectUrl = URL.createObjectURL(blob)
        setState({ url: objectUrl, loading: false, error: null })
      })
      .catch((e) => {
        if (!revoked) setState({ url: null, loading: false, error: e.message })
      })
    return () => {
      revoked = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [fileId, enabled])

  return state
}
