'use client'

import { useState } from 'react'

interface DayPassModalProps {
  isOpen: boolean
  onClose: () => void
  showLimitReached?: boolean
}

export function DayPassModal({ isOpen, onClose, showLimitReached = false }: DayPassModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  async function handlePurchase() {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ returnPath: '/results' }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to start checkout')
      }

      // Redirect to Stripe Checkout
      window.location.href = data.checkoutUrl
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="relative bg-white rounded-lg max-w-md w-full p-8 space-y-6">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            {showLimitReached ? 'Daily limit reached' : 'Need more evaluations?'}
          </h2>
          <p className="text-sm text-gray-600 mt-2">
            {showLimitReached
              ? 'You\'ve used your 3 free evaluations today. Get a Day Pass for unlimited access.'
              : 'Get a Day Pass to evaluate as many resumes as you want for 24 hours.'}
          </p>
        </div>

        {/* Benefits */}
        <ul className="space-y-2">
          <li className="flex items-start gap-2 text-sm text-gray-700">
            <svg className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Unlimited resume evaluations for 24 hours
          </li>
          <li className="flex items-start gap-2 text-sm text-gray-700">
            <svg className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Test multiple resume versions against the same job
          </li>
          <li className="flex items-start gap-2 text-sm text-gray-700">
            <svg className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Compare your resume against multiple job postings
          </li>
        </ul>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded px-3 py-2">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* CTA */}
        <div className="space-y-3">
          <button
            onClick={handlePurchase}
            disabled={isLoading}
            className="w-full px-4 py-3 bg-gray-900 text-white font-semibold text-sm rounded-lg hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors uppercase tracking-wide"
          >
            {isLoading ? 'Loading...' : 'Get Day Pass — $4.99'}
          </button>
          <button
            onClick={onClose}
            className="w-full text-gray-500 text-sm hover:text-gray-700 transition-colors"
          >
            {showLimitReached ? 'I\'ll come back tomorrow' : 'No thanks'}
          </button>
        </div>

        {/* Trust signals */}
        <p className="text-xs text-gray-400 text-center">
          One-time payment. No account required. Secure checkout by Stripe.
        </p>
      </div>
    </div>
  )
}
