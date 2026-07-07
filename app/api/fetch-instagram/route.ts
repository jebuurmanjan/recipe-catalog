import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { requireUser } from '@/lib/auth'
import type { ParsedRecipe } from '@/types'

const IG_APP_ID = process.env.INSTAGRAM_X_IG_APP_ID ?? '936619743392459'
const IG_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'

const client = new Anthropic()

function extractShortcode(url: string): string | null {
  const match = url.match(
    /instagram\.com\/(?:[A-Za-z0-9_.]+\/)?(p|reels|reel|stories)\/([A-Za-z0-9-_]+)/
  )
  return match?.[2] ?? null
}

async function fetchIgPost(shortcode: string): Promise<Record<string, unknown> | null> {
  const params = new URLSearchParams({
    variables: JSON.stringify({ shortcode }),
    doc_id: '10015901848480474',
    lsd: 'AVqbxe3J_YA',
  })

  const res = await fetch(`https://www.instagram.com/api/graphql?${params}`, {
    method: 'POST',
    headers: {
      'User-Agent': IG_UA,
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-IG-App-ID': IG_APP_ID,
      'X-FB-LSD': 'AVqbxe3J_YA',
      'X-ASBD-ID': '129477',
      'Sec-Fetch-Site': 'same-origin',
    },
    signal: AbortSignal.timeout(15_000),
  })

  if (!res.ok) return null
  const json = (await res.json()) as { data?: { xdt_shortcode_media?: Record<string, unknown> } }
  return json?.data?.xdt_shortcode_media ?? null
}

async function fetchImageBase64(
  url: string
): Promise<{ data: string; mimeType: string } | null> {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': IG_UA },
      signal: AbortSignal.timeout(10_000),
    })
    if (!res.ok) return null
    const buffer = await res.arrayBuffer()
    return {
      data: Buffer.from(buffer).toString('base64'),
      mimeType: (res.headers.get('content-type') ?? 'image/jpeg').split(';')[0],
    }
  } catch {
    return null
  }
}

const PROMPT = `Extract the recipe from this Instagram post. Return ONLY a JSON object with this exact structure:

{
  "title": "Recipe name",
  "description": "Brief one-sentence description, or empty string if not present",
  "ingredients": [
    "2 cups flour",
    "1 tsp salt"
  ],
  "steps": [
    "Preheat oven to 180°C.",
    "Mix the dry ingredients."
  ]
}

Rules:
- ingredients: each item is a plain string combining amount + unit + ingredient
- steps: each item is a complete instruction sentence
- Use the caption as the primary source; use the image for additional context
- If no recipe is present at all, return exactly: {"error": "No recipe found in this post"}
- Return ONLY the JSON object, no other text`

export async function POST(req: NextRequest) {
  const { unauthorized } = await requireUser()
  if (unauthorized) return unauthorized

  const body = (await req.json()) as { url?: string }
  const url = body.url?.trim()

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 })
  }

  const shortcode = extractShortcode(url)
  if (!shortcode) {
    return NextResponse.json(
      { error: 'Invalid Instagram URL. Paste a link to a post or reel.' },
      { status: 400 }
    )
  }

  let post: Record<string, unknown> | null = null
  try {
    post = await fetchIgPost(shortcode)
  } catch (err) {
    console.error('[fetch-instagram] fetch error:', err)
  }

  if (!post) {
    return NextResponse.json(
      { error: 'Could not fetch this post. Make sure it is public and the URL is correct.' },
      { status: 422 }
    )
  }

  type CaptionEdges = { edges?: { node?: { text?: string } }[] }
  const caption =
    (post.edge_media_to_caption as CaptionEdges)?.edges?.[0]?.node?.text ?? ''
  const imageUrl = (post.display_url ?? post.thumbnail_src) as string | undefined

  // Build multimodal Claude content
  const content: Anthropic.MessageParam['content'] = []

  if (imageUrl) {
    const img = await fetchImageBase64(imageUrl)
    if (img) {
      content.push({
        type: 'image',
        source: {
          type: 'base64',
          media_type: img.mimeType as 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif',
          data: img.data,
        },
      })
    }
  }

  const captionText = caption
    ? `Instagram caption:\n\n${caption}\n\n${PROMPT}`
    : `(No caption available — extract from image if possible)\n\n${PROMPT}`

  content.push({ type: 'text', text: captionText })

  let text: string
  try {
    const message = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 2048,
      messages: [{ role: 'user', content }],
    })
    const block = message.content[0]
    text = block.type === 'text' ? block.text : ''
  } catch (err) {
    console.error('[fetch-instagram] Claude error:', err)
    return NextResponse.json(
      { error: 'Failed to extract recipe. Please try again.' },
      { status: 502 }
    )
  }

  const jsonText = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()

  let parsed: Record<string, unknown>
  try {
    parsed = JSON.parse(jsonText)
  } catch {
    console.error('[fetch-instagram] JSON parse failed:', jsonText)
    return NextResponse.json({ error: 'Could not parse extracted recipe.' }, { status: 422 })
  }

  if (parsed.error) {
    return NextResponse.json({ error: String(parsed.error) }, { status: 422 })
  }

  const recipe: ParsedRecipe = {
    title: typeof parsed.title === 'string' ? parsed.title : undefined,
    description: typeof parsed.description === 'string' ? parsed.description : undefined,
    ingredients: Array.isArray(parsed.ingredients)
      ? (parsed.ingredients as unknown[]).filter((i): i is string => typeof i === 'string')
      : [],
    steps: Array.isArray(parsed.steps)
      ? (parsed.steps as unknown[]).filter((s): s is string => typeof s === 'string')
      : [],
    source_url: url,
  }

  return NextResponse.json({ parsed: recipe })
}
