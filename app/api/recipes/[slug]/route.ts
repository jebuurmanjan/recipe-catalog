import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { requireUser } from '@/lib/auth'
import { slugify } from '@/lib/utils'

type Params = { params: Promise<{ slug: string }> }

export async function GET(req: NextRequest, { params }: Params) {
  const { user, unauthorized } = await requireUser()
  if (unauthorized) return unauthorized

  const { slug } = await params
  const db = createServiceClient()

  const { data, error } = await db
    .from('recipes')
    .select(`*, recipe_tags(tags(id, name)), recipe_categories(categories(id, name, type))`)
    .eq('slug', slug)
    .eq('user_id', user.id)
    .single()

  if (error || !data) return NextResponse.json({ error: 'Recipe not found' }, { status: 404 })

  const recipe = {
    ...data,
    tags: (data.recipe_tags ?? []).map((rt: { tags: unknown }) => rt.tags).filter(Boolean),
    categories: (data.recipe_categories ?? []).map((rc: { categories: unknown }) => rc.categories).filter(Boolean),
  }

  return NextResponse.json({ recipe })
}

export async function PUT(req: NextRequest, { params }: Params) {
  const { user, unauthorized } = await requireUser()
  if (unauthorized) return unauthorized

  const { slug } = await params
  const body = await req.json()
  const { title, description, ingredients, steps, image_url, source_url, tagIds, categoryIds, is_concept } = body

  const db = createServiceClient()

  const { data: existing, error: findError } = await db
    .from('recipes').select('id').eq('slug', slug).eq('user_id', user.id).single()

  if (findError || !existing) return NextResponse.json({ error: 'Recipe not found' }, { status: 404 })

  const newSlug = title ? slugify(title) : slug

  const { data: recipe, error } = await db
    .from('recipes')
    .update({ title, slug: newSlug, description, ingredients, steps, image_url, source_url, is_concept: is_concept ?? false })
    .eq('id', existing.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await db.from('recipe_tags').delete().eq('recipe_id', existing.id)
  if (tagIds?.length > 0) {
    await db.from('recipe_tags').insert(tagIds.map((tag_id: string) => ({ recipe_id: existing.id, tag_id })))
  }

  await db.from('recipe_categories').delete().eq('recipe_id', existing.id)
  if (categoryIds?.length > 0) {
    await db.from('recipe_categories').insert(categoryIds.map((category_id: string) => ({ recipe_id: existing.id, category_id })))
  }

  return NextResponse.json({ recipe })
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { user, unauthorized } = await requireUser()
  if (unauthorized) return unauthorized

  const { slug } = await params
  const db = createServiceClient()

  const { error } = await db.from('recipes').delete().eq('slug', slug).eq('user_id', user.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
