'use client'
import { useEffect, useRef } from 'react'
import type { Collection, RecipeCard } from '@/types'

interface Props {
  recipe: RecipeCard
  collections: Collection[]
  /** IDs of collections this recipe already belongs to */
  memberCollectionIds: string[]
  onToggle: (collectionId: string, isMember: boolean) => void
  onClose: () => void
}

export default function AddToCollectionModal({ recipe, collections, memberCollectionIds, onToggle, onClose }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
      onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
    >
      <div
        className="w-full max-w-sm rounded-2xl shadow-xl overflow-hidden"
        style={{ backgroundColor: 'var(--bg-base)', border: '1px solid var(--border)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <div>
            <p className="font-serif font-semibold text-base" style={{ color: 'var(--text-primary)' }}>Add to collection</p>
            <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)', maxWidth: '220px' }}>{recipe.title}</p>
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

        {/* Collection list */}
        <div className="max-h-72 overflow-y-auto p-3 flex flex-col gap-1">
          {collections.length === 0 ? (
            <p className="text-sm text-center py-6" style={{ color: 'var(--text-muted)' }}>
              No collections yet. Create one from the sidebar.
            </p>
          ) : (
            collections.map((col) => {
              const isMember = memberCollectionIds.includes(col.id)
              return (
                <button
                  key={col.id}
                  onClick={() => onToggle(col.id, isMember)}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-left transition-colors hover:bg-surface-2"
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
                  <span className="flex-1 font-medium text-sm truncate" style={{ color: 'var(--text-primary)' }}>{col.name}</span>
                  <span className="text-xs flex-shrink-0" style={{ color: 'var(--text-muted)' }}>{col.recipe_count ?? 0}</span>
                </button>
              )
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3" style={{ borderTop: '1px solid var(--border)' }}>
          <button onClick={onClose} className="btn-primary w-full text-sm">Done</button>
        </div>
      </div>
    </div>
  )
}
