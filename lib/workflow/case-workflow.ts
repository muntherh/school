import { prisma } from '@/lib/prisma'
import { canTransitionStatus, CASE_STATUS_TRANSITIONS, CaseStatusCode } from '@/lib/permissions'
import { AuditService } from '@/services/audit.service'
import { Prisma } from '@prisma/client'

export interface TransitionResult {
  success: boolean
  case?: any
  error?: string
}

export interface CaseAssignmentInput {
  caseId: string
  assignedToId: string
  assignedBy: string
  rationale?: string
}

export interface ClarificationRequestInput {
  caseId: string
  requestedBy: string
  clarificationRequest: string
}

export interface ClarificationResponseInput {
  caseId: string
  respondedBy: string
  clarificationResponse: string
}

export class CaseWorkflowService {
  /**
   * Transition case status with validation and audit logging
   */
  static async transitionStatus(
    caseId: string,
    newStatus: CaseStatusCode,
    actorId: string,
    actorRole: string,
    rationale?: string,
    currentVersion?: number
  ): Promise<TransitionResult> {
    // Fetch current case with version for optimistic locking
    const currentCase = await prisma.case.findUnique({
      where: { id: caseId },
      include: { student: true, reporter: true },
    })

    if (!currentCase) {
      return { success: false, error: 'Case not found' }
    }

    // Optimistic locking check
    if (currentVersion !== undefined && currentCase.version !== currentVersion) {
      return { success: false, error: 'Case was modified by another user. Please refresh and try again.' }
    }

    // Validate status transition
    if (!canTransitionStatus(currentCase.status as CaseStatusCode, newStatus, actorRole as any)) {
      return { 
        success: false, 
        error: `Invalid status transition from ${currentCase.status} to ${newStatus}` 
      }
    }

    // Prepare update data
    const updateData: Prisma.CaseUpdateInput = {
      status: newStatus,
      version: { increment: 1 },
    }

    // Add status-specific fields
    if (newStatus === 'CLOSED') {
      updateData.closedAt = new Date()
      updateData.closedBy = actorId
    } else if (newStatus === 'REOPENED') {
      updateData.reopenedAt = new Date()
      updateData.reopenedBy = actorId
      updateData.reopenReason = rationale
    }

    // Perform transition
    const updatedCase = await prisma.case.update({
      where: { id: caseId },
      data: updateData,
      include: { student: true, reporter: true },
    })

    // Log audit event
    await AuditService.logEvent({
      actorId,
      action: 'CASE_STATUS_TRANSITION',
      targetType: 'Case',
      targetId: caseId,
      metadata: {
        fromStatus: currentCase.status,
        toStatus: newStatus,
        rationale,
        referenceNumber: currentCase.referenceNumber,
      },
    })

    return { success: true, case: updatedCase }
  }

  /**
   * Assign case to a staff member
   */
  static async assignCase(input: CaseAssignmentInput): Promise<TransitionResult> {
    const currentCase = await prisma.case.findUnique({
      where: { id: input.caseId },
    })

    if (!currentCase) {
      return { success: false, error: 'Case not found' }
    }

    // Validate status - can only assign from SUBMITTED, UNDER_REVIEW, or CLARIFICATION_REQUIRED
    const assignableStatuses = ['SUBMITTED', 'UNDER_REVIEW', 'CLARIFICATION_REQUIRED']
    if (!assignableStatuses.includes(currentCase.status)) {
      return { success: false, error: `Cannot assign case in status ${currentCase.status}` }
    }

    // Verify assigned user exists and is active
    const assignedUser = await prisma.user.findUnique({
      where: { id: input.assignedToId },
    })

    if (!assignedUser || assignedUser.accountStatus !== 'ACTIVE') {
      return { success: false, error: 'Assigned user not found or not active' }
    }

    // Update case
    const updatedCase = await prisma.case.update({
      where: { id: input.caseId },
      data: {
        assignedToId: input.assignedToId,
        assignedAt: new Date(),
        status: 'ASSIGNED',
        version: { increment: 1 },
      },
      include: { student: true, reporter: true, assignedTo: true },
    })

    // Log audit event
    await AuditService.logEvent({
      actorId: input.assignedBy,
      action: 'CASE_ASSIGNED',
      targetType: 'Case',
      targetId: input.caseId,
      metadata: {
        assignedToId: input.assignedToId,
        assignedToName: assignedUser.name,
        assignedToRole: assignedUser.role,
        rationale: input.rationale,
        referenceNumber: currentCase.referenceNumber,
      },
    })

    return { success: true, case: updatedCase }
  }

