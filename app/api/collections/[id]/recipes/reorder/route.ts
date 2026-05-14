import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

// PATCH body: { order: string[] }  — array of recipe_ids in new order
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { order } = await req.json() as { order: string[] }

  if (!Array.isArray(order)) {
    return NextResponse.json({ error: 'order must be an array of recipe IDs' }, { status: 400 })
  }

  const db = createServiceClient()

  // Update positions in parallel
  await Promise.all(
    order.map((recipe_id, position) =>
      db
        .from('collection_recipes')
        .update({ position })
        .eq('collection_id', id)
        .eq('recipe_id', recipe_id)
    )
  )

  return NextResponse.json({ ok: true })
}
