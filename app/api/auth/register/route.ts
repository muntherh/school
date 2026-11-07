import { allowLogin } from '@/lib/login-limit'
import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/services/auth.service'
import { registerSchema } from '@/lib/validation'
import { successResponse, errorResponse } from '@/lib/api-response'
import { AuditService } from '@/services/audit.service'

// POST /api/auth/register - Public self-registration.
// Creates a PENDING TEACHER account that a Principal approves or rejects from
// the Users page. Intentionally NOT guarded by routeAccess so it is public, but
// it enforces the same origin check and rate limit as the login route, and the
// role is always forced server-side (never taken from the request body).
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = registerSchema.parse(body)

    const origin = request.headers.get('origin')
    if (origin && origin !== new URL(process.env.NEXT_PUBLIC_APP_URL || request.url).origin) {
      return NextResponse.json(errorResponse('FORBIDDEN', 'Invalid request origin'), { status: 403 })
    }

    if (!allowLogin('register:' + data.email.toLowerCase())) {
      return NextResponse.json(errorResponse('RATE_LIMIT', 'Too many attempts. Try again later.'), { status: 429 })
    }

    const user = await AuthService.register(data)

    await AuditService.logEvent({
      actorId: 'anonymous',
      action: 'USER_REGISTERED',
      targetType: 'USER',
      targetId: user.id,
      metadata: { email: user.email, role: user.role },
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    })

    // Return only non-sensitive fields; the account cannot sign in until approved.
    return NextResponse.json(
      successResponse({ email: user.email, accountStatus: user.accountStatus }),
      { status: 201 }
    )
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(errorResponse('VALIDATION_ERROR', 'Invalid input data', error.issues), { status: 400 })
    }
    if (/already exists/i.test(error?.message || '')) {
      return NextResponse.json(errorResponse('EMAIL_EXISTS', 'An account with this email already exists'), { status: 409 })
    }
    console.error('Register error:', error)
    return NextResponse.json(errorResponse('INTERNAL_ERROR', 'An error occurred during registration'), { status: 500 })
  }
}
