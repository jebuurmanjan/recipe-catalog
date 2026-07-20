import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase/service'

export const maxDuration = 30

const IG_APP_ID = process.env.INSTAGRAM_X_IG_APP_ID ?? '936619743392459'
const IG_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'

async function getStoredCookie(userId: string): Promise<string | null> {
  const db = createServiceClient()
  const { data } = await db
    .from('instagram_settings')
    .select('session_id, ds_user_id')
    .eq('user_id', userId)
    .maybeSingle()

  if (!data) return null
  return `sessionid=${data.session_id}; ds_user_id=${data.ds_user_id}`
}

export async function GET(req: NextRequest) {
  const { user, unauthorized } = await requireUser()
  if (unauthorized) return unauthorized

  const cookie = await getStoredCookie(user.id)
  if (!cookie) {
    return NextResponse.json({ error: 'Instagram not connected' }, { status: 401 })
  }

  let res: Response
  try {
    res = await fetch(
      'https://www.instagram.com/api/v1/collections/list/?collection_types[]=ALL&include_public_only=0',
      {
        headers: {
          Cookie: cookie,
          'User-Agent': IG_UA,
          'X-IG-App-ID': IG_APP_ID,
          'X-Requested-With': 'XMLHttpRequest',
        },
        signal: AbortSignal.timeout(15_000),
      }
    )
  } catch (err) {
    console.error('[instagram/collections] fetch error:', err)
    return NextResponse.json({ error: 'Could not reach Instagram' }, { status: 502 })
  }

  console.log('[instagram/collections] IG status:', res.status)

  if (res.status === 401 || res.status === 403) {
    return NextResponse.json(
      { error: 'Instagram session expired. Please reconnect.' },
      { status: 401 }
    )
  }

  if (!res.ok) {
    const errBody = await res.text()
    console.error('[instagram/collections] IG error body:', errBody.slice(0, 300))
    return NextResponse.json(
      { error: `Instagram returned ${res.status}` },
      { status: 502 }
    )
  }

  // Instagram serves an HTML login/challenge page (status 200) when the
  // session cookie is rejected — guard against parsing that as JSON.
  const rawText = await res.text()
  const contentType = res.headers.get('content-type') ?? ''
  if (contentType.includes('text/html') || rawText.trimStart().startsWith('<')) {
    console.error(
      '[instagram/collections] got HTML instead of JSON — session likely invalid. Body head:',
      rawText.slice(0, 200)
    )
    return NextResponse.json(
      {
        error:
          'Instagram rejected the session cookie. Please reconnect with a fresh sessionid from your browser.',
      },
      { status: 401 }
    )
  }

  let json: {
    items?: { collection_id: string; collection_name: string; media_count?: number; cover_media?: { image_versions2?: { candidates?: { url: string }[] } } }[]
  }
  try {
    json = JSON.parse(rawText)
  } catch {
    console.error('[instagram/collections] JSON parse failed. Body head:', rawText.slice(0, 200))
    return NextResponse.json(
      { error: 'Unexpected response from Instagram. Please reconnect.' },
      { status: 502 }
    )
  }

  const collections = (json.items ?? []).map((c) => ({
    id: c.collection_id,
    name: c.collection_name,
    count: c.media_count ?? 0,
    coverUrl: c.cover_media?.image_versions2?.candidates?.[0]?.url ?? null,
  }))

  return NextResponse.json({ collections })
}
