import { prisma } from '@/lib/prisma'
import { createDisciplinaryActionSchema, updateDisciplinaryActionSchema } from '@/lib/validation'

export class DisciplinaryActionService {
  /**
   * Get disciplinary actions for a case
   */
  static async getActionsByCase(caseId: string) {
    try {
      const actions = await prisma.disciplinaryAction.findMany({
        where: { caseId },
        include: {
          responsibleUser: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      })

      return actions
    } catch (error: any) {
      console.error('Get actions error:', error)
      throw new Error('Failed to get disciplinary actions')
    }
  }

  /**
   * Get action by ID
   */
  static async getActionById(id: string) {
    try {
      const action = await prisma.disciplinaryAction.findUnique({
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
          responsibleUser: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      })

      return action
    } catch (error: any) {
      console.error('Get action error:', error)
      throw new Error('Failed to get disciplinary action')
    }
  }

  /**
   * Create a disciplinary action
   */
  static async createAction(data: {
    caseId: string
    actionType: string
    rationale: string
    startDate?: string | Date
    endDate?: string | Date
    responsibleUserId: string
  }) {
    try {
      // responsibleUserId is part of the validated schema, so only caseId is separated out
      const { caseId, ...actionData } = data
      const validatedData = createDisciplinaryActionSchema.parse(actionData)
      const responsibleUserId = validatedData.responsibleUserId

      // Verify case exists
      const caseExists = await prisma.case.findUnique({
        where: { id: caseId },
      })

      if (!caseExists) {
        throw new Error('Case not found')
      }

      const action = await prisma.disciplinaryAction.create({
        data: {
          caseId,
          actionType: validatedData.actionType,
          rationale: validatedData.rationale,
          startDate: validatedData.startDate ? new Date(validatedData.startDate) : null,
          endDate: validatedData.endDate ? new Date(validatedData.endDate) : null,
          responsibleUserId,
          status: 'PENDING',
        },
        include: {
          case: {
            select: {
              id: true,
              referenceNumber: true,
            },
          },
          responsibleUser: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      })

      return action
    } catch (error: any) {
      console.error('Create action error:', error)
      throw new Error(error.message || 'Failed to create disciplinary action')
    }
  }

  /**
   * Update disciplinary action status
   */
  static async updateActionStatus(id: string, status: string) {
    try {
      const validatedData = updateDisciplinaryActionSchema.parse({ status })

      const action = await prisma.disciplinaryAction.update({
        where: { id },
        data: {
          status: validatedData.status,
        },
        include: {
          responsibleUser: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      })

      return action
    } catch (error: any) {
      console.error('Update action status error:', error)
      throw new Error('Failed to update action status')
    }
  }
}
