'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { ParsedRecipe } from '@/types'

interface Collection {
  id: string
  name: string
  count: number
  coverUrl: string | null
}

interface IgPost {
  shortcode: string
  caption: string
  thumbnailUrl: string | null
}

interface ExtractedPost {
  shortcode: string
  thumbnailUrl: string | null
  status: 'pending' | 'loading' | 'done' | 'error'
  recipe: ParsedRecipe | null
  error: string | null
}

interface Props {
  onDisconnect: () => void
}

export default function SyncView({ onDisconnect }: Props) {
  const router = useRouter()
  const [collections, setCollections] = useState<Collection[]>([])
  const [loadingCollections, setLoadingCollections] = useState(true)
  const [collectionsError, setCollectionsError] = useState('')
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null)
  const [posts, setPosts] = useState<IgPost[]>([])
  const [loadingPosts, setLoadingPosts] = useState(false)
  const [extractedPosts, setExtractedPosts] = useState<ExtractedPost[]>([])
  const [syncing, setSyncing] = useState(false)
  const [savingAll, setSavingAll] = useState(false)
  const [phase, setPhase] = useState<'collections' | 'posts' | 'review'>('collections')

  useEffect(() => {
    loadCollections()
  }, [])

  async function loadCollections() {
    setLoadingCollections(true)
    setCollectionsError('')
    try {
      const res = await fetch('/api/instagram/collections')
      const data = await res.json()
      if (!res.ok) {
        if (res.status === 401) onDisconnect()
        setCollectionsError(data.error ?? 'Failed to load collections')
        return
      }
      setCollections(data.collections ?? [])
    } catch {
      setCollectionsError('Network error — please try again.')
    } finally {
      setLoadingCollections(false)
    }
  }

  async function selectCollection(col: Collection) {
    setSelectedCollection(col)
    setPhase('posts')
    setLoadingPosts(true)
    setPosts([])
    try {
      const res = await fetch(`/api/instagram/collections/${col.id}/posts`)
      const data = await res.json()
      if (!res.ok) {
        setCollectionsError(data.error ?? 'Failed to load posts')
        return
      }
      setPosts(data.posts ?? [])
    } catch {
      setCollectionsError('Failed to load posts.')
    } finally {
      setLoadingPosts(false)
    }
  }

  async function startSync() {
    if (!posts.length) return
    setSyncing(true)
    setPhase('review')

    const initial: ExtractedPost[] = posts.map((p) => ({
      shortcode: p.shortcode,
      thumbnailUrl: p.thumbnailUrl,
      status: 'pending',
      recipe: null,
      error: null,
    }))
    setExtractedPosts(initial)

    for (let i = 0; i < posts.length; i++) {
      const post = posts[i]
      setExtractedPosts((prev) =>
        prev.map((p) => (p.shortcode === post.shortcode ? { ...p, status: 'loading' } : p))
      )

      try {
        const res = await fetch('/api/fetch-instagram', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: `https://www.instagram.com/p/${post.shortcode}/`,
          }),
        })
        const data = await res.json()

        if (!res.ok || !data.parsed) {
          setExtractedPosts((prev) =>
            prev.map((p) =>
              p.shortcode === post.shortcode
                ? { ...p, status: 'error', error: data.error ?? 'No recipe found' }
                : p
            )
          )
        } else {
          setExtractedPosts((prev) =>
            prev.map((p) =>
              p.shortcode === post.shortcode
                ? { ...p, status: 'done', recipe: data.parsed }
                : p
            )
          )
        }
      } catch {
        setExtractedPosts((prev) =>
          prev.map((p) =>
            p.shortcode === post.shortcode
              ? { ...p, status: 'error', error: 'Network error' }
              : p
          )
        )
      }
    }

    setSyncing(false)
  }

  async function saveAllDrafts() {
    const toSave = extractedPosts.filter((p) => p.status === 'done' && p.recipe)
    if (!toSave.length) return
    setSavingAll(true)

    for (const ep of toSave) {
      if (!ep.recipe) continue
      const recipe = ep.recipe
      await fetch('/api/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: recipe.title ?? 'Untitled',
          description: recipe.description ?? null,
          ingredients: recipe.ingredients ?? [],
          steps: recipe.steps ?? [],
          image_url: null,
          source_url: recipe.source_url ?? `https://www.instagram.com/p/${ep.shortcode}/`,
          is_concept: true,
        }),
      })
    }

    setSavingAll(false)
    router.push('/catalog')
    router.refresh()
  }

  const doneCount = extractedPosts.filter((p) => p.status === 'done').length
  const errorCount = extractedPosts.filter((p) => p.status === 'error').length
  const pendingCount = extractedPosts.filter(
    (p) => p.status === 'pending' || p.status === 'loading'
  ).length

  if (loadingCollections) {
    return (
      <div className="flex items-center justify-center py-16 gap-3 text-ink-dim">
        <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
        Loading your collections…
      </div>
    )
  }

  if (collectionsError) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          {collectionsError}
        </p>
        <button type="button" onClick={loadCollections} className="btn-secondary">
          Retry
        </button>
      </div>
    )
  }

  // Phase: collections list
  if (phase === 'collections') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-2xl font-bold text-ink">Your saved collections</h2>
          <button
            type="button"
            onClick={onDisconnect}
            className="text-xs text-ink-muted hover:text-red-500 transition-colors"
          >
            Disconnect
          </button>
        </div>
        <p className="text-ink-dim text-sm">Select a collection to sync.</p>

        {collections.length === 0 ? (
          <p className="text-ink-muted text-sm py-8 text-center">No saved collections found.</p>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {collections.map((col) => (
              <button
                key={col.id}
                type="button"
                onClick={() => selectCollection(col)}
                className="flex items-center gap-4 rounded-xl border border-border bg-surface p-4 hover:border-terracotta/40 hover:shadow-sm transition-all text-left"
              >
                {col.coverUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={col.coverUrl}
                    alt=""
                    className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                  />
                ) : (
                  <span className="w-12 h-12 rounded-lg bg-surface-2 flex items-center justify-center flex-shrink-0 text-ink-muted text-xl">
                    📁
                  </span>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-ink">{col.name}</p>
                  <p className="text-xs text-ink-muted mt-0.5">{col.count} posts</p>
                </div>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  className="text-ink-muted flex-shrink-0"
                >
                  <path
                    d="M6 3l5 5-5 5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  // Phase: posts in collection
  if (phase === 'posts') {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setPhase('collections')}
            className="text-sm text-ink-dim hover:text-terracotta transition-colors"
          >
            ← Back
          </button>
          <h2 className="font-serif text-2xl font-bold text-ink">{selectedCollection?.name}</h2>
        </div>

        {loadingPosts ? (
          <div className="flex items-center gap-3 py-12 justify-center text-ink-dim">
            <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            Loading posts…
          </div>
        ) : posts.length === 0 ? (
          <p className="text-ink-muted text-sm py-8 text-center">No posts in this collection.</p>
        ) : (
          <>
            <p className="text-ink-dim text-sm">
              {posts.length} posts found. Claude will extract recipes from each one.
            </p>

            {/* Thumbnail grid preview */}
            <div className="grid grid-cols-4 gap-2">
              {posts.slice(0, 16).map((p) => (
                <div
                  key={p.shortcode}
                  className="aspect-square rounded-lg overflow-hidden bg-surface-2"
                >
                  {p.thumbnailUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.thumbnailUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-ink-muted text-2xl">
                      📸
                    </div>
                  )}
                </div>
              ))}
              {posts.length > 16 && (
                <div className="aspect-square rounded-lg bg-surface-2 flex items-center justify-center text-sm text-ink-muted font-medium">
                  +{posts.length - 16}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={startSync}
              className="btn-primary w-full"
            >
              Extract recipes from all {posts.length} posts
            </button>
          </>
        )}
      </div>
    )
  }

  // Phase: review extractions
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-2xl font-bold text-ink">Extracting recipes</h2>
        {!syncing && (
          <span className="text-sm text-ink-dim">
            {doneCount} found · {errorCount} skipped
          </span>
        )}
      </div>

      {syncing && (
        <div className="rounded-xl border border-border bg-surface px-4 py-3 flex items-center gap-3">
          <span className="w-4 h-4 border-2 border-terracotta border-t-transparent rounded-full animate-spin flex-shrink-0" />
          <span className="text-sm text-ink-dim">
            Processing… {extractedPosts.length - pendingCount} of {extractedPosts.length}
          </span>
          <div className="flex-1 h-1 bg-border rounded-full overflow-hidden">
            <div
              className="h-full bg-terracotta rounded-full transition-all duration-300"
              style={{
                width: `${((extractedPosts.length - pendingCount) / extractedPosts.length) * 100}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Results list */}
      <div className="space-y-2">
        {extractedPosts.map((ep) => (
          <div
            key={ep.shortcode}
            className={`flex items-start gap-3 rounded-xl border p-3 ${
              ep.status === 'done'
                ? 'border-green-200 bg-green-50'
                : ep.status === 'error'
                ? 'border-border bg-surface opacity-60'
                : 'border-border bg-surface'
            }`}
          >
            {ep.thumbnailUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={ep.thumbnailUrl}
                alt=""
                className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-surface-2 flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              {ep.status === 'loading' && (
                <p className="text-xs text-ink-muted flex items-center gap-1.5">
                  <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                  Extracting…
                </p>
              )}
              {ep.status === 'pending' && (
                <p className="text-xs text-ink-muted">Waiting…</p>
              )}
              {ep.status === 'done' && ep.recipe && (
                <>
                  <p className="text-sm font-semibold text-ink truncate">
                    {ep.recipe.title ?? 'Untitled'}
                  </p>
                  <p className="text-xs text-ink-dim mt-0.5">
                    {ep.recipe.ingredients?.length ?? 0} ingredients ·{' '}
                    {ep.recipe.steps?.length ?? 0} steps
                  </p>
                </>
              )}
              {ep.status === 'error' && (
                <p className="text-xs text-ink-muted">{ep.error ?? 'No recipe found'}</p>
              )}
            </div>
            <span className="text-sm flex-shrink-0">
              {ep.status === 'done' && '✓'}
              {ep.status === 'error' && '—'}
            </span>
          </div>
        ))}
      </div>

      {!syncing && doneCount > 0 && (
        <button
          type="button"
          onClick={saveAllDrafts}
          disabled={savingAll}
          className="btn-primary w-full disabled:opacity-50"
        >
          {savingAll
            ? 'Saving…'
            : `Save ${doneCount} recipe${doneCount === 1 ? '' : 's'} as concept drafts`}
        </button>
      )}
    </div>
  )
}
