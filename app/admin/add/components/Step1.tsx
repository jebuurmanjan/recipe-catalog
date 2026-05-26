'use client'
import { useState, useRef } from 'react'
import type { ParsedRecipe } from '@/types'

interface Props {
  onImport: (data: ParsedRecipe) => void
  onManual: () => void
}

async function resizeToBase64(file: File): Promise<{ data: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      const MAX = 1024
      let { width, height } = img
      if (width > MAX || height > MAX) {
        if (width >= height) {
          height = Math.round((height * MAX) / width)
          width = MAX
        } else {
          width = Math.round((width * MAX) / height)
          height = MAX
        }
      }
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      if (!ctx) { reject(new Error('Canvas unavailable')); return }
      ctx.drawImage(img, 0, 0, width, height)
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85)
      resolve({ data: dataUrl.split(',')[1], mimeType: 'image/jpeg' })
    }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Failed to load image')) }
    img.src = url
  })
}

function Spinner() {
  return (
    <span
      className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"
      aria-hidden
    />
  )
}

export default function Step1({ onImport, onManual }: Props) {
  const [urlInput, setUrlInput] = useState('')
  const [urlLoading, setUrlLoading] = useState(false)
  const [urlError, setUrlError] = useState('')
  const [photoLoading, setPhotoLoading] = useState(false)
  const [photoError, setPhotoError] = useState('')
  const photoRef = useRef<HTMLInputElement>(null)

  async function handleUrlImport() {
    const url = urlInput.trim()
    if (!url) return
    setUrlLoading(true)
    setUrlError('')
    try {
      const res = await fetch('/api/fetch-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      const data = await res.json()
      if (!res.ok || !data.parsed) {
        setUrlError(data.error ?? 'Could not parse a recipe from this URL.')
        return
      }
      onImport(data.parsed)
    } catch {
      setUrlError('Network error — please check your connection.')
    } finally {
      setUrlLoading(false)
    }
  }

  async function handlePhotoFile(file: File) {
    setPhotoLoading(true)
    setPhotoError('')
    try {
      const { data, mimeType } = await resizeToBase64(file)
      const res = await fetch('/api/extract-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: data, mimeType }),
      })
      const json = await res.json()
      if (!res.ok || !json.parsed) {
        setPhotoError(json.error ?? 'Could not extract a recipe from this image.')
        return
      }
      onImport(json.parsed)
    } catch {
      setPhotoError('Network error — please try again.')
    } finally {
      setPhotoLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-serif text-2xl font-bold text-ink">
          How would you like to add this recipe?
        </h2>
        <p className="text-ink-dim text-sm mt-1">
          Import from a website, snap a photo, or start from scratch.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 mt-2">
        {/* URL Import */}
        <div className="rounded-2xl border border-border bg-surface p-6 space-y-4">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-terracotta/10 flex items-center justify-center flex-shrink-0">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-terracotta">
                <path
                  d="M7.5 12.5l5-5M8.5 6.5l1.5-1.5a3.536 3.536 0 015 5l-1.5 1.5M11.5 13.5L10 15a3.536 3.536 0 01-5-5l1.5-1.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            <div>
              <p className="font-semibold text-ink">Import from URL</p>
              <p className="text-xs text-ink-muted">Reads JSON-LD recipe data automatically</p>
            </div>
          </div>
          <div className="flex gap-2">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleUrlImport()}
              placeholder="https://www.bbcgoodfood.com/recipes/…"
              className="input-base flex-1"
            />
            <button
              type="button"
              onClick={handleUrlImport}
              disabled={!urlInput.trim() || urlLoading}
              className="btn-primary whitespace-nowrap disabled:opacity-50"
            >
              {urlLoading ? (
                <span className="flex items-center gap-2">
                  <Spinner /> Fetching…
                </span>
              ) : (
                'Import'
              )}
            </button>
          </div>
          {urlError && (
            <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {urlError}
            </p>
          )}
        </div>

        {/* Photo */}
        <div className="rounded-2xl border border-border bg-surface p-6 space-y-4">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-terracotta/10 flex items-center justify-center flex-shrink-0">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-terracotta">
                <path
                  d="M2 7a2 2 0 012-2h1.5l1-2h7l1 2H16a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V7z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
                <circle cx="10" cy="11" r="2.5" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </span>
            <div>
              <p className="font-semibold text-ink">Extract from photo</p>
              <p className="text-xs text-ink-muted">AI-powered — takes 10–20 seconds</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => photoRef.current?.click()}
            disabled={photoLoading}
            className="btn-secondary w-full flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {photoLoading ? (
              <>
                <Spinner /> Extracting recipe…
              </>
            ) : (
              'Select photo'
            )}
          </button>
          <input
            ref={photoRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0]
              e.target.value = ''
              if (file) handlePhotoFile(file)
            }}
          />
          {photoError && (
            <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {photoError}
            </p>
          )}
        </div>

        {/* Manual */}
        <div className="rounded-2xl border border-border bg-surface p-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-terracotta/10 flex items-center justify-center flex-shrink-0">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-terracotta">
                <path
                  d="M14.5 3.5l2 2-9 9H5v-2.5l9.5-8.5zM13 5l2 2"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <div>
              <p className="font-semibold text-ink">Enter manually</p>
              <p className="text-xs text-ink-muted">Start from scratch</p>
            </div>
          </div>
          <button type="button" onClick={onManual} className="btn-secondary whitespace-nowrap">
            Start →
          </button>
        </div>
      </div>
    </div>
  )
}
