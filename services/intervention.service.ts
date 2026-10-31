import { prisma } from '@/lib/prisma'
import { createInterventionSchema, updateInterventionSchema, createConfidentialNoteSchema } from '@/lib/validation'

export class InterventionService {
  /**
   * Get interventions for a case
   */
  static async getInterventionsByCase(caseId: string) {
    try {
      const interventions = await prisma.intervention.findMany({
        where: { caseId },
        include: {
          counsellor: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { date: 'desc' },
      })

      return interventions
    } catch (error: any) {
      console.error('Get interventions error:', error)
      throw new Error('Failed to get interventions')
    }
  }

  /**
   * Get intervention by ID
   */
  static async getInterventionById(id: string) {
    try {
      const intervention = await prisma.intervention.findUnique({
        where: { id },
        include: {
          counsellor: {
            select: {
              id: true,
              name: true,
            },
          },
          confidentialNotes: {
            select: {
              id: true,
              notes: true,
              createdAt: true,
              createdBy: true,
            },
          },
        },
      })

      return intervention
    } catch (error: any) {
      console.error('Get intervention error:', error)
      throw new Error('Failed to get intervention')
    }
  }

  /**
   * Create a new intervention
   */
  static async createIntervention(data: {
    caseId: string
    counsellorId: string
    type: string
    date: string | Date
    notes: string
    confidentialityLevel?: string
    outcome?: string
    nextStep?: string
  }) {
    try {
      // Extract caseId and counsellorId before validation (they come from auth/context)
      const { caseId, counsellorId, ...interventionData } = data
      const validatedData = createInterventionSchema.parse(interventionData)

      // Verify case exists
      const caseExists = await prisma.case.findUnique({
        where: { id: caseId },
      })

      if (!caseExists) {
        throw new Error('Case not found')
      }

      const intervention = await prisma.intervention.create({
        data: {
          caseId,
          counsellorId,
          type: validatedData.type,
          date: new Date(validatedData.date),
          notes: validatedData.notes,
          confidentialityLevel: validatedData.confidentialityLevel || 'STANDARD',
          outcome: validatedData.outcome,
          nextStep: validatedData.nextStep,
        },
        include: {
          counsellor: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      })

      return intervention
    } catch (error: any) {
      console.error('Create intervention error:', error)
      throw new Error(error.message || 'Failed to create intervention')
    }
  }

  /**
   * Update intervention
   */
  static async updateIntervention(id: string, data: {
    type?: string
    date?: string | Date
    notes?: string
    confidentialityLevel?: string
    outcome?: string
    nextStep?: string
  }) {
    try {
      const validatedData = updateInterventionSchema.parse(data)

      const intervention = await prisma.intervention.update({
        where: { id },
        data: validatedData,
        include: {
          counsellor: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      })

      return intervention
    } catch (error: any) {
      console.error('Update intervention error:', error)
      throw new Error('Failed to update intervention')
    }
  }

  /**
   * Create confidential note for intervention
   */
  static async createConfidentialNote(interventionId: string, notes: string, createdBy: string) {
    try {
      const validatedData = createConfidentialNoteSchema.parse({ notes })

      // Verify intervention exists
      const intervention = await prisma.intervention.findUnique({
        where: { id: interventionId },
      })

      if (!intervention) {
        throw new Error('Intervention not found')
      }

      const confidentialNote = await prisma.confidentialNote.create({
        data: {
          interventionId,
          notes: validatedData.notes,
          createdBy,
        },
      })

      return confidentialNote
    } catch (error: any) {
      console.error('Create confidential note error:', error)
      throw new Error(error.message || 'Failed to create confidential note')
    }
  }

  /**
   * Get confidential notes for intervention
   */
  static async getConfidentialNotes(interventionId: string) {
    try {
      const notes = await prisma.confidentialNote.findMany({
        where: { interventionId },
        select: {
          id: true,
          notes: true,
          createdAt: true,
          createdBy: true,
        },
        orderBy: { createdAt: 'desc' },
      })

      return notes
    } catch (error: any) {
      console.error('Get confidential notes error:', error)
      throw new Error('Failed to get confidential notes')
    }
  }
}
