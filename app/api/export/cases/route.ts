import { routeAccess } from '@/lib/route-access'
import { NextRequest, NextResponse } from 'next/server'
import { CSVExportService, ExportOptions, ExportFilters } from '@/lib/services/csv-export.service'
import { withAuth, authErrorResponse, permissionErrorResponse } from '@/lib/middleware'

// POST /api/export/cases - Export cases to CSV
export async function POST(request: NextRequest) {
  try {
    const denied = await routeAccess(request)
    if (denied) return denied
    const auth = await withAuth(request)
    
    if (!auth) {
      return authErrorResponse()
    }

    // Check export permission
    if (auth.user.role !== 'PRINCIPAL' && auth.user.role !== 'ADMIN') {
      return permissionErrorResponse('Only principals and admins can export data')
    }

    const body = await request.json()
    const { filters, fields, includeConfidential } = body

    // Validate fields
    if (!fields || !Array.isArray(fields) || fields.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Fields array is required' },
        { status: 400 }
      )
    }

    const options: ExportOptions = {
      filters: filters || {},
      fields,
      userId: auth.user.id,
      userRole: auth.user.role as any,
      includeConfidential: includeConfidential || false,
    }

    const result = await CSVExportService.exportCases(options)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      )
    }

    // Return CSV as downloadable file
    return new NextResponse(result.csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${result.filename}"`,
        'Cache-Control': 'no-cache',
      },
    })
  } catch (error: any) {
    console.error('Export error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to export data' },
      { status: 500 }
    )
  }
}

// GET /api/export/cases/stats - Get export statistics
export async function GET(request: NextRequest) {
  try {
    const denied = await routeAccess(request)
    if (denied) return denied
    const auth = await withAuth(request)
    
    if (!auth) {
      return authErrorResponse()
    }

    // Check export permission
    if (auth.user.role !== 'PRINCIPAL' && auth.user.role !== 'ADMIN') {
      return permissionErrorResponse('Only principals and admins can view export stats')
    }

    const { searchParams } = new URL(request.url)
    const filters: ExportFilters = {
      dateFrom: searchParams.get('dateFrom') || undefined,
      dateTo: searchParams.get('dateTo') || undefined,
      status: searchParams.get('status') || undefined,
      category: searchParams.get('category') || undefined,
      classGrade: searchParams.get('classGrade') || undefined,
      reporterId: searchParams.get('reporterId') || undefined,
      assignedToId: searchParams.get('assignedToId') || undefined,
    }

    const stats = await CSVExportService.getExportStats(
      filters,
      auth.user.id,
      auth.user.role as any
    )

    return NextResponse.json({ success: true, data: stats })
  } catch (error: any) {
    console.error('Export stats error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to get export stats' },
      { status: 500 }
    )
  }
}
