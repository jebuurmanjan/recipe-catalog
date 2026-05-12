import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <p className="font-serif text-7xl font-bold text-terracotta mb-4">404</p>
        <h1 className="font-serif text-3xl font-bold text-ink mb-3">Recipe not found</h1>
        <p className="text-ink-dim mb-6">This recipe doesn&apos;t exist or may have been removed.</p>
        <Link href="/" className="btn-primary">Back to catalog</Link>
      </div>
    </div>
  )
}
