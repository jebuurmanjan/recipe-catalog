'use client'
import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { type Locale, type TranslationKey, translate } from '@/lib/translations'

interface LanguageContextValue {
  locale: Locale
  setLocale: (l: Locale) => void
  t: (key: TranslationKey, subs?: Record<string, string | number>) => string
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window === 'undefined') return 'en'
    const stored = localStorage.getItem('locale')
    return stored === 'nl' ? 'nl' : 'en'
  })

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l)
    try {
      localStorage.setItem('locale', l)
    } catch {}
  }, [])

  const t = useCallback(
    (key: TranslationKey, subs?: Record<string, string | number>) =>
      translate(locale, key, subs),
    [locale]
  )

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}
