import { prisma } from '@/lib/prisma'
import { createCaseSchema, updateCaseSchema, updateCaseStatusSchema, reopenCaseSchema, caseFilterSchema } from '@/lib/validation'
import { canTransitionStatus } from '@/lib/permissions'

export class CaseService {
  /**
   * Generate unique reference number
   */
  static async generateReferenceNumber(): Promise<string> {
    const year = new Date().getFullYear()
    return `INC-${year}-${crypto.randomUUID()}`
  }

  /**
   * Get cases with filters and pagination
   */
  static async getCases(filters: {
    search?: string
    status?: string
    studentId?: string
    assignedToId?: string
    reporterId?: string
    category?: string
    incidentDateFrom?: string
    incidentDateTo?: string
    classGrade?: string
    sort?: string
    page?: string
    limit?: string
  }) {
    try {
      const validatedFilters = caseFilterSchema.parse(filters)
      const page = parseInt(validatedFilters.page || '1')
      const limit = parseInt(validatedFilters.limit || '20')
      const skip = (page - 1) * limit

      const where: any = {}
      if (validatedFilters.search) where.OR = [
        { referenceNumber: { contains: validatedFilters.search, mode: 'insensitive' } },
        { description: { contains: validatedFilters.search, mode: 'insensitive' } },
        { student: { name: { contains: validatedFilters.search, mode: 'insensitive' } } },
        { student: { studentId: { contains: validatedFilters.search, mode: 'insensitive' } } },
      ]
      if (validatedFilters.classGrade) where.student = { classGrade: { equals: validatedFilters.classGrade, mode: 'insensitive' } }
      if (validatedFilters.assignedToId) where.assignedToId = validatedFilters.assignedToId

      if (validatedFilters.status) {
        where.status = validatedFilters.status
      }

      if (validatedFilters.studentId) {
        where.studentId = validatedFilters.studentId
      }

      if (validatedFilters.reporterId) {
        where.reporterId = validatedFilters.reporterId
      }

      if (validatedFilters.category) {
        where.category = validatedFilters.category
      }

      if (validatedFilters.incidentDateFrom || validatedFilters.incidentDateTo) {
        where.incidentDate = {}
        if (validatedFilters.incidentDateFrom) {
          where.incidentDate.gte = new Date(validatedFilters.incidentDateFrom)
        }
        if (validatedFilters.incidentDateTo) {
          // A plain date (YYYY-MM-DD) means "up to the end of that day".
          const to = new Date(validatedFilters.incidentDateTo)
          if (/^\d{4}-\d{2}-\d{2}$/.test(validatedFilters.incidentDateTo)) to.setUTCHours(23, 59, 59, 999)
          where.incidentDate.lte = to
        }
      }

      const [cases, total] = await Promise.all([
        prisma.case.findMany({
          where,
          select: {
            id: true,
            referenceNumber: true,
            student: {
              select: {
                id: true,
                studentId: true,
                name: true,
                classGrade: true,
              },
            },
            reporter: {
              select: {
                id: true,
                name: true,
              },
            },
            incidentDate: true,
            category: true,
            status: true,
            submittedAt: true,
          },
          orderBy: {
            newest: { submittedAt: 'desc' as const },
            oldest: { submittedAt: 'asc' as const },
            incident_desc: { incidentDate: 'desc' as const },
            incident_asc: { incidentDate: 'asc' as const },
          }[validatedFilters.sort ?? 'newest'],
          skip,
          take: limit,
        }),
        prisma.case.count({ where }),
      ])

      return {
        cases,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      }
    } catch (error: any) {
      console.error('Get cases error:', error)
      throw new Error('Failed to get cases')
    }
  }

