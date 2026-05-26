import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { requireUser } from '@/lib/auth'
import { slugify } from '@/lib/utils'

export async function GET(req: NextRequest) {
  const { user, unauthorized } = await requireUser()
  if (unauthorized) return unauthorized

  const { searchParams } = req.nextUrl
  const query = searchParams.get('q') ?? ''
  const tagIds = searchParams.getAll('tag').filter(Boolean)
  const catIds = searchParams.getAll('category').filter(Boolean)
  const showConcepts = searchParams.get('concepts') === 'true'

  const db = createServiceClient()

  if (query.trim()) {
    const { data, error } = await db.rpc('search_recipes', { query: query.trim(), p_user_id: user.id })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ recipes: data ?? [] })
  }

  let recipeIds: string[] | null = null

  if (tagIds.length > 0) {
    const { data: tagMatches, error } = await db
      .from('recipe_tags').select('recipe_id').in('tag_id', tagIds)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    recipeIds = [...new Set((tagMatches ?? []).map((r) => r.recipe_id))]
  }

  if (catIds.length > 0) {
    const { data: catMatches, error } = await db
      .from('recipe_categories').select('recipe_id').in('category_id', catIds)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    const catSet = new Set((catMatches ?? []).map((r) => r.recipe_id))
    recipeIds = recipeIds !== null ? recipeIds.filter((id) => catSet.has(id)) : [...catSet]
  }

  let qb = db
    .from('recipes')
    .select('id, title, slug, description, image_url, is_concept, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (!showConcepts) qb = qb.eq('is_concept', false)

  if (recipeIds !== null) {
    if (recipeIds.length === 0) return NextResponse.json({ recipes: [] })
    qb = qb.in('id', recipeIds)
  }

  const { data, error } = await qb
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ recipes: data ?? [] })
}

export async function POST(req: NextRequest) {
  const { user, unauthorized } = await requireUser()
  if (unauthorized) return unauthorized

  const body = await req.json()
  const { title, description, ingredients, steps, image_url, source_url, tagIds, categoryIds, is_concept, servings } = body

  if (!title?.trim()) return NextResponse.json({ error: 'Title is required' }, { status: 400 })

  const db = createServiceClient()
  const baseSlug = slugify(title)
  let slug = baseSlug

  let { data: recipe, error } = await db
    .from('recipes')
    .insert({ title, slug, description, ingredients, steps, image_url, source_url, is_concept: is_concept ?? false, servings: servings ?? null, user_id: user.id })
    .select()
    .single()

  if (error?.code === '23505') {
    slug = `${baseSlug}-${Date.now()}`
    ;({ data: recipe, error } = await db
      .from('recipes')
      .insert({ title, slug, description, ingredients, steps, image_url, source_url, is_concept: is_concept ?? false, servings: servings ?? null, user_id: user.id })
      .select()
      .single())
  }

  if (error || !recipe) return NextResponse.json({ error: error?.message ?? 'Insert failed' }, { status: 500 })

  if (tagIds?.length > 0) {
    await db.from('recipe_tags').insert(tagIds.map((tag_id: string) => ({ recipe_id: recipe.id, tag_id })))
  }
  if (categoryIds?.length > 0) {
    await db.from('recipe_categories').insert(categoryIds.map((category_id: string) => ({ recipe_id: recipe.id, category_id })))
  }

  return NextResponse.json({ recipe }, { status: 201 })
}
