import { requireActiveSession } from '@/lib/session'
import { AuditService } from '@/services/audit.service'
import { routeAccess } from '@/lib/route-access'
import { NextRequest, NextResponse } from 'next/server'
import { DisciplinaryActionService } from '@/services/disciplinary-action.service'
import { successResponse, errorResponse } from '@/lib/api-response'

// PATCH /api/actions/[id] - Update disciplinary action status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const denied = await routeAccess(request)
    if (denied) return denied
    const { id } = await params
    const body = await request.json()
    
    const action = await DisciplinaryActionService.updateActionStatus(id, body.status)

    await AuditService.logEvent({actorId:(await requireActiveSession()).userId!,action:'ACTION_UPDATED',targetType:'ACTION',targetId:id})
    return NextResponse.json(successResponse(action))
  } catch (error: any) {
    console.error('Update action status error:', error)
    return NextResponse.json(errorResponse('INTERNAL_ERROR', 'Failed to update action status'), { status: 500 })
  }
}
