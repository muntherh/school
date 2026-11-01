import { routeAccess } from '@/lib/route-access'
import { NextRequest, NextResponse } from 'next/server'
import { CaseWorkflowService } from '@/lib/workflow/case-workflow'
import { CaseReviewService } from '@/services/case-review.service'
import { successResponse, errorResponse } from '@/lib/api-response'
import { withAuth, authErrorResponse, permissionErrorResponse } from '@/lib/middleware'
import { AuditService } from '@/services/audit.service'

// GET /api/cases/[id]/reviews - Get reviews for a case
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
    const reviews = await CaseReviewService.getReviewsByCase(id)

    return NextResponse.json(successResponse(reviews))
  } catch (error: any) {
    console.error('Get reviews error:', error)
    return NextResponse.json(errorResponse('INTERNAL_ERROR', 'Failed to get reviews'), { status: 500 })
  }
}

// POST /api/cases/[id]/reviews - Create a case review
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

    // Only principals can create reviews
    if (auth.user.role !== 'PRINCIPAL') {
      return permissionErrorResponse('Only principals can create case reviews')
    }

    const { id } = await params
    const body = await request.json()
    
    if (['APPROVED', 'REJECTED', 'CLOSED'].includes(body.result)) {
      if (typeof body.notes !== 'string' || !body.notes.trim()) {
        return NextResponse.json(errorResponse('VALIDATION_ERROR', 'Decision rationale is required'), { status: 400 })
      }
      const result = await CaseWorkflowService.recordDecision(id, body.result, body.notes, auth.user.id, body.assignedToId)
      return NextResponse.json(result.success ? successResponse(result.case) : errorResponse('DECISION_FAILED', result.error || 'Decision failed'), { status: result.success ? 201 : 400 })
    }

    const review = await CaseReviewService.createReview({
      ...body,
      caseId: id,
      reviewerId: auth.user.id,
    })

    // Log review creation
    await AuditService.logEvent({
      actorId: auth.user.id,
      action: 'CASE_REVIEW_CREATED',
      targetType: 'CASE_REVIEW',
      targetId: review.id,
      metadata: { 
        caseId: id,
        result: body.result,
        reviewer: auth.user.name 
      },
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    })

    return NextResponse.json(successResponse(review), { status: 201 })
  } catch (error: any) {
    console.error('Create review error:', error)
    return NextResponse.json(errorResponse('INTERNAL_ERROR', error.message || 'Failed to create review'), { status: 400 })
  }
}
