import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { requireUser } from '@/lib/auth'
import type { Category } from '@/types'

const client = new Anthropic()

export async function POST(req: NextRequest) {
  const { unauthorized } = await requireUser()
  if (unauthorized) return unauthorized

  const { title, description, categories } = (await req.json()) as {
    title: string
    description?: string
    categories: Category[]
  }

  if (!title?.trim() || !categories?.length) {
    return NextResponse.json({ categoryIds: [] })
  }

  // Group categories by type for the prompt
  const grouped: Record<string, string[]> = {}
  for (const cat of categories) {
    if (!grouped[cat.type]) grouped[cat.type] = []
    grouped[cat.type].push(cat.name)
  }

  const categoryList = Object.entries(grouped)
    .map(([type, names]) => `${type}: ${names.join(', ')}`)
    .join('\n')

  const prompt = `Classify this recipe into the appropriate categories. Return ONLY a JSON object like: {"names": ["Italian", "Easy"]}

Recipe title: ${title}${description ? `\nDescription: ${description}` : ''}

Available categories:
${categoryList}

Rules:
- Only select categories that clearly apply
- Select at most 1 from effort (Easy/Medium/Hard)
- Return an empty array if nothing fits well
- Return ONLY the JSON object, no other text`

  try {
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 256,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : '{}'
    const jsonText = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()
    const parsed = JSON.parse(jsonText) as { names?: string[] }
    const names = new Set((parsed.names ?? []).map((n: string) => n.toLowerCase()))

    const categoryIds = categories
      .filter((c) => names.has(c.name.toLowerCase()))
      .map((c) => c.id)

    return NextResponse.json({ categoryIds })
  } catch (err) {
    console.error('[suggest-tags] error:', err)
    return NextResponse.json({ categoryIds: [] })
  }
}
