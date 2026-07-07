import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase/service'

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

interface IgMediaItem {
  code?: string
  caption?: { text?: string }
  image_versions2?: { candidates?: { url: string; width: number; height: number }[] }
  carousel_media?: { image_versions2?: { candidates?: { url: string }[] } }[]
  thumbnail_url?: string
  product_type?: string
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, unauthorized } = await requireUser()
  if (unauthorized) return unauthorized

  const { id } = await params

  const cookie = await getStoredCookie(user.id)
  if (!cookie) {
    return NextResponse.json({ error: 'Instagram not connected' }, { status: 401 })
  }

  // Fetch all posts (paginate up to 100)
  const posts: { shortcode: string; caption: string; thumbnailUrl: string | null }[] = []
  let maxId: string | null = null
  const MAX = 100

  while (posts.length < MAX) {
    const url = new URL(
      `https://www.instagram.com/api/v1/feed/collection/${id}/posts/`
    )
    url.searchParams.set('count', '24')
    if (maxId) url.searchParams.set('max_id', maxId)

    let res: Response
    try {
      res = await fetch(url.toString(), {
        headers: {
          Cookie: cookie,
          'User-Agent': IG_UA,
          'X-IG-App-ID': IG_APP_ID,
          'X-Requested-With': 'XMLHttpRequest',
        },
        signal: AbortSignal.timeout(15_000),
      })
    } catch (err) {
      console.error('[instagram/collections/posts] fetch error:', err)
      break
    }

    if (!res.ok) break

    const json = (await res.json()) as {
      items?: IgMediaItem[]
      more_available?: boolean
      next_max_id?: string
    }

    for (const item of json.items ?? []) {
      if (!item.code) continue
      const thumb =
        item.image_versions2?.candidates?.[0]?.url ??
        item.carousel_media?.[0]?.image_versions2?.candidates?.[0]?.url ??
        item.thumbnail_url ??
        null

      posts.push({
        shortcode: item.code,
        caption: item.caption?.text ?? '',
        thumbnailUrl: thumb,
      })
    }

    if (!json.more_available || !json.next_max_id) break
    maxId = json.next_max_id
  }

  return NextResponse.json({ posts })
}
