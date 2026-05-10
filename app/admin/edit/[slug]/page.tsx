import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import RecipeForm from '@/components/admin/RecipeForm'
import type { Recipe } from '@/types'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  return { title: `Edit: ${slug}` }
}

export default async function EditPage({ params }: PageProps) {
  const { slug } = await params
  const db = await createClient()

  const [recipeResult, tagsResult, categoriesResult] = await Promise.all([
    db
      .from('recipes')
      .select(`*, recipe_tags(tags(id, name)), recipe_categories(categories(id, name, type))`)
      .eq('slug', slug)
      .single(),
    db.from('tags').select('*').order('name'),
    db.from('categories').select('*').order('type').order('name'),
  ])

  if (recipeResult.error || !recipeResult.data) notFound()

  const data = recipeResult.data
  const recipe: Recipe = {
    ...data,
    tags: (data.recipe_tags ?? [])
      .map((rt: { tags: unknown }) => rt.tags)
      .filter(Boolean),
    categories: (data.recipe_categories ?? [])
      .map((rc: { categories: unknown }) => rc.categories)
      .filter(Boolean),
  }

  return (
    <RecipeForm
      mode="edit"
      recipe={recipe}
      tags={tagsResult.data ?? []}
      categories={categoriesResult.data ?? []}
    />
  )
}
