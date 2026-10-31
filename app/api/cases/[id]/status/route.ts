import { NextRequest, NextResponse } from 'next/server'
import { successResponse, errorResponse } from '@/lib/api-response'
import { withAuth, authErrorResponse, permissionErrorResponse } from '@/lib/middleware'
import { CaseWorkflowService } from '@/lib/workflow/case-workflow'

// PATCH /api/cases/[id]/status - Update case status with workflow validation
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await withAuth(request)
    
    if (!auth) {
      return authErrorResponse()
    }

    // Only principals can change case status (except teacher resubmitting)
    if (auth.user.role !== 'PRINCIPAL') {
      return permissionErrorResponse('Only principals can change case status')
    }

    const { id } = await params
    const body = await request.json()
    const { status, reason, version } = body
    
    // Use workflow service for validated transition
    const result = await CaseWorkflowService.transitionStatus(
      id,
      status,
      auth.user.id,
      auth.user.role,
      reason,
      version
    )

    if (!result.success) {
      return NextResponse.json(errorResponse('INVALID_TRANSITION', result.error || 'Failed to transition case status'), { status: 400 })
    }

    return NextResponse.json(successResponse(result.case))
  } catch (error: any) {
    console.error('Update case status error:', error)
    return NextResponse.json(errorResponse('INTERNAL_ERROR', error.message || 'Failed to update case status'), { status: 500 })
  }
}
