import Link from 'next/link'
import Image from 'next/image'
import { truncate } from '@/lib/utils'
import type { RecipeCard as RecipeCardType } from '@/types'

interface Props {
  recipe: RecipeCardType
  view: 'grid' | 'list'
}

export default function RecipeCard({ recipe, view }: Props) {
  if (view === 'list') {
    return (
      <Link
        href={`/recipe/${recipe.slug}`}
        className="group flex items-center gap-3 px-4 py-3 rounded-xl bg-surface border border-border hover:border-terracotta/30 hover:shadow-sm transition-all"
      >
        <div className="flex-1 min-w-0">
          <h3 className="font-serif text-base font-semibold text-ink group-hover:text-terracotta transition-colors truncate">
            {recipe.title}
          </h3>
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
    )
  }

  // Grid view
  return (
    <Link
      href={`/recipe/${recipe.slug}`}
      className="group card flex flex-col"
    >
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
