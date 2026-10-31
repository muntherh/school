import { NextRequest, NextResponse } from 'next/server'
import { requireActiveSession } from './session'
import { hasPermission, isAccountActive } from './permissions'
import { AuditService } from '@/services/audit.service'

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string
    name: string
    email: string
    role: string
    accountStatus: string
  }
}

/**
 * Middleware to require authentication for API routes
 */
export async function withAuth(request: NextRequest) {
  try {
    const session = await requireActiveSession()
    
    return {
      user: {
        id: session.userId!,
        name: session.name!,
        email: session.email!,
        role: session.role!,
        accountStatus: session.accountStatus!,
      },
      session,
    }
  } catch (error: any) {
    return null
  }
}

/**
 * Middleware to require specific permission
 */
export async function withPermission(
  request: NextRequest,
  permission: string
) {
  const auth = await withAuth(request)
  
  if (!auth) {
    return null
  }
  
  if (!hasPermission(auth.user.role as any, permission as any)) {
    return null
  }
  
  return auth
}

/**
 * Middleware to require specific role
 */
export async function withRole(request: NextRequest, allowedRoles: string[]) {
  const auth = await withAuth(request)
  
  if (!auth) {
    return null
  }
  
  if (!allowedRoles.includes(auth.user.role)) {
    return null
  }
  
  return auth
}

/**
 * Helper to log audit events
 */
export async function logSecurityEvent(
  userId: string,
  action: string,
  targetType: string,
  targetId?: string,
  metadata?: any,
  request?: NextRequest
) {
  await AuditService.logEvent({
    actorId: userId,
    action,
    targetType,
    targetId,
    metadata,
    ipAddress: request?.headers.get('x-forwarded-for') || request?.headers.get('x-real-ip') || undefined,
    userAgent: request?.headers.get('user-agent') || undefined,
  })
}

/**
 * Error response helper for auth failures
 */
export function authErrorResponse(message: string = 'Unauthorized', statusCode: number = 401) {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: 'AUTH_ERROR',
        message,
      },
    },
    { status: statusCode }
  )
}

/**
 * Error response helper for permission failures
 */
export function permissionErrorResponse(message: string = 'Insufficient permissions') {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: 'PERMISSION_ERROR',
        message,
      },
    },
    { status: 403 }
  )
}
