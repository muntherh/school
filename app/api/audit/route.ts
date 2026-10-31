import { routeAccess } from '@/lib/route-access'
import { NextRequest, NextResponse } from 'next/server'
import { AuditService } from '@/services/audit.service'
import { withAuth, authErrorResponse, permissionErrorResponse } from '@/lib/middleware'

// GET /api/audit - Get audit log with filters
export async function GET(request: NextRequest) {
  try {
    const denied = await routeAccess(request)
    if (denied) return denied
    const auth = await withAuth(request)
    
    if (!auth) {
      return authErrorResponse()
    }

    // Check view permission (Principal and Admin only)
    if (auth.user.role !== 'PRINCIPAL' && auth.user.role !== 'ADMIN') {
      return permissionErrorResponse('Only principals and admins can view audit log')
    }

    const { searchParams } = new URL(request.url)
    const filters = {
      actorId: searchParams.get('actorId') || undefined,
      action: searchParams.get('action') || undefined,
      targetType: searchParams.get('targetType') || undefined,
      targetId: searchParams.get('targetId') || undefined,
      from: searchParams.get('from') || undefined,
      to: searchParams.get('to') || undefined,
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '50',
    }

    const result = await AuditService.getAuditLog(filters)

    return NextResponse.json({ success: true, data: result })
  } catch (error: any) {
    console.error('Get audit log error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to get audit log' },
      { status: 500 }
    )
  }
}

// DELETE /api/audit - Delete audit records (Admin only)
export async function DELETE(request: NextRequest) {
  try {
    const denied = await routeAccess(request)
    if (denied) return denied
    const auth = await withAuth(request)
    
    if (!auth) {
      return authErrorResponse()
    }

    // Check modification permission (Admin only)
    if (!AuditService.canModifyAuditRecords(auth.user.role)) {
      return permissionErrorResponse('Only admins can modify audit records')
    }

    const body = await request.json()
    const { ids, beforeDate } = body

    if (!ids && !beforeDate) {
      return NextResponse.json(
        { success: false, error: 'Either ids or beforeDate is required' },
        { status: 400 }
      )
    }

    // This would require adding delete functionality to the service
    // For now, return not implemented as audit records should typically be immutable
    return NextResponse.json(
      { success: false, error: 'Audit record deletion is not implemented. Audit records should be preserved for compliance.' },
      { status: 403 }
    )
  } catch (error: any) {
    console.error('Delete audit records error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete audit records' },
      { status: 500 }
    )
  }
}
