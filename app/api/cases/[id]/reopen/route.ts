import { routeAccess } from '@/lib/route-access'
import { NextRequest, NextResponse } from 'next/server'
import { CaseService } from '@/services/case.service'
import { successResponse, errorResponse } from '@/lib/api-response'
import { withAuth, authErrorResponse, permissionErrorResponse } from '@/lib/middleware'
import { AuditService } from '@/services/audit.service'

// POST /api/cases/[id]/reopen - Reopen a closed case
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const denied = await routeAccess(request)
    if (denied) return denied
    const auth = await withAuth(request)
    
    if (!auth) {
      return authErrorResponse()
    }

    // Only principals can reopen cases
    if (auth.user.role !== 'PRINCIPAL') {
      return permissionErrorResponse('Only principals can reopen cases')
    }

    const { id } = await params
    const body = await request.json()
    
    const caseData = await CaseService.reopenCase(id, body.reason, auth.user.id)

    // Log case reopening
    await AuditService.logEvent({
      actorId: auth.user.id,
      action: 'CASE_REOPENED',
      targetType: 'CASE',
      targetId: id,
      metadata: { 
        reason: body.reason,
        reopenedBy: auth.user.name 
      },
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    })

    return NextResponse.json(successResponse(caseData))
  } catch (error: any) {
    console.error('Reopen case error:', error)
    return NextResponse.json(errorResponse('INTERNAL_ERROR', error.message || 'Failed to reopen case'), { status: 400 })
  }
}
