import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

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
