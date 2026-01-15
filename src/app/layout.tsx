import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Is My Resume Good Enough?',
  description: 'Get an honest ATS evaluation of your resume in under 60 seconds.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-stone-50 text-gray-900 antialiased">
        {children}
      </body>
    </html>
  )
}
