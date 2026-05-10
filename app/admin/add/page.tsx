import { createClient } from '@/lib/supabase/server'
import RecipeForm from '@/components/admin/RecipeForm'

export const metadata = { title: 'Add recipe' }

export default async function AddPage() {
  let tags: { id: string; name: string }[] = []
  let categories: { id: string; name: string; type: string }[] = []

  try {
    const db = await createClient()
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
