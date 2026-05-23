import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { requireUser } from '@/lib/auth'

export async function POST(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { user, unauthorized } = await requireUser()
  if (unauthorized) return unauthorized

  const { slug } = await params
  const db = createServiceClient()

  // Get current share_token (if already generated)
  const { data: existing } = await db
    .from('recipes').select('share_token').eq('slug', slug).eq('user_id', user.id).single()

  if (!existing) return NextResponse.json({ error: 'Recipe not found' }, { status: 404 })
  if (existing.share_token) return NextResponse.json({ share_token: existing.share_token })

  // Generate a new token
  const { data, error } = await db
    .from('recipes')
    .update({ share_token: crypto.randomUUID() })
    .eq('slug', slug)
    .eq('user_id', user.id)
    .select('share_token')
    .single()

  if (error || !data) return NextResponse.json({ error: 'Failed to generate share link' }, { status: 500 })
  return NextResponse.json({ share_token: data.share_token })
}
