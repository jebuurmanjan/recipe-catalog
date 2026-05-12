'use client'
import { useEffect } from 'react'
import FilterSidebar from './FilterSidebar'
import type { Tag, Category } from '@/types'

interface Props {
  tags: Tag[]
  categories: Category[]
  selectedTags: string[]
  selectedCategories: string[]
  showConcepts: boolean
  onTagToggle: (id: string) => void
  onCategoryToggle: (id: string) => void
  onClear: () => void
  onEditLabels: () => void
  onShowConceptsToggle: () => void
  onClose: () => void
}

export default function MobileFilterModal(props: Props) {
  const { onClose } = props

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  // Prevent body scroll while open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const activeCount = props.selectedTags.length + props.selectedCategories.length

  return (
    <div className="fixed inset-0 z-50 flex flex-col lg:hidden" style={{ backgroundColor: 'var(--bg-base)' }}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-4 border-b flex-shrink-0"
        style={{ borderColor: 'var(--border)' }}
      >
        <p className="font-serif text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
          Filters
        </p>
        <button
          onClick={onClose}
          className="btn-ghost p-2"
          aria-label="Close filters"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
            <path d="M1 1l16 16M17 1L1 17" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Scrollable filter content */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <FilterSidebar
          tags={props.tags}
          categories={props.categories}
          selectedTags={props.selectedTags}
          selectedCategories={props.selectedCategories}
          showConcepts={props.showConcepts}
          onTagToggle={props.onTagToggle}
          onCategoryToggle={props.onCategoryToggle}
          onClear={props.onClear}
          onEditLabels={props.onEditLabels}
          onShowConceptsToggle={props.onShowConceptsToggle}
        />
      </div>

      {/* Sticky footer */}
      <div
        className="flex-shrink-0 px-4 py-4 border-t"
        style={{ borderColor: 'var(--border)' }}
      >
        <button onClick={onClose} className="btn-primary w-full py-3 text-base">
          {activeCount > 0 ? `Show results (${activeCount} filter${activeCount !== 1 ? 's' : ''})` : 'Show results'}
        </button>
      </div>
    </div>
  )
}
