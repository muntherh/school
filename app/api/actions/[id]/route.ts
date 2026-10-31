import { NextRequest, NextResponse } from 'next/server'
import { DisciplinaryActionService } from '@/services/disciplinary-action.service'
import { successResponse, errorResponse } from '@/lib/api-response'

// PATCH /api/actions/[id] - Update disciplinary action status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    
    const action = await DisciplinaryActionService.updateActionStatus(id, body.status)

    return NextResponse.json(successResponse(action))
  } catch (error: any) {
    console.error('Update action status error:', error)
    return NextResponse.json(errorResponse('INTERNAL_ERROR', 'Failed to update action status'), { status: 500 })
  }
}
