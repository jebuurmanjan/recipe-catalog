import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import RecipeDetail from '@/components/recipe/RecipeDetail'
import type { Recipe } from '@/types'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
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
}

export default async function RecipePage({ params }: PageProps) {
  const { slug } = await params
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

  // Flatten join table results
  const recipe: Recipe = {
    ...data,
    tags: (data.recipe_tags ?? [])
      .map((rt: { tags: unknown }) => rt.tags)
      .filter(Boolean),
    categories: (data.recipe_categories ?? [])
      .map((rc: { categories: unknown }) => rc.categories)
      .filter(Boolean),
  }

  return <RecipeDetail recipe={recipe} />
}
