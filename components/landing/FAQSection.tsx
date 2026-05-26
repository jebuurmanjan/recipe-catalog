'use client'
import { useState } from 'react'

// TODO: replace with your own questions and answers
const FAQS = [
  {
    q: 'Is Dishcovery free to use?',
    a: 'Yes — creating an account and saving recipes is completely free. Sign up with your email address and get started immediately.',
  },
  {
    q: 'Do I need to install an app?',
    a: 'No. Dishcovery works in any browser on your phone, tablet, or desktop. You can also add it to your home screen for a native app-like experience.',
  },
  {
    q: 'Can I import recipes from websites?',
    a: 'Yes. Paste any URL from a recipe website and Dishcovery extracts the title, ingredients, and steps automatically — as long as the site uses structured recipe data.',
  },
  {
    q: 'How does sharing work?',
    a: 'Each recipe and collection can generate a public share link. Anyone with the link can view the recipe — they don\'t need an account.',
  },
  {
    q: 'Is my recipe catalog private?',
    a: 'Yes. Your recipes are only visible to you unless you explicitly share a link. Each account is completely isolated.',
  },
  {
    q: 'Can I use Dishcovery on multiple devices?',
    a: 'Absolutely. Your catalog syncs across all your devices. Sign in with your email on any device and everything is there.',
  },
]

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="flex-shrink-0 transition-transform duration-200"
      style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
      aria-hidden
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  )
}

export default function FAQSection() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section
      className="border-t"
      style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}
    >
      <div className="max-w-2xl mx-auto px-6 py-20 md:py-28">

        <div className="text-center mb-12">
          <p className="text-sm font-medium tracking-widest uppercase mb-3" style={{ color: 'var(--accent)' }}>
            FAQ
          </p>
          <h2 className="font-serif text-3xl md:text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Questions &amp; answers
          </h2>
        </div>

        <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
          {FAQS.map((faq, i) => (
            <div key={i}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between gap-4 py-5 text-left transition-colors"
                style={{ color: 'var(--text-primary)' }}
              >
                <span className="font-medium">{faq.q}</span>
                <ChevronIcon open={open === i} />
              </button>

              {open === i && (
                <p
                  className="pb-5 text-sm leading-relaxed"
                  style={{ color: 'var(--text-dim)' }}
                >
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
