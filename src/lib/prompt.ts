// ATS Evaluation Prompt Builder
// This module constructs the evaluation prompt with conditional overlays

const BASE_PROMPT = `You are an Applicant Tracking System (ATS) evaluator.

Your task is to evaluate a resume strictly for ATS screening purposes,
not human review.

INPUTS:
- Resume text
- Target job title
- Job posting (the actual job description)

EVALUATION RULES:
- Extract keywords and requirements DIRECTLY from the job posting
- Compare the resume against the SPECIFIC requirements in the job posting
- Penalize vague phrases, keyword stuffing, and irrelevant experience
- Do NOT reward formatting, design, or personality
- If unsure, default conservatively
- Prioritize keywords that appear multiple times in the job posting

VERDICT CRITERIA:
- Pass: Resume likely survives ATS filters for this role
- Borderline: Resume may survive but has clear risks
- Weak: Resume unlikely to pass ATS filters

OUTPUT REQUIREMENTS:
Respond in JSON ONLY with the following structure:

{
  "verdict": "Pass | Borderline | Weak",
  "ats_score": number (0–100),
  "keyword_gaps": [
    { "keyword": "keyword 1", "status": "missing" },
    { "keyword": "keyword 2", "status": "weak" },
    { "keyword": "keyword 3", "status": "missing" },
    { "keyword": "keyword 4", "status": "weak" },
    { "keyword": "keyword 5", "status": "missing" }
  ],
  "improvement_suggestions": [
    "Blunt, specific improvement",
    "Blunt, specific improvement",
    "Blunt, specific improvement"
  ]
}

KEYWORD STATUS DEFINITIONS:
- "missing": Keyword is expected for this role but NOT found in resume
- "weak": Keyword exists but is vague, buried, or lacks context

STYLE RULES:
- Be direct and neutral
- No encouragement or motivational language
- No filler explanations
- No disclaimers
- No emojis`

const SHORT_RESUME_OVERLAY = `
ADDITIONAL CONTEXT:
This resume is short or early-career.

ADJUSTMENTS:
- Expect fewer roles and bullet points
- Focus evaluation on core skills coverage and relevance
- Do NOT penalize lack of seniority
- Penalize missing foundational keywords more heavily`

const SENIOR_RESUME_OVERLAY = `
ADDITIONAL CONTEXT:
This resume represents a senior role.

ADJUSTMENTS:
- Expect measurable impact and ownership
- Penalize vague leadership language
- Penalize missing system-level or strategic keywords
- Be stricter with Pass verdicts`

const SAFETY_RULES = `
SAFETY RULES:
- Only use requirements EXPLICITLY stated in the job posting
- Do NOT invent additional requirements beyond what's in the posting
- If a requirement in the job posting is ambiguous, interpret conservatively
- Never infer education, certifications, or years unless stated in resume
- Keywords must come from the job posting, not general assumptions`

// Senior title patterns for detection
const SENIOR_TITLE_PATTERNS = [
  /\b(senior|sr\.?|lead|principal|staff|director|head of|vp|vice president|chief|cto|cfo|ceo|coo|manager|architect)\b/i,
]

const SENIOR_EXPERIENCE_PATTERNS = [
  /\b(\d{2,})\+?\s*years?\b/i, // 10+ years, 12 years, etc.
  /\b(8|9)\+?\s*years?\b/i,    // 8+ years, 9 years
]

/**
 * Counts words in resume text
 */
function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length
}

/**
 * Detects if resume indicates senior-level experience
 */
function detectSeniorExperience(resumeText: string): boolean {
  // Check for senior titles
  for (const pattern of SENIOR_TITLE_PATTERNS) {
    if (pattern.test(resumeText)) {
      return true
    }
  }

  // Check for 8+ years experience mentions
  for (const pattern of SENIOR_EXPERIENCE_PATTERNS) {
    if (pattern.test(resumeText)) {
      return true
    }
  }

  return false
}

export interface PromptMetadata {
  isShortResume: boolean
  isSeniorResume: boolean
  wordCount: number
}

/**
 * Builds the complete evaluation prompt with appropriate overlays
 */
export function buildEvaluationPrompt(
  resumeText: string,
  jobTitle: string,
  jobPosting: string
): { prompt: string; metadata: PromptMetadata } {
  const wordCount = countWords(resumeText)
  const isShortResume = wordCount < 350
  const isSeniorResume = detectSeniorExperience(resumeText)

  let prompt = BASE_PROMPT

  // Apply conditional overlays (mutually exclusive - short takes precedence)
  if (isShortResume) {
    prompt += '\n' + SHORT_RESUME_OVERLAY
  } else if (isSeniorResume) {
    prompt += '\n' + SENIOR_RESUME_OVERLAY
  }

  // Always append safety rules
  prompt += '\n' + SAFETY_RULES

  // Append the actual inputs
  prompt += `

---

TARGET JOB TITLE: ${jobTitle}

JOB POSTING:
${jobPosting}

---

RESUME TEXT:
${resumeText}

---

Now evaluate this resume against the job posting above. Respond with JSON only.`

  return {
    prompt,
    metadata: {
      isShortResume,
      isSeniorResume,
      wordCount,
    },
  }
}
