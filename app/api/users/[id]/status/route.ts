import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/services/auth.service'
import { updateUserStatusSchema } from '@/lib/validation'
import { successResponse, errorResponse } from '@/lib/api-response'
import { withPermission, permissionErrorResponse } from '@/lib/middleware'
import { AuditService } from '@/services/audit.service'

// PATCH /api/users/[id]/status - Update user account status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const auth = await withPermission(request, 'canApproveUser')
    
    if (!auth) {
      return permissionErrorResponse('You do not have permission to approve users')
    }

    const body = await request.json()
    const validatedData = updateUserStatusSchema.parse(body)

    const user = await AuthService.updateUserStatus(
      id,
      validatedData.status,
      auth.user.id
    )

    // Log account status change
    await AuditService.logEvent({
      actorId: auth.user.id,
      action: 'USER_STATUS_CHANGED',
      targetType: 'USER',
      targetId: id,
      metadata: { 
        newStatus: validatedData.status,
        previousStatus: user.accountStatus,
        approver: auth.user.name 
      },
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    })

    return NextResponse.json(successResponse(user))
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(errorResponse('VALIDATION_ERROR', 'Invalid input data', error.errors), { status: 400 })
    }
    console.error('Update user status error:', error)
    return NextResponse.json(errorResponse('INTERNAL_ERROR', error.message || 'Failed to update user status'), { status: 500 })
  }
}
