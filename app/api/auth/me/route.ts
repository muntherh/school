import { NextRequest, NextResponse } from 'next/server'
import { successResponse, errorResponse } from '@/lib/api-response'
import { requireActiveSession } from '@/lib/session'

export async function GET(request: NextRequest) {
  try {
    const session = await requireActiveSession()
    
    return NextResponse.json(successResponse({
      id: session.userId,
      name: session.name,
      email: session.email,
      role: session.role,
      accountStatus: session.accountStatus,
    }))
  } catch (error: any) {
    return NextResponse.json(errorResponse('UNAUTHORIZED', 'Not authenticated'), { status: 401 })
  }
}
