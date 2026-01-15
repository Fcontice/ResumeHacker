import type { Verdict } from '@/lib/types'

interface VerdictCardProps {
  verdict: Verdict
  atsScore: number
}

const verdictConfig = {
  Pass: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-300',
    text: 'text-emerald-900',
    icon: '✓',
    label: 'Your resume is likely to pass ATS filters',
  },
  Borderline: {
    bg: 'bg-amber-50',
    border: 'border-amber-300',
    text: 'text-amber-900',
    icon: '!',
    label: 'Your resume may pass ATS filters with improvements',
  },
  Weak: {
    bg: 'bg-red-50',
    border: 'border-red-300',
    text: 'text-red-900',
    icon: '✕',
    label: 'Your resume is unlikely to pass ATS filters',
  },
}

export function VerdictCard({ verdict, atsScore }: VerdictCardProps) {
  const config = verdictConfig[verdict]

  return (
    <div className="space-y-6">
      {/* Verdict status region - announces to screen readers when content updates */}
      <div
        role="status"
        aria-live="polite"
        aria-label={`Verdict: ${verdict}. ${config.label}`}
        className={`rounded-lg border-2 px-8 py-10 text-center ${config.bg} ${config.border}`}
      >
        {/* Icon + verdict text - icon is visible for color-blind users */}
        <div className="flex items-center justify-center gap-3">
          <span
            className={`text-3xl font-bold ${config.text}`}
            aria-hidden="true"
          >
            {config.icon}
          </span>
          <h2 className={`text-4xl font-bold ${config.text}`}>
            {verdict.toUpperCase()}
          </h2>
        </div>
        {/* Visible description for all users */}
        <p className={`mt-3 text-sm ${config.text}`}>
          {config.label}
        </p>
      </div>

      {/* Score section */}
      <div className="text-center" aria-label={`ATS Score: ${atsScore} out of 100`}>
        <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider">
          ATS Score
        </p>
        <p className="text-5xl font-bold text-gray-900 mt-2">
          {atsScore}
          <span className="text-xl text-gray-400 ml-1 font-normal" aria-hidden="true">/100</span>
        </p>
      </div>
    </div>
  )
}
