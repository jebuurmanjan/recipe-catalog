'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

function SunIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )
}

interface Props {
  isLoggedIn: boolean
}

export default function LandingNav({ isLoggedIn }: Props) {
  const [visible, setVisible] = useState(false)
  const [isDark, setIsDark] = useState(false)

  // Read theme from DOM — anti-flash script has already applied it
  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'))
  }, [])

  // Show nav once user scrolls past the hero section (~80% of viewport height)
  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > window.innerHeight * 0.8)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll() // handle page loads that are already scrolled
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  function toggleTheme() {
    const next = !isDark
    setIsDark(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('theme', next ? 'dark' : 'light')
  }

  return (
    <div className="fixed top-5 inset-x-0 z-50 flex justify-center px-6">
      <nav
        className="w-full max-w-6xl flex items-center px-6 py-3 rounded-full border transition-all duration-300"
        style={{
          backgroundColor: 'color-mix(in srgb, var(--surface) 92%, transparent)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderColor: 'var(--border)',
          boxShadow: 'var(--shadow-md)',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(-14px)',
          pointerEvents: visible ? 'auto' : 'none',
        }}
      >
        {/* Wordmark — left */}
        <Link
          href="/"
          className="font-serif text-lg font-bold mr-auto"
          style={{ color: 'var(--text-primary)' }}
        >
          Dishcovery
        </Link>

        {/* Separator */}
        <div className="w-px h-4 mx-4 flex-shrink-0" style={{ backgroundColor: 'var(--border)' }} />

        {/* Theme toggle — right group */}
        <button
          onClick={toggleTheme}
          className="w-8 h-8 flex items-center justify-center rounded-full transition-colors"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--surface-2)')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? <SunIcon /> : <MoonIcon />}
        </button>

        {/* Separator */}
        <div className="w-px h-4 mx-4 flex-shrink-0" style={{ backgroundColor: 'var(--border)' }} />

        {/* Nav actions */}
        {isLoggedIn ? (
          <Link href="/catalog" className="btn-primary px-4 py-1.5 text-sm">
            My catalog →
          </Link>
        ) : (
          <>
            <Link
              href="/login"
              className="text-sm font-medium px-3 py-1.5 rounded-full transition-colors"
              style={{ color: 'var(--text-dim)' }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--surface-2)')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              Sign in
            </Link>
            <Link href="/login" className="btn-primary px-4 py-1.5 text-sm">
              Register for free
            </Link>
          </>
        )}
      </nav>
    </div>
  )
}
