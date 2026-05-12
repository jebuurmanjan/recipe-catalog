'use client'
import { useRef, useEffect } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { useLanguage } from '@/contexts/LanguageContext'
import type { Locale } from '@/lib/translations'

interface Props {
  onClose: () => void
}

function SunIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <line x1="12" y1="2" x2="12" y2="6" />
      <line x1="12" y1="18" x2="12" y2="22" />
      <line x1="4.22" y1="4.22" x2="7.05" y2="7.05" />
      <line x1="16.95" y1="16.95" x2="19.78" y2="19.78" />
      <line x1="2" y1="12" x2="6" y2="12" />
      <line x1="18" y1="12" x2="22" y2="12" />
      <line x1="4.22" y1="19.78" x2="7.05" y2="16.95" />
      <line x1="16.95" y1="7.05" x2="19.78" y2="4.22" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )
}

export default function SettingsModal({ onClose }: Props) {
  const { theme, setTheme } = useTheme()
  const { locale, setLocale, t } = useLanguage()
  const backdropRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(44,36,22,0.4)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === backdropRef.current) onClose() }}
    >
      <div
        className="w-full max-w-xs rounded-2xl shadow-xl"
        style={{ backgroundColor: 'var(--bg-base)', border: '1px solid var(--border)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <h2 className="font-serif text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            {t('settings')}
          </h2>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full text-sm transition-colors"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--surface)')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = '')}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-5 space-y-5">

          {/* Language row */}
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm font-medium" style={{ color: 'var(--text-dim)' }}>
              {t('language')}
            </span>
            <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid var(--border)' }}>
              {(['en', 'nl'] as Locale[]).map((loc) => (
                <button
                  key={loc}
                  onClick={() => setLocale(loc)}
                  className="px-4 py-1.5 text-sm font-semibold transition-colors"
                  style={
                    locale === loc
                      ? { backgroundColor: 'var(--accent)', color: '#fff' }
                      : { backgroundColor: 'var(--surface)', color: 'var(--text-dim)' }
                  }
                >
                  {loc.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Theme row */}
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm font-medium" style={{ color: 'var(--text-dim)' }}>
              {t('theme')}
            </span>
            <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid var(--border)' }}>
              <button
                onClick={() => setTheme('light')}
                className="px-3 py-1.5 flex items-center gap-1.5 text-sm font-semibold transition-colors"
                style={
                  theme === 'light'
                    ? { backgroundColor: 'var(--accent)', color: '#fff' }
                    : { backgroundColor: 'var(--surface)', color: 'var(--text-dim)' }
                }
              >
                <SunIcon /> {t('light')}
              </button>
              <button
                onClick={() => setTheme('dark')}
                className="px-3 py-1.5 flex items-center gap-1.5 text-sm font-semibold transition-colors"
                style={
                  theme === 'dark'
                    ? { backgroundColor: 'var(--accent)', color: '#fff' }
                    : { backgroundColor: 'var(--surface)', color: 'var(--text-dim)' }
                }
              >
                <MoonIcon /> {t('dark')}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
