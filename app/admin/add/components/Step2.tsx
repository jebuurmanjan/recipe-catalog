'use client'
import { useState, useEffect } from 'react'
import ImageUpload from '@/components/admin/ImageUpload'
import CategorySelect from '@/components/admin/CategorySelect'
import TagSelect from '@/components/admin/TagSelect'
import type { Tag, Category } from '@/types'

interface Props {
  title: string
  description: string
  imageUrl: string
  sourceUrl: string
  servings: number
  prepTime: string
  selectedCategories: string[]
  selectedTags: string[]
  allTags: Tag[]
  categories: Category[]
  onUpdate: (fields: {
    title?: string
    description?: string
    imageUrl?: string
    sourceUrl?: string
    servings?: number
    prepTime?: string
    selectedCategories?: string[]
    selectedTags?: string[]
  }) => void
  onAddTag: (name: string) => Promise<Tag | null>
  onNext: () => void
  onBack: () => void
}

export default function Step2({
  title,
  description,
  imageUrl,
  sourceUrl,
  servings,
  prepTime,
  selectedCategories,
  selectedTags,
  allTags,
  categories,
  onUpdate,
  onAddTag,
  onNext,
  onBack,
}: Props) {
  const [suggesting, setSuggesting] = useState(false)

  useEffect(() => {
    // Auto-suggest categories on mount if we have a title but no categories selected yet
    if (title.trim() && selectedCategories.length === 0) {
      fetchSuggestions()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function fetchSuggestions() {
    if (!title.trim()) return
    setSuggesting(true)
    try {
      const res = await fetch('/api/suggest-tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, categories }),
      })
      if (res.ok) {
        const data = await res.json()
        if (data.categoryIds?.length > 0) {
          onUpdate({ selectedCategories: data.categoryIds })
        }
      }
    } catch {
      // silently fail — suggestions are best-effort
    } finally {
      setSuggesting(false)
    }
  }

  const canProceed = title.trim().length > 0

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl font-bold text-ink">Details</h2>
        <p className="text-ink-dim text-sm mt-1">Fill in the basics — you can always edit later.</p>
      </div>

      {/* Title */}
      <div>
        <label htmlFor="wiz-title" className="label">
          Title *
        </label>
        <input
          id="wiz-title"
          type="text"
          value={title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          placeholder="E.g. Classic Spaghetti Carbonara"
          className="input-base font-serif text-lg"
        />
      </div>

      {/* Description */}
      <div>
        <label htmlFor="wiz-desc" className="label">
          Description
        </label>
        <textarea
          id="wiz-desc"
          value={description}
          onChange={(e) => onUpdate({ description: e.target.value })}
          placeholder="A brief description of the dish…"
          rows={3}
          className="input-base resize-y"
        />
      </div>

      {/* Servings & prep time */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <p className="label">Servings</p>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => onUpdate({ servings: Math.max(1, servings - 1) })}
              className="w-10 h-10 rounded-full border flex items-center justify-center text-xl transition-colors"
              style={{ borderColor: 'var(--border)', color: 'var(--text-dim)', backgroundColor: 'var(--surface)' }}
              aria-label="Decrease servings"
            >
              −
            </button>
            <span className="w-8 text-center text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              {servings}
            </span>
            <button
              type="button"
              onClick={() => onUpdate({ servings: Math.min(99, servings + 1) })}
              className="w-10 h-10 rounded-full border flex items-center justify-center text-xl transition-colors"
              style={{ borderColor: 'var(--border)', color: 'var(--text-dim)', backgroundColor: 'var(--surface)' }}
              aria-label="Increase servings"
            >
              +
            </button>
          </div>
        </div>
        <div>
          <label htmlFor="wiz-prep" className="label">
            Prep time
          </label>
          <input
            id="wiz-prep"
            type="text"
            value={prepTime}
            onChange={(e) => onUpdate({ prepTime: e.target.value })}
            placeholder="e.g. 30 minutes"
            className="input-base"
          />
        </div>
      </div>

      {/* Photo */}
      <div>
        <p className="label">Photo</p>
        <ImageUpload value={imageUrl} onChange={(v) => onUpdate({ imageUrl: v })} />
      </div>

      {/* Source URL */}
      <div>
        <label htmlFor="wiz-source" className="label">
          Source URL
        </label>
        <input
          id="wiz-source"
          type="url"
          value={sourceUrl}
          onChange={(e) => onUpdate({ sourceUrl: e.target.value })}
          placeholder="https://example.com/recipe"
          className="input-base"
        />
      </div>

      {/* Categories */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm font-medium text-ink">Categories</p>
          <div className="flex items-center gap-2">
            {suggesting && (
              <span className="text-xs text-ink-muted flex items-center gap-1">
                <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                AI suggesting…
              </span>
            )}
            {!suggesting && title.trim() && (
              <button
                type="button"
                onClick={fetchSuggestions}
                className="text-xs text-terracotta hover:underline"
              >
                ✨ Re-suggest
              </button>
            )}
          </div>
        </div>
        <CategorySelect
          categories={categories}
          selected={selectedCategories}
          onChange={(v) => onUpdate({ selectedCategories: v })}
        />
      </div>

      {/* Tags */}
      <div>
        <p className="label">Tags</p>
        <TagSelect
          allTags={allTags}
          selected={selectedTags}
          onChange={(v) => onUpdate({ selectedTags: v })}
          onCreateTag={onAddTag}
        />
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <button type="button" onClick={onBack} className="btn-secondary">
          ← Back
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!canProceed}
          className="btn-primary disabled:opacity-50"
        >
          Next: Recipe →
        </button>
      </div>
    </div>
  )
}
