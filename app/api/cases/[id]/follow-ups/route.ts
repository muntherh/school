import { routeAccess } from '@/lib/route-access'
import { NextRequest, NextResponse } from 'next/server'
import { FollowUpService } from '@/services/follow-up.service'
import { FollowUpWorkflowService } from '@/lib/workflow/follow-up-workflow'
import { successResponse, errorResponse } from '@/lib/api-response'
import { withAuth, authErrorResponse } from '@/lib/middleware'

// GET /api/cases/[id]/follow-ups - Get follow-ups for a case
export async function GET(
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
    const followUps = await FollowUpService.getFollowUpsByCase(id)

    return NextResponse.json(successResponse(followUps))
  } catch (error: any) {
    console.error('Get follow-ups error:', error)
    return NextResponse.json(errorResponse('INTERNAL_ERROR', 'Failed to get follow-ups'), { status: 500 })
  }
}

// POST /api/cases/[id]/follow-ups - Create a follow-up with assignment
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
    const { dueDate, assignedUserId, notes } = body
    
    if (!dueDate || !assignedUserId) {
      return NextResponse.json(errorResponse('INVALID_INPUT', 'dueDate and assignedUserId are required'), { status: 400 })
    }

    const followUp = await FollowUpWorkflowService.assignFollowUp({
      caseId: id,
      dueDate: new Date(dueDate),
      assignedUserId,
      assignedBy: auth.user.id,
      notes,
    })

    return NextResponse.json(successResponse(followUp), { status: 201 })
  } catch (error: any) {
    console.error('Create follow-up error:', error)
    return NextResponse.json(errorResponse('INTERNAL_ERROR', error.message || 'Failed to create follow-up'), { status: 400 })
  }
}
