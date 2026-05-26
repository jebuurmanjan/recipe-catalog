'use client'
import { useState } from 'react'
import IngredientsInput from '@/components/admin/IngredientsInput'
import StepsInput from '@/components/admin/StepsInput'
import PasteModal from './PasteModal'

interface Props {
  ingredients: string[]
  steps: string[]
  isConcept: boolean
  saving: boolean
  error: string | null
  onUpdate: (fields: { ingredients?: string[]; steps?: string[]; isConcept?: boolean }) => void
  onBack: () => void
  onSubmit: () => void
}

export default function Step3({
  ingredients,
  steps,
  isConcept,
  saving,
  error,
  onUpdate,
  onBack,
  onSubmit,
}: Props) {
  const [pasteModal, setPasteModal] = useState<'ingredients' | 'steps' | null>(null)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl font-bold text-ink">Recipe</h2>
        <p className="text-ink-dim text-sm mt-1">Add the ingredients and instructions.</p>
      </div>

      {/* Ingredients */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm font-medium text-ink">Ingredients</p>
          <button
            type="button"
            onClick={() => setPasteModal('ingredients')}
            className="text-xs text-terracotta hover:underline"
          >
            Paste list
          </button>
        </div>
        <IngredientsInput value={ingredients} onChange={(v) => onUpdate({ ingredients: v })} />
      </div>

      {/* Steps */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm font-medium text-ink">Instructions</p>
          <button
            type="button"
            onClick={() => setPasteModal('steps')}
            className="text-xs text-terracotta hover:underline"
          >
            Paste instructions
          </button>
        </div>
        <StepsInput value={steps} onChange={(v) => onUpdate({ steps: v })} />
      </div>

      {/* Concept toggle */}
      <div className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3">
        <div>
          <p className="text-sm font-medium text-ink">Mark as concept</p>
          <p className="text-xs text-ink-muted mt-0.5">
            Concept recipes are hidden from the catalog by default
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={isConcept}
          onClick={() => onUpdate({ isConcept: !isConcept })}
          className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ${
            isConcept ? 'bg-terracotta' : 'bg-border'
          }`}
        >
          <span
            className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${
              isConcept ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <button type="button" onClick={onBack} className="btn-secondary">
          ← Back
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={saving}
          className="btn-primary disabled:opacity-50"
        >
          {saving ? 'Publishing…' : 'Publish recipe'}
        </button>
      </div>

      {/* Paste modal */}
      {pasteModal && (
        <PasteModal
          type={pasteModal}
          onApply={(items) => {
            if (pasteModal === 'ingredients') onUpdate({ ingredients: items })
            else onUpdate({ steps: items })
          }}
          onClose={() => setPasteModal(null)}
        />
      )}
    </div>
  )
}
