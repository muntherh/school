import { routeAccess } from '@/lib/route-access'
import { NextRequest, NextResponse } from 'next/server'
import { requireActiveSession } from '@/lib/session'
import { CaseService } from '@/services/case.service'
import { successResponse, errorResponse } from '@/lib/api-response'

// GET /api/cases/[id] - Get case by ID with full details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const denied = await routeAccess(request)
    if (denied) return denied
    const { id } = await params
    const caseData = await CaseService.getCaseById(id)

    if (!caseData) {
      return NextResponse.json(errorResponse('NOT_FOUND', 'Case not found'), { status: 404 })
    }

    const session = await requireActiveSession()
    if (session.role === 'TEACHER') caseData.interventions = []
    return NextResponse.json(successResponse(caseData))
  } catch (error: any) {
    console.error('Get case error:', error)
    return NextResponse.json(errorResponse('INTERNAL_ERROR', 'Failed to get case'), { status: 500 })
  }
}

// PATCH /api/cases/[id] - Update case (limited fields)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const denied = await routeAccess(request)
    if (denied) return denied
    const { id } = await params
    const body = await request.json()
    const caseData = await CaseService.updateCase(id, body)

    const session = await requireActiveSession()
    return NextResponse.json(successResponse(caseData))
  } catch (error: any) {
    console.error('Update case error:', error)
    return NextResponse.json(errorResponse('INTERNAL_ERROR', error.message || 'Failed to update case'), { status: 500 })
  }
}
