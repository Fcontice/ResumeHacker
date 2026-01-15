export type Verdict = 'Pass' | 'Borderline' | 'Weak'
export type KeywordStatus = 'missing' | 'weak'

export interface KeywordGap {
  keyword: string
  status: KeywordStatus
}

export interface EvaluationResult {
  verdict: Verdict
  atsScore: number
  keywordGaps: [KeywordGap, KeywordGap, KeywordGap, KeywordGap, KeywordGap]
  improvementSuggestions: [string, string, string]
}

export interface EvaluationRequest {
  resumeText: string
  jobTitle: string
  jobPosting: string
}

// Internal type for raw LLM response (snake_case)
export interface RawKeywordGap {
  keyword: string
  status: string
}

export interface RawLLMResponse {
  verdict: string
  ats_score: number
  keyword_gaps: RawKeywordGap[]
  improvement_suggestions: string[]
}

// Safe fallback result
export const FALLBACK_RESULT: EvaluationResult = {
  verdict: 'Borderline',
  atsScore: 50,
  keywordGaps: [
    { keyword: 'Unable to extract keyword 1', status: 'missing' },
    { keyword: 'Unable to extract keyword 2', status: 'missing' },
    { keyword: 'Unable to extract keyword 3', status: 'missing' },
    { keyword: 'Unable to extract keyword 4', status: 'missing' },
    { keyword: 'Unable to extract keyword 5', status: 'missing' },
  ],
  improvementSuggestions: [
    'Re-submit your resume for a more accurate evaluation',
    'Ensure your resume is in plain text format',
    'Check that your job title is specific and accurate',
  ],
}
