import { routeAccess } from '@/lib/route-access'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse } from '@/lib/api-response'
import { withAuth, authErrorResponse, permissionErrorResponse } from '@/lib/middleware'

// GET /api/configuration/[key] - Get configuration by key
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const denied = await routeAccess(request)
    if (denied) return denied
    const auth = await withAuth(request)
    
    if (!auth) {
      return authErrorResponse()
    }

    const { key } = await params
    const configuration = await prisma.configuration.findUnique({
      where: { key },
    })

    if (!configuration) {
      return NextResponse.json(errorResponse('NOT_FOUND', 'Configuration not found'), { status: 404 })
    }

    return NextResponse.json(successResponse(configuration))
  } catch (error: any) {
    console.error('Get configuration error:', error)
    return NextResponse.json(errorResponse('INTERNAL_ERROR', 'Failed to get configuration'), { status: 500 })
  }
}

// PATCH /api/configuration/[key] - Update configuration
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const denied = await routeAccess(request)
    if (denied) return denied
    const auth = await withAuth(request)
    
    if (!auth) {
      return authErrorResponse()
    }

    // Only principals and admins can update configuration
    if (auth.user.role !== 'PRINCIPAL' && auth.user.role !== 'ADMIN') {
      return permissionErrorResponse('You do not have permission to update configuration')
    }

    const { key } = await params
    const body = await request.json()
    if (!['INCIDENT_CATEGORIES','ACTION_TYPES','INTERVENTION_TYPES'].includes(key) || !Array.isArray(body.value) || body.value.length === 0 || body.value.length > 100 || body.value.some((v:unknown) => typeof v !== 'string' || !v.trim() || v.length > 200)) return NextResponse.json(errorResponse('VALIDATION_ERROR','Expected a non-empty category list'),{status:400})
    
    const configuration = await prisma.configuration.update({
      where: { key },
      data: {
        value: body.value,
      },
    })

    return NextResponse.json(successResponse(configuration))
  } catch (error: any) {
    console.error('Update configuration error:', error)
    return NextResponse.json(errorResponse('INTERNAL_ERROR', 'Failed to update configuration'), { status: 500 })
  }
}
