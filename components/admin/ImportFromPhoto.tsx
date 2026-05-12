'use client'
import { useState, useRef } from 'react'
import type { ParsedRecipe } from '@/types'

interface Props {
  onImport: (data: ParsedRecipe) => void
}

type Status = 'idle' | 'loading' | 'success' | 'error'

/** Resize image to max 1024px on the long edge, return base64 JPEG */
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
      if (!ctx) { reject(new Error('Canvas not available')); return }

      ctx.drawImage(img, 0, 0, width, height)

      // toDataURL returns "data:image/jpeg;base64,<data>"
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85)
      const data = dataUrl.split(',')[1]
      resolve({ data, mimeType: 'image/jpeg' })
    }

    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Failed to load image')) }
    img.src = url
  })
}

export default function ImportFromPhoto({ onImport }: Props) {
  const [status, setStatus] = useState<Status>('idle')
  const [message, setMessage] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    setStatus('loading')
    setMessage('')

    try {
      const { data, mimeType } = await resizeToBase64(file)

      const res = await fetch('/api/extract-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: data, mimeType }),
      })
      const json = await res.json()

      if (!res.ok || !json.parsed) {
        setStatus('error')
        setMessage(json.error ?? 'Could not extract a recipe from this image.')
        return
      }

      onImport(json.parsed)
      setStatus('success')
      setMessage('Recipe extracted! Review and adjust the fields below.')
    } catch {
      setStatus('error')
      setMessage('Network error — please check your connection and try again.')
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    // Reset input so the same file can be re-selected after an error
    e.target.value = ''
    if (file) handleFile(file)
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-4 space-y-3">
      <div className="flex items-center gap-2">
        {/* Camera icon */}
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden className="text-terracotta">
          <path d="M1 5.5A1.5 1.5 0 012.5 4h.879l.707-1.414A1 1 0 015 2h6a1 1 0 01.894.553L12.621 4H13.5A1.5 1.5 0 0115 5.5v7A1.5 1.5 0 0113.5 14h-11A1.5 1.5 0 011 12.5v-7z"
            stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" />
          <circle cx="8" cy="9" r="2.25" stroke="currentColor" strokeWidth="1.25" />
        </svg>
        <p className="text-sm font-semibold text-ink">Extract from photo</p>
        <span className="text-xs text-ink-muted ml-auto">AI-powered</span>
      </div>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={status === 'loading'}
        className="btn-secondary w-full flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {status === 'loading' ? (
          <>
            <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" aria-hidden />
            Extracting recipe…
          </>
        ) : (
          <>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path d="M7 1v8M4 6l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M1 10v2a1 1 0 001 1h10a1 1 0 001-1v-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            Select photo
          </>
        )}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="sr-only"
        aria-hidden
      />

      {status === 'success' && (
        <p className="text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
          ✓ {message}
        </p>
      )}
      {status === 'error' && (
        <div className="flex items-start gap-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          <span className="flex-1">{message}</span>
          <button
            type="button"
            onClick={() => setStatus('idle')}
            className="font-medium underline underline-offset-2 shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  )
}
