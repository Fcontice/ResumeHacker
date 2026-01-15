'use client'

import { getUsageRemaining, hasDayPass, getTimeUntilReset } from '@/lib/premium'

interface UsageBannerProps {
  onUpgradeClick: () => void
}

export function UsageBanner({ onUpgradeClick }: UsageBannerProps) {
  const isPremium = hasDayPass()
  const remaining = getUsageRemaining()

  if (isPremium) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3 mb-6">
        <p className="text-sm text-emerald-800">
          <span className="font-semibold">Day Pass Active</span> — Unlimited evaluations for 24 hours
        </p>
      </div>
    )
  }

  if (remaining === 0) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <p className="text-sm text-amber-800 font-semibold">
              Daily limit reached
            </p>
            <p className="text-xs text-amber-700">
              Resets in {getTimeUntilReset()}
            </p>
          </div>
          <button
            onClick={onUpgradeClick}
            className="px-4 py-2 bg-gray-900 text-white text-xs font-semibold rounded-md hover:bg-gray-800 transition-colors uppercase tracking-wide"
          >
            Get Day Pass
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-100 border border-gray-200 rounded-lg px-4 py-3 mb-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-sm text-gray-700">
          <span className="font-semibold">{remaining} of 2</span> free evaluations remaining today
        </p>
        <button
          onClick={onUpgradeClick}
          className="text-xs text-gray-600 hover:text-gray-900 underline transition-colors"
        >
          Get unlimited
        </button>
      </div>
    </div>
  )
}
