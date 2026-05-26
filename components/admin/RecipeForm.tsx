'use client'
import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import IngredientsInput from './IngredientsInput'
import StepsInput from './StepsInput'
import TagSelect from './TagSelect'
import CategorySelect from './CategorySelect'
import ImageUpload from './ImageUpload'
import ImportFromURL from './ImportFromURL'
import ImportFromPhoto from './ImportFromPhoto'
import type { Recipe, Tag, Category, ParsedRecipe } from '@/types'

interface Props {
  mode: 'add' | 'edit'
  recipe?: Recipe
  tags: Tag[]
  categories: Category[]
}

export default function RecipeForm({ mode, recipe, tags: allTagsProp, categories }: Props) {
  const router = useRouter()

  const [title, setTitle] = useState(recipe?.title ?? '')
  const [description, setDescription] = useState(recipe?.description ?? '')
  const [ingredients, setIngredients] = useState<string[]>(recipe?.ingredients ?? [''])
  const [steps, setSteps] = useState<string[]>(recipe?.steps ?? [''])
  const [imageUrl, setImageUrl] = useState(recipe?.image_url ?? '')
  const [sourceUrl, setSourceUrl] = useState(recipe?.source_url ?? '')
  const [selectedTags, setSelectedTags] = useState<string[]>(recipe?.tags?.map((t) => t.id) ?? [])
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    recipe?.categories?.map((c) => c.id) ?? []
  )
  const [allTags, setAllTags] = useState<Tag[]>(allTagsProp)
  const [servings, setServings] = useState<number>(recipe?.servings ?? 2)
  const [isConcept, setIsConcept] = useState(recipe?.is_concept ?? false)

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleCreateTag(name: string): Promise<Tag | null> {
    const res = await fetch('/api/tags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    })
    const data = await res.json()
    if (!res.ok) return null
    const newTag = data.tag as Tag
    setAllTags((prev) => [...prev, newTag].sort((a, b) => a.name.localeCompare(b.name)))
    return newTag
  }

  function handleImport(data: ParsedRecipe) {
    if (data.title) setTitle(data.title)
    if (data.description) setDescription(data.description)
    if (data.ingredients?.length) setIngredients(data.ingredients)
    if (data.steps?.length) setSteps(data.steps)
    if (data.image_url) setImageUrl(data.image_url)
    if (data.source_url) setSourceUrl(data.source_url)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (!title.trim()) {
      setError('Title is required')
      return
    }

    setSaving(true)
    try {
      const payload = {
        title: title.trim(),
        description: description.trim() || null,
        ingredients: ingredients.filter((s) => s.trim()),
        steps: steps.filter((s) => s.trim()),
        image_url: imageUrl || null,
        source_url: sourceUrl.trim() || null,
        tagIds: selectedTags,
        categoryIds: selectedCategories,
        is_concept: isConcept,
        servings: servings > 0 ? servings : null,
      }

      const url = mode === 'edit' ? `/api/recipes/${recipe!.slug}` : '/api/recipes'
      const method = mode === 'edit' ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong')
        return
      }

      router.push(`/recipe/${data.recipe.slug}`)
      router.refresh()
    } catch {
      setError('Network error — please try again.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this recipe? This cannot be undone.')) return

    const res = await fetch(`/api/recipes/${recipe!.slug}`, { method: 'DELETE' })
    if (res.ok) {
      router.push('/')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen bg-cream pb-24 sm:pb-0">
      {/* Header */}
      <header className="border-b border-border bg-cream sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <a href="/" className="text-sm text-ink-dim hover:text-terracotta transition-colors">
              ← Catalog
            </a>
            <span className="text-border">·</span>
            <h1 className="font-serif text-lg font-semibold text-ink">
              {mode === 'add' ? 'New recipe' : 'Edit recipe'}
            </h1>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            {mode === 'edit' && (
              <button
                type="button"
                onClick={handleDelete}
                className="btn-ghost text-red-500 hover:bg-red-50 hover:text-red-600"
              >
                Delete
              </button>
            )}
            <button
              type="submit"
              form="recipe-form"
              disabled={saving}
              className="btn-primary disabled:opacity-50"
            >
              {saving ? 'Saving…' : mode === 'add' ? 'Publish' : 'Save changes'}
            </button>
          </div>
        </div>
      </header>

      <form id="recipe-form" onSubmit={handleSubmit} className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Import from URL or photo */}
        <ImportFromURL onImport={handleImport} />
        <ImportFromPhoto onImport={handleImport} />

        {/* Error */}
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Title */}
        <div>
          <label htmlFor="title" className="label">Title *</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="E.g. Classic Spaghetti Carbonara"
            className="input-base font-serif text-lg"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="label">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="A brief description of the dish…"
            rows={3}
            className="input-base resize-y"
          />
        </div>

        {/* Servings */}
        <div>
          <p className="label">Servings</p>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setServings((v) => Math.max(1, v - 1))}
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
              onClick={() => setServings((v) => Math.min(99, v + 1))}
              className="w-10 h-10 rounded-full border flex items-center justify-center text-xl transition-colors"
              style={{ borderColor: 'var(--border)', color: 'var(--text-dim)', backgroundColor: 'var(--surface)' }}
              aria-label="Increase servings"
            >
              +
            </button>
          </div>
        </div>

        {/* Photo */}
        <div>
          <p className="label">Photo</p>
          <ImageUpload value={imageUrl} onChange={setImageUrl} />
        </div>

        {/* Source URL */}
        <div>
          <label htmlFor="source-url" className="label">Source URL</label>
          <input
            id="source-url"
            type="url"
            value={sourceUrl}
            onChange={(e) => setSourceUrl(e.target.value)}
            placeholder="https://example.com/recipe"
            className="input-base"
          />
        </div>

        {/* Categories */}
        <div>
          <p className="label">Categories</p>
          <CategorySelect
            categories={categories}
            selected={selectedCategories}
            onChange={setSelectedCategories}
          />
        </div>

        {/* Tags */}
        <div>
          <p className="label">Tags</p>
          <TagSelect
            allTags={allTags}
            selected={selectedTags}
            onChange={setSelectedTags}
            onCreateTag={handleCreateTag}
          />
        </div>

        {/* Ingredients */}
        <div>
          <p className="label">Ingredients</p>
          <IngredientsInput value={ingredients} onChange={setIngredients} />
        </div>

        {/* Steps */}
        <div>
          <p className="label">Instructions</p>
          <StepsInput value={steps} onChange={setSteps} />
        </div>

        {/* Concept toggle */}
        <div className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3">
          <div>
            <p className="text-sm font-medium text-ink">Mark as concept</p>
            <p className="text-xs text-ink-muted mt-0.5">Concept recipes are hidden from the catalog by default</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={isConcept}
            onClick={() => setIsConcept((v) => !v)}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
              isConcept ? 'bg-terracotta' : 'bg-border'
            }`}
          >
            <span
              className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${
                isConcept ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Bottom submit — desktop only */}
        <div className="hidden sm:flex pt-4 border-t border-border justify-end gap-3">
          {mode === 'edit' && (
            <a href={`/recipe/${recipe!.slug}`} className="btn-secondary">
              View recipe
            </a>
          )}
          <button
            type="submit"
            disabled={saving}
            className="btn-primary disabled:opacity-50"
          >
            {saving ? 'Saving…' : mode === 'add' ? 'Publish recipe' : 'Save changes'}
          </button>
        </div>
      </form>

      {/* Mobile sticky bottom bar */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 border-t border-border bg-cream/95 backdrop-blur-sm p-3 flex gap-2 z-10">
        {mode === 'edit' && (
          <button
            type="button"
            onClick={handleDelete}
            className="btn-ghost text-red-500 hover:bg-red-50 hover:text-red-600 px-4 py-3"
          >
            Delete
          </button>
        )}
        <button
          type="submit"
          form="recipe-form"
          disabled={saving}
          className="btn-primary flex-1 py-3 text-base disabled:opacity-50"
        >
          {saving ? 'Saving…' : mode === 'add' ? 'Publish recipe' : 'Save changes'}
        </button>
      </div>
    </div>
  )
}
