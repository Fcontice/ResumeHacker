import type { EvaluationRequest, EvaluationResult, Verdict, KeywordStatus } from './types'

const MAX_RESUME_LENGTH = 15000
const MIN_RESUME_LENGTH = 50
const MAX_JOB_TITLE_LENGTH = 100
const MIN_JOB_TITLE_LENGTH = 2
const MAX_JOB_POSTING_LENGTH = 20000
const MIN_JOB_POSTING_LENGTH = 100

const VALID_VERDICTS: Verdict[] = ['Pass', 'Borderline', 'Weak']
const VALID_STATUSES: KeywordStatus[] = ['missing', 'weak']

interface ValidationResult {
  valid: boolean
  error?: string
}

/**
 * Validates evaluation request input
 * Enforces max resume length and sanitizes input
 */
export function validateInput(input: unknown): ValidationResult {
  if (!input || typeof input !== 'object') {
    return { valid: false, error: 'Invalid request body' }
  }

  const body = input as Record<string, unknown>

  // Support both old and new field names for backwards compatibility
  const resumeText = body.resumeText ?? body.resume
  const jobTitle = body.jobTitle
  const jobPosting = body.jobPosting

  if (!resumeText || typeof resumeText !== 'string') {
    return { valid: false, error: 'Resume text is required' }
  }

  if (!jobTitle || typeof jobTitle !== 'string') {
    return { valid: false, error: 'Job title is required' }
  }

  if (!jobPosting || typeof jobPosting !== 'string') {
    return { valid: false, error: 'Job posting is required' }
  }

  const trimmedResume = resumeText.trim()
  const trimmedJobTitle = jobTitle.trim()
  const trimmedJobPosting = jobPosting.trim()

  if (trimmedResume.length < MIN_RESUME_LENGTH) {
    return { valid: false, error: `Resume too short (min ${MIN_RESUME_LENGTH} characters)` }
  }

  if (trimmedJobTitle.length < MIN_JOB_TITLE_LENGTH) {
    return { valid: false, error: `Job title too short (min ${MIN_JOB_TITLE_LENGTH} characters)` }
  }

  if (trimmedJobPosting.length < MIN_JOB_POSTING_LENGTH) {
    return { valid: false, error: `Job posting too short (min ${MIN_JOB_POSTING_LENGTH} characters)` }
  }

  if (trimmedResume.length > MAX_RESUME_LENGTH) {
    return { valid: false, error: `Resume too long (max ${MAX_RESUME_LENGTH} characters)` }
  }

  if (trimmedJobTitle.length > MAX_JOB_TITLE_LENGTH) {
    return { valid: false, error: `Job title too long (max ${MAX_JOB_TITLE_LENGTH} characters)` }
  }

  if (trimmedJobPosting.length > MAX_JOB_POSTING_LENGTH) {
    return { valid: false, error: `Job posting too long (max ${MAX_JOB_POSTING_LENGTH} characters)` }
  }

  return { valid: true }
}

/**
 * Extracts and normalizes input from request body
 */
export function extractInput(input: unknown): EvaluationRequest | null {
  if (!input || typeof input !== 'object') {
    return null
  }

  const body = input as Record<string, unknown>

  // Support both old and new field names
  const resumeText = body.resumeText ?? body.resume
  const jobTitle = body.jobTitle
  const jobPosting = body.jobPosting

  if (
    typeof resumeText !== 'string' ||
    typeof jobTitle !== 'string' ||
    typeof jobPosting !== 'string'
  ) {
    return null
  }

  return {
    resumeText: resumeText.trim(),
    jobTitle: jobTitle.trim(),
    jobPosting: jobPosting.trim(),
  }
}

/**
 * Type guard for validating evaluation output structure
 * Enforces:
 * - Valid verdict enum
 * - atsScore 0-100
 * - Exactly 5 keywords
 * - Exactly 3 suggestions
 */
export function validateOutput(output: unknown): output is EvaluationResult {
  if (!output || typeof output !== 'object') {
    return false
  }

  const result = output as Record<string, unknown>

  // Validate verdict is a valid enum
  if (!VALID_VERDICTS.includes(result.verdict as Verdict)) {
    return false
  }

  // Validate atsScore is a number 0-100
  if (
    typeof result.atsScore !== 'number' ||
    result.atsScore < 0 ||
    result.atsScore > 100 ||
    !Number.isInteger(result.atsScore)
  ) {
    return false
  }

  // Validate keywordGaps is exactly 5 objects with keyword and status
  if (!Array.isArray(result.keywordGaps)) {
    return false
  }
  if (result.keywordGaps.length !== 5) {
    return false
  }
  const keywordGapsValid = result.keywordGaps.every(
    (k) =>
      k &&
      typeof k === 'object' &&
      typeof (k as { keyword: unknown }).keyword === 'string' &&
      VALID_STATUSES.includes((k as { status: unknown }).status as KeywordStatus)
  )
  if (!keywordGapsValid) {
    return false
  }

  // Validate improvementSuggestions is exactly 3 strings
  if (!Array.isArray(result.improvementSuggestions)) {
    return false
  }
  if (result.improvementSuggestions.length !== 3) {
    return false
  }
  if (!result.improvementSuggestions.every((s) => typeof s === 'string')) {
    return false
  }

  return true
}
