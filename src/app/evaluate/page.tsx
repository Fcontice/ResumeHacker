'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ResumeForm } from '@/components/ResumeForm'
import { UsageBanner } from '@/components/UsageBanner'
import { DayPassModal } from '@/components/DayPassModal'
import { canEvaluate, incrementDailyUsage, hasDayPass, getDayPassToken } from '@/lib/premium'

export default function EvaluatePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [canSubmit, setCanSubmit] = useState(true)

  // Check usage on mount
  useEffect(() => {
    setCanSubmit(canEvaluate())
  }, [])

  const handleSubmit = async (resume: string, jobTitle: string, jobPosting: string) => {
    // Re-check usage in case it changed
    if (!canEvaluate()) {
      setShowModal(true)
      return
    }

    setIsLoading(true)
    setError(null)

    // Set up 30-second timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000)

    try {
      // Build headers with optional Day Pass token
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      const dayPassToken = getDayPassToken()
      if (dayPassToken) {
        headers['Authorization'] = `Bearer ${dayPassToken}`
      }

      const response = await fetch('/api/evaluate', {
        method: 'POST',
        headers,
        body: JSON.stringify({ resumeText: resume, jobTitle, jobPosting }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || 'Evaluation failed')
      }

      const result = await response.json()

      // Increment usage only for free users (after successful evaluation)
      if (!hasDayPass()) {
        incrementDailyUsage()
      }

      // Store result in sessionStorage and navigate
      sessionStorage.setItem('evaluationResult', JSON.stringify(result))
      router.push('/results')
    } catch (err) {
      clearTimeout(timeoutId)

      // Differentiate timeout from other errors
      if (err instanceof Error && err.name === 'AbortError') {
        setError('Request timed out. Try again.')
      } else {
        setError(err instanceof Error ? err.message : 'Something went wrong')
      }
      setIsLoading(false)
    }
  }

  const handleUpgradeClick = () => {
    setShowModal(true)
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Evaluate Your Resume
          </h1>
          <p className="mt-2 text-gray-600">
            Paste the job posting and your resume. We compare them directly.
          </p>
        </div>

        <UsageBanner onUpgradeClick={handleUpgradeClick} />

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <ResumeForm
          onSubmit={handleSubmit}
          isLoading={isLoading || !canSubmit}
        />

        {!canSubmit && !isLoading && (
          <div className="text-center py-4">
            <button
              onClick={handleUpgradeClick}
              className="px-6 py-3 bg-gray-900 text-white font-semibold text-sm rounded-lg hover:bg-gray-800 transition-colors uppercase tracking-wide"
            >
              Get Day Pass to Continue
            </button>
          </div>
        )}

        {isLoading && (
          <div className="text-center py-8">
            <div className="flex justify-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse" />
              <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse delay-100" />
              <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse delay-200" />
            </div>
            <p className="text-sm text-gray-600">
              Comparing your resume against the job posting...
            </p>
          </div>
        )}
      </div>

      <DayPassModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          setCanSubmit(canEvaluate())
        }}
        showLimitReached={!canEvaluate()}
      />
    </main>
  )
}
