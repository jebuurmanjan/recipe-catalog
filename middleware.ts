import { NextRequest, NextResponse } from 'next/server'
import { getIronSession } from 'iron-session'
import { sessionOptions, type SessionData } from '@/lib/session'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Only guard /admin routes
  if (!pathname.startsWith('/admin')) {
    return NextResponse.next()
  }

  // Always allow the login page through
  if (pathname === '/admin/login') {
    return NextResponse.next()
  }

  // Check session using the req/res overload (cannot use next/headers in middleware)
  const res = NextResponse.next()
  const session = await getIronSession<SessionData>(req, res, sessionOptions)

  if (!session.authenticated) {
    const loginUrl = new URL('/admin/login', req.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Return the response so iron-session cookie refresh is preserved
  return res
}

export const config = {
  matcher: ['/admin/:path*'],
}
