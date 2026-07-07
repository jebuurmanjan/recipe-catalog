import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

export const runtime = 'nodejs'

export async function GET() {
  const db = createServiceClient()
  const { error } = await db.from('recipes').select('id').limit(1)
  if (error) {
    console.error('[ping] Supabase error:', error.message)
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }
  return NextResponse.json({ ok: true, ts: new Date().toISOString() })
}
