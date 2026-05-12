import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { getSession } from '@/lib/session'
import { slugify } from '@/lib/utils'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const query = searchParams.get('q') ?? ''
  const tagIds = searchParams.getAll('tag').filter(Boolean)
  const catIds = searchParams.getAll('category').filter(Boolean)
  const showConcepts = searchParams.get('concepts') === 'true'

  const db = createServiceClient()

  // Full-text search via RPC when a query is present
  if (query.trim()) {
    const { data, error } = await db.rpc('search_recipes', { query: query.trim() })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ recipes: data ?? [] })
  }

  // Build base query
  let recipeIds: string[] | null = null

  // Tag filter — get matching recipe IDs
  if (tagIds.length > 0) {
    const { data: tagMatches, error } = await db
      .from('recipe_tags')
      .select('recipe_id')
      .in('tag_id', tagIds)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    recipeIds = [...new Set((tagMatches ?? []).map((r) => r.recipe_id))]
  }

  // Category filter — intersect with tag results
  if (catIds.length > 0) {
    const { data: catMatches, error } = await db
      .from('recipe_categories')
      .select('recipe_id')
      .in('category_id', catIds)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    const catSet = new Set((catMatches ?? []).map((r) => r.recipe_id))
    if (recipeIds !== null) {
      recipeIds = recipeIds.filter((id) => catSet.has(id))
    } else {
      recipeIds = [...catSet]
    }
  }

  let qb = db
    .from('recipes')
    .select('id, title, slug, description, image_url, is_concept, created_at')
    .order('created_at', { ascending: false })

  if (!showConcepts) {
    qb = qb.eq('is_concept', false)
  }

  if (recipeIds !== null) {
    if (recipeIds.length === 0) return NextResponse.json({ recipes: [] })
    qb = qb.in('id', recipeIds)
  }

  const { data, error } = await qb
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ recipes: data ?? [] })
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session.authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { title, description, ingredients, steps, image_url, source_url, tagIds, categoryIds, is_concept } = body

  if (!title?.trim()) {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 })
  }

  const db = createServiceClient()
  const baseSlug = slugify(title)

  // Insert recipe — handle slug collision
  let slug = baseSlug
  let { data: recipe, error } = await db
    .from('recipes')
    .insert({ title, slug, description, ingredients, steps, image_url, source_url, is_concept: is_concept ?? false })
    .select()
    .single()

  if (error?.code === '23505') {
    slug = `${baseSlug}-${Date.now()}`
    ;({ data: recipe, error } = await db
      .from('recipes')
      .insert({ title, slug, description, ingredients, steps, image_url, source_url, is_concept: is_concept ?? false })
      .select()
      .single())
  }

  if (error || !recipe) {
    return NextResponse.json({ error: error?.message ?? 'Insert failed' }, { status: 500 })
  }

  // Associate tags
  if (tagIds?.length > 0) {
    await db
      .from('recipe_tags')
      .insert(tagIds.map((tag_id: string) => ({ recipe_id: recipe.id, tag_id })))
  }

  // Associate categories
  if (categoryIds?.length > 0) {
    await db
      .from('recipe_categories')
      .insert(categoryIds.map((category_id: string) => ({ recipe_id: recipe.id, category_id })))
  }

  return NextResponse.json({ recipe }, { status: 201 })
}
