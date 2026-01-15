'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { VerdictCard } from '@/components/VerdictCard'
import { KeywordList } from '@/components/KeywordList'
import { UsageBanner } from '@/components/UsageBanner'
import { DayPassModal } from '@/components/DayPassModal'
import { storeDayPassToken, canEvaluate } from '@/lib/premium'
import type { EvaluationResult } from '@/lib/types'

function ResultsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [result, setResult] = useState<EvaluationResult | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)

  useEffect(() => {
    // Load evaluation result
    const stored = sessionStorage.getItem('evaluationResult')
    if (!stored) {
      router.push('/evaluate')
      return
    }
    setResult(JSON.parse(stored))

    // Check for payment return
    const sessionId = searchParams.get('session_id')
    const canceled = searchParams.get('canceled')

    if (sessionId) {
      verifyPayment(sessionId)
    } else if (canceled) {
      // Clean URL without reload
      window.history.replaceState({}, '', '/results')
    }
  }, [router, searchParams])

  async function verifyPayment(sessionId: string) {
    try {
      const response = await fetch(`/api/verify-payment?session_id=${sessionId}`)
      const data = await response.json()

      if (data.success && data.dayPassToken) {
        storeDayPassToken(data.dayPassToken)
        setPaymentSuccess(true)
        // Clean URL
        window.history.replaceState({}, '', '/results')
      }
    } catch (error) {
      console.error('Payment verification failed:', error)
    }
  }

  if (!result) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-12">
        <p className="text-gray-600">Loading results...</p>
      </main>
    )
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <div className="space-y-8">
        {paymentSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3">
            <p className="text-sm text-emerald-800 font-semibold">
              Day Pass activated! Unlimited evaluations for 24 hours.
            </p>
          </div>
        )}

        <UsageBanner onUpgradeClick={() => setShowModal(true)} />

        <VerdictCard verdict={result.verdict} atsScore={result.atsScore} />

        <KeywordList keywords={result.keywordGaps} />

        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
            Top 3 Improvements
          </h2>
          <div className="space-y-3">
            {result.improvementSuggestions.map((improvement, i) => (
              <div key={i} className="border-l-2 border-gray-300 pl-4">
                <p className="text-sm text-gray-800">
                  <span className="font-semibold">{i + 1}.</span> {improvement}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-6 border-t border-gray-200">
          {canEvaluate() ? (
            <Link
              href="/evaluate"
              className="block w-full text-center px-6 py-3 bg-gray-900 text-white font-semibold text-sm rounded-lg hover:bg-gray-800 transition-colors uppercase tracking-wide"
            >
              Evaluate Another Resume
            </Link>
          ) : (
            <button
              onClick={() => setShowModal(true)}
              className="w-full px-6 py-3 bg-gray-900 text-white font-semibold text-sm rounded-lg hover:bg-gray-800 transition-colors uppercase tracking-wide"
            >
              Get Day Pass to Evaluate More
            </button>
          )}
        </div>
      </div>

      <DayPassModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        showLimitReached={!canEvaluate()}
      />
    </main>
  )
}

export default function ResultsPage() {
  return (
    <Suspense fallback={
      <main className="max-w-2xl mx-auto px-4 py-12">
        <p className="text-gray-600">Loading results...</p>
      </main>
    }>
      <ResultsContent />
    </Suspense>
  )
}
