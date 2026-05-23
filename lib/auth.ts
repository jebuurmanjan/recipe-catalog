import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { User } from '@supabase/supabase-js'

/** Returns the currently logged-in Supabase user, or null. */
export async function getUser(): Promise<User | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

/** For API route handlers — returns the user or a ready-made 401 response. */
export async function requireUser(): Promise<
  { user: User; unauthorized: null } |
  { user: null; unauthorized: NextResponse }
> {
  const user = await getUser()
  if (!user) {
    return { user: null, unauthorized: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }
  return { user, unauthorized: null }
}
