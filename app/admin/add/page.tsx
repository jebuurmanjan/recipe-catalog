import { createClient } from '@/lib/supabase/server'
import RecipeForm from '@/components/admin/RecipeForm'

export const metadata = { title: 'Add recipe' }

export default async function AddPage() {
  const db = await createClient()

  const [tagsResult, categoriesResult] = await Promise.all([
    db.from('tags').select('*').order('name'),
    db.from('categories').select('*').order('type').order('name'),
  ])

  return (
    <RecipeForm
      mode="add"
      tags={tagsResult.data ?? []}
      categories={categoriesResult.data ?? []}
    />
  )
}
