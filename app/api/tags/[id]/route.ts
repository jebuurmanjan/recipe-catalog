import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { requireUser } from '@/lib/auth'

type Params = { params: Promise<{ id: string }> }

export async function PUT(req: NextRequest, { params }: Params) {
  const { user, unauthorized } = await requireUser()
  if (unauthorized) return unauthorized

  const { id } = await params
  const { name } = await req.json()
  if (!name?.trim()) return NextResponse.json({ error: 'Name is required' }, { status: 400 })

  const db = createServiceClient()
  const { data, error } = await db
    .from('tags')
    .update({ name: name.trim().toLowerCase() })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ tag: data })
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { user, unauthorized } = await requireUser()
  if (unauthorized) return unauthorized

  const { id } = await params
  const db = createServiceClient()
  const { error } = await db.from('tags').delete().eq('id', id).eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
