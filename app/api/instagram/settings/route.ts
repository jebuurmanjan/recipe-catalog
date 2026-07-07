import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase/service'

export async function GET(req: NextRequest) {
  const { user, unauthorized } = await requireUser()
  if (unauthorized) return unauthorized

  const db = createServiceClient()
  const { data } = await db
    .from('instagram_settings')
    .select('id, created_at')
    .eq('user_id', user.id)
    .maybeSingle()

  return NextResponse.json({ connected: !!data })
}

export async function POST(req: NextRequest) {
  const { user, unauthorized } = await requireUser()
  if (unauthorized) return unauthorized

  const { sessionId, dsUserId } = (await req.json()) as {
    sessionId?: string
    dsUserId?: string
  }

  if (!sessionId?.trim() || !dsUserId?.trim()) {
    return NextResponse.json(
      { error: 'Both sessionid and ds_user_id are required' },
      { status: 400 }
    )
  }

  const db = createServiceClient()
  const { error } = await db.from('instagram_settings').upsert(
    {
      user_id: user.id,
      session_id: sessionId.trim(),
      ds_user_id: dsUserId.trim(),
    },
    { onConflict: 'user_id' }
  )

  if (error) {
    console.error('[instagram/settings] upsert error:', error)
    return NextResponse.json({ error: 'Failed to save credentials' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  const { user, unauthorized } = await requireUser()
  if (unauthorized) return unauthorized

  const db = createServiceClient()
  await db.from('instagram_settings').delete().eq('user_id', user.id)

  return NextResponse.json({ ok: true })
}
