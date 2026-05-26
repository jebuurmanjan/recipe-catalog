const USPS = [
  {
    // TODO: replace icon, title and description
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z" />
        <path d="M12 8v4l3 3" />
      </svg>
    ),
    title: 'Save in seconds',
    description: 'Paste any URL and Dishcovery extracts the recipe automatically. No copying, no formatting — just saved.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M4 6h16M4 10h16M4 14h10M4 18h6" />
      </svg>
    ),
    title: 'Organised your way',
    description: 'Tag recipes, group them into collections, and filter by cuisine or occasion. Your catalog, your structure.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
        <polyline points="16 6 12 2 8 6" />
        <line x1="12" y1="2" x2="12" y2="15" />
      </svg>
    ),
    title: 'Share with anyone',
    description: 'Generate a public link for any recipe or collection and share it with friends and family — no account needed to view.',
  },
]

export default function USPSection() {
  return (
    <section className="border-t" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
      <div className="max-w-6xl mx-auto px-6 py-20 md:py-28">

        <div className="text-center mb-16">
          {/* TODO: replace section label and heading */}
          <p className="text-sm font-medium tracking-widest uppercase mb-3" style={{ color: 'var(--accent)' }}>
            Why Dishcovery
          </p>
          <h2 className="font-serif text-3xl md:text-5xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Everything you need for your recipes
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-10 md:gap-16">
          {USPS.map((usp) => (
            <div key={usp.title}>
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
                style={{ backgroundColor: 'var(--accent)', color: '#fff' }}
              >
                {usp.icon}
              </div>
              <h3 className="font-serif text-xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
                {usp.title}
              </h3>
              <p className="leading-relaxed text-sm" style={{ color: 'var(--text-dim)' }}>
                {usp.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
