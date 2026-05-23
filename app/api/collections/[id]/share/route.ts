import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { requireUser } from '@/lib/auth'

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, unauthorized } = await requireUser()
  if (unauthorized) return unauthorized

  const { id } = await params
  const db = createServiceClient()

  // Get current token
  const { data: existing } = await db
    .from('collections').select('share_token').eq('id', id).eq('user_id', user.id).single()

  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  if (existing.share_token) {
    return NextResponse.json({ share_token: existing.share_token })
  }

  const { data, error } = await db
    .from('collections')
    .update({ share_token: crypto.randomUUID() })
    .eq('id', id)
    .eq('user_id', user.id)
    .select('share_token')
    .single()

  if (error || !data) return NextResponse.json({ error: 'Failed to generate share link' }, { status: 500 })
  return NextResponse.json({ share_token: data.share_token })
}
