import { prisma } from '@/lib/prisma'
import { createCaseReviewSchema, respondToClarificationSchema } from '@/lib/validation'

export class CaseReviewService {
  /**
   * Get reviews for a case
   */
  static async getReviewsByCase(caseId: string) {
    try {
      const reviews = await prisma.caseReview.findMany({
        where: { caseId },
        include: {
          reviewer: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { reviewDate: 'desc' },
      })

      return reviews
    } catch (error: any) {
      console.error('Get reviews error:', error)
      throw new Error('Failed to get reviews')
    }
  }

  /**
   * Create a case review
   */
  static async createReview(data: {
    caseId: string
    reviewerId: string
    result: string
    clarificationRequest?: string
    notes?: string
  }) {
    try {
      // Extract caseId and reviewerId before validation (they come from auth/context)
      const { caseId, reviewerId, ...reviewData } = data
      const validatedData = createCaseReviewSchema.parse(reviewData)

      // Verify case exists
      const caseExists = await prisma.case.findUnique({
        where: { id: caseId },
      })

      if (!caseExists) {
        throw new Error('Case not found')
      }

      const review = await prisma.caseReview.create({
        data: {
          caseId,
          reviewerId,
          result: validatedData.result,
          clarificationRequest: validatedData.clarificationRequest,
          notes: validatedData.notes,
        },
        include: {
          reviewer: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      })

      return review
    } catch (error: any) {
      console.error('Create review error:', error)
      throw new Error(error.message || 'Failed to create review')
    }
  }

  /**
   * Respond to clarification request
   */
  static async respondToClarification(caseId: string, response: string) {
    try {
      const validatedData = respondToClarificationSchema.parse({ response })

      // Update case status back to UNDER_REVIEW
      const caseData = await prisma.case.update({
        where: { id: caseId },
        data: {
          status: 'UNDER_REVIEW',
        },
        select: {
          id: true,
          referenceNumber: true,
          status: true,
        },
      })

      return caseData
    } catch (error: any) {
      console.error('Respond to clarification error:', error)
      throw new Error(error.message || 'Failed to respond to clarification')
    }
  }
}
