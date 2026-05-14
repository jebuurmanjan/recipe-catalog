import Link from 'next/link'
import Image from 'next/image'
import { truncate } from '@/lib/utils'
import RecipeContextMenu, { type ContextAction } from '@/components/ui/RecipeContextMenu'
import type { RecipeCard as RecipeCardType } from '@/types'

interface Props {
  recipe: RecipeCardType
  view: 'grid' | 'list'
  contextActions?: ContextAction[]
  /** Extra wrapper class, e.g. for drag handle cursor */
  className?: string
}

export default function RecipeCard({ recipe, view, contextActions, className }: Props) {
  if (view === 'list') {
    return (
      <div className={`group flex items-center gap-1 px-4 py-3 rounded-xl bg-surface border border-border hover:border-terracotta/30 hover:shadow-sm transition-all ${className ?? ''}`}>
        <Link
          href={`/recipe/${recipe.slug}`}
          className="flex-1 min-w-0 flex items-center gap-3"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-serif text-base font-semibold text-ink group-hover:text-terracotta transition-colors truncate">
                {recipe.title}
              </h3>
              {recipe.is_concept && (
                <span className="flex-shrink-0 text-xs font-medium px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
                  Concept
                </span>
              )}
            </div>
            {recipe.description && (
              <p className="text-sm text-ink-dim mt-0.5 truncate">
                {recipe.description}
              </p>
            )}
            {((recipe.tags?.length ?? 0) > 0 || (recipe.categories?.length ?? 0) > 0) && (
              <div className="flex flex-wrap gap-1 mt-1">
                {recipe.categories?.slice(0, 2).map((c) => (
                  <span key={c.id} className="tag-pill">{c.name}</span>
                ))}
                {recipe.tags?.slice(0, 3).map((t) => (
                  <span key={t.id} className="tag-pill">{t.name}</span>
                ))}
              </div>
            )}
          </div>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="flex-shrink-0 text-ink-muted group-hover:text-terracotta transition-colors" aria-hidden>
            <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
        {contextActions && (
          <RecipeContextMenu actions={contextActions} />
        )}
      </div>
    )
  }

  // Grid view
  return (
    <div className={`group card flex flex-col relative ${className ?? ''}`}>
      {contextActions && (
        <div className="absolute top-2 right-2 z-10">
          <RecipeContextMenu actions={contextActions} />
        </div>
      )}
      <Link href={`/recipe/${recipe.slug}`} className="flex flex-col flex-1">
        <div className="relative aspect-[4/3] bg-surface-2 overflow-hidden">
          {recipe.image_url ? (
            <Image
              src={recipe.image_url}
              alt={recipe.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <PlaceholderIcon />
          )}
          {recipe.is_concept && (
            <span className="absolute top-2 left-2 text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100/90 text-amber-700 border border-amber-200">
              Concept
            </span>
          )}
        </div>
        <div className="p-4 flex flex-col flex-1">
          <h3 className="font-serif text-base font-semibold text-ink group-hover:text-terracotta transition-colors line-clamp-2 leading-snug">
            {recipe.title}
          </h3>
          {recipe.description && (
            <p className="text-sm text-ink-dim mt-1 line-clamp-2 flex-1">
              {truncate(recipe.description, 100)}
            </p>
          )}
          {((recipe.tags?.length ?? 0) > 0 || (recipe.categories?.length ?? 0) > 0) && (
            <div className="flex flex-wrap gap-1 mt-3">
              {recipe.categories?.slice(0, 2).map((c) => (
                <span key={c.id} className="tag-pill">{c.name}</span>
              ))}
              {recipe.tags?.slice(0, 2).map((t) => (
                <span key={t.id} className="tag-pill">{t.name}</span>
              ))}
            </div>
          )}
        </div>
      </Link>
    </div>
  )
}

function PlaceholderIcon() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden className="text-border">
        <path d="M5 32l10-12 7 8 5-6 8 10H5z" fill="currentColor" opacity="0.5" />
        <circle cx="28" cy="14" r="4" fill="currentColor" opacity="0.5" />
      </svg>
    </div>
  )
}
