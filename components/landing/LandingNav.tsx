import Link from 'next/link'

interface Props {
  isLoggedIn: boolean
}

export default function LandingNav({ isLoggedIn }: Props) {
  return (
    <nav
      className="sticky top-0 z-50 border-b"
      style={{
        backgroundColor: 'color-mix(in srgb, var(--surface) 85%, transparent)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderColor: 'var(--border)',
      }}
    >
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Wordmark */}
        <Link href="/" className="font-serif text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Dishcovery
        </Link>

        {/* Nav actions */}
        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <Link
              href="/catalog"
              className="btn-primary px-4 py-1.5 text-sm"
            >
              My catalog →
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm transition-colors"
                style={{ color: 'var(--text-dim)' }}
              >
                Sign in
              </Link>
              <Link href="/login" className="btn-primary px-4 py-1.5 text-sm">
                Register for free
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
