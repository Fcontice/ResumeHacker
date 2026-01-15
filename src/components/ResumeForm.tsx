'use client'

import { FormEvent, useRef, useState } from 'react'

interface ResumeFormProps {
  onSubmit: (resume: string, jobTitle: string, jobPosting: string) => void
  isLoading: boolean
}

// Limits aligned with API validation (from CLAUDE.md)
const LIMITS = {
  jobTitle: { min: 2, max: 100 },
  resume: { min: 50, max: 15000 },
} as const

function getCounterStyle(current: number, max: number): string {
  const percentage = (current / max) * 100
  if (current > max) return 'text-red-600 font-medium'
  if (percentage >= 90) return 'text-amber-600'
  return 'text-gray-500'
}

function getValidationError(
  field: 'jobTitle' | 'resume',
  value: string,
  touched: boolean
): string | null {
  if (!touched) return null

  const trimmed = value.trim()
  const limit = LIMITS[field]

  if (trimmed.length === 0) {
    return field === 'jobTitle' ? 'Job title is required' : 'Resume is required'
  }
  if (trimmed.length < limit.min) {
    return `Minimum ${limit.min} characters required`
  }
  if (value.length > limit.max) {
    return `Maximum ${limit.max} characters exceeded`
  }
  return null
}

export function ResumeForm({ onSubmit, isLoading }: ResumeFormProps) {
  const [jobTitle, setJobTitle] = useState('')
  const [resume, setResume] = useState('')
  const [touched, setTouched] = useState({ jobTitle: false, resume: false })
  const jobPostingRef = useRef<HTMLTextAreaElement>(null)

  const jobTitleError = getValidationError('jobTitle', jobTitle, touched.jobTitle)
  const resumeError = getValidationError('resume', resume, touched.resume)

  const isValid =
    jobTitle.trim().length >= LIMITS.jobTitle.min &&
    jobTitle.length <= LIMITS.jobTitle.max &&
    resume.trim().length >= LIMITS.resume.min &&
    resume.length <= LIMITS.resume.max

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // Mark all as touched to show errors
    setTouched({ jobTitle: true, resume: true })

    const jobPosting = jobPostingRef.current?.value.trim()

    if (!isValid || !jobPosting) {
      return
    }

    onSubmit(resume.trim(), jobTitle.trim(), jobPosting)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <label
            htmlFor="jobTitle"
            className="block text-sm font-semibold text-gray-900 uppercase tracking-wide"
          >
            Target Job Title
          </label>
          <span
            className={`text-xs tabular-nums shrink-0 ${getCounterStyle(jobTitle.length, LIMITS.jobTitle.max)}`}
          >
            {jobTitle.length} / {LIMITS.jobTitle.max}
          </span>
        </div>
        <input
          id="jobTitle"
          type="text"
          value={jobTitle}
          onChange={(e) => setJobTitle(e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, jobTitle: true }))}
          placeholder="e.g., Senior Software Engineer"
          disabled={isLoading}
          maxLength={LIMITS.jobTitle.max + 10} // Allow slight overflow to show error
          aria-invalid={!!jobTitleError}
          aria-describedby={jobTitleError ? 'jobTitle-error' : undefined}
          className={`w-full px-4 py-3 text-base text-gray-900 placeholder-gray-400 bg-white border rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed transition-all ${
            jobTitleError ? 'border-red-400' : 'border-gray-300'
          }`}
        />
        {jobTitleError && (
          <p id="jobTitle-error" className="text-xs text-red-600" role="alert">
            {jobTitleError}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label
          htmlFor="jobPosting"
          className="block text-sm font-semibold text-gray-900 uppercase tracking-wide"
        >
          Job Posting
        </label>
        <textarea
          id="jobPosting"
          ref={jobPostingRef}
          placeholder="Paste the full job description here"
          rows={8}
          disabled={isLoading}
          required
          className="w-full px-4 py-3 text-sm text-gray-900 placeholder-gray-400 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none disabled:bg-gray-100 disabled:cursor-not-allowed transition-all"
        />
        <p className="text-xs text-gray-500">
          Copy the entire job posting. We extract keywords directly from it.
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <label
            htmlFor="resume"
            className="block text-sm font-semibold text-gray-900 uppercase tracking-wide"
          >
            Resume Text
          </label>
          <span
            className={`text-xs tabular-nums shrink-0 ${getCounterStyle(resume.length, LIMITS.resume.max)}`}
          >
            {resume.length.toLocaleString()} / {LIMITS.resume.max.toLocaleString()}
          </span>
        </div>
        <textarea
          id="resume"
          value={resume}
          onChange={(e) => setResume(e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, resume: true }))}
          placeholder="Paste your entire resume here (plain text)"
          rows={12}
          disabled={isLoading}
          aria-invalid={!!resumeError}
          aria-describedby={resumeError ? 'resume-error' : 'resume-hint'}
          className={`w-full px-4 py-3 text-sm text-gray-900 placeholder-gray-400 font-mono bg-white border rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none disabled:bg-gray-100 disabled:cursor-not-allowed transition-all ${
            resumeError ? 'border-red-400' : 'border-gray-300'
          }`}
        />
        {resumeError ? (
          <p id="resume-error" className="text-xs text-red-600" role="alert">
            {resumeError}
          </p>
        ) : (
          <p id="resume-hint" className="text-xs text-gray-500">
            Plain text only. Copy-paste from your resume file.
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading || !isValid}
        className="w-full px-6 py-3 bg-gray-900 text-white font-semibold text-sm rounded-lg hover:bg-gray-800 active:bg-gray-950 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors uppercase tracking-wide"
      >
        {isLoading ? 'Evaluating...' : 'Evaluate Resume'}
      </button>
    </form>
  )
}
