'use client'
import type { Category, CategoryType } from '@/types'

const CATEGORY_LABELS: Record<CategoryType, string> = {
  cuisine: 'Cuisine',
  diet: 'Diet & dietary',
  occasion: 'Occasion',
  effort: 'Effort level',
}
const CATEGORY_ORDER: CategoryType[] = ['cuisine', 'diet', 'occasion', 'effort']

interface Props {
  categories: Category[]
  selected: string[]  // category IDs
  onChange: (selected: string[]) => void
}

export default function CategorySelect({ categories, selected, onChange }: Props) {
  function toggle(id: string) {
    onChange(selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id])
  }

  const grouped = CATEGORY_ORDER.reduce<Record<string, Category[]>>((acc, type) => {
    acc[type] = categories.filter((c) => c.type === type)
    return acc
  }, {} as Record<string, Category[]>)

  return (
    <div className="space-y-4">
      {CATEGORY_ORDER.map((type) => {
        const items = grouped[type] ?? []
        if (items.length === 0) return null
        return (
          <div key={type}>
            <p className="label">{CATEGORY_LABELS[type]}</p>
            <div className="flex flex-wrap gap-1.5">
              {items.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => toggle(cat.id)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all border ${
                    selected.includes(cat.id)
                      ? 'bg-terracotta text-white border-terracotta'
                      : 'bg-surface-2 text-ink-dim border-border hover:border-terracotta/40 hover:text-ink'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
