'use client'
import type { Tag, Category, CategoryType } from '@/types'

const CATEGORY_LABELS: Record<CategoryType, string> = {
  cuisine: 'Cuisine',
  diet: 'Diet',
  occasion: 'Occasion',
  effort: 'Effort',
}
const CATEGORY_ORDER: CategoryType[] = ['cuisine', 'diet', 'occasion', 'effort']

interface FilterSidebarProps {
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
}

export default function FilterSidebar({
  tags,
  categories,
  selectedTags,
  selectedCategories,
  showConcepts,
  onTagToggle,
  onCategoryToggle,
  onClear,
  onEditLabels,
  onShowConceptsToggle,
}: FilterSidebarProps) {
  const hasFilters = selectedTags.length > 0 || selectedCategories.length > 0

  const grouped = CATEGORY_ORDER.reduce<Record<string, Category[]>>((acc, type) => {
    acc[type] = categories.filter((c) => c.type === type)
    return acc
  }, {} as Record<string, Category[]>)

  return (
    <aside className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-ink-muted uppercase tracking-wider">Filters</p>
        <button
          onClick={onEditLabels}
          className="flex items-center gap-1 text-xs text-ink-muted hover:text-terracotta transition-colors"
          title="Manage labels"
        >
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11.5 2.5l2 2-9 9H2.5v-2l9-9z" />
          </svg>
          Edit
        </button>
      </div>

      {/* Concept toggle */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-ink-dim">Show concepts</span>
        <button
          type="button"
          role="switch"
          aria-checked={showConcepts}
          onClick={onShowConceptsToggle}
          className={`relative inline-flex h-5 w-9 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
            showConcepts ? 'bg-terracotta' : 'bg-border'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${
              showConcepts ? 'translate-x-4' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {hasFilters && (
        <button
          onClick={onClear}
          className="text-xs font-semibold text-terracotta hover:text-terracotta-dark transition-colors"
        >
          Clear all filters
        </button>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <FilterGroup label="Tags">
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <FilterChip
                key={tag.id}
                label={tag.name}
                selected={selectedTags.includes(tag.id)}
                onClick={() => onTagToggle(tag.id)}
              />
            ))}
          </div>
        </FilterGroup>
      )}

      {/* Category groups */}
      {CATEGORY_ORDER.map((type) =>
        grouped[type]?.length > 0 ? (
          <FilterGroup key={type} label={CATEGORY_LABELS[type]}>
            <div className="flex flex-wrap gap-1.5">
              {grouped[type].map((cat) => (
                <FilterChip
                  key={cat.id}
                  label={cat.name}
                  selected={selectedCategories.includes(cat.id)}
                  onClick={() => onCategoryToggle(cat.id)}
                />
              ))}
            </div>
          </FilterGroup>
        ) : null
      )}
    </aside>
  )
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="label">{label}</p>
      {children}
    </div>
  )
}

function FilterChip({
  label,
  selected,
  onClick,
}: {
  label: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all border ${
        selected
          ? 'bg-terracotta text-white border-terracotta'
          : 'bg-surface-2 text-ink-dim border-border hover:border-terracotta/40 hover:text-ink'
      }`}
    >
      {label}
    </button>
  )
}
