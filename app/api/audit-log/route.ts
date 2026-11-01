import { routeAccess } from '@/lib/route-access'
import { NextRequest, NextResponse } from 'next/server'
import { AuditService } from '@/services/audit.service'
import { successResponse, errorResponse } from '@/lib/api-response'
import { withAuth, authErrorResponse, permissionErrorResponse } from '@/lib/middleware'

// GET /api/audit-log - Get audit log with filters
export async function GET(request: NextRequest) {
  try {
    const denied = await routeAccess(request)
    if (denied) return denied
    const auth = await withAuth(request)
    
    if (!auth) {
      return authErrorResponse()
    }

    // Only principals and admins can view audit log
    if (auth.user.role !== 'PRINCIPAL' && auth.user.role !== 'ADMIN') {
      return permissionErrorResponse('You do not have permission to view audit log')
    }

    const { searchParams } = new URL(request.url)
    const filters = {
      actorId: searchParams.get('actorId') || undefined,
      action: searchParams.get('action') || undefined,
      targetType: searchParams.get('targetType') || undefined,
      targetId: searchParams.get('targetId') || undefined,
      from: searchParams.get('from') || undefined,
      to: searchParams.get('to') || undefined,
      page: searchParams.get('page') || undefined,
      limit: searchParams.get('limit') || undefined,
    }

    const result = await AuditService.getAuditLog(filters)
    // Technical administration does not grant access to counselling/case content.
    if (auth.user.role === 'ADMIN') result.events = result.events.map(event => ({ ...event, metadata: null }))

    return NextResponse.json(successResponse(result.events, result.pagination))
  } catch (error: any) {
    console.error('Get audit log error:', error)
    return NextResponse.json(errorResponse('INTERNAL_ERROR', 'Failed to get audit log'), { status: 500 })
  }
}
