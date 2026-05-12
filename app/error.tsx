'use client'
import Link from 'next/link'

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="font-serif text-4xl font-bold text-ink mb-3">Something went wrong</h1>
        <p className="text-ink-dim mb-6">An unexpected error occurred. You can try again or go back to the catalog.</p>
        <div className="flex items-center justify-center gap-3">
          <button onClick={reset} className="btn-primary">Try again</button>
          <Link href="/" className="btn-secondary">Back to catalog</Link>
        </div>
      </div>
    </div>
  )
}
