'use client'
import { useState, KeyboardEvent } from 'react'
import type { Tag } from '@/types'

interface Props {
  allTags: Tag[]
  selected: string[]  // tag IDs
  onChange: (selected: string[]) => void
  onCreateTag: (name: string) => Promise<Tag | null>
}

export default function TagSelect({ allTags, selected, onChange, onCreateTag }: Props) {
  const [input, setInput] = useState('')
  const [creating, setCreating] = useState(false)

  function toggle(id: string) {
    onChange(selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id])
  }

  async function handleCreate() {
    const name = input.trim().toLowerCase()
    if (!name) return

    // Check if tag already exists
    const existing = allTags.find((t) => t.name === name)
    if (existing) {
      if (!selected.includes(existing.id)) toggle(existing.id)
      setInput('')
      return
    }

    setCreating(true)
    try {
      const tag = await onCreateTag(name)
      if (tag) {
        onChange([...selected, tag.id])
        setInput('')
      }
    } finally {
      setCreating(false)
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleCreate()
    }
  }

  const filtered = allTags.filter((t) =>
    input ? t.name.includes(input.toLowerCase()) : true
  )

  return (
    <div className="space-y-3">
      {/* Selected tags */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {allTags
            .filter((t) => selected.includes(t.id))
            .map((t) => (
              <span
                key={t.id}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-terracotta text-white"
              >
                {t.name}
                <button
                  type="button"
                  onClick={() => toggle(t.id)}
                  className="hover:opacity-70 transition-opacity"
                  aria-label={`Remove ${t.name}`}
                >
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
                    <path d="M2 2l6 6M8 2l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
              </span>
            ))}
        </div>
      )}

      {/* Input for filtering / creating */}
      <div className="relative">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search or create a tag…"
          className="input-base"
        />
        {input.trim() && (
          <button
            type="button"
            onClick={handleCreate}
            disabled={creating}
            className="absolute inset-y-0 right-3 text-xs font-medium text-terracotta hover:text-terracotta-dark transition-colors disabled:opacity-50"
          >
            {creating ? 'Creating…' : `Create "${input.trim()}"`}
          </button>
        )}
      </div>

      {/* Tag list */}
      <div className="flex flex-wrap gap-1.5">
        {filtered.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => toggle(t.id)}
            className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all border ${
              selected.includes(t.id)
                ? 'bg-terracotta text-white border-terracotta'
                : 'bg-surface-2 text-ink-dim border-border hover:border-terracotta/40 hover:text-ink'
            }`}
          >
            {t.name}
          </button>
        ))}
        {filtered.length === 0 && !input.trim() && (
          <p className="text-xs text-ink-muted italic">No tags yet — type above to create one</p>
        )}
      </div>
    </div>
  )
}
