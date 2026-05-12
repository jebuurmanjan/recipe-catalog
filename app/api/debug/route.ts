import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

// Temporary diagnostic route — remove after debugging
export async function GET() {
  const results: Record<string, unknown> = {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'MISSING',
    hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
  }

  // Test anon client (what the recipe detail page uses)
  try {
    const db = await createClient()
    const { data, error } = await db.from('recipes').select('id, slug').limit(5)
    results.anonRead = { ok: !error, count: data?.length ?? 0, error: error?.message ?? null }
  } catch (e) {
    results.anonRead = { ok: false, error: String(e) }
  }

  // Test service client (what the admin save uses)
  try {
    const db = createServiceClient()
    const { data, error } = await db.from('recipes').select('id, slug').limit(5)
    results.serviceRead = {
      ok: !error,
      count: data?.length ?? 0,
      slugs: data?.map((r) => r.slug) ?? [],
      error: error?.message ?? null,
    }
  } catch (e) {
    results.serviceRead = { ok: false, error: String(e) }
  }

  return NextResponse.json(results)
}
