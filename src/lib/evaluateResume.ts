import OpenAI from 'openai'
import { buildEvaluationPrompt } from './prompt'
import type { EvaluationResult, RawLLMResponse, Verdict, KeywordGap, KeywordStatus } from './types'
import { FALLBACK_RESULT } from './types'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const VALID_VERDICTS: Verdict[] = ['Pass', 'Borderline', 'Weak']
const VALID_STATUSES: KeywordStatus[] = ['missing', 'weak']

/**
 * Parses and validates the raw LLM response
 * Returns null if validation fails
 */
function parseAndValidateResponse(content: string): EvaluationResult | null {
  // Extract JSON from response
  const jsonMatch = content.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    return null
  }

  let raw: RawLLMResponse
  try {
    raw = JSON.parse(jsonMatch[0])
  } catch {
    return null
  }

  // Validate verdict is a valid enum value
  if (!raw.verdict || !VALID_VERDICTS.includes(raw.verdict as Verdict)) {
    return null
  }

  // Validate ats_score exists and is a number
  if (typeof raw.ats_score !== 'number') {
    return null
  }

  // Validate keyword_gaps is an array
  if (!Array.isArray(raw.keyword_gaps)) {
    return null
  }

  // Validate improvement_suggestions is an array
  if (!Array.isArray(raw.improvement_suggestions)) {
    return null
  }

  // Clamp score to 0-100
  const clampedScore = Math.max(0, Math.min(100, Math.round(raw.ats_score)))

  // Parse and validate keyword gaps
  const keywordGaps: KeywordGap[] = raw.keyword_gaps
    .filter((k) =>
      k &&
      typeof k === 'object' &&
      typeof k.keyword === 'string' &&
      k.keyword.trim().length > 0 &&
      VALID_STATUSES.includes(k.status as KeywordStatus)
    )
    .map((k) => ({
      keyword: k.keyword.trim(),
      status: k.status as KeywordStatus,
    }))
    .slice(0, 5)

  // Pad if fewer than 5
  while (keywordGaps.length < 5) {
    keywordGaps.push({ keyword: 'No additional keyword identified', status: 'missing' })
  }

  // Enforce exactly 3 suggestions
  const suggestions = raw.improvement_suggestions
    .filter((s): s is string => typeof s === 'string' && s.trim().length > 0)
    .slice(0, 3)

  // Pad if fewer than 3
  while (suggestions.length < 3) {
    suggestions.push('Review overall resume clarity and keyword alignment')
  }

  // Final validation: ensure arrays are correct length
  if (keywordGaps.length !== 5 || suggestions.length !== 3) {
    return null
  }

  return {
    verdict: raw.verdict as Verdict,
    atsScore: clampedScore,
    keywordGaps: keywordGaps as [KeywordGap, KeywordGap, KeywordGap, KeywordGap, KeywordGap],
    improvementSuggestions: suggestions as [string, string, string],
  }
}

/**
 * Makes a single LLM call and returns the raw content
 */
async function callLLM(prompt: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.3,
    max_tokens: 1000,
    response_format: { type: 'json_object' },
  })

  const content = response.choices[0]?.message?.content
  if (!content) {
    throw new Error('No response from OpenAI')
  }

  return content
}

/**
 * Evaluates a resume against a job posting using ATS criteria
 *
 * SECURITY: Resume and job posting text are processed in-memory only and not logged
 *
 * @param resumeText - The raw text of the resume (NOT logged)
 * @param jobTitle - The target job title
 * @param jobPosting - The full job posting text (NOT logged)
 * @returns Deterministic evaluation result
 */
export async function evaluateResume(
  resumeText: string,
  jobTitle: string,
  jobPosting: string
): Promise<EvaluationResult> {
  const { prompt } = buildEvaluationPrompt(resumeText, jobTitle, jobPosting)

  // First attempt
  let content: string
  try {
    content = await callLLM(prompt)
  } catch (error) {
    // If LLM call fails, return fallback
    console.error('LLM call failed on first attempt')
    return FALLBACK_RESULT
  }

  let result = parseAndValidateResponse(content)

  // If validation fails, retry once
  if (!result) {
    console.error('Validation failed on first attempt, retrying...')

    try {
      content = await callLLM(prompt)
      result = parseAndValidateResponse(content)
    } catch (error) {
      console.error('LLM call failed on retry')
      return FALLBACK_RESULT
    }
  }

  // If still invalid after retry, return safe fallback
  if (!result) {
    console.error('Validation failed after retry, returning fallback')
    return FALLBACK_RESULT
  }

  return result
}
