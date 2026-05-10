import RecipeCard from './RecipeCard'
import type { RecipeCard as RecipeCardType } from '@/types'

interface Props {
  recipes: RecipeCardType[]
}

export default function RecipeList({ recipes }: Props) {
  if (recipes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden className="text-border mb-4">
          <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="2" />
          <path d="M16 30c1.5-3 4-5 8-5s6.5 2 8 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <circle cx="18" cy="20" r="2" fill="currentColor" />
          <circle cx="30" cy="20" r="2" fill="currentColor" />
        </svg>
        <p className="font-serif text-xl text-ink-dim">No recipes found</p>
        <p className="text-sm text-ink-muted mt-1">Try adjusting your search or filters</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {recipes.map((r) => (
        <RecipeCard key={r.id} recipe={r} view="list" />
      ))}
    </div>
  )
}
