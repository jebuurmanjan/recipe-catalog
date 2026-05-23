import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { requireUser } from '@/lib/auth'

export async function GET() {
  const { user, unauthorized } = await requireUser()
  if (unauthorized) return unauthorized

  const db = createServiceClient()
  const { data, error } = await db
    .from('tags')
    .select('*')
    .eq('user_id', user.id)
    .order('name')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ tags: data })
}

export async function POST(req: NextRequest) {
  const { user, unauthorized } = await requireUser()
  if (unauthorized) return unauthorized

  const { name } = await req.json()
  if (!name?.trim()) return NextResponse.json({ error: 'Tag name is required' }, { status: 400 })

  const db = createServiceClient()
  const { data, error } = await db
    .from('tags')
    .upsert({ name: name.trim().toLowerCase(), user_id: user.id }, { onConflict: 'user_id,name' })
    .select('*')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ tag: data })
}
