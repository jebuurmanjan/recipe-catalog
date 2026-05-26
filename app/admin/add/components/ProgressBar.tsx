'use client'

interface Props {
  step: 1 | 2 | 3
  completedSteps: number[]
  onStepClick: (step: number) => void
}

const STEPS = ['Import', 'Details', 'Recipe']

export default function ProgressBar({ step, completedSteps, onStepClick }: Props) {
  const progress = ((step - 1) / 2) * 100

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        {STEPS.map((label, i) => {
          const num = i + 1
          const isCompleted = completedSteps.includes(num)
          const isCurrent = num === step
          const isClickable = isCompleted && num < step

          return (
            <button
              key={num}
              type="button"
              onClick={() => isClickable && onStepClick(num)}
              disabled={!isClickable}
              className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                isClickable ? 'cursor-pointer hover:text-terracotta' : 'cursor-default'
              } ${isCurrent ? 'text-ink' : isCompleted ? 'text-ink-dim' : 'text-ink-muted'}`}
            >
              <span
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border transition-colors ${
                  isCompleted
                    ? 'bg-terracotta border-terracotta text-white'
                    : isCurrent
                    ? 'border-terracotta text-terracotta bg-terracotta/10'
                    : 'border-border text-ink-muted bg-surface'
                }`}
              >
                {isCompleted ? '✓' : num}
              </span>
              <span className="hidden sm:inline">{label}</span>
            </button>
          )
        })}
      </div>
      <div className="h-1 bg-border rounded-full overflow-hidden">
        <div
          className="h-full bg-terracotta rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
