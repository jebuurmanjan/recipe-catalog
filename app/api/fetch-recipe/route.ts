import { NextRequest, NextResponse } from 'next/server'
import { load } from 'cheerio'
import type { ParsedRecipe } from '@/types'

const BLOCKED_DOMAINS = ['instagram.com', 'www.instagram.com']

export async function POST(req: NextRequest) {
  const { url } = await req.json()

  if (!url || typeof url !== 'string') {
    return NextResponse.json({ error: 'A URL is required' }, { status: 400 })
  }

  // Validate and block certain domains
  let hostname: string
  try {
    hostname = new URL(url).hostname
  } catch {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
  }

  if (BLOCKED_DOMAINS.includes(hostname)) {
    return NextResponse.json(
      { error: 'Instagram URLs are not supported — please add the recipe manually.' },
      { status: 422 }
    )
  }

  // Fetch the page
  let html: string
  try {
    const resp = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; RecipeCatalogBot/1.0; +https://recipe-catalog.vercel.app)',
        Accept: 'text/html,application/xhtml+xml',
      },
      signal: AbortSignal.timeout(12_000),
    })
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
    html = await resp.text()
  } catch (err) {
    return NextResponse.json({ error: `Could not fetch the page: ${err}` }, { status: 502 })
  }

  // Parse JSON-LD
  const $ = load(html)
  let schema: Record<string, unknown> | null = null
  type SchemaObj = Record<string, unknown>

  $('script[type="application/ld+json"]').each((_, el) => {
    if (schema) return
    try {
      const raw = $(el).html() ?? ''
      const json = JSON.parse(raw)
      // Handle @graph (array of entities on the page)
      const candidates: SchemaObj[] = json['@graph']
        ? (json['@graph'] as SchemaObj[])
        : Array.isArray(json)
        ? (json as SchemaObj[])
        : [json as SchemaObj]

      const recipe = candidates.find((n) => {
        const t = n['@type']
        return t === 'Recipe' || (Array.isArray(t) && (t as string[]).includes('Recipe'))
      })
      if (recipe) schema = recipe
    } catch {
      // skip malformed JSON-LD blocks
    }
  })

  if (!schema) {
    return NextResponse.json(
      { error: 'No Recipe schema found on this page. Try a different recipe site or add manually.' },
      { status: 404 }
    )
  }

  // Explicit cast because TypeScript loses track of `schema` after closure mutation
  const s = schema as Record<string, unknown>

  const parsed: ParsedRecipe = {
    title: typeof s.name === 'string' ? s.name : undefined,
    description: typeof s.description === 'string' ? s.description : undefined,
    source_url: url,
    image_url: normalizeImage(s.image),
    ingredients: normalizeStringArray(s.recipeIngredient),
    steps: normalizeSteps(s.recipeInstructions),
  }

  return NextResponse.json({ parsed })
}

function normalizeImage(image: unknown): string | undefined {
  if (typeof image === 'string') return image
  if (Array.isArray(image)) return normalizeImage(image[0])
  if (image && typeof image === 'object' && 'url' in image) {
    return (image as { url: string }).url
  }
  return undefined
}

function normalizeStringArray(val: unknown): string[] {
  if (!val) return []
  if (Array.isArray(val)) return val.filter((v): v is string => typeof v === 'string')
  if (typeof val === 'string') return [val]
  return []
}

function normalizeSteps(val: unknown): string[] {
  if (!val) return []
  if (typeof val === 'string') return [val]
  if (Array.isArray(val)) {
    return val.flatMap((step) => {
      if (typeof step === 'string') return [step]
      if (step && typeof step === 'object') {
        const s = step as Record<string, unknown>
        // HowToStep
        if (typeof s.text === 'string') return [s.text]
        // HowToSection with nested itemListElement
        if (s.itemListElement) return normalizeSteps(s.itemListElement)
      }
      return []
    })
  }
  return []
}
