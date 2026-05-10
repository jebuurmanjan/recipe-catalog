'use client'
import { useState, useRef, DragEvent } from 'react'
import Image from 'next/image'

interface Props {
  value: string
  onChange: (url: string) => void
}

export default function ImageUpload({ value, onChange }: Props) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function uploadFile(file: File) {
    setError(null)
    setUploading(true)
    try {
      const form = new FormData()
      form.append('file', file)

      const res = await fetch('/api/upload', { method: 'POST', body: form })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Upload failed')
        return
      }
      onChange(data.url)
    } catch {
      setError('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) uploadFile(file)
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) uploadFile(file)
  }

  function handleDragOver(e: DragEvent) {
    e.preventDefault()
    setDragOver(true)
  }

  return (
    <div className="space-y-3">
      {/* Preview */}
      {value && (
        <div className="relative rounded-xl overflow-hidden aspect-video bg-surface-2">
          <Image src={value} alt="Recipe photo" fill className="object-cover" sizes="600px" />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-ink/60 text-white hover:bg-ink/80 transition-colors flex items-center justify-center"
            aria-label="Remove photo"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
              <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      )}

      {/* Drop zone */}
      {!value && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={() => setDragOver(false)}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors ${
            dragOver
              ? 'border-terracotta bg-terracotta/5'
              : 'border-border hover:border-terracotta/40 hover:bg-surface'
          }`}
        >
          {uploading ? (
            <p className="text-sm text-ink-dim">Uploading…</p>
          ) : (
            <>
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden className="text-border">
                <path d="M16 22V10M10 16l6-6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <rect x="3" y="3" width="26" height="26" rx="5" stroke="currentColor" strokeWidth="2" />
              </svg>
              <p className="text-sm text-ink-dim">
                <span className="text-terracotta font-medium">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-ink-muted">JPEG, PNG, WebP, GIF — up to 5 MB</p>
            </>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleChange}
        className="hidden"
        aria-hidden
      />

      {/* Manual URL input */}
      <div>
        <label className="label">Or paste an image URL</label>
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://example.com/photo.jpg"
          className="input-base"
        />
      </div>

      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}
    </div>
  )
}
