import { AuditService } from '@/services/audit.service'
import { routeAccess } from '@/lib/route-access'
import { NextRequest, NextResponse } from 'next/server'
import { requireActiveSession } from '@/lib/session'
import { InterventionService } from '@/services/intervention.service'
import { successResponse, errorResponse } from '@/lib/api-response'

// GET /api/interventions/[id] - Get intervention by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const denied = await routeAccess(request)
    if (denied) return denied
    const { id } = await params
    const intervention = await InterventionService.getInterventionById(id)

    if (!intervention) {
      return NextResponse.json(errorResponse('NOT_FOUND', 'Intervention not found'), { status: 404 })
    }

    const session = await requireActiveSession()
    if ('confidentialNotes' in intervention && session.role !== 'PRINCIPAL') intervention.confidentialNotes = intervention.confidentialNotes.filter(n => n.createdBy === session.userId)
    return NextResponse.json(successResponse(intervention))
  } catch (error: any) {
    console.error('Get intervention error:', error)
    return NextResponse.json(errorResponse('INTERNAL_ERROR', 'Failed to get intervention'), { status: 500 })
  }
}

// PATCH /api/interventions/[id] - Update intervention
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const denied = await routeAccess(request)
    if (denied) return denied
    const { id } = await params
    const body = await request.json()
    const intervention = await InterventionService.updateIntervention(id, body)

    const session = await requireActiveSession()
    await AuditService.logEvent({actorId:(await requireActiveSession()).userId!,action:'INTERVENTION_UPDATED',targetType:'INTERVENTION',targetId:id})
    return NextResponse.json(successResponse(intervention))
  } catch (error: any) {
    console.error('Update intervention error:', error)
    return NextResponse.json(errorResponse('INTERNAL_ERROR', 'Failed to update intervention'), { status: 500 })
  }
}
