import { requireActiveSession } from '@/lib/session'
import { AuditService } from '@/services/audit.service'
import { routeAccess } from '@/lib/route-access'
import { NextRequest, NextResponse } from 'next/server'
import { StudentService } from '@/services/student.service'
import { successResponse, errorResponse } from '@/lib/api-response'

// GET /api/students/[id] - Get student by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const denied = await routeAccess(request)
    if (denied) return denied
    const { id } = await params
    const student = await StudentService.getStudentById(id)

    if (!student) {
      return NextResponse.json(errorResponse('NOT_FOUND', 'Student not found'), { status: 404 })
    }

    return NextResponse.json(successResponse(student))
  } catch (error: any) {
    console.error('Get student error:', error)
    return NextResponse.json(errorResponse('INTERNAL_ERROR', 'Failed to get student'), { status: 500 })
  }
}

// PATCH /api/students/[id] - Update student
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const denied = await routeAccess(request)
    if (denied) return denied
    const { id } = await params
    const body = await request.json()
    const student = await StudentService.updateStudent(id, body)

    await AuditService.logEvent({actorId:(await requireActiveSession()).userId!,action:'STUDENT_UPDATED',targetType:'STUDENT',targetId:id})
    return NextResponse.json(successResponse(student))
  } catch (error: any) {
    console.error('Update student error:', error)
    return NextResponse.json(errorResponse('INTERNAL_ERROR', error.message || 'Failed to update student'), { status: 500 })
  }
}
