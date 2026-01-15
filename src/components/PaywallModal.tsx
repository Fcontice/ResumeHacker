'use client'

interface PaywallModalProps {
  isOpen: boolean
  onClose: () => void
}

export function PaywallModal({ isOpen, onClose }: PaywallModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6 space-y-4">
        <h2 className="text-xl font-bold text-gray-900">
          Want More Detail?
        </h2>

        <p className="text-sm text-gray-600">
          Get a comprehensive breakdown with specific line-by-line suggestions.
        </p>

        <div className="space-y-3 pt-2">
          <button
            className="w-full px-4 py-3 bg-gray-900 text-white font-semibold text-sm rounded-lg hover:bg-gray-800 transition-colors"
          >
            Upgrade for $5
          </button>

          <button
            onClick={onClose}
            className="w-full px-4 py-2 text-gray-600 text-sm hover:text-gray-900 transition-colors"
          >
            No thanks, I'm good
          </button>
        </div>

        <p className="text-xs text-gray-400 text-center">
          Your resume is not stored.
        </p>
      </div>
    </div>
  )
}
