'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ProgressBar from './ProgressBar'
import Step1 from './Step1'
import Step2 from './Step2'
import Step3 from './Step3'
import type { Tag, Category, ParsedRecipe } from '@/types'

const DRAFT_KEY = 'recipe-draft'

interface FormState {
  title: string
  description: string
  ingredients: string[]
  steps: string[]
  imageUrl: string
  sourceUrl: string
  serves: string
  prepTime: string
  isConcept: boolean
  selectedTags: string[]
  selectedCategories: string[]
}

const DEFAULT_FORM: FormState = {
  title: '',
  description: '',
  ingredients: [''],
  steps: [''],
  imageUrl: '',
  sourceUrl: '',
  serves: '',
  prepTime: '',
  isConcept: false,
  selectedTags: [],
  selectedCategories: [],
}

interface Props {
  initialTags: Tag[]
  categories: Category[]
}

export default function AddRecipeWizard({ initialTags, categories }: Props) {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [form, setForm] = useState<FormState>(DEFAULT_FORM)
  const [allTags, setAllTags] = useState<Tag[]>(initialTags)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasDraft, setHasDraft] = useState(false)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Restore draft on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY)
      if (raw) {
        const draft = JSON.parse(raw) as Partial<FormState>
        setForm((prev) => ({ ...prev, ...draft }))
        setHasDraft(true)
      }
    } catch {
      // ignore
    }
  }, [])

  // Debounced draft save
  const saveDraft = useCallback((state: FormState) => {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(state))
        setHasDraft(true)
      } catch {
        // ignore
      }
    }, 800)
  }, [])

  function updateForm(fields: Partial<FormState>) {
    setForm((prev) => {
      const next = { ...prev, ...fields }
      saveDraft(next)
      return next
    })
  }

  function markCompleted(stepNum: number) {
    setCompletedSteps((prev) => (prev.includes(stepNum) ? prev : [...prev, stepNum]))
  }

  function advanceTo(s: 1 | 2 | 3) {
    markCompleted(step)
    setStep(s)
  }

  function goBack() {
    if (step === 2) setStep(1)
    else if (step === 3) setStep(2)
  }

  function goToStep(s: number) {
    setStep(s as 1 | 2 | 3)
  }

  function handleImport(data: ParsedRecipe) {
    updateForm({
      title: data.title ?? form.title,
      description: data.description ?? form.description,
      ingredients: data.ingredients?.length ? data.ingredients : form.ingredients,
      steps: data.steps?.length ? data.steps : form.steps,
      imageUrl: data.image_url ?? form.imageUrl,
      sourceUrl: data.source_url ?? form.sourceUrl,
    })
    advanceTo(2)
  }

  async function handleCreateTag(name: string): Promise<Tag | null> {
    const res = await fetch('/api/tags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    })
    const data = await res.json()
    if (!res.ok) return null
    const newTag = data.tag as Tag
    setAllTags((prev) => [...prev, newTag].sort((a, b) => a.name.localeCompare(b.name)))
    return newTag
  }

  async function handleSubmit() {
    if (!form.title.trim()) {
      setError('Title is required')
      return
    }

    setSaving(true)
    setError(null)

    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        ingredients: form.ingredients.filter((s) => s.trim()),
        steps: form.steps.filter((s) => s.trim()),
        image_url: form.imageUrl || null,
        source_url: form.sourceUrl.trim() || null,
        serves: form.serves.trim() || null,
        prep_time: form.prepTime.trim() || null,
        tagIds: form.selectedTags,
        categoryIds: form.selectedCategories,
        is_concept: form.isConcept,
      }

      const res = await fetch('/api/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong')
        return
      }

      try {
        localStorage.removeItem(DRAFT_KEY)
      } catch {
        // ignore
      }

      router.push(`/recipe/${data.recipe.slug}`)
      router.refresh()
    } catch {
      setError('Network error — please try again.')
    } finally {
      setSaving(false)
    }
  }

  function clearDraft() {
    try {
      localStorage.removeItem(DRAFT_KEY)
    } catch {
      // ignore
    }
    setForm(DEFAULT_FORM)
    setHasDraft(false)
    setStep(1)
    setCompletedSteps([])
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Nav */}
      <nav className="border-b border-border">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-sm text-ink-dim hover:text-terracotta transition-colors">
              ← Catalog
            </Link>
            <span className="text-border">·</span>
            <h1 className="font-serif text-lg font-semibold text-ink">New recipe</h1>
          </div>
          {hasDraft && (
            <button
              type="button"
              onClick={clearDraft}
              className="text-xs text-ink-muted hover:text-red-500 transition-colors"
            >
              Clear draft
            </button>
          )}
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <ProgressBar step={step} completedSteps={completedSteps} onStepClick={goToStep} />

        {step === 1 && <Step1 onImport={handleImport} onManual={() => advanceTo(2)} />}

        {step === 2 && (
          <Step2
            title={form.title}
            description={form.description}
            imageUrl={form.imageUrl}
            sourceUrl={form.sourceUrl}
            serves={form.serves}
            prepTime={form.prepTime}
            selectedCategories={form.selectedCategories}
            selectedTags={form.selectedTags}
            allTags={allTags}
            categories={categories}
            onUpdate={updateForm}
            onAddTag={handleCreateTag}
            onNext={() => advanceTo(3)}
            onBack={goBack}
          />
        )}

        {step === 3 && (
          <Step3
            ingredients={form.ingredients}
            steps={form.steps}
            isConcept={form.isConcept}
            saving={saving}
            error={error}
            onUpdate={updateForm}
            onBack={goBack}
            onSubmit={handleSubmit}
          />
        )}
      </div>
    </div>
  )
}
