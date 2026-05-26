import Image from 'next/image'
import Link from 'next/link'
import BrowseBanner from '@/components/ui/BrowseBanner'
import ShareButton from './ShareButton'
import { formatDate } from '@/lib/utils'
import type { Recipe } from '@/types'

interface Props {
  recipe: Recipe
  /** When true the recipe is being viewed via a public share link — hide edit link */
  shared?: boolean
}

export default function RecipeDetail({ recipe, shared }: Props) {
  const ingredients = Array.isArray(recipe.ingredients) ? recipe.ingredients : []
  const steps = Array.isArray(recipe.steps) ? recipe.steps : []
  return (
    <div className="min-h-screen bg-cream">
      {/* Nav */}
      <nav className="border-b border-border no-print">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3 text-sm">
          <Link href="/" className="text-ink-dim hover:text-terracotta transition-colors font-medium">
            ← Catalog
          </Link>
          <span className="text-border">·</span>
          <span className="text-ink-muted truncate">{recipe.title}</span>
        </div>
      </nav>

      <article className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        {/* Hero */}
        {recipe.image_url && (
          <div className="relative w-full aspect-[16/7] rounded-2xl overflow-hidden mb-8 shadow-md">
            <Image
              src={recipe.image_url}
              alt={recipe.title}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 896px) 100vw, 896px"
            />
          </div>
        )}

        {/* Title + meta */}
        <header className="mb-8">
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-ink leading-tight mb-3">
            {recipe.title}
          </h1>

          {/* Tags & categories */}
          {((recipe.tags?.length ?? 0) > 0 || (recipe.categories?.length ?? 0) > 0) && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {recipe.categories?.map((c) => (
                <span key={c.id} className="tag-pill capitalize">{c.name}</span>
              ))}
              {recipe.tags?.map((t) => (
                <span key={t.id} className="tag-pill">{t.name}</span>
              ))}
            </div>
          )}

          {recipe.description && (
            <p className="text-lg text-ink-dim leading-relaxed">{recipe.description}</p>
          )}

          <div className="flex items-center gap-4 mt-4 text-sm text-ink-muted flex-wrap">
            <time dateTime={recipe.created_at}>{formatDate(recipe.created_at)}</time>
            {recipe.servings && (
              <>
                <span>·</span>
                <span>{recipe.servings} servings</span>
              </>
            )}
            {recipe.source_url && (
              <>
                <span>·</span>
                <a
                  href={recipe.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-terracotta transition-colors underline underline-offset-2"
                >
                  Original source ↗
                </a>
              </>
            )}
            {!shared && (
              <>
                <span>·</span>
                <ShareButton slug={recipe.slug} initialToken={recipe.share_token} />
              </>
            )}
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Ingredients */}
          <section className="md:col-span-1">
            <h2 className="font-serif text-2xl font-semibold text-ink mb-4 pb-2 border-b border-border">
              Ingredients
            </h2>
            {ingredients.length > 0 ? (
              <ul className="space-y-2">
                {ingredients.map((ingredient, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-ink-dim">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-terracotta flex-shrink-0" />
                    {ingredient}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-ink-muted italic">No ingredients listed</p>
            )}
          </section>

          {/* Steps */}
          <section className="md:col-span-2">
            <h2 className="font-serif text-2xl font-semibold text-ink mb-4 pb-2 border-b border-border">
              Instructions
            </h2>
            {steps.length > 0 ? (
              <ol className="space-y-5">
                {steps.map((step, i) => (
                  <li key={i} className="flex gap-4">
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-terracotta/10 text-terracotta text-xs font-bold flex items-center justify-center mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-ink-dim leading-relaxed text-sm">{step}</p>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-ink-muted italic">No instructions listed</p>
            )}
          </section>
        </div>

        {/* Browse more banner */}
        <div className="mt-14">
          <BrowseBanner />
        </div>

        {/* Admin edit link */}
        {!shared && (
          <div className="mt-8 text-center no-print">
            <Link
              href={`/admin/edit/${recipe.slug}`}
              className="text-xs text-ink-muted hover:text-terracotta transition-colors"
            >
              Edit this recipe
            </Link>
          </div>
        )}
      </article>
    </div>
  )
}
