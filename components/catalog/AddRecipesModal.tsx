'use client'
import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import type { RecipeCard } from '@/types'

interface Props {
  collectionName: string
  /** All available recipes */
  allRecipes: RecipeCard[]
  /** IDs already in the collection */
  memberIds: string[]
  onToggle: (recipe: RecipeCard, isMember: boolean) => void
  onClose: () => void
}

export default function AddRecipesModal({ collectionName, allRecipes, memberIds, onToggle, onClose }: Props) {
  const [search, setSearch] = useState('')
  const overlayRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    function handleKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    inputRef.current?.focus()
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  const filtered = allRecipes.filter((r) =>
    r.title.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
      onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
    >
      <div
        className="w-full max-w-lg rounded-2xl shadow-xl flex flex-col overflow-hidden"
        style={{ backgroundColor: 'var(--bg-base)', border: '1px solid var(--border)', maxHeight: '80vh' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 flex-shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
          <div>
            <p className="font-serif font-semibold text-base" style={{ color: 'var(--text-primary)' }}>Add recipes</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>to &ldquo;{collectionName}&rdquo;</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg transition-colors" style={{ color: 'var(--text-muted)' }}
            onMouseOver={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
            onMouseOut={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
            aria-label="Close"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden>
              <path d="M4 4l8 8M12 4l-8 8" />
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="px-4 py-3 flex-shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2" width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden style={{ color: 'var(--text-muted)' }}>
              <circle cx="6.5" cy="6.5" r="4.5" />
              <path d="M10 10l3.5 3.5" strokeLinecap="round" />
            </svg>
            <input
              ref={inputRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search recipes…"
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-terracotta/40"
              style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            />
          </div>
        </div>

        {/* Recipe list */}
        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-1">
          {filtered.length === 0 ? (
            <p className="text-sm text-center py-8" style={{ color: 'var(--text-muted)' }}>No recipes match your search</p>
          ) : (
            filtered.map((recipe) => {
              const isMember = memberIds.includes(recipe.id)
              return (
                <button
                  key={recipe.id}
                  onClick={() => onToggle(recipe, isMember)}
                  className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-left transition-colors hover:bg-surface-2"
                >
                  {/* Checkbox */}
                  <span className={`w-5 h-5 rounded-md border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                    isMember ? 'bg-terracotta border-terracotta' : 'border-border'
                  }`}>
                    {isMember && (
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="white" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <path d="M1.5 5l2.5 2.5L8.5 2" />
                      </svg>
                    )}
                  </span>

                  {/* Thumbnail */}
                  <div className="relative w-8 h-8 rounded-lg overflow-hidden flex-shrink-0" style={{ backgroundColor: 'var(--bg-surface-2)' }}>
                    {recipe.image_url ? (
                      <Image src={recipe.image_url} alt="" fill className="object-cover" sizes="32px" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden style={{ color: 'var(--border)' }}>
                          <path d="M3 20l6-8 5 6 3-4 5 6H3z" fill="currentColor" opacity="0.5" />
                        </svg>
                      </div>
                    )}
                  </div>

                  <span className="flex-1 min-w-0 text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                    {recipe.title}
                  </span>
                  {recipe.is_concept && (
                    <span className="flex-shrink-0 text-xs px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
                      Concept
                    </span>
                  )}
                </button>
              )
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 flex-shrink-0" style={{ borderTop: '1px solid var(--border)' }}>
          <button onClick={onClose} className="btn-primary w-full text-sm">Done</button>
        </div>
      </div>
    </div>
  )
}
