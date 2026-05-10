'use client'

interface Props {
  value: string[]
  onChange: (value: string[]) => void
}

export default function StepsInput({ value, onChange }: Props) {
  function update(index: number, text: string) {
    onChange(value.map((v, i) => (i === index ? text : v)))
  }

  function add() {
    onChange([...value, ''])
  }

  function remove(index: number) {
    onChange(value.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-3">
      {value.map((step, i) => (
        <div key={i} className="flex items-start gap-2">
          <span className="mt-2.5 w-6 h-6 rounded-full bg-terracotta/10 text-terracotta text-xs flex items-center justify-center flex-shrink-0 font-semibold">
            {i + 1}
          </span>
          <textarea
            value={step}
            onChange={(e) => update(i, e.target.value)}
            placeholder={`Step ${i + 1} — describe what to do`}
            rows={2}
            className="input-base resize-y min-h-[4rem]"
          />
          <button
            type="button"
            onClick={() => remove(i)}
            disabled={value.length === 1}
            className="mt-2.5 text-ink-muted hover:text-red-500 transition-colors disabled:opacity-30 flex-shrink-0"
            aria-label="Remove step"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M2 8h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="flex items-center gap-1.5 text-sm text-terracotta hover:text-terracotta-dark transition-colors font-medium"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
          <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        Add step
      </button>
    </div>
  )
}
