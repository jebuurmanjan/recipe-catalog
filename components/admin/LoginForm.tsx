'use client'
import { useState, FormEvent } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useLanguage } from '@/contexts/LanguageContext'

export default function LoginForm() {
  const { t } = useLanguage()
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? t('incorrectPassword'))
        return
      }

      const from = searchParams.get('from') ?? '/admin/add'
      router.push(from)
      router.refresh()
    } catch {
      setError(t('somethingWentWrong'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: 'var(--bg-base)' }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Recipe Catalog</h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--text-dim)' }}>{t('enterPasswordPrompt')}</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl p-6 shadow-sm space-y-4"
          style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <div>
            <label htmlFor="password" className="label">{t('password')}</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-base"
              placeholder={t('enterPassword')}
              autoFocus
              required
            />
          </div>

          {error && (
            <div
              className="rounded-lg px-4 py-3 text-sm"
              style={{ backgroundColor: 'color-mix(in srgb, #ef4444 10%, var(--surface))', border: '1px solid color-mix(in srgb, #ef4444 30%, transparent)', color: '#dc2626' }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="btn-primary w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? t('checking') : t('enter')}
          </button>
        </form>

        <p className="text-center mt-4 text-xs" style={{ color: 'var(--text-muted)' }}>
          <a href="/" className="transition-colors hover:text-[var(--accent)]">{t('backToCatalog')}</a>
        </p>
      </div>
    </div>
  )
}
