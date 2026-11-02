import { routeAccess } from '@/lib/route-access'
import { NextRequest, NextResponse } from 'next/server'
import { CaseService } from '@/services/case.service'
import { successResponse, errorResponse } from '@/lib/api-response'
import { withAuth, authErrorResponse, permissionErrorResponse } from '@/lib/middleware'
import { AuditService } from '@/services/audit.service'
import { prisma } from '@/lib/prisma'

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
      classGrade: searchParams.get('classGrade') || undefined,
      sort: searchParams.get('sort') || undefined,
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
    const { confirmDuplicate, ...caseInput } = body ?? {}

    // FR-INC-06: detect a likely duplicate (same student, category and day) before saving.
    // Only a count is returned so a teacher never learns about other staff members' reports.
    let duplicates: { id: string; referenceNumber: string }[] = []
    const incidentDate = new Date(caseInput.incidentDate)
    if (typeof caseInput.studentId === 'string' && typeof caseInput.category === 'string' && !Number.isNaN(incidentDate.getTime())) {
      const student = await prisma.student.findFirst({ where: { OR: [{ id: caseInput.studentId }, { studentId: caseInput.studentId }] }, select: { id: true } })
      if (student) duplicates = await CaseService.checkForDuplicates(student.id, caseInput.category, incidentDate)
    }
    if (duplicates.length && confirmDuplicate !== true) {
      return NextResponse.json(
        errorResponse('DUPLICATE_SUSPECTED', `A similar report for this student and category already exists for this date (${duplicates.length}). Submit again to confirm it is a separate incident.`),
        { status: 409 }
      )
    }

    const caseData = await CaseService.createCase({
      ...caseInput,
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

    if (duplicates.length) {
      // Flag the confirmed submission so the principal sees it in the case history.
      await AuditService.logEvent({
        actorId: auth.user.id,
        action: 'POSSIBLE_DUPLICATE_FLAGGED',
        targetType: 'CASE',
        targetId: caseData.id,
        metadata: { similarCaseIds: duplicates.map(d => d.id) },
      })
    }

    return NextResponse.json(successResponse(caseData), { status: 201 })
  } catch (error: any) {
    console.error('Create case error:', error)
    return NextResponse.json(errorResponse('INTERNAL_ERROR', error.message || 'Failed to create case'), { status: 400 })
  }
}
