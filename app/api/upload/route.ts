import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { createServiceClient } from '@/lib/supabase/service'

const BUCKET = 'recipe-images'
const MAX_SIZE = 10 * 1024 * 1024 // 10 MB (iPhone photos can be large)

// Map MIME type → { extension, canonical content-type }
// HEIC/HEIF: iOS sends the raw HEIC data with image/heic type; we store it as .jpg
// and tell Supabase Storage it's image/jpeg so the content-type matches the extension.
const MIME_MAP: Record<string, { ext: string; contentType: string }> = {
  'image/jpeg':  { ext: 'jpg',  contentType: 'image/jpeg' },
  'image/jpg':   { ext: 'jpg',  contentType: 'image/jpeg' },
  'image/png':   { ext: 'png',  contentType: 'image/png'  },
  'image/webp':  { ext: 'webp', contentType: 'image/webp' },
  'image/gif':   { ext: 'gif',  contentType: 'image/gif'  },
  'image/heic':  { ext: 'jpg',  contentType: 'image/jpeg' },
  'image/heif':  { ext: 'jpg',  contentType: 'image/jpeg' },
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session.authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const form = await req.formData()
  const file = form.get('file') as File | null

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'File exceeds 10 MB limit' }, { status: 413 })
  }

  const mime = MIME_MAP[file.type]
  if (!mime) {
    return NextResponse.json({ error: `Unsupported file type: ${file.type}` }, { status: 415 })
  }

  // Use UUID + MIME-derived extension — never the original filename (may have spaces, .HEIC, etc.)
  // Use the canonical content-type (e.g. image/jpeg for HEIC) so Supabase Storage
  // doesn't reject a content-type/extension mismatch.
  const filename = `${crypto.randomUUID()}.${mime.ext}`
  const buffer = Buffer.from(await file.arrayBuffer())

  const db = createServiceClient()
  const { error } = await db.storage.from(BUCKET).upload(filename, buffer, {
    contentType: mime.contentType,
    upsert: false,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data: { publicUrl } } = db.storage.from(BUCKET).getPublicUrl(filename)

  return NextResponse.json({ url: publicUrl })
}
