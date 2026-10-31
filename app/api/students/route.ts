import { routeAccess } from '@/lib/route-access'
import { NextRequest, NextResponse } from 'next/server'
import { StudentService } from '@/services/student.service'
import { studentFilterSchema } from '@/lib/validation'
import { successResponse, errorResponse } from '@/lib/api-response'
import { withAuth, authErrorResponse } from '@/lib/middleware'

// GET /api/students - Search students
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
      studentId: searchParams.get('studentId') || undefined,
      name: searchParams.get('name') || undefined,
      classGrade: searchParams.get('classGrade') || undefined,
      activeStatus: searchParams.get('activeStatus') || undefined,
    }

    const students = await StudentService.searchStudents(filters)

    return NextResponse.json(successResponse(students))
  } catch (error: any) {
    console.error('Get students error:', error)
    return NextResponse.json(errorResponse('INTERNAL_ERROR', 'Failed to search students'), { status: 500 })
  }
}

// POST /api/students - Create a new student
export async function POST(request: NextRequest) {
  try {
    const denied = await routeAccess(request)
    if (denied) return denied
    const auth = await withAuth(request)
    
    if (!auth) {
      return authErrorResponse()
    }

    const body = await request.json()
    const student = await StudentService.createStudent(body)

    return NextResponse.json(successResponse(student), { status: 201 })
  } catch (error: any) {
    console.error('Create student error:', error)
    return NextResponse.json(errorResponse('INTERNAL_ERROR', error.message || 'Failed to create student'), { status: 400 })
  }
}
