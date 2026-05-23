import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/service'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import type { RecipeCard } from '@/types'

interface Props {
  params: Promise<{ token: string }>
}

async function getSharedCollection(token: string) {
  const db = createServiceClient()

  const { data: col, error: colError } = await db
    .from('collections')
    .select('id, name, created_at')
    .eq('share_token', token)
    .single()

  if (colError || !col) return null

  const { data: rows } = await db
    .from('collection_recipes')
    .select('position, recipes(id, title, slug, description, image_url, is_concept, created_at)')
    .eq('collection_id', col.id)
    .order('position', { ascending: true })

  const recipes = (rows ?? []).map((r: { position: number; recipes: unknown }) => r.recipes).filter(Boolean) as RecipeCard[]

  return { ...col, recipes }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token } = await params
  const col = await getSharedCollection(token)
  if (!col) return { title: 'Collection not found' }
  return { title: col.name, description: `${col.recipes.length} recipe${col.recipes.length === 1 ? '' : 's'}` }
}

export default async function SharedCollectionPage({ params }: Props) {
  const { token } = await params
  const col = await getSharedCollection(token)
  if (!col) notFound()

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-base)' }}>
      <nav className="border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3 text-sm">
          <span className="text-ink-muted font-medium">Recipe Catalog</span>
          <span className="text-border">·</span>
          <span className="text-ink-muted truncate">{col.name}</span>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="font-serif text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>{col.name}</h1>
        <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>
          {col.recipes.length} {col.recipes.length === 1 ? 'recipe' : 'recipes'}
        </p>

        <div className="flex flex-col gap-3">
          {col.recipes.map((recipe) => (
            <Link
              key={recipe.id}
              href={`/recipe/${recipe.slug}`}
              className="group flex items-center gap-3 px-4 py-3 rounded-xl border transition-all hover:border-terracotta/30 hover:shadow-sm"
              style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}
            >
              <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0" style={{ backgroundColor: 'var(--bg-surface-2)' }}>
                {recipe.image_url ? (
                  <Image src={recipe.image_url} alt="" fill className="object-cover" sizes="48px" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden style={{ color: 'var(--border)' }}>
                      <path d="M3 20l6-8 5 6 3-4 5 6H3z" fill="currentColor" opacity="0.5" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-serif font-semibold truncate group-hover:text-terracotta transition-colors" style={{ color: 'var(--text-primary)' }}>
                  {recipe.title}
                </p>
                {recipe.description && (
                  <p className="text-sm truncate mt-0.5" style={{ color: 'var(--text-muted)' }}>{recipe.description}</p>
                )}
              </div>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="flex-shrink-0 group-hover:text-terracotta transition-colors" style={{ color: 'var(--text-muted)' }} aria-hidden>
                <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
