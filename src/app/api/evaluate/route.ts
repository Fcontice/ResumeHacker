import { NextRequest, NextResponse } from 'next/server'
import { evaluateResume } from '@/lib/evaluateResume'
import { validateInput, validateOutput, extractInput } from '@/lib/validators'
import { verifyDayPassToken } from '@/lib/tokens'

// Simple in-memory rate limiter
// In production, use Redis or a dedicated rate limiting service
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT_WINDOW_MS = 60 * 1000 // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10 // 10 requests per minute per IP

function getRateLimitKey(req: NextRequest): string {
  // Get IP from headers (works behind proxies like Vercel)
  const forwarded = req.headers.get('x-forwarded-for')
  const ip = forwarded?.split(',')[0]?.trim() ?? req.headers.get('x-real-ip') ?? 'unknown'
  return ip
}

function checkRateLimit(key: string): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now()
  const entry = rateLimitMap.get(key)

  // Clean up expired entries periodically
  if (rateLimitMap.size > 10000) {
    for (const [k, v] of rateLimitMap.entries()) {
      if (now > v.resetTime) {
        rateLimitMap.delete(k)
      }
    }
  }

  if (!entry || now > entry.resetTime) {
    // New window
    rateLimitMap.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS })
    return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - 1, resetIn: RATE_LIMIT_WINDOW_MS }
  }

  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
    return { allowed: false, remaining: 0, resetIn: entry.resetTime - now }
  }

  entry.count++
  return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - entry.count, resetIn: entry.resetTime - now }
}

async function hasPremiumAccess(req: NextRequest): Promise<boolean> {
  // Check Authorization header for Day Pass token
  const authHeader = req.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return false
  }

  const token = authHeader.slice(7)
  if (!token) {
    return false
  }

  try {
    const payload = await verifyDayPassToken(token)
    return payload !== null
  } catch {
    return false
  }
}

export async function POST(req: NextRequest) {
  // Check API key
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: 'OpenAI API key not configured' },
      { status: 500 }
    )
  }

  // Check for premium access (Day Pass token)
  const isPremium = await hasPremiumAccess(req)

  // Rate limiting (skip for premium users)
  let rateLimit = { allowed: true, remaining: -1, resetIn: 0 }
  if (!isPremium) {
    const rateLimitKey = getRateLimitKey(req)
    rateLimit = checkRateLimit(rateLimitKey)

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again in a moment.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil(rateLimit.resetIn / 1000)),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(Math.ceil(rateLimit.resetIn / 1000)),
          },
        }
      )
    }
  }

  try {
    const body = await req.json()

    // Validate input
    const validation = validateInput(body)
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    // Extract normalized input
    const input = extractInput(body)
    if (!input) {
      return NextResponse.json(
        { error: 'Failed to parse request' },
        { status: 400 }
      )
    }

    // SECURITY: Do not log resume text or job posting
    // Evaluate resume (in-memory only)
    const result = await evaluateResume(input.resumeText, input.jobTitle, input.jobPosting)

    // Validate output shape (defensive - should always pass)
    if (!validateOutput(result)) {
      console.error('Output validation failed unexpectedly')
      return NextResponse.json(
        { error: 'Invalid evaluation result' },
        { status: 500 }
      )
    }

    return NextResponse.json(result, {
      headers: {
        'X-RateLimit-Remaining': String(rateLimit.remaining),
      },
    })
  } catch (error) {
    // SECURITY: Do not log error details that might contain resume text
    console.error('Evaluation error occurred')

    if (error instanceof Error) {
      if (error.message.includes('rate_limit')) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please try again in a moment.' },
          { status: 429 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Failed to evaluate resume. Please try again.' },
      { status: 500 }
    )
  }
}
