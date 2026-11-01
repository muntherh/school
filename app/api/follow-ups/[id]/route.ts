import { requireActiveSession } from '@/lib/session'
import { AuditService } from '@/services/audit.service'
import { routeAccess } from '@/lib/route-access'
import { NextRequest, NextResponse } from 'next/server'
import { FollowUpService } from '@/services/follow-up.service'
import { successResponse, errorResponse } from '@/lib/api-response'

// GET /api/follow-ups/[id] - Get follow-up by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const denied = await routeAccess(request)
    if (denied) return denied
    const { id } = await params
    const followUp = await FollowUpService.getFollowUpById(id)

    if (!followUp) {
      return NextResponse.json(errorResponse('NOT_FOUND', 'Follow-up not found'), { status: 404 })
    }

    return NextResponse.json(successResponse(followUp))
  } catch (error: any) {
    console.error('Get follow-up error:', error)
    return NextResponse.json(errorResponse('INTERNAL_ERROR', 'Failed to get follow-up'), { status: 500 })
  }
}

// PATCH /api/follow-ups/[id] - Update follow-up
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const denied = await routeAccess(request)
    if (denied) return denied
    const { id } = await params
    const body = await request.json()
    const followUp = await FollowUpService.updateFollowUp(id, body)

    await AuditService.logEvent({actorId:(await requireActiveSession()).userId!,action:'FOLLOW_UP_UPDATED',targetType:'FOLLOW_UP',targetId:id})
    return NextResponse.json(successResponse(followUp))
  } catch (error: any) {
    console.error('Update follow-up error:', error)
    return NextResponse.json(errorResponse('INTERNAL_ERROR', 'Failed to update follow-up'), { status: 500 })
  }
}
