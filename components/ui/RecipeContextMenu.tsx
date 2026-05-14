'use client'
import { useState, useRef, useEffect } from 'react'

export interface ContextAction {
  label: string
  onClick: () => void
  destructive?: boolean
}

interface Props {
  actions: ContextAction[]
  className?: string
}

export default function RecipeContextMenu({ actions, className }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  return (
    <div ref={ref} className={`relative flex-shrink-0 ${className ?? ''}`}>
      <button
        type="button"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen((v) => !v) }}
        className="p-1.5 rounded-lg text-ink-muted hover:text-ink hover:bg-surface-2 transition-colors"
        aria-label="More options"
        aria-expanded={open}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden>
          <circle cx="7" cy="2" r="1.25" />
          <circle cx="7" cy="7" r="1.25" />
          <circle cx="7" cy="12" r="1.25" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 z-30 min-w-[168px] rounded-xl border shadow-lg py-1"
          style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}
        >
          {actions.map((action) => (
            <button
              key={action.label}
              type="button"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(false); action.onClick() }}
              className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                action.destructive
                  ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20'
                  : 'hover:bg-surface-2'
              }`}
              style={action.destructive ? {} : { color: 'var(--text-primary)' }}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
