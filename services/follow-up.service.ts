import { prisma } from '@/lib/prisma'
import { createFollowUpSchema, updateFollowUpSchema } from '@/lib/validation'

export class FollowUpService {
  /**
   * Get follow-ups for a case
   */
  static async getFollowUpsByCase(caseId: string) {
    try {
      const followUps = await prisma.followUp.findMany({
        where: { caseId },
        include: {
          assignedUser: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { dueDate: 'asc' },
      })

      return followUps
    } catch (error: any) {
      console.error('Get follow-ups error:', error)
      throw new Error('Failed to get follow-ups')
    }
  }

  /**
   * Get follow-ups assigned to a user
   */
  static async getFollowUpsByUser(userId: string) {
    try {
      const followUps = await prisma.followUp.findMany({
        where: { assignedUserId: userId },
        include: {
          case: {
            select: {
              id: true,
              referenceNumber: true,
              student: {
                select: {
                  id: true,
                  studentId: true,
                  name: true,
                },
              },
            },
          },
          assignedUser: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { dueDate: 'asc' },
      })

      return followUps
    } catch (error: any) {
      console.error('Get user follow-ups error:', error)
      throw new Error('Failed to get user follow-ups')
    }
  }

  /**
   * Get follow-up by ID
   */
  static async getFollowUpById(id: string) {
    try {
      const followUp = await prisma.followUp.findUnique({
        where: { id },
        include: {
          case: {
            select: {
              id: true,
              referenceNumber: true,
              student: {
                select: {
                  id: true,
                  studentId: true,
                  name: true,
                },
              },
            },
          },
          assignedUser: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      })

      return followUp
    } catch (error: any) {
      console.error('Get follow-up error:', error)
      throw new Error('Failed to get follow-up')
    }
  }

  /**
   * Create a new follow-up
   */
  static async createFollowUp(data: {
    caseId: string
    dueDate: string | Date
    assignedUserId: string
    nextStep?: string
  }) {
    try {
      // Extract caseId and assignedUserId before validation
      const { caseId, assignedUserId, ...followUpData } = data
      const validatedData = createFollowUpSchema.parse(followUpData)

      // Verify case exists
      const caseExists = await prisma.case.findUnique({
        where: { id: caseId },
      })

      if (!caseExists) {
        throw new Error('Case not found')
      }

      const followUp = await prisma.followUp.create({
        data: {
          caseId,
          dueDate: new Date(validatedData.dueDate),
          assignedUserId,
          nextStep: validatedData.nextStep,
          status: 'PENDING',
        },
        include: {
          case: {
            select: {
              id: true,
              referenceNumber: true,
            },
          },
          assignedUser: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      })

      return followUp
    } catch (error: any) {
      console.error('Create follow-up error:', error)
      throw new Error(error.message || 'Failed to create follow-up')
    }
  }

  /**
   * Update follow-up
   */
  static async updateFollowUp(id: string, data: {
    completionDate?: string | Date
    result?: string
    nextStep?: string
    status?: string
  }) {
    try {
      const validatedData = updateFollowUpSchema.parse(data)

      const updateData: any = {}

      if (validatedData.completionDate) {
        updateData.completionDate = new Date(validatedData.completionDate)
      }

      if (validatedData.result !== undefined) {
        updateData.result = validatedData.result
      }

      if (validatedData.nextStep !== undefined) {
        updateData.nextStep = validatedData.nextStep
      }

      if (validatedData.status) {
        updateData.status = validatedData.status
      }

      const followUp = await prisma.followUp.update({
        where: { id },
        data: updateData,
        include: {
          assignedUser: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      })

      return followUp
    } catch (error: any) {
      console.error('Update follow-up error:', error)
      throw new Error('Failed to update follow-up')
    }
  }

  /**
   * Update overdue follow-ups
   */
  static async updateOverdueFollowUps() {
    try {
      const overdueFollowUps = await prisma.followUp.findMany({
        where: {
          status: 'PENDING',
          dueDate: {
            lt: new Date(),
          },
        },
      })

      const updates = overdueFollowUps.map((followUp: { id: string }) =>
        prisma.followUp.update({
          where: { id: followUp.id },
          data: { status: 'OVERDUE' },
        })
      )

      await Promise.all(updates)

      return overdueFollowUps.length
    } catch (error: any) {
      console.error('Update overdue follow-ups error:', error)
      throw new Error('Failed to update overdue follow-ups')
    }
  }
}
