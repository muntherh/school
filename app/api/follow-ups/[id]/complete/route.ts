import { routeAccess } from '@/lib/route-access'
import { NextRequest, NextResponse } from 'next/server'
import { FollowUpWorkflowService } from '@/lib/workflow/follow-up-workflow'
import { successResponse, errorResponse } from '@/lib/api-response'
import { withAuth, authErrorResponse } from '@/lib/middleware'

// POST /api/follow-ups/[id]/complete - Mark a follow-up as completed
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

    const { id } = await params
    const body = await request.json()
    const { result, nextStep } = body
    
    if (!result) {
      return NextResponse.json(errorResponse('INVALID_INPUT', 'result is required'), { status: 400 })
    }

    const followUp = await FollowUpWorkflowService.completeFollowUp({
      followUpId: id,
      completedBy: auth.user.id,
      result,
      nextStep,
    })

    return NextResponse.json(successResponse(followUp))
  } catch (error: any) {
    console.error('Complete follow-up error:', error)
    return NextResponse.json(errorResponse('INTERNAL_ERROR', error.message || 'Failed to complete follow-up'), { status: 400 })
  }
}
