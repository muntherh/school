import { routeAccess } from '@/lib/route-access'
import { NextRequest, NextResponse } from 'next/server'
import { successResponse, errorResponse } from '@/lib/api-response'
import { withAuth, authErrorResponse, permissionErrorResponse } from '@/lib/middleware'
import { CaseWorkflowService } from '@/lib/workflow/case-workflow'

// POST /api/cases/[id]/assign - Assign case to staff member
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

    // Only principals can assign cases
    if (auth.user.role !== 'PRINCIPAL') {
      return permissionErrorResponse('Only principals can assign cases')
    }

    const { id } = await params
    const body = await request.json()
    const { assignedToId, rationale } = body
    
    if (!assignedToId) {
      return NextResponse.json(errorResponse('INVALID_INPUT', 'assignedToId is required'), { status: 400 })
    }

    const result = await CaseWorkflowService.assignCase({
      caseId: id,
      assignedToId,
      assignedBy: auth.user.id,
      rationale,
    })

    if (!result.success) {
      return NextResponse.json(errorResponse('ASSIGNMENT_FAILED', result.error || 'Failed to assign case'), { status: 400 })
    }

    return NextResponse.json(successResponse(result.case))
  } catch (error: any) {
    console.error('Assign case error:', error)
    return NextResponse.json(errorResponse('INTERNAL_ERROR', error.message || 'Failed to assign case'), { status: 500 })
  }
}
