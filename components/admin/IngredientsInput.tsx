'use client'

interface Props {
  value: string[]
  onChange: (value: string[]) => void
}

export default function IngredientsInput({ value, onChange }: Props) {
  function update(index: number, text: string) {
    onChange(value.map((v, i) => (i === index ? text : v)))
  }

  function add() {
    onChange([...value, ''])
  }

  function remove(index: number) {
    onChange(value.filter((_, i) => i !== index))
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>, index: number) {
    if (e.key === 'Enter') {
      e.preventDefault()
      add()
    }
    if (e.key === 'Backspace' && value[index] === '' && value.length > 1) {
      e.preventDefault()
      remove(index)
    }
  }

  return (
    <div className="space-y-2">
      {value.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-terracotta/10 text-terracotta text-xs flex items-center justify-center flex-shrink-0 font-medium">
            {i + 1}
          </span>
          <input
            type="text"
            value={item}
            onChange={(e) => update(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, i)}
            placeholder={`Ingredient ${i + 1}`}
            className="input-base"
          />
          <button
            type="button"
            onClick={() => remove(i)}
            disabled={value.length === 1}
            className="text-ink-muted hover:text-red-500 transition-colors disabled:opacity-30 flex-shrink-0"
            aria-label="Remove ingredient"
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
        className="flex items-center gap-1.5 text-sm text-terracotta hover:text-terracotta-dark transition-colors font-medium mt-1"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
          <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        Add ingredient
      </button>
    </div>
  )
}
