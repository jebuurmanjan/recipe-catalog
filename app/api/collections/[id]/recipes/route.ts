import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { requireUser } from '@/lib/auth'

async function verifyCollectionOwner(db: ReturnType<typeof import('@/lib/supabase/service').createServiceClient>, collectionId: string, userId: string) {
  const { data } = await db.from('collections').select('id').eq('id', collectionId).eq('user_id', userId).single()
  return !!data
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, unauthorized } = await requireUser()
  if (unauthorized) return unauthorized

  const { id } = await params
  const db = createServiceClient()

  if (!(await verifyCollectionOwner(db, id, user.id))) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const { data, error } = await db
    .from('collection_recipes')
    .select('position, recipes(id, title, slug, description, image_url, is_concept, created_at)')
    .eq('collection_id', id)
    .order('position', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const recipes = (data ?? []).map((row: { position: number; recipes: unknown }) => row.recipes).filter(Boolean)
  return NextResponse.json({ recipes })
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, unauthorized } = await requireUser()
  if (unauthorized) return unauthorized

  const { id } = await params
  const { recipe_id } = await req.json()
  if (!recipe_id) return NextResponse.json({ error: 'recipe_id required' }, { status: 400 })

  const db = createServiceClient()

  if (!(await verifyCollectionOwner(db, id, user.id))) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const { data: maxRow } = await db
    .from('collection_recipes').select('position').eq('collection_id', id)
    .order('position', { ascending: false }).limit(1).single()

  const position = (maxRow?.position ?? -1) + 1

  const { error } = await db.from('collection_recipes').insert({ collection_id: id, recipe_id, position })
  if (error) {
    if (error.code === '23505') return NextResponse.json({ ok: true })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ ok: true }, { status: 201 })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, unauthorized } = await requireUser()
  if (unauthorized) return unauthorized

  const { id } = await params
  const { recipe_id } = await req.json()
  if (!recipe_id) return NextResponse.json({ error: 'recipe_id required' }, { status: 400 })

  const db = createServiceClient()

  if (!(await verifyCollectionOwner(db, id, user.id))) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const { error } = await db.from('collection_recipes').delete().eq('collection_id', id).eq('recipe_id', recipe_id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
