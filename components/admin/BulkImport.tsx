'use client'
import { useState, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'

type Status = 'pending' | 'uploading' | 'done' | 'error'

interface ImportItem {
  id: string
  file: File
  previewUrl: string
  title: string
  status: Status
  recipeSlug?: string
  error?: string
}

type Phase = 'select' | 'review' | 'importing' | 'done'

export default function BulkImport() {
  const [items, setItems] = useState<ImportItem[]>([])
  const [phase, setPhase] = useState<Phase>('select')
  const [importedCount, setImportedCount] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    const newItems: ImportItem[] = Array.from(files).map((file) => ({
      id: crypto.randomUUID(),
      file,
      previewUrl: URL.createObjectURL(file),
      title: file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '),
      status: 'pending',
    }))
    setItems((prev) => [...prev, ...newItems])
    setPhase('review')
  }

  function handleRemove(id: string) {
    setItems((prev) => {
      const item = prev.find((i) => i.id === id)
      if (item) URL.revokeObjectURL(item.previewUrl)
      return prev.filter((i) => i.id !== id)
    })
    if (items.length === 1) setPhase('select')
  }

  function updateItem(id: string, patch: Partial<ImportItem>) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)))
  }

  async function handleImport() {
    const pending = items.filter((i) => i.status === 'pending')
    if (pending.length === 0) return
    if (pending.some((i) => !i.title.trim())) {
      alert('Please give every photo a title before importing.')
      return
    }

    setPhase('importing')
    let count = 0

    for (const item of pending) {
      updateItem(item.id, { status: 'uploading' })

      try {
        // 1. Upload image (non-fatal — recipe is created even if upload fails)
        let imageUrl: string | undefined
        try {
          const form = new FormData()
          form.append('file', item.file)
          const uploadRes = await fetch('/api/upload', { method: 'POST', body: form })
          const uploadData = await uploadRes.json()
          if (uploadRes.ok && uploadData.url) imageUrl = uploadData.url
        } catch {
          // image upload failed — recipe will be created without a photo
        }

        // 2. Create recipe stub
        const recipeRes = await fetch('/api/recipes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: item.title.trim(),
            image_url: imageUrl,
            ingredients: [],
            steps: [],
          }),
        })
        const recipeData = await recipeRes.json()

        if (!recipeRes.ok) throw new Error(recipeData.error ?? 'Recipe creation failed')

        updateItem(item.id, { status: 'done', recipeSlug: recipeData.recipe.slug })
        count++
        setImportedCount(count)
      } catch (err) {
        updateItem(item.id, {
          status: 'error',
          error: err instanceof Error ? err.message : 'Unknown error',
        })
      }
    }

    setPhase('done')
  }

  function handleReset() {
    items.forEach((i) => URL.revokeObjectURL(i.previewUrl))
    setItems([])
    setImportedCount(0)
    setPhase('select')
  }

  const pendingCount = items.filter((i) => i.status === 'pending').length
  const doneItems = items.filter((i) => i.status === 'done')
  const errorItems = items.filter((i) => i.status === 'error')

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="border-b border-border bg-cream sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <Link href="/" className="text-sm text-ink-dim hover:text-terracotta transition-colors">
            ← Catalog
          </Link>
          <span className="text-border">·</span>
          <h1 className="font-serif text-lg font-semibold text-ink">Import photos</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">

        {/* ── SELECT phase ── */}
        {phase === 'select' && (
          <div className="flex flex-col items-center gap-6">
            <div className="text-center">
              <h2 className="font-serif text-2xl font-bold text-ink mb-2">Import meal photos</h2>
              <p className="text-ink-dim text-sm max-w-sm">
                Select multiple photos at once. You'll give each one a title before importing.
              </p>
            </div>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full max-w-sm aspect-square rounded-2xl border-2 border-dashed border-border bg-surface hover:border-terracotta/40 hover:bg-surface transition-all flex flex-col items-center justify-center gap-4 text-ink-muted hover:text-ink active:scale-95"
            >
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden>
                <rect x="6" y="10" width="36" height="28" rx="4" stroke="currentColor" strokeWidth="2" />
                <circle cx="16" cy="20" r="3" stroke="currentColor" strokeWidth="2" />
                <path d="M6 32l10-10 8 8 6-6 12 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M32 6v10M27 11l5-5 5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div className="text-center">
                <p className="font-semibold text-base">Tap to select photos</p>
                <p className="text-sm mt-1">You can select multiple at once</p>
              </div>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              className="sr-only"
              onChange={(e) => handleFiles(e.target.files)}
            />

            <p className="text-xs text-ink-muted text-center">
              💡 In Safari: tap Share → <strong>Add to Home Screen</strong> for one-tap access
            </p>
          </div>
        )}

        {/* ── REVIEW phase ── */}
        {(phase === 'review' || phase === 'importing') && (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-ink-dim">
                {phase === 'importing'
                  ? `Importing ${importedCount} of ${items.filter(i => i.status !== 'pending').length + pendingCount}…`
                  : `${items.length} photo${items.length !== 1 ? 's' : ''} selected`}
              </p>
              {phase === 'review' && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-sm text-terracotta hover:underline"
                >
                  + Add more
                </button>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              className="sr-only"
              onChange={(e) => handleFiles(e.target.files)}
            />

            <div className="grid grid-cols-2 gap-3 mb-24">
              {items.map((item) => (
                <PhotoCard
                  key={item.id}
                  item={item}
                  disabled={phase === 'importing'}
                  onTitleChange={(title) => updateItem(item.id, { title })}
                  onRemove={() => handleRemove(item.id)}
                />
              ))}
            </div>

            {/* Sticky import button */}
            <div className="fixed bottom-0 left-0 right-0 bg-cream/95 backdrop-blur-sm border-t border-border p-4 safe-bottom">
              <div className="max-w-2xl mx-auto">
                <button
                  onClick={handleImport}
                  disabled={phase === 'importing' || pendingCount === 0}
                  className="btn-primary w-full py-3.5 text-base disabled:opacity-50"
                >
                  {phase === 'importing'
                    ? `Importing ${importedCount} of ${items.length}…`
                    : `Import ${pendingCount} recipe${pendingCount !== 1 ? 's' : ''}`}
                </button>
              </div>
            </div>
          </>
        )}

        {/* ── DONE phase ── */}
        {phase === 'done' && (
          <div className="flex flex-col gap-6">
            <div className="rounded-2xl bg-green-50 border border-green-200 px-5 py-4 text-center">
              <p className="text-2xl mb-1">✓</p>
              <p className="font-serif text-lg font-semibold text-green-800">
                {doneItems.length} recipe{doneItems.length !== 1 ? 's' : ''} imported!
              </p>
              <p className="text-sm text-green-700 mt-1">
                Tap any recipe below to add ingredients, steps, and tags.
              </p>
            </div>

            <div className="space-y-2">
              {doneItems.map((item) => (
                <Link
                  key={item.id}
                  href={`/admin/edit/${item.recipeSlug}`}
                  className="flex items-center gap-3 p-3 rounded-xl bg-surface border border-border hover:border-terracotta/30 transition-all group"
                >
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                    <Image src={item.previewUrl} alt={item.title} fill className="object-cover" sizes="48px" />
                  </div>
                  <span className="flex-1 text-sm font-medium text-ink group-hover:text-terracotta transition-colors truncate">
                    {item.title}
                  </span>
                  <span className="text-ink-muted text-sm">Edit →</span>
                </Link>
              ))}

              {errorItems.length > 0 && (
                <div className="mt-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3">
                  <p className="text-sm font-semibold text-red-700 mb-1">
                    {errorItems.length} failed to import:
                  </p>
                  {errorItems.map((item) => (
                    <p key={item.id} className="text-xs text-red-600">
                      {item.title}: {item.error}
                    </p>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button onClick={handleReset} className="btn-primary flex-1 py-3">
                Import more photos
              </button>
              <Link href="/" className="btn-secondary flex-1 py-3 text-center">
                Back to catalog
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function PhotoCard({
  item,
  disabled,
  onTitleChange,
  onRemove,
}: {
  item: ImportItem
  disabled: boolean
  onTitleChange: (title: string) => void
  onRemove: () => void
}) {
  return (
    <div className="rounded-xl border border-border bg-surface overflow-hidden flex flex-col">
      {/* Image */}
      <div className="relative aspect-square bg-surface-2">
        <Image src={item.previewUrl} alt={item.title} fill className="object-cover" sizes="(max-width: 640px) 50vw, 300px" />

        {/* Status overlay */}
        {item.status === 'uploading' && (
          <div className="absolute inset-0 bg-ink/40 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        {item.status === 'done' && (
          <div className="absolute inset-0 bg-green-900/40 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 8l4 4 6-7" />
              </svg>
            </div>
          </div>
        )}
        {item.status === 'error' && (
          <div className="absolute inset-0 bg-red-900/40 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white font-bold text-sm">!</div>
          </div>
        )}

        {/* Remove button */}
        {!disabled && item.status === 'pending' && (
          <button
            onClick={onRemove}
            className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-ink/60 text-white flex items-center justify-center text-xs hover:bg-ink/80 transition-colors"
            aria-label="Remove"
          >
            ✕
          </button>
        )}
      </div>

      {/* Title input */}
      <div className="p-2">
        <input
          type="text"
          value={item.title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Recipe name…"
          disabled={disabled || item.status !== 'pending'}
          autoCapitalize="words"
          className="w-full text-sm font-medium text-ink bg-transparent border-none outline-none placeholder:text-ink-muted disabled:opacity-60"
        />
      </div>
    </div>
  )
}
