import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { requireUser } from '@/lib/auth'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, unauthorized } = await requireUser()
  if (unauthorized) return unauthorized

  const { id } = await params
  const { order } = await req.json() as { order: string[] }
  if (!Array.isArray(order)) return NextResponse.json({ error: 'order must be an array' }, { status: 400 })

  const db = createServiceClient()

  // Verify ownership
  const { data: col } = await db.from('collections').select('id').eq('id', id).eq('user_id', user.id).single()
  if (!col) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await Promise.all(
    order.map((recipe_id, position) =>
      db.from('collection_recipes').update({ position }).eq('collection_id', id).eq('recipe_id', recipe_id)
    )
  )

  return NextResponse.json({ ok: true })
}
