import { NextRequest, NextResponse } from 'next/server'
import { getIronSession } from 'iron-session'
import { sessionOptions, type SessionData } from '@/lib/session'

export async function POST(req: NextRequest) {
  const { passphrase } = await req.json()

  if (!passphrase || passphrase !== process.env.EDITOR_SECRET) {
    return NextResponse.json({ error: 'Invalid passphrase' }, { status: 401 })
  }

  const res = NextResponse.json({ ok: true })
  const session = await getIronSession<SessionData>(req, res, sessionOptions)
  session.authenticated = true
  await session.save()

  return res
}
