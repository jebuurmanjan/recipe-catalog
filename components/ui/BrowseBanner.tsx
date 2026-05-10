import Link from 'next/link'

interface BrowseBannerProps {
  className?: string
}

export default function BrowseBanner({ className = '' }: BrowseBannerProps) {
  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl bg-terracotta/10 border border-terracotta/20 px-6 py-5 ${className}`}
    >
      <div>
        <p className="font-serif text-lg font-semibold text-ink">Hungry for more?</p>
        <p className="text-sm text-ink-dim mt-0.5">Browse the full recipe catalog</p>
      </div>
      <Link href="/" className="btn-primary whitespace-nowrap no-print">
        Browse recipes
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
          <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Link>
    </div>
  )
}
