import { NextRequest, NextResponse } from 'next/server'
import { InterventionService } from '@/services/intervention.service'
import { successResponse, errorResponse } from '@/lib/api-response'
import { withAuth, authErrorResponse, permissionErrorResponse } from '@/lib/middleware'
import { canViewConfidentialNotes } from '@/lib/permissions'

// GET /api/interventions/[id]/confidential-notes - Get confidential notes
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await withAuth(request)
    
    if (!auth) {
      return authErrorResponse()
    }

    // Check if user can view confidential notes
    if (!canViewConfidentialNotes(auth.user.role as any, '', auth.user.id)) {
      return permissionErrorResponse('You do not have permission to view confidential notes')
    }

    const { id } = await params
    const notes = await InterventionService.getConfidentialNotes(id)

    return NextResponse.json(successResponse(notes))
  } catch (error: any) {
    console.error('Get confidential notes error:', error)
    return NextResponse.json(errorResponse('INTERNAL_ERROR', 'Failed to get confidential notes'), { status: 500 })
  }
}

// POST /api/interventions/[id]/confidential-notes - Create confidential note
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await withAuth(request)
    
    if (!auth) {
      return authErrorResponse()
    }

    // Only principals and counsellors can create confidential notes
    if (auth.user.role !== 'PRINCIPAL' && auth.user.role !== 'COUNSELLOR') {
      return permissionErrorResponse('You do not have permission to create confidential notes')
    }

    const { id } = await params
    const body = await request.json()
    
    const note = await InterventionService.createConfidentialNote(id, body.notes, auth.user.id)

    return NextResponse.json(successResponse(note), { status: 201 })
  } catch (error: any) {
    console.error('Create confidential note error:', error)
    return NextResponse.json(errorResponse('INTERNAL_ERROR', error.message || 'Failed to create confidential note'), { status: 400 })
  }
}
