import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

export async function GET() {
  const db = createServiceClient()

  const { data, error } = await db
    .from('collections')
    .select('id, name, created_at, collection_recipes(count)')
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const collections = (data ?? []).map((c: { id: string; name: string; created_at: string; collection_recipes: { count: number }[] }) => ({
    id: c.id,
    name: c.name,
    created_at: c.created_at,
    recipe_count: c.collection_recipes?.[0]?.count ?? 0,
  }))

  return NextResponse.json({ collections })
}

export async function POST(req: NextRequest) {
  const { name } = await req.json()
  if (!name?.trim()) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  }

  const db = createServiceClient()
  const { data, error } = await db
    .from('collections')
    .insert({ name: name.trim() })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ collection: { ...data, recipe_count: 0 } }, { status: 201 })
}
