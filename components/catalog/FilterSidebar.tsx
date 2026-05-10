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
  onTagToggle: (id: string) => void
  onCategoryToggle: (id: string) => void
  onClear: () => void
}

export default function FilterSidebar({
  tags,
  categories,
  selectedTags,
  selectedCategories,
  onTagToggle,
  onCategoryToggle,
  onClear,
}: FilterSidebarProps) {
  const hasFilters = selectedTags.length > 0 || selectedCategories.length > 0

  const grouped = CATEGORY_ORDER.reduce<Record<string, Category[]>>((acc, type) => {
    acc[type] = categories.filter((c) => c.type === type)
    return acc
  }, {} as Record<string, Category[]>)

  return (
    <aside className="space-y-6">
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
