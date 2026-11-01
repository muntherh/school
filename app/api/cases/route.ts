import { routeAccess } from '@/lib/route-access'
import { NextRequest, NextResponse } from 'next/server'
import { CaseService } from '@/services/case.service'
import { successResponse, errorResponse } from '@/lib/api-response'
import { withAuth, authErrorResponse, permissionErrorResponse } from '@/lib/middleware'
import { AuditService } from '@/services/audit.service'

// GET /api/cases - Get cases with filters
export async function GET(request: NextRequest) {
  try {
    const denied = await routeAccess(request)
    if (denied) return denied
    const auth = await withAuth(request)
    
    if (!auth) {
      return authErrorResponse()
    }

    const { searchParams } = new URL(request.url)
    const filters = {
      search: searchParams.get('search') || undefined,
      assignedToId: auth.user.role === 'COUNSELLOR' ? auth.user.id : undefined,
      status: searchParams.get('status') || undefined,
      studentId: searchParams.get('studentId') || undefined,
      reporterId: searchParams.get('reporterId') || undefined,
      category: searchParams.get('category') || undefined,
      incidentDateFrom: searchParams.get('incidentDateFrom') || undefined,
      incidentDateTo: searchParams.get('incidentDateTo') || undefined,
      page: searchParams.get('page') || undefined,
      limit: searchParams.get('limit') || undefined,
    }

    // Teachers can only see their own cases
    if (auth.user.role === 'TEACHER') {
      filters.reporterId = auth.user.id
    }

    const result = await CaseService.getCases(filters)

    return NextResponse.json(successResponse(result.cases, result.pagination))
  } catch (error: any) {
    console.error('Get cases error:', error)
    return NextResponse.json(errorResponse('INTERNAL_ERROR', 'Failed to get cases'), { status: 500 })
  }
}

// POST /api/cases - Create a new case
export async function POST(request: NextRequest) {
  try {
    const denied = await routeAccess(request)
    if (denied) return denied
    const auth = await withAuth(request)
    
    if (!auth) {
      return authErrorResponse()
    }

    // Only teachers and principals can create cases
    if (auth.user.role !== 'TEACHER' && auth.user.role !== 'PRINCIPAL') {
      return permissionErrorResponse('You do not have permission to create cases')
    }

    const body = await request.json()
    
    const caseData = await CaseService.createCase({
      ...body,
      reporterId: auth.user.id,
    })

    // Log case creation
    await AuditService.logEvent({
      actorId: auth.user.id,
      action: 'CASE_CREATED',
      targetType: 'CASE',
      targetId: caseData.id,
      metadata: { 
        referenceNumber: caseData.referenceNumber,
        category: caseData.category,
        studentId: caseData.studentId 
      },
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    })

    return NextResponse.json(successResponse(caseData), { status: 201 })
  } catch (error: any) {
    console.error('Create case error:', error)
    return NextResponse.json(errorResponse('INTERNAL_ERROR', error.message || 'Failed to create case'), { status: 400 })
  }
}
