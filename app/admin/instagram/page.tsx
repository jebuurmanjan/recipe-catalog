'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import ConnectForm from './components/ConnectForm'
import SyncView from './components/SyncView'

export default function InstagramPage() {
  const [connected, setConnected] = useState<boolean | null>(null)

  useEffect(() => {
    fetch('/api/instagram/settings')
      .then((r) => r.json())
      .then((d) => setConnected(!!d.connected))
      .catch(() => setConnected(false))
  }, [])

  async function handleDisconnect() {
    await fetch('/api/instagram/settings', { method: 'DELETE' })
    setConnected(false)
  }

  return (
    <div className="min-h-screen bg-cream">
      <nav className="border-b border-border">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <Link href="/catalog" className="text-sm text-ink-dim hover:text-terracotta transition-colors">
            ← Catalog
          </Link>
          <span className="text-border">·</span>
          <h1 className="font-serif text-lg font-semibold text-ink flex items-center gap-2">
            <InstagramIcon />
            Instagram sync
          </h1>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        {connected === null ? (
          <div className="flex items-center justify-center py-16 gap-3 text-ink-dim">
            <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            Loading…
          </div>
        ) : connected ? (
          <SyncView onDisconnect={() => setConnected(false)} />
        ) : (
          <ConnectForm onConnected={() => setConnected(true)} />
        )}
      </div>
    </div>
  )
}

function InstagramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-terracotta">
      <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="1.75" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.75" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
    </svg>
  )
}
