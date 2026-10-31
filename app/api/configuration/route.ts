import { routeAccess } from '@/lib/route-access'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse } from '@/lib/api-response'

// GET /api/configuration - Get all configuration
export async function GET(request: NextRequest) {
  try {
    const denied = await routeAccess(request)
    if (denied) return denied
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    const where: any = {}
    if (category) {
      where.category = category
    }

    const configurations = await prisma.configuration.findMany({
      where,
      orderBy: { category: 'asc' },
    })

    return NextResponse.json(successResponse(configurations))
  } catch (error: any) {
    console.error('Get configuration error:', error)
    return NextResponse.json(errorResponse('INTERNAL_ERROR', 'Failed to get configuration'), { status: 500 })
  }
}
