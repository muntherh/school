import { routeAccess } from '@/lib/route-access'
import { NextRequest, NextResponse } from 'next/server'
import { DisciplinaryActionService } from '@/services/disciplinary-action.service'
import { successResponse, errorResponse } from '@/lib/api-response'
import { withAuth, authErrorResponse, permissionErrorResponse } from '@/lib/middleware'
import { AuditService } from '@/services/audit.service'

// GET /api/cases/[id]/actions - Get disciplinary actions for a case
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
    const actions = await DisciplinaryActionService.getActionsByCase(id)

    return NextResponse.json(successResponse(actions))
  } catch (error: any) {
    console.error('Get actions error:', error)
    return NextResponse.json(errorResponse('INTERNAL_ERROR', 'Failed to get disciplinary actions'), { status: 500 })
  }
}

// POST /api/cases/[id]/actions - Create a disciplinary action
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

    // Only principals can create disciplinary actions
    if (auth.user.role !== 'PRINCIPAL') {
      return permissionErrorResponse('Only principals can create disciplinary actions')
    }

    const { id } = await params
    const body = await request.json()
    
    const action = await DisciplinaryActionService.createAction({
      ...body,
      caseId: id,
    })

    // Log action creation
    await AuditService.logEvent({
      actorId: auth.user.id,
      action: 'DISCIPLINARY_ACTION_CREATED',
      targetType: 'DISCIPLINARY_ACTION',
      targetId: action.id,
      metadata: { 
        caseId: id,
        actionType: body.actionType,
        createdBy: auth.user.name 
      },
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    })

    return NextResponse.json(successResponse(action), { status: 201 })
  } catch (error: any) {
    console.error('Create action error:', error)
    return NextResponse.json(errorResponse('INTERNAL_ERROR', error.message || 'Failed to create disciplinary action'), { status: 400 })
  }
}
