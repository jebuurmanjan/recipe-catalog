import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { requireUser } from '@/lib/auth'
import type { ParsedRecipe } from '@/types'

const client = new Anthropic()

const PROMPT = `Look at this image and extract the recipe from it. Return ONLY a JSON object with this exact structure, no other text:

{
  "title": "Recipe name",
  "description": "Brief one-sentence description, or empty string if not present",
  "ingredients": [
    "2 cups flour",
    "1 tsp salt"
  ],
  "steps": [
    "Preheat oven to 180°C.",
    "Mix the dry ingredients together."
  ]
}

Rules:
- ingredients: each item is a plain string combining amount + unit + ingredient (e.g. "2 cups flour", "1 tbsp olive oil")
- steps: each item is a complete instruction sentence
- Use empty arrays if no ingredients or steps are visible
- If this image does not appear to contain a recipe, return exactly: {"error": "No recipe found in this image"}`

export async function POST(req: NextRequest) {
  const { unauthorized } = await requireUser()
  if (unauthorized) return unauthorized

  let image: string
  let mimeType: string

  try {
    const body = await req.json()
    image = body.image
    mimeType = body.mimeType ?? 'image/jpeg'
    if (!image) throw new Error('missing image')
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  let text: string
  try {
    const message = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mimeType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
                data: image,
              },
            },
            { type: 'text', text: PROMPT },
          ],
        },
      ],
    })

    const block = message.content[0]
    text = block.type === 'text' ? block.text : ''
  } catch (err) {
    console.error('[extract-recipe] Claude API error:', err)
    return NextResponse.json(
      { error: 'Failed to contact AI service. Please try again.' },
      { status: 502 }
    )
  }

  // Strip optional code fence
  const jsonText = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()

  let parsed: Record<string, unknown>
  try {
    parsed = JSON.parse(jsonText)
  } catch {
    console.error('[extract-recipe] JSON parse failed:', jsonText)
    return NextResponse.json(
      { error: 'Could not extract recipe from this image.' },
      { status: 422 }
    )
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
  }

  return NextResponse.json({ parsed: recipe })
}
