import { NextRequest, NextResponse } from 'next/server'
import { successResponse, errorResponse } from '@/lib/api-response'
import { withAuth, authErrorResponse, permissionErrorResponse } from '@/lib/middleware'
import { CaseWorkflowService } from '@/lib/workflow/case-workflow'

// POST /api/cases/[id]/clarification - Request clarification from reporter
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await withAuth(request)
    
    if (!auth) {
      return authErrorResponse()
    }

    // Only principals can request clarification
    if (auth.user.role !== 'PRINCIPAL') {
      return permissionErrorResponse('Only principals can request clarification')
    }

    const { id } = await params
    const body = await request.json()
    const { clarificationRequest } = body
    
    if (!clarificationRequest) {
      return NextResponse.json(errorResponse('INVALID_INPUT', 'clarificationRequest is required'), { status: 400 })
    }

    const result = await CaseWorkflowService.requestClarification({
      caseId: id,
      requestedBy: auth.user.id,
      clarificationRequest,
    })

    if (!result.success) {
      return NextResponse.json(errorResponse('CLARIFICATION_FAILED', result.error || 'Failed to request clarification'), { status: 400 })
    }

    return NextResponse.json(successResponse(result.case))
  } catch (error: any) {
    console.error('Request clarification error:', error)
    return NextResponse.json(errorResponse('INTERNAL_ERROR', error.message || 'Failed to request clarification'), { status: 500 })
  }
}

// PATCH /api/cases/[id]/clarification - Respond to clarification request
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await withAuth(request)
    
    if (!auth) {
      return authErrorResponse()
    }

    const { id } = await params
    const body = await request.json()
    const { clarificationResponse } = body
    
    if (!clarificationResponse) {
      return NextResponse.json(errorResponse('INVALID_INPUT', 'clarificationResponse is required'), { status: 400 })
    }

    const result = await CaseWorkflowService.respondToClarification({
      caseId: id,
      respondedBy: auth.user.id,
      clarificationResponse,
    })

    if (!result.success) {
      return NextResponse.json(errorResponse('RESPONSE_FAILED', result.error || 'Failed to respond to clarification'), { status: 400 })
    }

    return NextResponse.json(successResponse(result.case))
  } catch (error: any) {
    console.error('Respond to clarification error:', error)
    return NextResponse.json(errorResponse('INTERNAL_ERROR', error.message || 'Failed to respond to clarification'), { status: 500 })
  }
}
