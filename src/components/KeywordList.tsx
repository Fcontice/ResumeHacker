import type { KeywordGap } from '@/lib/types'

interface KeywordListProps {
  keywords: KeywordGap[]
}

const statusStyles = {
  missing: {
    badge: 'bg-red-100 text-red-800 border-red-200',
    label: 'Missing',
  },
  weak: {
    badge: 'bg-amber-100 text-amber-800 border-amber-200',
    label: 'Weak',
  },
}

export function KeywordList({ keywords }: KeywordListProps) {
  if (keywords.length === 0) {
    return null
  }

  const missingKeywords = keywords.filter((k) => k.status === 'missing')
  const weakKeywords = keywords.filter((k) => k.status === 'weak')

  return (
    <div className="space-y-4">
      {missingKeywords.length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-300 px-6 py-4 rounded">
          <p className="text-sm font-semibold text-red-900 uppercase tracking-wider mb-3">
            Missing Keywords
          </p>
          <p className="text-xs text-red-700 mb-3">
            Not found in your resume
          </p>
          <div className="flex flex-wrap gap-2">
            {missingKeywords.map((item, i) => (
              <code
                key={`missing-${i}`}
                className="text-xs bg-white text-red-800 px-2 py-1 rounded border border-red-200 font-mono"
              >
                {item.keyword}
              </code>
            ))}
          </div>
        </div>
      )}

      {weakKeywords.length > 0 && (
        <div className="bg-amber-50 border-l-4 border-amber-300 px-6 py-4 rounded">
          <p className="text-sm font-semibold text-amber-900 uppercase tracking-wider mb-3">
            Weak Keywords
          </p>
          <p className="text-xs text-amber-700 mb-3">
            Present but vague or lacking context
          </p>
          <div className="flex flex-wrap gap-2">
            {weakKeywords.map((item, i) => (
              <code
                key={`weak-${i}`}
                className="text-xs bg-white text-amber-800 px-2 py-1 rounded border border-amber-200 font-mono"
              >
                {item.keyword}
              </code>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
