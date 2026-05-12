import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { getSession } from '@/lib/session'

export async function GET() {
  const db = createServiceClient()
  const { data, error } = await db
    .from('tags')
    .select('*')
    .order('name')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ tags: data })
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session.authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { name } = await req.json()
  if (!name?.trim()) {
    return NextResponse.json({ error: 'Tag name is required' }, { status: 400 })
  }

  const db = createServiceClient()
  const { data, error } = await db
    .from('tags')
    .upsert({ name: name.trim().toLowerCase() }, { onConflict: 'name' })
    .select('*')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ tag: data })
}
