import { Suspense } from 'react'
import { createServiceClient } from '@/lib/supabase/service'
import CatalogPage from '@/components/catalog/CatalogPage'

interface PageProps {
  searchParams: Promise<{
    q?: string
    tag?: string | string[]
    category?: string | string[]
  }>
}

async function CatalogData({ searchParams }: PageProps) {
  const params = await searchParams
  const q = params.q ?? ''
  const tagIds = [params.tag ?? []].flat().filter(Boolean)
  const catIds = [params.category ?? []].flat().filter(Boolean)

  try {
    const db = createServiceClient()

    const [categoriesResult, tagsResult] = await Promise.all([
      db.from('categories').select('*').order('type').order('name'),
      db.from('tags').select('*').order('name'),
    ])

    // Server-side pre-filter for initial load
    let recipesResult
    if (q) {
      recipesResult = await db.rpc('search_recipes', { query: q })
    } else {
      let qb = db
        .from('recipes')
        .select('id, title, slug, description, image_url, created_at')
        .order('created_at', { ascending: false })

      let recipeIds: string[] | null = null
      if (tagIds.length > 0) {
        const { data } = await db.from('recipe_tags').select('recipe_id').in('tag_id', tagIds)
        recipeIds = [...new Set((data ?? []).map((r) => r.recipe_id))]
      }
      if (catIds.length > 0) {
        const { data } = await db.from('recipe_categories').select('recipe_id').in('category_id', catIds)
        const catSet = new Set((data ?? []).map((r) => r.recipe_id))
        recipeIds = recipeIds !== null
          ? recipeIds.filter((id) => catSet.has(id))
          : [...catSet]
      }
      if (recipeIds !== null) {
        if (recipeIds.length === 0) {
          recipesResult = { data: [] }
        } else {
          qb = qb.in('id', recipeIds)
          recipesResult = await qb
        }
      } else {
        recipesResult = await qb
      }
    }

    return (
      <CatalogPage
        initialRecipes={recipesResult.data ?? []}
        tags={tagsResult.data ?? []}
        categories={categoriesResult.data ?? []}
        initialSearch={q}
        initialTags={tagIds}
        initialCategories={catIds}
      />
    )
  } catch {
    // Supabase not configured — show the catalog shell with empty state
    return (
      <CatalogPage
        initialRecipes={[]}
        tags={[]}
        categories={[]}
        initialSearch={q}
        initialTags={tagIds}
        initialCategories={catIds}
      />
    )
  }
}

export default function HomePage(props: PageProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-cream flex items-center justify-center">
          <p className="text-ink-muted font-serif text-lg">Loading catalog…</p>
        </div>
      }
    >
      <CatalogData {...props} />
    </Suspense>
  )
}
