import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/service'
import RecipeDetail from '@/components/recipe/RecipeDetail'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ token: string }>
}

async function getSharedRecipe(token: string) {
  const db = createServiceClient()
  const { data, error } = await db
    .from('recipes')
    .select(`*, recipe_tags(tags(id, name)), recipe_categories(categories(id, name, type))`)
    .eq('share_token', token)
    .single()

  if (error || !data) return null

  return {
    ...data,
    tags: (data.recipe_tags ?? []).map((rt: { tags: unknown }) => rt.tags).filter(Boolean),
    categories: (data.recipe_categories ?? []).map((rc: { categories: unknown }) => rc.categories).filter(Boolean),
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token } = await params
  const recipe = await getSharedRecipe(token)
  if (!recipe) return { title: 'Recipe not found' }
  return {
    title: recipe.title,
    description: recipe.description ?? undefined,
  }
}

export default async function SharedRecipePage({ params }: Props) {
  const { token } = await params
  const recipe = await getSharedRecipe(token)
  if (!recipe) notFound()

  return <RecipeDetail recipe={recipe} shared />
}
