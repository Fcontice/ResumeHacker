import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createDayPassToken } from '@/lib/tokens'

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get('session_id')

  if (!sessionId) {
    return NextResponse.json(
      { success: false, error: 'Missing session ID' },
      { status: 400 }
    )
  }

  try {
    // Retrieve the Checkout Session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    // Verify payment was successful
    if (session.payment_status !== 'paid') {
      return NextResponse.json(
        { success: false, error: 'Payment not completed' },
        { status: 402 }
      )
    }

    // Create a signed day pass token
    const dayPassToken = await createDayPassToken(sessionId)

    return NextResponse.json({
      success: true,
      dayPassToken,
      expiresIn: '24 hours',
    })
  } catch (error) {
    console.error('Payment verification failed:', error)
    return NextResponse.json(
      { success: false, error: 'Verification failed' },
      { status: 500 }
    )
  }
}
