import { createServiceClient } from '@/lib/supabase/service'
import RecipeForm from '@/components/admin/RecipeForm'
import type { Tag, Category } from '@/types'

export const metadata = { title: 'Add recipe' }

export default async function AddPage() {
  let tags: Tag[] = []
  let categories: Category[] = []

  try {
    const db = createServiceClient()
    const [tagsResult, categoriesResult] = await Promise.all([
      db.from('tags').select('*').order('name'),
      db.from('categories').select('*').order('type').order('name'),
    ])
    tags = tagsResult.data ?? []
    categories = categoriesResult.data ?? []
  } catch {
    // Supabase unavailable — form still renders, tags/categories will be empty
  }

  return (
    <RecipeForm
      mode="add"
      tags={tags}
      categories={categories}
    />
  )
}
