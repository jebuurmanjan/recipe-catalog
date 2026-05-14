'use client'
import { useState, useRef, useEffect } from 'react'
import type { Collection } from '@/types'

interface Props {
  collections: Collection[]
  activeCollectionId: string | null
  onSelect: (id: string) => void
  onCreate: (name: string) => Promise<void>
}

export default function CollectionsSidebar({ collections, activeCollectionId, onSelect, onCreate }: Props) {
  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [saving, setSaving] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (adding) inputRef.current?.focus()
  }, [adding])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim()) return
    setSaving(true)
    try {
      await onCreate(newName.trim())
      setNewName('')
      setAdding(false)
    } finally {
      setSaving(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') { setAdding(false); setNewName('') }
  }

  return (
    <aside className="space-y-3">
      <button
        onClick={() => setAdding(true)}
        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border border-dashed transition-colors"
        style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
        onMouseOver={(e) => (e.currentTarget.style.color = 'var(--terracotta)')}
        onMouseOut={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden>
          <path d="M7 2v10M2 7h10" />
        </svg>
        Add collection
      </button>

      {adding && (
        <form onSubmit={handleCreate} className="flex gap-1.5">
          <input
            ref={inputRef}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Collection name…"
            disabled={saving}
            className="flex-1 min-w-0 px-2.5 py-1.5 text-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-terracotta/40"
            style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
          />
          <button
            type="submit"
            disabled={!newName.trim() || saving}
            className="px-2.5 py-1.5 text-sm rounded-lg bg-terracotta text-white disabled:opacity-40 transition-opacity"
          >
            Add
          </button>
        </form>
      )}

      {collections.length === 0 && !adding && (
        <p className="text-xs px-1" style={{ color: 'var(--text-muted)' }}>
          No collections yet. Create one to group your recipes.
        </p>
      )}

      <div className="space-y-0.5">
        {collections.map((col) => (
          <button
            key={col.id}
            onClick={() => onSelect(col.id)}
            className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm text-left transition-colors ${
              activeCollectionId === col.id
                ? 'bg-terracotta text-white'
                : 'hover:bg-surface-2'
            }`}
            style={activeCollectionId === col.id ? {} : { color: 'var(--text-primary)' }}
          >
            <span className="truncate font-medium">{col.name}</span>
            <span className={`text-xs flex-shrink-0 ${activeCollectionId === col.id ? 'text-white/70' : ''}`}
              style={activeCollectionId !== col.id ? { color: 'var(--text-muted)' } : {}}
            >
              {col.recipe_count ?? 0}
            </span>
          </button>
        ))}
      </div>
    </aside>
  )
}
