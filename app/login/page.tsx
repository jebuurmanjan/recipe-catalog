'use client'
import { useState, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Step = 'form' | 'code'

function LoginForm() {
  const searchParams = useSearchParams()
  const from = searchParams.get('from') ?? '/'
  const router = useRouter()

  const [step, setStep] = useState<Step>('form')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const codeRefs = useRef<(HTMLInputElement | null)[]>([])

  const supabase = createClient()

  // ── Step 1: send OTP ────────────────────────────────────────────────────────
  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    setError(null)
    try {
      const { error: err } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(from)}`,
        },
      })
      if (err) setError(err.message)
      else setStep('code')
    } finally {
      setLoading(false)
    }
  }

  // ── Step 2: verify OTP ──────────────────────────────────────────────────────
  async function handleVerify(e: React.FormEvent) {
    e.preventDefault()
    const token = code.join('')
    if (token.length < 6) return
    setLoading(true)
    setError(null)
    try {
      const { error: err } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token,
        type: 'email',
      })
      if (err) {
        setError(err.message)
      } else {
        router.push(from)
      }
    } finally {
      setLoading(false)
    }
  }

  // ── Code input helpers ──────────────────────────────────────────────────────
  function handleCodeChange(i: number, val: string) {
    const digit = val.replace(/\D/g, '').slice(-1)
    const next = [...code]
    next[i] = digit
    setCode(next)
    if (digit && i < 5) codeRefs.current[i + 1]?.focus()
  }

  function handleCodeKeyDown(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !code[i] && i > 0) {
      codeRefs.current[i - 1]?.focus()
    }
  }

  function handleCodePaste(e: React.ClipboardEvent) {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 6) {
      setCode(pasted.split(''))
      codeRefs.current[5]?.focus()
    }
  }

  // ── Logo ────────────────────────────────────────────────────────────────────
  const logo = (
    <div className="text-center mb-8">
      <div className="w-14 h-14 rounded-2xl bg-terracotta flex items-center justify-center mx-auto mb-4">
        <span className="font-serif text-3xl font-bold text-white leading-none">R</span>
      </div>
      <h1 className="font-serif text-2xl font-bold text-ink">Recipe Catalog</h1>
    </div>
  )

  // ── Code entry screen ───────────────────────────────────────────────────────
  if (step === 'code') {
    const codeComplete = code.every(d => d !== '')
    return (
      <>
        {logo}
        <p className="text-sm text-ink-dim text-center mb-6">
          We sent a 6-digit code to <strong>{email}</strong>.
          <br />Enter it below to sign in.
        </p>

        <form onSubmit={handleVerify} className="space-y-5">
          <div className="flex gap-2 justify-center" onPaste={handleCodePaste}>
            {code.map((digit, i) => (
              <input
                key={i}
                ref={el => { codeRefs.current[i] = el }}
                type="text"
                inputMode="numeric"
                pattern="\d"
                maxLength={1}
                value={digit}
                autoFocus={i === 0}
                onChange={e => handleCodeChange(i, e.target.value)}
                onKeyDown={e => handleCodeKeyDown(i, e)}
                className="w-11 h-14 text-center text-xl font-semibold rounded-xl border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-terracotta/40 text-ink"
              />
            ))}
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 dark:bg-red-950/20 px-3 py-2 rounded-lg text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !codeComplete}
            className="btn-primary w-full py-2.5 text-sm disabled:opacity-50"
          >
            {loading ? 'Verifying…' : 'Sign in'}
          </button>
        </form>

        <div className="flex items-center justify-center gap-4 mt-5 text-xs text-ink-muted">
          <button
            onClick={() => { setStep('form'); setEmail(''); setCode(['', '', '', '', '', '']); setError(null) }}
            className="hover:text-terracotta transition-colors"
          >
            ← Change email
          </button>
          <span>·</span>
          <button
            onClick={(e) => handleSend(e as unknown as React.FormEvent)}
            className="hover:text-terracotta transition-colors"
          >
            Resend code
          </button>
        </div>
      </>
    )
  }

  // ── Contact form ─────────────────────────────────────────────────────────────
  return (
    <>
      {logo}

      <form onSubmit={handleSend} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-ink mb-1.5">
            Email address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
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
          {loading ? 'Sending…' : 'Send code via email'}
        </button>
      </form>

      <p className="text-xs text-ink-muted text-center mt-6">
        We&apos;ll send a 6-digit code — no password needed.
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
