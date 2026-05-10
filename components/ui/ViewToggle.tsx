'use client'

interface ViewToggleProps {
  view: 'grid' | 'list'
  onChange: (v: 'grid' | 'list') => void
}

export default function ViewToggle({ view, onChange }: ViewToggleProps) {
  return (
    <div className="flex items-center gap-1 p-1 rounded-lg bg-surface border border-border">
      <button
        aria-label="Grid view"
        onClick={() => onChange('grid')}
        className={`p-1.5 rounded-md transition-colors ${
          view === 'grid'
            ? 'bg-white text-terracotta shadow-sm'
            : 'text-ink-muted hover:text-ink'
        }`}
      >
        <GridIcon />
      </button>
      <button
        aria-label="List view"
        onClick={() => onChange('list')}
        className={`p-1.5 rounded-md transition-colors ${
          view === 'list'
            ? 'bg-white text-terracotta shadow-sm'
            : 'text-ink-muted hover:text-ink'
        }`}
      >
        <ListIcon />
      </button>
    </div>
  )
}

function GridIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <rect x="1" y="1" width="7" height="7" rx="1.5" fill="currentColor" />
      <rect x="10" y="1" width="7" height="7" rx="1.5" fill="currentColor" />
      <rect x="1" y="10" width="7" height="7" rx="1.5" fill="currentColor" />
      <rect x="10" y="10" width="7" height="7" rx="1.5" fill="currentColor" />
    </svg>
  )
}

function ListIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <rect x="1" y="2" width="16" height="2.5" rx="1.25" fill="currentColor" />
      <rect x="1" y="7.75" width="16" height="2.5" rx="1.25" fill="currentColor" />
      <rect x="1" y="13.5" width="16" height="2.5" rx="1.25" fill="currentColor" />
    </svg>
  )
}
