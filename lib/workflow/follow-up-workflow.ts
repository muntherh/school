import { prisma } from '@/lib/prisma'
import { AuditService } from '@/services/audit.service'

export interface FollowUpAssignmentInput {
  caseId: string
  dueDate: Date
  assignedUserId: string
  assignedBy: string
  notes?: string
}

export interface FollowUpCompletionInput {
  followUpId: string
  completedBy: string
  result: string
  nextStep?: string
}

export class FollowUpWorkflowService {
  /**
   * Create and assign a follow-up
   */
  static async assignFollowUp(input: FollowUpAssignmentInput) {
    const followUp = await prisma.followUp.create({
      data: {
        caseId: input.caseId,
        dueDate: input.dueDate,
        assignedUserId: input.assignedUserId,
        notes: input.notes,
        status: 'PENDING',
      },
      include: {
        case: true,
        assignedUser: true,
      },
    })

    // Update case status to FOLLOW_UP_PENDING if not already
    const currentCase = await prisma.case.findUnique({
      where: { id: input.caseId },
    })

    if (currentCase && currentCase.status !== 'FOLLOW_UP_PENDING' && currentCase.status !== 'CLOSED') {
      await prisma.case.update({
        where: { id: input.caseId },
        data: {
          status: 'FOLLOW_UP_PENDING',
          version: { increment: 1 },
        },
      })
    }

    // Log audit event
    await AuditService.logEvent({
      actorId: input.assignedBy,
      action: 'FOLLOW_UP_ASSIGNED',
      targetType: 'FollowUp',
      targetId: followUp.id,
      metadata: {
        caseId: input.caseId,
        assignedToId: input.assignedUserId,
        dueDate: input.dueDate.toISOString(),
        referenceNumber: currentCase?.referenceNumber,
      },
    })

    return followUp
  }

  /**
   * Mark a follow-up as completed
   */
  static async completeFollowUp(input: FollowUpCompletionInput) {
    const followUp = await prisma.followUp.findUnique({
      where: { id: input.followUpId },
      include: { case: true },
    })

    if (!followUp) {
      throw new Error('Follow-up not found')
    }

    if (followUp.status === 'COMPLETED') {
      throw new Error('Follow-up is already completed')
    }

    const updatedFollowUp = await prisma.followUp.update({
      where: { id: input.followUpId },
      data: {
        status: 'COMPLETED',
        completionDate: new Date(),
        completedBy: input.completedBy,
        result: input.result,
        nextStep: input.nextStep,
      },
      include: {
        case: true,
        assignedUser: true,
      },
    })

    // Check if all follow-ups for this case are completed
    const pendingFollowUps = await prisma.followUp.count({
      where: {
        caseId: followUp.caseId,
        status: 'PENDING',
      },
    })

    // If no pending follow-ups, consider closing the case
    if (pendingFollowUps === 0 && followUp.case.status === 'FOLLOW_UP_PENDING') {
      await prisma.case.update({
        where: { id: followUp.caseId },
        data: {
          status: 'CLOSED',
          closedAt: new Date(),
          closedBy: input.completedBy,
          version: { increment: 1 },
        },
      })
    }

    // Log audit event
    await AuditService.logEvent({
      actorId: input.completedBy,
      action: 'FOLLOW_UP_COMPLETED',
      targetType: 'FollowUp',
      targetId: input.followUpId,
      metadata: {
        caseId: followUp.caseId,
        result: input.result,
        nextStep: input.nextStep,
        referenceNumber: followUp.case.referenceNumber,
      },
    })

    return updatedFollowUp
  }

  /**
   * Get overdue follow-ups
   */
  static async getOverdueFollowUps() {
    const now = new Date()
    const overdueFollowUps = await prisma.followUp.findMany({
      where: {
        status: 'PENDING',
        dueDate: {
          lt: now,
        },
      },
      include: {
        case: true,
        assignedUser: true,
      },
      orderBy: {
        dueDate: 'asc',
      },
    })

    // Update status to OVERDUE
    for (const followUp of overdueFollowUps) {
      await prisma.followUp.update({
        where: { id: followUp.id },
        data: { status: 'OVERDUE' },
      })
    }

    return overdueFollowUps
  }

  /**
   * Get upcoming follow-ups (within next 7 days)
   */
  static async getUpcomingFollowUps() {
    const now = new Date()
    const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

    return await prisma.followUp.findMany({
      where: {
        status: 'PENDING',
        dueDate: {
          gte: now,
          lte: sevenDaysLater,
        },
      },
      include: {
        case: true,
        assignedUser: true,
      },
      orderBy: {
        dueDate: 'asc',
      },
    })
  }
}
