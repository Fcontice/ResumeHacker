// Client-side premium state utilities
// These run in the browser only

const DAY_PASS_KEY = 'dayPassToken'
const USAGE_KEY = 'dailyUsage'

interface DailyUsage {
  count: number
  date: string // YYYY-MM-DD
}

function getTodayString(): string {
  return new Date().toISOString().split('T')[0]
}

// --- Day Pass Functions ---

export function storeDayPassToken(token: string): void {
  if (typeof window === 'undefined') return
  sessionStorage.setItem(DAY_PASS_KEY, token)
}

export function getDayPassToken(): string | null {
  if (typeof window === 'undefined') return null
  return sessionStorage.getItem(DAY_PASS_KEY)
}

export function clearDayPassToken(): void {
  if (typeof window === 'undefined') return
  sessionStorage.removeItem(DAY_PASS_KEY)
}

// --- Usage Tracking Functions ---

export function getDailyUsage(): DailyUsage {
  if (typeof window === 'undefined') {
    return { count: 0, date: getTodayString() }
  }

  const stored = localStorage.getItem(USAGE_KEY)
  if (!stored) {
    return { count: 0, date: getTodayString() }
  }

  try {
    const usage = JSON.parse(stored) as DailyUsage
    // Reset if different day
    if (usage.date !== getTodayString()) {
      return { count: 0, date: getTodayString() }
    }
    return usage
  } catch {
    return { count: 0, date: getTodayString() }
  }
}

export function incrementDailyUsage(): DailyUsage {
  if (typeof window === 'undefined') {
    return { count: 1, date: getTodayString() }
  }

  const current = getDailyUsage()
  const updated: DailyUsage = {
    count: current.count + 1,
    date: getTodayString(),
  }
  localStorage.setItem(USAGE_KEY, JSON.stringify(updated))
  return updated
}

export function getUsageRemaining(): number {
  const FREE_LIMIT = 2
  const usage = getDailyUsage()
  return Math.max(0, FREE_LIMIT - usage.count)
}

// --- Premium Status Check ---

export function hasDayPass(): boolean {
  const token = getDayPassToken()
  if (!token) return false

  try {
    // Decode JWT payload (without verification - server does that)
    const parts = token.split('.')
    if (parts.length !== 3) return false

    const payload = JSON.parse(atob(parts[1]))
    return payload.expiresAt > Date.now()
  } catch {
    return false
  }
}

export function canEvaluate(): boolean {
  // Premium users can always evaluate
  if (hasDayPass()) return true

  // Free users limited to 2 per day
  return getUsageRemaining() > 0
}

export function getTimeUntilReset(): string {
  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(0, 0, 0, 0)

  const diff = tomorrow.getTime() - now.getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  return `${hours}h ${minutes}m`
}
