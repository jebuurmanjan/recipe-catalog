'use client'
import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function LoginForm() {
  const searchParams = useSearchParams()
  const from = searchParams.get('from') ?? '/'

  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    setError(null)
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin}/auth/callback?next=${encodeURIComponent(from)}`,
        },
      })
      if (error) setError(error.message)
      else setSent(true)
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="text-center">
        <div className="w-14 h-14 rounded-full bg-terracotta/10 flex items-center justify-center mx-auto mb-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="text-terracotta" aria-hidden>
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
        </div>
        <h1 className="font-serif text-2xl font-bold text-ink mb-2">Check your email</h1>
        <p className="text-ink-dim text-sm">
          We sent a sign-in link to <strong>{email}</strong>.
          <br />Click it to access your recipe catalog.
        </p>
        <button
          onClick={() => { setSent(false); setEmail('') }}
          className="mt-6 text-sm text-ink-muted hover:text-terracotta transition-colors"
        >
          Use a different email
        </button>
      </div>
    )
  }

  return (
    <>
      <div className="text-center mb-8">
        <div className="w-14 h-14 rounded-2xl bg-terracotta flex items-center justify-center mx-auto mb-4">
          <span className="font-serif text-3xl font-bold text-white leading-none">R</span>
        </div>
        <h1 className="font-serif text-2xl font-bold text-ink">Recipe Catalog</h1>
        <p className="text-ink-dim text-sm mt-1">Sign in with your email to continue</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-ink mb-1.5">
            Email address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            autoFocus
            className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-terracotta/40 text-ink placeholder:text-ink-muted text-sm"
          />
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 dark:bg-red-950/20 px-3 py-2 rounded-lg">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading || !email.trim()}
          className="btn-primary w-full py-2.5 text-sm disabled:opacity-50"
        >
          {loading ? 'Sending…' : 'Continue with email'}
        </button>
      </form>

      <p className="text-xs text-ink-muted text-center mt-6">
        We&apos;ll send a magic link — no password needed.
      </p>
    </>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--bg-base)' }}>
      <div className="w-full max-w-sm">
        <div className="rounded-2xl border border-border bg-surface p-8 shadow-sm">
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
