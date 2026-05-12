'use client'
import { useState, useRef, useEffect } from 'react'
import type { Tag, Category, CategoryType } from '@/types'

const TABS = [
  { key: 'tags' as const, label: 'Tags' },
  { key: 'cuisine' as const, label: 'Cuisine' },
  { key: 'diet' as const, label: 'Diet' },
  { key: 'occasion' as const, label: 'Occasion' },
  { key: 'effort' as const, label: 'Effort' },
]

type TabKey = 'tags' | CategoryType

interface Props {
  tags: Tag[]
  categories: Category[]
  onClose: () => void
  onTagsChange: (tags: Tag[]) => void
  onCategoriesChange: (categories: Category[]) => void
}

export default function LabelsModal({ tags, categories, onClose, onTagsChange, onCategoriesChange }: Props) {
  const [activeTab, setActiveTab] = useState<TabKey>('tags')
  const backdropRef = useRef<HTMLDivElement>(null)

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  // Prevent body scroll while open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const categoryItems = activeTab === 'tags'
    ? []
    : categories.filter((c) => c.type === activeTab)

  async function handleRenameTag(id: string, name: string) {
    const res = await fetch(`/api/tags/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    })
    if (res.ok) {
      const { tag } = await res.json()
      onTagsChange(tags.map((t) => (t.id === id ? tag : t)))
    }
  }

  async function handleDeleteTag(id: string) {
    const res = await fetch(`/api/tags/${id}`, { method: 'DELETE' })
    if (res.ok) onTagsChange(tags.filter((t) => t.id !== id))
  }

  async function handleAddTag(name: string) {
    const res = await fetch('/api/tags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    })
    if (res.ok) {
      const { tag } = await res.json()
      onTagsChange([...tags, tag].sort((a, b) => a.name.localeCompare(b.name)))
    }
  }

  async function handleRenameCategory(id: string, name: string) {
    const res = await fetch(`/api/categories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    })
    if (res.ok) {
      const { category } = await res.json()
      onCategoriesChange(categories.map((c) => (c.id === id ? category : c)))
    }
  }

  async function handleDeleteCategory(id: string) {
    const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' })
    if (res.ok) onCategoriesChange(categories.filter((c) => c.id !== id))
  }

  async function handleAddCategory(name: string) {
    if (activeTab === 'tags') return
    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, type: activeTab }),
    })
    if (res.ok) {
      const { category } = await res.json()
      onCategoriesChange([...categories, category].sort((a, b) => a.name.localeCompare(b.name)))
    }
  }

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm"
      onClick={(e) => { if (e.target === backdropRef.current) onClose() }}
    >
      <div className="bg-cream rounded-2xl shadow-xl w-full max-w-md max-h-[80vh] flex flex-col border border-border">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <h2 className="font-serif text-xl font-semibold text-ink">Manage labels</h2>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full text-ink-muted hover:bg-surface hover:text-ink transition-colors"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-5 pb-3 overflow-x-auto scrollbar-none">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === tab.key
                  ? 'bg-terracotta text-white'
                  : 'bg-surface text-ink-dim hover:text-ink'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-5 py-2 space-y-1">
          {activeTab === 'tags' ? (
            tags.length === 0 ? (
              <p className="text-sm text-ink-muted italic py-2">No tags yet</p>
            ) : (
              tags.map((tag) => (
                <LabelRow
                  key={tag.id}
                  name={tag.name}
                  onSave={(name) => handleRenameTag(tag.id, name)}
                  onDelete={() => handleDeleteTag(tag.id)}
                />
              ))
            )
          ) : (
            categoryItems.length === 0 ? (
              <p className="text-sm text-ink-muted italic py-2">No {activeTab} categories yet</p>
            ) : (
              categoryItems.map((cat) => (
                <LabelRow
                  key={cat.id}
                  name={cat.name}
                  onSave={(name) => handleRenameCategory(cat.id, name)}
                  onDelete={() => handleDeleteCategory(cat.id)}
                />
              ))
            )
          )}
        </div>

        {/* Add form */}
        <div className="px-5 py-4 border-t border-border">
          <AddForm
            placeholder={activeTab === 'tags' ? 'New tag name…' : `New ${activeTab} option…`}
            onAdd={activeTab === 'tags' ? handleAddTag : handleAddCategory}
          />
        </div>
      </div>
    </div>
  )
}

function LabelRow({
  name,
  onSave,
  onDelete,
}: {
  name: string
  onSave: (name: string) => Promise<void>
  onDelete: () => Promise<void>
}) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(name)
  const [busy, setBusy] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) inputRef.current?.focus()
  }, [editing])

  async function handleSave() {
    const trimmed = value.trim()
    if (!trimmed || trimmed === name) { setEditing(false); setValue(name); return }
    setBusy(true)
    await onSave(trimmed)
    setBusy(false)
    setEditing(false)
  }

  async function handleDelete() {
    if (!confirm(`Delete "${name}"? This removes it from all recipes.`)) return
    setBusy(true)
    await onDelete()
    setBusy(false)
  }

  if (editing) {
    return (
      <div className="flex items-center gap-2 py-1">
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave()
            if (e.key === 'Escape') { setEditing(false); setValue(name) }
          }}
          className="input-base flex-1 py-1.5 text-sm"
          disabled={busy}
        />
        <button onClick={handleSave} disabled={busy} className="btn-primary py-1.5 text-xs">
          Save
        </button>
        <button
          onClick={() => { setEditing(false); setValue(name) }}
          className="btn-ghost py-1.5 text-xs"
        >
          Cancel
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 group py-1 rounded-lg hover:bg-surface px-2 -mx-2 transition-colors">
      <span className="flex-1 text-sm text-ink">{name}</span>
      <button
        onClick={() => setEditing(true)}
        disabled={busy}
        className="opacity-0 group-hover:opacity-100 text-ink-muted hover:text-ink transition-opacity p-1 rounded"
        aria-label={`Edit ${name}`}
        title="Rename"
      >
        <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11.5 2.5l2 2-9 9H2.5v-2l9-9z" />
        </svg>
      </button>
      <button
        onClick={handleDelete}
        disabled={busy}
        className="opacity-0 group-hover:opacity-100 text-ink-muted hover:text-red-500 transition-opacity p-1 rounded"
        aria-label={`Delete ${name}`}
        title="Delete"
      >
        <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <path d="M3 4h10M6 4V2h4v2M5 4l.5 9h5l.5-9" />
        </svg>
      </button>
    </div>
  )
}

function AddForm({ placeholder, onAdd }: { placeholder: string; onAdd: (name: string) => Promise<void> }) {
  const [value, setValue] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleSubmit() {
    const trimmed = value.trim()
    if (!trimmed) return
    setBusy(true)
    await onAdd(trimmed)
    setBusy(false)
    setValue('')
  }

  return (
    <div className="flex gap-2">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        placeholder={placeholder}
        className="input-base flex-1 py-1.5 text-sm"
        disabled={busy}
      />
      <button
        onClick={handleSubmit}
        disabled={busy || !value.trim()}
        className="btn-primary text-sm py-1.5 whitespace-nowrap disabled:opacity-50"
      >
        + Add
      </button>
    </div>
  )
}
