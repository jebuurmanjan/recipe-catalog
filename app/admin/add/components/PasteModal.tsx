'use client'
import { useState } from 'react'

interface Props {
  type: 'ingredients' | 'steps'
  onApply: (items: string[]) => void
  onClose: () => void
}

export default function PasteModal({ type, onApply, onClose }: Props) {
  const [text, setText] = useState('')

  function handleApply() {
    let items: string[]
    if (type === 'ingredients') {
      items = text.split('\n').map((s) => s.trim()).filter(Boolean)
    } else {
      const byDouble = text.split('\n\n').map((s) => s.trim()).filter(Boolean)
      items = byDouble.length > 1 ? byDouble : text.split('\n').map((s) => s.trim()).filter(Boolean)
    }
    if (items.length > 0) {
      onApply(items)
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-cream w-full max-w-lg rounded-2xl shadow-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl font-semibold text-ink">
            Paste {type === 'ingredients' ? 'ingredients' : 'instructions'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-ink-muted hover:text-ink text-2xl leading-none w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface transition-colors"
          >
            ×
          </button>
        </div>

        <p className="text-sm text-ink-dim">
          {type === 'ingredients'
            ? 'Paste one ingredient per line.'
            : 'Paste instructions separated by blank lines, or one per line.'}
        </p>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={
            type === 'ingredients'
              ? '2 cups flour\n1 tsp salt\n3 eggs\n...'
              : 'Preheat oven to 180°C.\n\nMix the dry ingredients together.\n\nPour into a greased tin...'
          }
          rows={10}
          className="input-base resize-y w-full font-mono text-xs"
          autoFocus
        />

        <div className="flex gap-2 justify-end">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={!text.trim()}
            className="btn-primary disabled:opacity-50"
          >
            Paste &amp; apply
          </button>
        </div>
      </div>
    </div>
  )
}
