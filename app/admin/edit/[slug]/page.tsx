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

  let recipeData: Record<string, unknown> | null = null
  let tags: { id: string; name: string }[] = []
  let categories: { id: string; name: string; type: string }[] = []

  try {
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
    recipeData = recipeResult.data
    tags = tagsResult.data ?? []
    categories = categoriesResult.data ?? []
  } catch {
    notFound()
  }

  if (!recipeData) notFound()

  const recipe: Recipe = {
    ...recipeData,
    tags: ((recipeData.recipe_tags as { tags: unknown }[]) ?? [])
      .map((rt) => rt.tags)
      .filter(Boolean),
    categories: ((recipeData.recipe_categories as { categories: unknown }[]) ?? [])
      .map((rc) => rc.categories)
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