  /**
   * Get case by ID with full details
   */
  static async getCaseById(id: string) {
    try {
      const caseData = await prisma.case.findUnique({
        where: { id },
        include: {
          student: {
            select: {
              id: true,
              studentId: true,
              name: true,
              classGrade: true,
              activeStatus: true,
            },
          },
          reporter: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          assignedTo: {
            select: {
              id: true,
              name: true,
              role: true,
            },
          },
          reviews: {
            include: {
              reviewer: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
            orderBy: { reviewDate: 'desc' },
          },
          actions: {
            include: {
              responsibleUser: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
            orderBy: { createdAt: 'desc' },
          },
          interventions: {
            include: {
              counsellor: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
            orderBy: { date: 'desc' },
          },
          followUps: {
            include: {
              assignedUser: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
            orderBy: { dueDate: 'asc' },
          },
        },
      })

      return caseData
    } catch (error: any) {
      console.error('Get case error:', error)
      throw new Error('Failed to get case')
    }
  }

  /**
   * Create a new case
   */
  static async createCase(data: {
    studentId: string
    reporterId: string
    incidentDate: string | Date
    incidentTime?: string | Date
    category: string
    description: string
    location?: string
    witnesses?: string
    immediateSafetyConcern?: boolean
  }) {
    try {
      // Extract reporterId before validation (it comes from auth context, not request body)
      const { reporterId, ...caseData } = data
      const selectedStudent = await prisma.student.findFirst({ where: { OR: [{ id: caseData.studentId }, { studentId: caseData.studentId }], activeStatus: true } })
      if (!selectedStudent) throw new Error('Active student not found')
      const validatedData = createCaseSchema.parse({ ...caseData, studentId: selectedStudent.id })

      // Verify student exists
      const student = await prisma.student.findUnique({
        where: { id: validatedData.studentId },
      })

      if (!student) {
        throw new Error('Student not found')
      }

      // Generate reference number
      const referenceNumber = await this.generateReferenceNumber()

      const caseRecord = await prisma.case.create({
        data: {
          referenceNumber,
          studentId: validatedData.studentId,
          reporterId, // Add reporterId from auth context
          incidentDate: new Date(validatedData.incidentDate),
          incidentTime: validatedData.incidentTime ? new Date(validatedData.incidentTime) : null,
          category: validatedData.category,
          description: validatedData.description,
          location: validatedData.location,
          witnesses: validatedData.witnesses,
          immediateSafetyConcern: validatedData.immediateSafetyConcern || false,
          status: 'SUBMITTED',
        },
        include: {
          student: {
            select: {
              id: true,
              studentId: true,
              name: true,
              classGrade: true,
            },
          },
          reporter: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      })

      return caseRecord
    } catch (error: any) {
      console.error('Create case error:', error)
      throw new Error(error.message || 'Failed to create case')
    }
  }

  /**
   * Update case (limited fields)
   */
  static async updateCase(id: string, data: {
    description?: string
    location?: string
    witnesses?: string
  }) {
    try {
      const validatedData = updateCaseSchema.parse(data)

      const caseData = await prisma.case.update({
        where: { id },
        data: validatedData,
        select: {
          id: true,
          referenceNumber: true,
          description: true,
          location: true,
          witnesses: true,
          updatedAt: true,
        },
      })

      return caseData
    } catch (error: any) {
      console.error('Update case error:', error)
      throw new Error('Failed to update case')
    }
  }

  /**
   * Update case status
   */
  static async updateCaseStatus(
    id: string,
    newStatus: string,
    userRole: string,
    reason?: string
  ) {
    try {
      const validatedData = updateCaseStatusSchema.parse({ status: newStatus, reason })

      // Get current case
      const currentCase = await prisma.case.findUnique({
        where: { id },
        select: { status: true },
      })

      if (!currentCase) {
        throw new Error('Case not found')
      }

      // Check if transition is allowed
      const canTransition = canTransitionStatus(
        currentCase.status as any,
        validatedData.status as any,
        userRole as any
      )

      if (!canTransition) {
        throw new Error(`Cannot transition from ${currentCase.status} to ${validatedData.status}`)
      }

      const updateData: any = {
        status: validatedData.status,
      }

      // Handle closure
      if (validatedData.status === 'CLOSED') {
        updateData.closedAt = new Date()
        updateData.closedBy = reason // Using reason field to pass user ID
      }

      const caseData = await prisma.case.update({
        where: { id },
        data: updateData,
        select: {
          id: true,
          referenceNumber: true,
          status: true,
          updatedAt: true,
          closedAt: true,
        },
      })

      return caseData
    } catch (error: any) {
      console.error('Update case status error:', error)
      throw new Error(error.message || 'Failed to update case status')
    }
  }

  /**
   * Reopen a closed case
   */
  static async reopenCase(id: string, reason: string, userId: string) {
    try {
      const validatedData = reopenCaseSchema.parse({ reason })

      const caseData = await prisma.case.update({
        where: { id },
        data: {
          status: 'REOPENED',
          reopenedAt: new Date(),
          reopenedBy: userId,
          reopenReason: validatedData.reason,
        },
        select: {
          id: true,
          referenceNumber: true,
          status: true,
          reopenedAt: true,
        },
      })

      return caseData
    } catch (error: any) {
      console.error('Reopen case error:', error)
      throw new Error(error.message || 'Failed to reopen case')
    }
  }

  /**
   * Get case history (audit events)
   */
  static async getCaseHistory(id: string) {
    try {
      const auditEvents = await prisma.auditEvent.findMany({
        where: {
          targetType: 'CASE',
          targetId: id,
        },
        include: {
          actor: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { timestamp: 'desc' },
      })

      return auditEvents
    } catch (error: any) {
      console.error('Get case history error:', error)
      throw new Error('Failed to get case history')
    }
  }

  /**
   * Check for potential duplicate cases
   */
  static async checkForDuplicates(studentId: string, category: string, incidentDate: Date) {
    try {
      const duplicates = await prisma.case.findMany({
        where: {
          studentId,
          category,
          incidentDate: {
            gte: new Date(incidentDate.getTime() - 24 * 60 * 60 * 1000), // Within 24 hours
            lte: new Date(incidentDate.getTime() + 24 * 60 * 60 * 1000),
          },
          status: {
            not: 'REJECTED',
          },
        },
        select: {
          id: true,
          referenceNumber: true,
          incidentDate: true,
          status: true,
        },
      })

      return duplicates
    } catch (error: any) {
      console.error('Check duplicates error:', error)
      throw new Error('Failed to check for duplicates')
    }
  }
}
