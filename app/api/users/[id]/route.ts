import { routeAccess } from '@/lib/route-access'
import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/services/auth.service'
import { updateUserSchema } from '@/lib/validation'
import { successResponse, errorResponse } from '@/lib/api-response'

// GET /api/users/[id] - Get user by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const denied = await routeAccess(request)
    if (denied) return denied
    const { id } = await params
    const user = await AuthService.getUserById(id)

    if (!user) {
      return NextResponse.json(errorResponse('NOT_FOUND', 'User not found'), { status: 404 })
    }

    return NextResponse.json(successResponse(user))
  } catch (error: any) {
    console.error('Get user error:', error)
    return NextResponse.json(errorResponse('INTERNAL_ERROR', 'Failed to get user'), { status: 500 })
  }
}

// PATCH /api/users/[id] - Update user
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const denied = await routeAccess(request)
    if (denied) return denied
    const { id } = await params
    const body = await request.json()
    const validatedData = updateUserSchema.parse(body)

    const user = await AuthService.updateUser(id, validatedData)

    return NextResponse.json(successResponse(user))
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(errorResponse('VALIDATION_ERROR', 'Invalid input data', error.issues), { status: 400 })
    }
    console.error('Update user error:', error)
    return NextResponse.json(errorResponse('INTERNAL_ERROR', error.message || 'Failed to update user'), { status: 500 })
  }
}
