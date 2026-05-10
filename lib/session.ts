import { getIronSession, type SessionOptions } from 'iron-session'
import { cookies } from 'next/headers'
import type { NextRequest, NextResponse } from 'next/server'

export interface SessionData {
  authenticated?: boolean
}

export const sessionOptions: SessionOptions = {
  cookieName: 'recipe_session',
  password: process.env.SESSION_SECRET!,
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
}

/** For Server Components, Server Actions, and Route Handlers */
export async function getSession() {
  const cookieStore = await cookies()
  return getIronSession<SessionData>(cookieStore, sessionOptions)
}

/** For middleware (req/res overload — cannot use next/headers in middleware) */
export async function getSessionFromRequest(req: NextRequest, res: NextResponse) {
  return getIronSession<SessionData>(req, res, sessionOptions)
}
