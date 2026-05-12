import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import RecipeDetail from '@/components/recipe/RecipeDetail'
import type { Recipe, Tag, Category } from '@/types'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const { slug } = await params
    const db = await createClient()
    const { data } = await db
      .from('recipes')
      .select('title, description')
      .eq('slug', slug)
      .single()

    if (!data) return { title: 'Recipe not found' }

    return {
      title: data.title,
      description: data.description ?? undefined,
    }
  } catch {
    return { title: 'Recipe Catalog' }
  }
}

export default async function RecipePage({ params }: PageProps) {
  const { slug } = await params

  let recipe: Recipe | null = null

  try {
    const db = await createClient()

    const { data, error } = await db
      .from('recipes')
      .select(`
        *,
        recipe_tags(tags(id, name)),
        recipe_categories(categories(id, name, type))
      `)
      .eq('slug', slug)
      .single()

    if (error || !data) notFound()

    const raw = data as Record<string, unknown>
    recipe = {
      ...(raw as unknown as Recipe),
      ingredients: Array.isArray(raw.ingredients) ? (raw.ingredients as string[]) : [],
      steps: Array.isArray(raw.steps) ? (raw.steps as string[]) : [],
      tags: ((raw.recipe_tags as { tags: Tag }[]) ?? []).map((rt) => rt.tags).filter(Boolean),
      categories: ((raw.recipe_categories as { categories: Category }[]) ?? [])
        .map((rc) => rc.categories)
        .filter(Boolean),
    }
  } catch (err: unknown) {
    // Re-throw Next.js internal errors (notFound, redirect) so they work correctly
    if (
      err !== null &&
      typeof err === 'object' &&
      'digest' in err &&
      typeof (err as { digest: unknown }).digest === 'string' &&
      (err as { digest: string }).digest.startsWith('NEXT_')
    ) {
      throw err
    }
    notFound()
  }

  if (!recipe) notFound()

  return <RecipeDetail recipe={recipe} />
}
