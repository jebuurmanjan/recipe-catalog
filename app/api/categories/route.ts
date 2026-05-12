import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
// import { getSession } from '@/lib/session' // Uncomment to require admin auth

export async function GET() {
  const db = createServiceClient()
  const { data, error } = await db
    .from('categories')
    .select('*')
    .order('type')
    .order('name')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ categories: data })
}

export async function POST(req: NextRequest) {
  // const session = await getSession()
  // if (!session.authenticated) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name, type } = await req.json()
  if (!name?.trim()) return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  const validTypes = ['cuisine', 'diet', 'occasion', 'effort']
  if (!validTypes.includes(type)) return NextResponse.json({ error: 'Invalid type' }, { status: 400 })

  const db = createServiceClient()
  const { data, error } = await db
    .from('categories')
    .insert({ name: name.trim(), type })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ category: data }, { status: 201 })
}
