const FEATURES = [
  {
    badge: 'Import',
    // TODO: replace headline, description, and image for each feature row
    headline: 'Import from any website',
    description:
      'Paste a URL from BBC Good Food, Allrecipes, NYT Cooking, or thousands of other recipe sites. Dishcovery reads the structured data and fills in the recipe for you — ingredients, steps, and all.',
    imageAlt: 'URL import feature',
    flip: false,
  },
  {
    badge: 'AI extraction',
    headline: 'Snap a photo, get a recipe',
    description:
      'Got a recipe from a magazine, a handwritten note, or a screenshot? Take a photo and our AI extracts the ingredients and steps automatically.',
    imageAlt: 'Photo extraction feature',
    flip: true,
  },
  {
    badge: 'Collections',
    headline: 'Group recipes into collections',
    description:
      'Build a "weeknight dinners" collection, a "Christmas menu", or a "Jan\'s favourites" list. Share entire collections with a single link.',
    imageAlt: 'Collections feature',
    flip: false,
  },
]

function ImagePlaceholder({ alt }: { alt: string }) {
  return (
    <div
      className="w-full rounded-2xl aspect-[4/3] flex items-center justify-center"
      style={{ backgroundColor: 'var(--surface-2)', border: '2px dashed var(--border)' }}
    >
      {/* TODO: Replace with <Image src="..." alt={alt} fill className="object-cover" /> */}
      <div className="text-center px-6" style={{ color: 'var(--text-muted)' }}>
        <svg className="w-8 h-8 mx-auto mb-2 opacity-40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="M21 15l-5-5L5 21" />
        </svg>
        <p className="text-xs">{alt}</p>
      </div>
    </div>
  )
}

export default function FeaturesSection() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-20 md:py-28 space-y-24">

      <div className="text-center mb-4">
        <p className="text-sm font-medium tracking-widest uppercase mb-3" style={{ color: 'var(--accent)' }}>
          Features
        </p>
        <h2 className="font-serif text-3xl md:text-5xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Built for how you actually cook
        </h2>
      </div>

      {FEATURES.map((feature) => (
        <div
          key={feature.badge}
          className={`grid md:grid-cols-2 gap-12 items-center ${feature.flip ? 'md:[&>*:first-child]:order-2' : ''}`}
        >
          {/* Text */}
          <div>
            <span
              className="inline-block text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded-full mb-5"
              style={{ backgroundColor: 'var(--surface-2)', color: 'var(--accent)' }}
            >
              {feature.badge}
            </span>
            <h3
              className="font-serif text-2xl md:text-4xl font-bold mb-5 leading-tight"
              style={{ color: 'var(--text-primary)' }}
            >
              {feature.headline}
            </h3>
            <p className="leading-relaxed" style={{ color: 'var(--text-dim)' }}>
              {feature.description}
            </p>
          </div>

          {/* Image */}
          <ImagePlaceholder alt={feature.imageAlt} />
        </div>
      ))}

    </section>
  )
}
