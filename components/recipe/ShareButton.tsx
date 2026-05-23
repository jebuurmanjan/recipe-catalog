'use client'
import { useState } from 'react'

interface Props {
  slug: string
  initialToken?: string | null
}

export default function ShareButton({ slug, initialToken }: Props) {
  const [token, setToken] = useState<string | null>(initialToken ?? null)
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleShare() {
    setLoading(true)
    try {
      let shareToken = token
      if (!shareToken) {
        const res = await fetch(`/api/recipes/${slug}/share`, { method: 'POST' })
        const data = await res.json()
        shareToken = data.share_token
        setToken(shareToken)
      }
      const url = `${window.location.origin}/share/recipe/${shareToken}`
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleShare}
      disabled={loading}
      className="flex items-center gap-1.5 text-sm text-ink-muted hover:text-terracotta transition-colors disabled:opacity-50"
      title={copied ? 'Link copied!' : 'Share recipe'}
    >
      {copied ? (
        <>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M1.5 7l3.5 3.5L12.5 2.5" />
          </svg>
          Copied!
        </>
      ) : (
        <>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M10 2h4v4" />
            <path d="M14 2L8 8" />
            <path d="M7 3H3a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1V9" />
          </svg>
          Share
        </>
      )}
    </button>
  )
}
