import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { createServiceClient } from '@/lib/supabase/service'

const BUCKET = 'recipe-images'
const MAX_SIZE = 10 * 1024 * 1024 // 10 MB (iPhone photos can be large)

// Known MIME type → { extension, canonical content-type }
// HEIC/HEIF: iOS may send raw HEIC — store as .jpg with image/jpeg so
// Supabase Storage doesn't reject a content-type/extension mismatch.
const MIME_MAP: Record<string, { ext: string; contentType: string }> = {
  'image/jpeg':  { ext: 'jpg',  contentType: 'image/jpeg' },
  'image/jpg':   { ext: 'jpg',  contentType: 'image/jpeg' },
  'image/png':   { ext: 'png',  contentType: 'image/png'  },
  'image/webp':  { ext: 'webp', contentType: 'image/webp' },
  'image/gif':   { ext: 'gif',  contentType: 'image/gif'  },
  'image/heic':  { ext: 'jpg',  contentType: 'image/jpeg' },
  'image/heif':  { ext: 'jpg',  contentType: 'image/jpeg' },
  'image/avif':  { ext: 'avif', contentType: 'image/avif' },
  'image/tiff':  { ext: 'jpg',  contentType: 'image/jpeg' },
}

// Fallback for unrecognised types (e.g. empty string on some iOS versions):
// treat as JPEG — Supabase bucket has no MIME restrictions so it will be stored fine.
const FALLBACK_MIME = { ext: 'jpg', contentType: 'image/jpeg' }

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

  // Use known mapping or fall back to JPEG — never trust the original filename.
  const mime = MIME_MAP[file.type] ?? FALLBACK_MIME

  const filename = `${crypto.randomUUID()}.${mime.ext}`
  const buffer = Buffer.from(await file.arrayBuffer())

  const db = createServiceClient()
  const { error } = await db.storage.from(BUCKET).upload(filename, buffer, {
    contentType: mime.contentType,
    upsert: false,
  })

  if (error) {
    return NextResponse.json(
      { error: error.message, receivedType: file.type, size: file.size },
      { status: 500 }
    )
  }

  const { data: { publicUrl } } = db.storage.from(BUCKET).getPublicUrl(filename)

  return NextResponse.json({ url: publicUrl })
}
