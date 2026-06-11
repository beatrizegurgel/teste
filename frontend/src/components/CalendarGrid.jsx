import { useState } from 'react'
import { Plus, Image as ImageIcon, Loader2 } from 'lucide-react'
import { statusStyle, formatIcon, parseDate } from '../utils/post'
import { useObjectUrl, isImage } from '../utils/media'

const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

function buildGrid(year, month) {
  const startDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells = []
  for (let i = 0; i < startDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

const chipClass = {
  green: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
  yellow: 'bg-nomad-yellow/10 border-nomad-yellow/30 text-nomad-yellow',
  red: 'bg-red-500/10 border-red-500/30 text-red-300',
  blue: 'bg-blue-500/10 border-blue-500/30 text-blue-300',
  gray: 'bg-nomad-border/40 border-nomad-border text-nomad-text-dim',
}

// Mini-preview exibido ao passar o mouse sobre um post.
function HoverPreview({ post }) {
  const showImg = post.fileId && isImage(post.fileType)
  const { url, loading } = useObjectUrl(post.fileId, showImg)
  const cfg = statusStyle[post.status]
  return (
    <div className="absolute z-50 left-1/2 -translate-x-1/2 top-full mt-1 w-60 bg-nomad-card border border-nomad-border rounded-xl shadow-2xl p-3 animate-fade-in pointer-events-none">
      <div className="aspect-video rounded-lg bg-nomad-bg-2 border border-nomad-border overflow-hidden flex items-center justify-center mb-2">
        {showImg && url ? (
          <img src={url} alt="" className="w-full h-full object-cover" />
        ) : showImg && loading ? (
          <Loader2 className="w-5 h-5 animate-spin text-nomad-text-muted" />
        ) : (
          <ImageIcon className="w-6 h-6 text-nomad-text-muted" />
        )}
      </div>
      <div className="text-xs font-semibold text-nomad-text truncate">{post.title}</div>
      <p className="text-[11px] text-nomad-text-dim mt-0.5 line-clamp-2">{post.caption || 'Sem legenda.'}</p>
      <div className="flex items-center gap-2 mt-2 text-[10px]">
        <span className={`px-1.5 py-0.5 rounded-full border ${chipClass[cfg.variant]}`}>{cfg.emoji} {cfg.label}</span>
        <span className="text-nomad-text-muted">{post.scheduledTime}</span>
      </div>
    </div>
  )
}

export function CalendarGrid({ year, month, posts, onSelectPost, onAddOnDay }) {
  const [hoveredId, setHoveredId] = useState(null)
  const now = new Date()

  const byDay = {}
  posts.forEach((p) => {
    const d = parseDate(p.scheduledDate)
    if (!d || d.getFullYear() !== year || d.getMonth() !== month) return
    const day = d.getDate()
    ;(byDay[day] ||= []).push(p)
  })

  const cells = buildGrid(year, month)

  return (
    <div>
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((d) => (
          <div key={d} className="text-[11px] uppercase tracking-wider text-nomad-text-muted font-semibold text-center py-2">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, idx) => {
          const dayPosts = day ? byDay[day] || [] : []
          const isToday = day && day === now.getDate() && month === now.getMonth() && year === now.getFullYear()
          const dateStr = day ? `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` : null
          return (
            <div
              key={idx}
              className={`group/cell relative min-h-[96px] rounded-lg border p-1.5 ${
                day ? 'border-nomad-border bg-nomad-bg-2/40' : 'border-transparent'
              } ${isToday ? 'border-nomad-yellow/60 bg-nomad-yellow/5' : ''}`}
            >
              {day && (
                <>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-[11px] font-semibold ${isToday ? 'text-nomad-yellow' : 'text-nomad-text-muted'}`}>
                      {day}
                    </span>
                    {onAddOnDay && (
                      <button
                        onClick={() => onAddOnDay(dateStr)}
                        title="Adicionar post"
                        className="opacity-0 group-hover/cell:opacity-100 transition-opacity text-nomad-text-muted hover:text-nomad-yellow"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="space-y-1">
                    {dayPosts.map((p) => {
                      const cfg = statusStyle[p.status]
                      const FIcon = formatIcon[p.format] || formatIcon.Outro
                      return (
                        <div key={p.id} className="relative" onMouseEnter={() => setHoveredId(p.id)} onMouseLeave={() => setHoveredId((h) => (h === p.id ? null : h))}>
                          <button
                            onClick={() => onSelectPost(p)}
                            className={`w-full text-left text-[10px] px-1.5 py-1 rounded border truncate flex items-center gap-1 hover:brightness-125 transition-all ${chipClass[cfg.variant]}`}
                          >
                            <FIcon className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{p.title}</span>
                          </button>
                          {hoveredId === p.id && <HoverPreview post={p} />}
                        </div>
                      )
                    })}
                  </div>
                </>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
