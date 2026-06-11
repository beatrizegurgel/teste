import { useEffect } from 'react'
import { X } from 'lucide-react'

export function Modal({ open, onClose, title, subtitle, children, footer, size = 'md' }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose?.()
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div
        className={`relative w-full ${sizes[size]} bg-nomad-card border border-nomad-border rounded-xl shadow-2xl animate-slide-up max-h-[90vh] flex flex-col`}
      >
        <div className="flex items-start justify-between p-5 border-b border-nomad-border">
          <div>
            <h2 className="text-lg font-semibold text-nomad-text">{title}</h2>
            {subtitle && <p className="text-sm text-nomad-text-muted mt-1">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="text-nomad-text-muted hover:text-nomad-text transition-colors p-1 rounded-lg hover:bg-nomad-bg-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5 overflow-y-auto flex-1">{children}</div>
        {footer && (
          <div className="p-5 border-t border-nomad-border flex justify-end gap-2">{footer}</div>
        )}
      </div>
    </div>
  )
}

export function Drawer({ open, onClose, title, subtitle, children, footer, width = 'md' }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose?.()
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  const widths = {
    sm: 'w-full max-w-md',
    md: 'w-full max-w-xl',
    lg: 'w-full max-w-2xl',
  }

  return (
    <div className="fixed inset-0 z-50 flex animate-fade-in">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div
        className={`ml-auto relative ${widths[width]} bg-nomad-card border-l border-nomad-border h-full overflow-hidden flex flex-col animate-slide-in-right shadow-2xl`}
      >
        <div className="flex items-start justify-between p-5 border-b border-nomad-border">
          <div className="pr-3">
            <h2 className="text-lg font-semibold text-nomad-text">{title}</h2>
            {subtitle && <p className="text-sm text-nomad-text-muted mt-1">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="text-nomad-text-muted hover:text-nomad-text transition-colors p-1 rounded-lg hover:bg-nomad-bg-2 flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5 overflow-y-auto flex-1">{children}</div>
        {footer && (
          <div className="p-5 border-t border-nomad-border flex justify-end gap-2 flex-wrap">{footer}</div>
        )}
      </div>
    </div>
  )
}