  /**
   * Request clarification from reporter
   */
  static async requestClarification(input: ClarificationRequestInput): Promise<TransitionResult> {
    const currentCase = await prisma.case.findUnique({
      where: { id: input.caseId },
    })

    if (!currentCase) {
      return { success: false, error: 'Case not found' }
    }

    // Create clarification request as a review
    const review = await prisma.caseReview.create({
      data: {
        caseId: input.caseId,
        reviewerId: input.requestedBy,
        result: 'CLARIFICATION_REQUIRED',
        clarificationRequest: input.clarificationRequest,
      },
    })

    // Transition case status
    const transitionResult = await this.transitionStatus(
      input.caseId,
      'CLARIFICATION_REQUIRED',
      input.requestedBy,
      'PRINCIPAL',
      input.clarificationRequest,
      currentCase.version
    )

    if (!transitionResult.success) {
      return transitionResult
    }

    // Log audit event
    await AuditService.logEvent({
      actorId: input.requestedBy,
      action: 'CLARIFICATION_REQUESTED',
      targetType: 'Case',
      targetId: input.caseId,
      metadata: {
        clarificationRequest: input.clarificationRequest,
        reviewId: review.id,
        referenceNumber: currentCase.referenceNumber,
      },
    })

    return transitionResult
  }

  /**
   * Respond to clarification request
   */
  static async respondToClarification(input: ClarificationResponseInput): Promise<TransitionResult> {
    const currentCase = await prisma.case.findUnique({
      where: { id: input.caseId },
    })

    if (!currentCase) {
      return { success: false, error: 'Case not found' }
    }

    if (currentCase.status !== 'CLARIFICATION_REQUIRED') {
      return { success: false, error: 'Case is not in clarification required status' }
    }

    // Add clarification response to case description or create a note
    const updatedCase = await prisma.case.update({
      where: { id: input.caseId },
      data: {
        description: `${currentCase.description}\n\n[Clarification Response]: ${input.clarificationResponse}`,
        status: 'SUBMITTED',
        version: { increment: 1 },
      },
      include: { student: true, reporter: true },
    })

    // Log audit event
    await AuditService.logEvent({
      actorId: input.respondedBy,
      action: 'CLARIFICATION_RESPONDED',
      targetType: 'Case',
      targetId: input.caseId,
      metadata: {
        clarificationResponse: input.clarificationResponse,
        referenceNumber: currentCase.referenceNumber,
      },
    })

    return { success: true, case: updatedCase }
  }

  /**
   * Record principal decision with rationale
   */
  static async recordDecision(
    caseId: string,
    decision: string,
    rationale: string,
    actorId: string,
    assignedToId?: string
  ): Promise<TransitionResult> {
    const currentCase = await prisma.case.findUnique({
      where: { id: caseId },
    })

    if (!currentCase) {
      return { success: false, error: 'Case not found' }
    }

    // Create review with decision
    const review = await prisma.caseReview.create({
      data: {
        caseId,
        reviewerId: actorId,
        result: decision,
        notes: rationale,
      },
    })

    // Determine next status based on decision
    let newStatus: CaseStatusCode = 'UNDER_REVIEW'
    if (decision === 'APPROVED') {
      newStatus = assignedToId ? 'ASSIGNED' : 'ACTION_PENDING'
    } else if (decision === 'REJECTED') {
      newStatus = 'REJECTED'
    } else if (decision === 'CLOSED') {
      newStatus = 'CLOSED'
    }

    // Transition status
    const transitionResult = await this.transitionStatus(
      caseId,
      newStatus,
      actorId,
      'PRINCIPAL',
      rationale,
      currentCase.version
    )

    // If assigned to someone, perform assignment
    if (assignedToId && newStatus === 'ASSIGNED') {
      await this.assignCase({
        caseId,
        assignedToId,
        assignedBy: actorId,
        rationale,
      })
    }

    // Log audit event
    await AuditService.logEvent({
      actorId,
      action: 'CASE_DECISION_RECORDED',
      targetType: 'Case',
      targetId: caseId,
      metadata: {
        decision,
        rationale,
        assignedToId,
        reviewId: review.id,
        referenceNumber: currentCase.referenceNumber,
      },
    })

    return transitionResult
  }

  /**
   * Validate if a transition is allowed
   */
  static validateTransition(
    currentStatus: CaseStatusCode,
    newStatus: CaseStatusCode,
    userRole: string
  ): { allowed: boolean; reason?: string } {
    if (!canTransitionStatus(currentStatus, newStatus, userRole as any)) {
      return {
        allowed: false,
        reason: `Role ${userRole} cannot transition from ${currentStatus} to ${newStatus}`,
      }
    }

    return { allowed: true }
  }

  /**
   * Get allowed next statuses for a case
   */
  static getAllowedTransitions(currentStatus: CaseStatusCode, userRole: string): CaseStatusCode[] {
    const transitions = CASE_STATUS_TRANSITIONS[currentStatus] || []
    
    // Filter by role permissions
    if (userRole !== 'PRINCIPAL') {
      // Non-principals can only resubmit after clarification
      if (currentStatus === 'CLARIFICATION_REQUIRED' && userRole === 'TEACHER') {
        return ['SUBMITTED']
      }
      return []
    }

    return transitions
  }
}
