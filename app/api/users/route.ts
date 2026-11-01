import { routeAccess } from '@/lib/route-access'
import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/services/auth.service'
import { createUserSchema, updateUserStatusSchema } from '@/lib/validation'
import { successResponse, errorResponse } from '@/lib/api-response'
import { withPermission, authErrorResponse, permissionErrorResponse } from '@/lib/middleware'
import { AuditService } from '@/services/audit.service'

// GET /api/users - List all users (Principal/Admin only)
export async function GET(request: NextRequest) {
  try {
    const denied = await routeAccess(request)
    if (denied) return denied
    const auth = await withPermission(request, 'canViewAllUsers')
    
    if (!auth) {
      return permissionErrorResponse('You do not have permission to view all users')
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const role = searchParams.get('role')
    const search = searchParams.get('search')

    const prisma = (await import('@/lib/prisma')).prisma
    
    const where: any = {}
    
    if (status) {
      where.accountStatus = status
    }
    
    if (role) {
      where.role = role
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { staffIdentifier: { contains: search, mode: 'insensitive' } },
      ]
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        staffIdentifier: true,
        email: true,
        role: true,
        accountStatus: true,
        createdAt: true,
        approvedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(successResponse(users))
  } catch (error: any) {
    console.error('Get users error:', error)
    return NextResponse.json(errorResponse('INTERNAL_ERROR', 'Failed to get users'), { status: 500 })
  }
}

// POST /api/users - Create a new user (Principal/Admin only)
export async function POST(request: NextRequest) {
  try {
    const denied = await routeAccess(request)
    if (denied) return denied
    const auth = await withPermission(request, 'canCreateUser')
    
    if (!auth) {
      return permissionErrorResponse('You do not have permission to create users')
    }

    const body = await request.json()
    const validatedData = createUserSchema.parse(body)

    const user = await AuthService.createUser(validatedData)

    // Log user creation
    await AuditService.logEvent({
      actorId: auth.user.id,
      action: 'USER_CREATED',
      targetType: 'USER',
      targetId: user.id,
      metadata: { 
        email: user.email, 
        role: user.role,
        createdBy: auth.user.name 
      },
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    })

    return NextResponse.json(successResponse(user), { status: 201 })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(errorResponse('VALIDATION_ERROR', 'Invalid input data', error.issues), { status: 400 })
    }
    console.error('Create user error:', error)
    return NextResponse.json(errorResponse('INTERNAL_ERROR', error.message || 'Failed to create user'), { status: 400 })
  }
}
