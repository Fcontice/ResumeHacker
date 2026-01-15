import { SignJWT, jwtVerify } from 'jose'

const getSecret = () => {
  const secret = process.env.TOKEN_SECRET
  if (!secret) {
    throw new Error('TOKEN_SECRET not configured')
  }
  return new TextEncoder().encode(secret)
}

export interface DayPassPayload {
  sessionId: string
  purchasedAt: number
  expiresAt: number
}

export async function createDayPassToken(sessionId: string): Promise<string> {
  const now = Date.now()
  const expiresAt = now + 24 * 60 * 60 * 1000 // 24 hours

  return new SignJWT({ sessionId, purchasedAt: now, expiresAt })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('24h')
    .sign(getSecret())
}

export async function verifyDayPassToken(
  token: string
): Promise<DayPassPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret())
    const dayPass = payload as unknown as DayPassPayload

    // Check if expired
    if (dayPass.expiresAt < Date.now()) {
      return null
    }

    return dayPass
  } catch {
    return null
  }
}
