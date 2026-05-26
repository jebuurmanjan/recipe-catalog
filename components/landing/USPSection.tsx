const USPS = [
  {
    badge: 'Collect',
    // TODO: replace title, description, and imageAlt
    title: 'Save in seconds',
    description: 'Paste any URL and Dishcovery extracts the recipe automatically. No copying, no formatting — just saved.',
    imageAlt: 'Saving a recipe from a website',
    cta: 'Start collecting',
  },
  {
    badge: 'Organise',
    title: 'Organised your way',
    description: 'Tag recipes, group them into collections, and filter by cuisine or occasion. Your catalog, your structure.',
    imageAlt: 'Recipe collections and tags',
    cta: 'See how it works',
  },
  {
    badge: 'Share',
    title: 'Share with anyone',
    description: 'Generate a public link for any recipe or collection and share it with friends and family — no account needed to view.',
    imageAlt: 'Sharing a recipe link',
    cta: 'Try sharing',
  },
]

export default function USPSection() {
  return (
    <section className="border-t" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
      <div className="max-w-6xl mx-auto px-6 py-20 md:py-28">

        <div className="text-center mb-14">
          {/* TODO: replace section label and heading */}
          <p className="text-sm font-medium tracking-widest uppercase mb-3" style={{ color: 'var(--accent)' }}>
            Why Dishcovery
          </p>
          <h2 className="font-serif text-3xl md:text-5xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Everything you need for your recipes
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {USPS.map((usp) => (
            <div
              key={usp.badge}
              className="flex flex-col rounded-2xl overflow-hidden"
              style={{ backgroundColor: 'var(--bg-base)', border: '1px solid var(--border)' }}
            >
              {/* Image area */}
              <div
                className="aspect-[4/3] flex items-center justify-center"
                style={{ backgroundColor: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}
              >
                {/* TODO: Replace with <Image src="..." alt={usp.imageAlt} fill className="object-cover" /> */}
                <div className="text-center px-6" style={{ color: 'var(--text-muted)' }}>
                  <svg className="w-8 h-8 mx-auto mb-2 opacity-40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path d="M21 15l-5-5L5 21" />
                  </svg>
                  <p className="text-xs">{usp.imageAlt}</p>
                </div>
              </div>

              {/* Text + CTA */}
              <div className="flex flex-col flex-1 p-7">
                <p
                  className="text-xs font-semibold tracking-widest uppercase mb-3"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {usp.badge}
                </p>
                <h3
                  className="font-serif text-xl md:text-2xl font-bold mb-3 leading-snug"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {usp.title}
                </h3>
                <p className="text-sm leading-relaxed mb-6 flex-1" style={{ color: 'var(--text-dim)' }}>
                  {usp.description}
                </p>
                <a
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-sm font-medium px-5 py-2.5 rounded-full border transition-colors self-start hover:bg-surface-2"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                >
                  {usp.cta}
                </a>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
