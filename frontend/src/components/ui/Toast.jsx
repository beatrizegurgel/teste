import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react'
import { useToast } from '../../context/ToastContext'

const iconMap = {
  success: CheckCircle2,
  warning: AlertTriangle,
  info: Info,
  error: AlertTriangle,
}

const styleMap = {
  success: 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300',
  warning: 'bg-orange-500/10 border-orange-500/40 text-orange-300',
  info: 'bg-blue-500/10 border-blue-500/40 text-blue-300',
  error: 'bg-red-500/10 border-red-500/40 text-red-300',
}

export function ToastContainer() {
  const { toasts, dismissToast } = useToast()
  return (
    <div className="fixed bottom-6 right-6 z-[60] space-y-2 w-full max-w-sm">
      {toasts.map((t) => {
        const Icon = iconMap[t.variant] || CheckCircle2
        return (
          <div
            key={t.id}
            className={`flex items-start gap-3 px-4 py-3 rounded-lg border backdrop-blur-sm shadow-lg animate-slide-in-right ${
              styleMap[t.variant] || styleMap.success
            }`}
          >
            <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="flex-1 text-sm">{t.message}</p>
            <button
              onClick={() => dismissToast(t.id)}
              className="text-current opacity-60 hover:opacity-100 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
