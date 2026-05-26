import Link from 'next/link'

interface Props {
  isLoggedIn: boolean
}

export default function HeroSection({ isLoggedIn }: Props) {
  return (
    <section className="max-w-6xl mx-auto px-6 py-20 md:py-32">
      <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">

        {/* Text */}
        <div>
          <p
            className="text-sm font-medium tracking-widest uppercase mb-6"
            style={{ color: 'var(--accent)' }}
          >
            Your personal recipe catalog
          </p>

          <h1
            className="font-serif font-bold leading-[1.05] mb-6"
            style={{ fontSize: 'clamp(3rem, 8vw, 5.5rem)', color: 'var(--text-primary)' }}
          >
            {/* TODO: replace with your hero headline */}
            Your recipes,<br />
            <span style={{ color: 'var(--accent)' }}>beautifully</span><br />
            organised.
          </h1>

          <p
            className="text-lg md:text-xl mb-4 font-serif italic"
            style={{ color: 'var(--text-dim)' }}
          >
            Collect. Cook. Share.
          </p>

          <p className="text-base mb-10 max-w-md leading-relaxed" style={{ color: 'var(--text-dim)' }}>
            {/* TODO: replace with your hero subline */}
            Dishcovery is the simplest way to save, organise, and share your favourite recipes —
            whether from websites, cookbooks, or your own creations.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link
              href={isLoggedIn ? '/catalog' : '/login'}
              className="btn-primary px-6 py-3 text-base"
            >
              {isLoggedIn ? 'Go to my catalog →' : 'Register for free'}
            </Link>
            {!isLoggedIn && (
              <Link
                href="/login"
                className="btn-secondary px-6 py-3 text-base"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>

        {/* Hero image */}
        <div
          className="relative rounded-2xl overflow-hidden aspect-[4/3] md:aspect-[3/4] flex items-center justify-center"
          style={{ backgroundColor: 'var(--surface-2)', border: '2px dashed var(--border)' }}
        >
          {/* TODO: Replace this div with an <Image> once you have your hero photo:
              <Image src="/hero.jpg" alt="Dishcovery app screenshot" fill className="object-cover" />
          */}
          <div className="text-center px-8" style={{ color: 'var(--text-muted)' }}>
            <svg className="w-12 h-12 mx-auto mb-3 opacity-40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
            <p className="text-sm">Drop your hero image here</p>
            <p className="text-xs mt-1 opacity-60">Recommended: 1200 × 1600px</p>
          </div>
        </div>

      </div>
    </section>
  )
}
