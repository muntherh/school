import { routeAccess } from '@/lib/route-access'
import { NextRequest, NextResponse } from 'next/server'
import { InterventionService } from '@/services/intervention.service'
import { successResponse, errorResponse } from '@/lib/api-response'
import { withAuth, authErrorResponse, permissionErrorResponse } from '@/lib/middleware'
import { AuditService } from '@/services/audit.service'

// GET /api/cases/[id]/interventions - Get interventions for a case
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

    // Only principals and counsellors can view interventions
    if (auth.user.role !== 'PRINCIPAL' && auth.user.role !== 'COUNSELLOR') {
      return permissionErrorResponse('You do not have permission to view interventions')
    }

    const { id } = await params
    const interventions = await InterventionService.getInterventionsByCase(id)

    return NextResponse.json(successResponse(interventions))
  } catch (error: any) {
    console.error('Get interventions error:', error)
    return NextResponse.json(errorResponse('INTERNAL_ERROR', 'Failed to get interventions'), { status: 500 })
  }
}

// POST /api/cases/[id]/interventions - Create an intervention
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

    // Only principals and counsellors can create interventions
    if (auth.user.role !== 'PRINCIPAL' && auth.user.role !== 'COUNSELLOR') {
      return permissionErrorResponse('You do not have permission to create interventions')
    }

    const { id } = await params
    const body = await request.json()
    
    const intervention = await InterventionService.createIntervention({
      ...body,
      caseId: id,
      counsellorId: auth.user.id,
    })

    // Log intervention creation
    await AuditService.logEvent({
      actorId: auth.user.id,
      action: 'INTERVENTION_CREATED',
      targetType: 'INTERVENTION',
      targetId: intervention.id,
      metadata: { 
        caseId: id,
        type: body.type,
        createdBy: auth.user.name 
      },
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    })

    return NextResponse.json(successResponse(intervention), { status: 201 })
  } catch (error: any) {
    console.error('Create intervention error:', error)
    return NextResponse.json(errorResponse('INTERNAL_ERROR', error.message || 'Failed to create intervention'), { status: 400 })
  }
}
