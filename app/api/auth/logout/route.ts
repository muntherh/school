import { NextRequest, NextResponse } from 'next/server'
import { successResponse, errorResponse } from '@/lib/api-response'
import { destroySession, requireSession } from '@/lib/session'
import { AuditService } from '@/services/audit.service'

export async function POST(request: NextRequest) {
  try {
    const session = await requireSession()
    
    // Log logout event
    if (session.userId) {
      await AuditService.logEvent({
        actorId: session.userId,
        action: 'LOGOUT',
        targetType: 'USER',
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
        userAgent: request.headers.get('user-agent') || undefined,
      })
    }
    
    // Destroy session
    await destroySession()
    
    return NextResponse.json(successResponse({ message: 'Logged out successfully' }))
  } catch (error: any) {
    // Even if session doesn't exist, return success
    await destroySession()
    return NextResponse.json(successResponse({ message: 'Logged out successfully' }))
  }
}
