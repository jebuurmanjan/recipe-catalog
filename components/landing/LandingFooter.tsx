import Link from 'next/link'

export default function LandingFooter() {
  const year = new Date().getFullYear()

  return (
    <footer
      className="border-t"
      style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface-2)' }}
    >
      <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">

        {/* Left */}
        <div>
          <p className="font-serif text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
            Dishcovery
          </p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Collect. Cook. Share. &copy; {year}
          </p>
        </div>

        {/* Right */}
        <div className="flex items-center gap-5 text-sm" style={{ color: 'var(--text-dim)' }}>
          <Link href="/login" className="hover:underline transition-colors" style={{ color: 'var(--text-dim)' }}>
            Sign in
          </Link>
          <Link href="/login" className="hover:underline transition-colors" style={{ color: 'var(--accent)' }}>
            Register for free →
          </Link>
        </div>

      </div>
    </footer>
  )
}
