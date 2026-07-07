'use client'
import { useState } from 'react'

interface Props {
  onConnected: () => void
}

export default function ConnectForm({ onConnected }: Props) {
  const [sessionId, setSessionId] = useState('')
  const [dsUserId, setDsUserId] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSave() {
    if (!sessionId.trim() || !dsUserId.trim()) return
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/instagram/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, dsUserId }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Failed to save')
        return
      }
      onConnected()
    } catch {
      setError('Network error — please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl font-bold text-ink">Connect Instagram</h2>
        <p className="text-ink-dim text-sm mt-1">
          Paste your browser session cookies to access your saved collections.
        </p>
      </div>

      {/* Instructions */}
      <div className="rounded-xl border border-border bg-surface p-5 space-y-3 text-sm">
        <p className="font-semibold text-ink">How to get your cookies</p>
        <ol className="space-y-2 text-ink-dim list-decimal list-inside">
          <li>Open <strong className="text-ink">instagram.com</strong> in your browser and log in</li>
          <li>Press <kbd className="px-1.5 py-0.5 rounded bg-surface-2 border border-border text-xs font-mono">F12</kbd> to open DevTools</li>
          <li>Go to the <strong className="text-ink">Network</strong> tab</li>
          <li>Refresh the page, then click any request to instagram.com</li>
          <li>In <strong className="text-ink">Request Headers</strong>, find the <code className="text-xs bg-surface-2 px-1 rounded">Cookie</code> field</li>
          <li>Copy the values of <code className="text-xs bg-surface-2 px-1 rounded">sessionid</code> and <code className="text-xs bg-surface-2 px-1 rounded">ds_user_id</code></li>
        </ol>
        <p className="text-ink-muted text-xs pt-1">
          Your credentials are stored only in your own database and never shared.
          They expire when you log out of Instagram.
        </p>
      </div>

      {/* Inputs */}
      <div className="space-y-4">
        <div>
          <label htmlFor="ig-session" className="label">
            sessionid
          </label>
          <input
            id="ig-session"
            type="password"
            value={sessionId}
            onChange={(e) => setSessionId(e.target.value)}
            placeholder="Paste your sessionid value…"
            className="input-base font-mono text-xs"
          />
        </div>
        <div>
          <label htmlFor="ig-dsuser" className="label">
            ds_user_id
          </label>
          <input
            id="ig-dsuser"
            type="text"
            value={dsUserId}
            onChange={(e) => setDsUserId(e.target.value)}
            placeholder="Paste your ds_user_id value…"
            className="input-base font-mono text-xs"
          />
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={handleSave}
        disabled={!sessionId.trim() || !dsUserId.trim() || saving}
        className="btn-primary w-full disabled:opacity-50"
      >
        {saving ? 'Connecting…' : 'Connect Instagram'}
      </button>
    </div>
  )
}
