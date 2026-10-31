import { allowLogin } from '@/lib/login-limit'
import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/services/auth.service'
import { loginSchema } from '@/lib/validation'
import { successResponse, errorResponse } from '@/lib/api-response'
import { createSession } from '@/lib/session'
import { AuditService } from '@/services/audit.service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = loginSchema.parse(body)

    const origin = request.headers.get('origin')
    if (origin && origin !== new URL(process.env.NEXT_PUBLIC_APP_URL || request.url).origin) return NextResponse.json({success:false}, {status:403})
    if (!allowLogin(validatedData.email.toLowerCase())) return NextResponse.json(errorResponse('RATE_LIMIT','Too many attempts. Try again later.'), {status:429})
    const result = await AuthService.login(validatedData.email, validatedData.password)

    if (!result.success) {
      // Log failed login attempt
      await AuditService.logEvent({
        actorId: 'anonymous',
        action: 'LOGIN_FAILED',
        targetType: 'USER',
        metadata: { email: validatedData.email, reason: result.error },
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
        userAgent: request.headers.get('user-agent') || undefined,
      })

      return NextResponse.json(errorResponse('AUTH_FAILED', result.error || 'Authentication failed'), { status: 401 })
    }

    // Create session
    await createSession(result.user!)

    // Log successful login
    await AuditService.logEvent({
      actorId: result.user!.id,
      action: 'LOGIN_SUCCESS',
      targetType: 'USER',
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    })

    return NextResponse.json(successResponse(result.user))
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(errorResponse('VALIDATION_ERROR', 'Invalid input data', error.issues), { status: 400 })
    }
    console.error('Login error:', error)
    return NextResponse.json(errorResponse('INTERNAL_ERROR', 'An error occurred during login'), { status: 500 })
  }
}
