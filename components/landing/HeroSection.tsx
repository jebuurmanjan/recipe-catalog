import Link from 'next/link'

interface Props {
  isLoggedIn: boolean
}

export default function HeroSection({ isLoggedIn }: Props) {
  return (
    <section className="max-w-4xl mx-auto px-6 py-24 md:py-36 text-center">

      {/* Beta badge */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-10 text-sm font-medium" style={{ borderColor: 'var(--border)', color: 'var(--text-dim)', backgroundColor: 'var(--surface)' }}>
        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: 'var(--accent)' }} />
        Beta test now live
      </div>

      {/* Headline: name + tagline combined */}
      <h1
        className="font-serif font-bold leading-[1.05] mb-6"
        style={{ fontSize: 'clamp(3rem, 9vw, 6rem)', color: 'var(--text-primary)' }}
      >
        {/* TODO: update headline copy */}
        Dishcovery.<br />
        <span className="italic" style={{ color: 'var(--accent)' }}>Collect. Cook. Share.</span>
      </h1>

      {/* Subline */}
      <p
        className="text-lg md:text-xl leading-relaxed mx-auto mb-10 max-w-xl"
        style={{ color: 'var(--text-dim)' }}
      >
        {/* TODO: update subline */}
        The simplest way to save, organise, and share your favourite recipes —
        from any website, photo, or your own kitchen.
      </p>

      {/* CTA */}
      <Link
        href={isLoggedIn ? '/catalog' : '/login'}
        className="btn-primary px-8 py-3.5 text-base inline-block"
      >
        {isLoggedIn ? 'Go to my catalog →' : 'Register for free'}
      </Link>

      <p className="text-xs mt-4" style={{ color: 'var(--text-muted)' }}>
        No credit card required.
      </p>

    </section>
  )
}
