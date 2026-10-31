import { prisma } from '@/lib/prisma'
import { getExportFields, filterSensitiveFields, UserRole } from '@/lib/permissions'
import { AuditService } from '@/services/audit.service'

export interface ExportFilters {
  dateFrom?: string
  dateTo?: string
  status?: string
  category?: string
  classGrade?: string
  reporterId?: string
  assignedToId?: string
}

export interface ExportOptions {
  filters: ExportFilters
  fields: string[]
  userId: string
  userRole: UserRole
  includeConfidential: boolean
}

export interface ExportResult {
  success: boolean
  csv?: string
  recordCount?: number
  error?: string
  filename?: string
}

export class CSVExportService {
  private static readonly MAX_EXPORT_RECORDS = 10000
  private static readonly BOM = '\uFEFF' // UTF-8 BOM for Excel compatibility

  /**
   * Escape CSV value to prevent injection and handle special characters
   */
  private static escapeCSV(value: any): string {
    if (value === null || value === undefined) {
      return ''
    }

    const stringValue = String(value)

    // Prevent CSV formula injection by prefixing with tab if starts with =, +, -, @
    if (/^[=+\-@]/.test(stringValue)) {
      return `\t${stringValue}`
    }

    // If value contains comma, quote, newline, or tab, wrap in quotes and escape quotes
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n') || stringValue.includes('\t')) {
      return `"${stringValue.replace(/"/g, '""')}"`
    }

