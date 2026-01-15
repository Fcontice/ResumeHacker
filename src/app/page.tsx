import Link from 'next/link'

export default function Home() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-16 sm:py-24">
      <div className="text-center space-y-8">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900">
          Is My Resume Good Enough?
        </h1>

        <p className="text-lg text-gray-600 max-w-md mx-auto">
          Find out if your resume will pass ATS filters.
          No fluff. No templates. Just the truth.
        </p>

        <div className="pt-4">
          <Link
            href="/evaluate"
            className="inline-block px-8 py-4 bg-gray-900 text-white font-semibold text-sm rounded-lg hover:bg-gray-800 transition-colors uppercase tracking-wide"
          >
            Evaluate My Resume
          </Link>
          <p className="mt-4 text-xs text-gray-500 tracking-wide">
            No sign-up. No storage. No BS.
          </p>
        </div>

        <div className="pt-8 border-t border-gray-200 text-sm text-gray-500 space-y-2">
          <p>Paste your resume. Enter a job title. Get a verdict.</p>
          <p>Takes less than 60 seconds.</p>
        </div>
      </div>
    </main>
  )
}
