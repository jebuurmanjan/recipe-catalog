'use client'
import { useState } from 'react'
import type { ParsedRecipe } from '@/types'

interface Props {
  onImport: (data: ParsedRecipe) => void
}

type Status = 'idle' | 'loading' | 'success' | 'error'

export default function ImportFromURL({ onImport }: Props) {
  const [url, setUrl] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [message, setMessage] = useState('')

  async function handleImport() {
    if (!url.trim()) return

    setStatus('loading')
    setMessage('')

    try {
      const res = await fetch('/api/fetch-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      })
      const data = await res.json()

      if (!res.ok || !data.parsed) {
        setStatus('error')
        setMessage(data.error ?? 'Could not parse a recipe from this URL.')
        return
      }

      onImport(data.parsed)
      setStatus('success')
      setMessage('Recipe imported! Review and adjust the fields below.')
      setUrl('')
    } catch {
      setStatus('error')
      setMessage('Network error — please check your connection and try again.')
    }
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-4 space-y-3">
      <div className="flex items-center gap-2">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden className="text-terracotta">
          <path d="M2 8a6 6 0 1112 0A6 6 0 012 8z" stroke="currentColor" strokeWidth="1.5" />
          <path d="M8 5v3l2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <p className="text-sm font-semibold text-ink">Import from URL</p>
        <span className="text-xs text-ink-muted ml-auto">Reads schema.org/Recipe JSON-LD</span>
      </div>

      <div className="flex gap-2">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleImport()}
          placeholder="https://www.bbcgoodfood.com/recipes/…"
          className="input-base flex-1"
        />
        <button
          type="button"
          onClick={handleImport}
          disabled={!url.trim() || status === 'loading'}
          className="btn-primary whitespace-nowrap disabled:opacity-50"
        >
          {status === 'loading' ? 'Fetching…' : 'Import'}
        </button>
      </div>

      {status === 'success' && (
        <p className="text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
          ✓ {message}
        </p>
      )}
      {status === 'error' && (
        <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {message}
        </p>
      )}
    </div>
  )
}