    return stringValue
  }

  /**
   * Generate CSV header row
   */
  private static generateHeader(fields: string[]): string {
    return fields.map(field => this.escapeCSV(field)).join(',')
  }

  /**
   * Generate CSV data row from object
   */
  private static generateRow(data: Record<string, any>, fields: string[]): string {
    return fields.map(field => this.escapeCSV(data[field])).join(',')
  }

  /**
   * Format date for CSV export (ISO 8601 format)
   */
  private static formatDate(date: Date | string | null): string {
    if (!date) return ''
    const d = new Date(date)
    return d.toISOString().split('T')[0] // YYYY-MM-DD format
  }

  /**
   * Format datetime for CSV export
   */
  private static formatDateTime(date: Date | string | null): string {
    if (!date) return ''
    const d = new Date(date)
    return d.toISOString() // ISO 8601 format
  }

  /**
   * Get allowed fields for user role
   */
  private static getAllowedFields(userRole: UserRole, includeConfidential: boolean): string[] {
    const baseFields = [
      'referenceNumber',
      'studentId',
      'studentName',
      'classGrade',
      'incidentDate',
      'category',
      'status',
      'submittedAt',
      'reporterName',
    ]

    const extendedFields = [
      'description',
      'location',
      'witnesses',
      'decision',
      'decisionDate',
      'actionType',
      'actionStartDate',
      'actionEndDate',
      'interventionType',
      'interventionDate',
      'followUpStatus',
      'followUpDueDate',
      'closedAt',
    ]

    const confidentialFields = [
      'confidentialNotes',
    ]

    let fields = [...baseFields]

    // Principal and Admin get extended fields
    if (userRole === 'PRINCIPAL' || userRole === 'ADMIN') {
      fields = [...fields, ...extendedFields]
    }

    // Only add confidential fields if explicitly authorized
    if (includeConfidential && (userRole === 'PRINCIPAL' || userRole === 'COUNSELLOR')) {
      fields = [...fields, ...confidentialFields]
    }

    return fields
  }

  /**
   * Build where clause for filters
   */
  private static buildWhereClause(filters: ExportFilters, userId: string, userRole: UserRole) {
    const where: any = {}

    // Date range filter
    if (filters.dateFrom || filters.dateTo) {
      where.incidentDate = {}
      if (filters.dateFrom) {
        where.incidentDate.gte = new Date(filters.dateFrom)
      }
      if (filters.dateTo) {
        where.incidentDate.lte = new Date(filters.dateTo)
      }
    }

    // Status filter
    if (filters.status) {
      where.status = filters.status
    }

    // Category filter
    if (filters.category) {
      where.category = filters.category
    }

    // Class grade filter (through student relation)
    if (filters.classGrade) {
      where.student = {
        classGrade: filters.classGrade,
      }
    }

    // Role-based access control
    if (userRole === 'TEACHER') {
      // Teachers can only export their own cases
      where.reporterId = userId
    }

    // Reporter filter (Principal/Admin only)
    if (filters.reporterId && (userRole === 'PRINCIPAL' || userRole === 'ADMIN')) {
      where.reporterId = filters.reporterId
    }

    // Assigned to filter
    if (filters.assignedToId) {
      where.assignedToId = filters.assignedToId
    }

    return where
  }

  /**
   * Export cases to CSV
   */
  static async exportCases(options: ExportOptions): Promise<ExportResult> {
    try {
      // Validate user can export
      if (!this.canExport(options.userRole)) {
        return {
          success: false,
          error: 'User does not have permission to export data',
        }
      }

      // Get allowed fields
      const allowedFields = this.getAllowedFields(options.userRole, options.includeConfidential)

      // Validate requested fields against allowed fields
      const invalidFields = options.fields.filter(f => !allowedFields.includes(f))
      if (invalidFields.length > 0) {
        return {
          success: false,
          error: `Unauthorized fields requested: ${invalidFields.join(', ')}`,
        }
      }

      // Build where clause
      const where = this.buildWhereClause(options.filters, options.userId, options.userRole)

      // Count total records
      const totalCount = await prisma.case.count({ where })

      // Enforce export limit
      if (totalCount > this.MAX_EXPORT_RECORDS) {
        return {
          success: false,
          error: `Export limit exceeded. Maximum ${this.MAX_EXPORT_RECORDS} records allowed. Requested: ${totalCount}`,
        }
      }

      // Fetch cases with relations
      const cases = await prisma.case.findMany({
        where,
        include: {
          student: true,
          reporter: true,
          assignedTo: true,
          reviews: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
          actions: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
          interventions: {
            orderBy: { date: 'desc' },
            take: 1,
          },
          followUps: {
            orderBy: { dueDate: 'asc' },
            take: 1,
          },
        },
        orderBy: {
          incidentDate: 'desc',
        },
      })

      // Transform data for CSV
      const csvData = cases.map((caseItem) => {
        const row: Record<string, any> = {
          referenceNumber: caseItem.referenceNumber,
          studentId: caseItem.student.studentId,
          studentName: caseItem.student.name,
          classGrade: caseItem.student.classGrade,
          incidentDate: this.formatDate(caseItem.incidentDate),
          category: caseItem.category,
          status: caseItem.status,
          submittedAt: this.formatDate(caseItem.submittedAt),
          reporterName: caseItem.reporter.name,
        }

        // Add extended fields if authorized
        if (options.userRole === 'PRINCIPAL' || options.userRole === 'ADMIN') {
          row.description = caseItem.description
          row.location = caseItem.location || ''
          row.witnesses = caseItem.witnesses || ''
          row.decision = caseItem.reviews[0]?.result || ''
          row.decisionDate = this.formatDate(caseItem.reviews[0]?.createdAt)
          row.actionType = caseItem.actions[0]?.actionType || ''
          row.actionStartDate = this.formatDate(caseItem.actions[0]?.startDate)
          row.actionEndDate = this.formatDate(caseItem.actions[0]?.endDate)
          row.interventionType = caseItem.interventions[0]?.type || ''
          row.interventionDate = this.formatDate(caseItem.interventions[0]?.date)
          row.followUpStatus = caseItem.followUps[0]?.status || ''
          row.followUpDueDate = this.formatDate(caseItem.followUps[0]?.dueDate)
          row.closedAt = this.formatDate(caseItem.closedAt)
        }

        // Add confidential fields if authorized
        if (options.includeConfidential && (options.userRole === 'PRINCIPAL' || options.userRole === 'COUNSELLOR')) {
          row.confidentialNotes = caseItem.interventions[0]?.notes || ''
        }

        // Filter to requested fields
        const filteredRow: Record<string, any> = {}
        options.fields.forEach(field => {
          filteredRow[field] = row[field] || ''
        })

        return filteredRow
      })

      // Generate CSV
      const header = this.generateHeader(options.fields)
      const rows = csvData.map(data => this.generateRow(data, options.fields))
      const csv = this.BOM + [header, ...rows].join('\n')

      // Generate filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
      const filename = `sdms-cases-export-${timestamp}.csv`

      // Log export event
      await AuditService.logEvent({
        actorId: options.userId,
        action: 'DATA_EXPORT',
        targetType: 'Case',
        metadata: {
          filters: options.filters,
          fields: options.fields,
          recordCount: cases.length,
          includeConfidential: options.includeConfidential,
          filename,
        },
      })

      return {
        success: true,
        csv,
        recordCount: cases.length,
        filename,
      }
    } catch (error: any) {
      console.error('CSV export error:', error)

      // Log failed export attempt
      await AuditService.logEvent({
        actorId: options.userId,
        action: 'DATA_EXPORT_FAILED',
        targetType: 'Case',
        metadata: {
          filters: options.filters,
          fields: options.fields,
          error: error.message,
        },
      })

      return {
        success: false,
        error: error.message || 'Failed to export data',
      }
    }
  }

  /**
   * Check if user can export data
   */
  private static canExport(userRole: UserRole): boolean {
    return userRole === 'PRINCIPAL' || userRole === 'ADMIN'
  }

  /**
   * Get export statistics
   */
  static async getExportStats(filters: ExportFilters, userId: string, userRole: UserRole) {
    const where = this.buildWhereClause(filters, userId, userRole)

    const totalCount = await prisma.case.count({ where })

    // Count by status
    const statusCounts = await prisma.case.groupBy({
      by: ['status'],
      where,
      _count: true,
    })

    // Count by category
    const categoryCounts = await prisma.case.groupBy({
      by: ['category'],
      where,
      _count: true,
    })

    return {
      totalCount,
      statusCounts: statusCounts.map(s => ({ status: s.status, count: s._count })),
      categoryCounts: categoryCounts.map(c => ({ category: c.category, count: c._count })),
      maxExportLimit: this.MAX_EXPORT_RECORDS,
      requiresPagination: totalCount > this.MAX_EXPORT_RECORDS,
    }
  }
}
