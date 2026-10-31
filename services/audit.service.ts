import { prisma } from '@/lib/prisma'

export class AuditService {
  /**
   * Log an audit event
   */
  static async logEvent(data: {
    actorId: string
    action: string
    targetType: string
    targetId?: string
    metadata?: any
    ipAddress?: string
    userAgent?: string
  }) {
    try {
      await prisma.auditEvent.create({
        data: {
          actorId: data.actorId,
          action: data.action,
          targetType: data.targetType,
          targetId: data.targetId,
          metadata: data.metadata,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
        },
      })
    } catch (error: any) {
      console.error('Log audit event error:', error)
      // Don't throw error - audit logging should not break the main flow
    }
  }

  /**
   * Log user account approval
   */
  static async logUserApproval(actorId: string, targetUserId: string, targetUserName: string) {
    return this.logEvent({
      actorId,
      action: 'USER_ACCOUNT_APPROVED',
      targetType: 'User',
      targetId: targetUserId,
      metadata: { targetUserName },
    })
  }

  /**
   * Log user account deactivation
   */
  static async logUserDeactivation(actorId: string, targetUserId: string, targetUserName: string, reason?: string) {
    return this.logEvent({
      actorId,
      action: 'USER_ACCOUNT_DEACTIVATED',
      targetType: 'User',
      targetId: targetUserId,
      metadata: { targetUserName, reason },
    })
  }

  /**
   * Log user account reactivation
   */
  static async logUserReactivation(actorId: string, targetUserId: string, targetUserName: string) {
    return this.logEvent({
      actorId,
      action: 'USER_ACCOUNT_REACTIVATED',
      targetType: 'User',
      targetId: targetUserId,
      metadata: { targetUserName },
    })
  }

  /**
   * Log incident submission
   */
  static async logIncidentSubmission(actorId: string, caseId: string, referenceNumber: string, studentId: string) {
    return this.logEvent({
      actorId,
      action: 'INCIDENT_SUBMITTED',
      targetType: 'Case',
      targetId: caseId,
      metadata: { referenceNumber, studentId },
    })
  }

  /**
   * Log case modification
   */
  static async logCaseModification(actorId: string, caseId: string, referenceNumber: string, changes: Record<string, any>) {
    return this.logEvent({
      actorId,
      action: 'CASE_MODIFIED',
      targetType: 'Case',
      targetId: caseId,
      metadata: { referenceNumber, changes },
    })
  }

  /**
   * Log case status change
   */
  static async logCaseStatusChange(actorId: string, caseId: string, referenceNumber: string, fromStatus: string, toStatus: string, reason?: string) {
    return this.logEvent({
      actorId,
      action: 'CASE_STATUS_CHANGED',
      targetType: 'Case',
      targetId: caseId,
      metadata: { referenceNumber, fromStatus, toStatus, reason },
    })
  }

  /**
   * Log case assignment
   */
  static async logCaseAssignment(actorId: string, caseId: string, referenceNumber: string, assignedToId: string, assignedToName: string, rationale?: string) {
    return this.logEvent({
      actorId,
      action: 'CASE_ASSIGNED',
      targetType: 'Case',
      targetId: caseId,
      metadata: { referenceNumber, assignedToId, assignedToName, rationale },
    })
  }

  /**
   * Log case decision
   */
  static async logCaseDecision(actorId: string, caseId: string, referenceNumber: string, decision: string, rationale: string) {
    return this.logEvent({
      actorId,
      action: 'CASE_DECISION_RECORDED',
      targetType: 'Case',
      targetId: caseId,
      metadata: { referenceNumber, decision, rationale },
    })
  }

  /**
   * Log case closure
   */
  static async logCaseClosure(actorId: string, caseId: string, referenceNumber: string, reason?: string) {
    return this.logEvent({
      actorId,
      action: 'CASE_CLOSED',
      targetType: 'Case',
      targetId: caseId,
      metadata: { referenceNumber, reason },
    })
  }

  /**
   * Log case reopening
   */
  static async logCaseReopening(actorId: string, caseId: string, referenceNumber: string, reason: string) {
    return this.logEvent({
      actorId,
      action: 'CASE_REOPENED',
      targetType: 'Case',
      targetId: caseId,
      metadata: { referenceNumber, reason },
    })
  }

  /**
   * Log disciplinary action
   */
  static async logDisciplinaryAction(actorId: string, caseId: string, referenceNumber: string, actionType: string, rationale: string) {
    return this.logEvent({
      actorId,
      action: 'DISCIPLINARY_ACTION_RECORDED',
      targetType: 'DisciplinaryAction',
      targetId: caseId,
      metadata: { referenceNumber, actionType, rationale },
    })
  }

  /**
   * Log intervention (without confidential details)
   */
  static async logIntervention(actorId: string, caseId: string, referenceNumber: string, interventionType: string) {
    return this.logEvent({
      actorId,
      action: 'INTERVENTION_RECORDED',
      targetType: 'Intervention',
      targetId: caseId,
      metadata: { referenceNumber, interventionType },
    })
  }

  /**
   * Log follow-up creation
   */
  static async logFollowUpCreated(actorId: string, caseId: string, referenceNumber: string, assignedToId: string, dueDate: Date) {
    return this.logEvent({
      actorId,
      action: 'FOLLOW_UP_CREATED',
      targetType: 'FollowUp',
      targetId: caseId,
      metadata: { referenceNumber, assignedToId, dueDate: dueDate.toISOString() },
    })
  }

  /**
   * Log follow-up completion
   */
  static async logFollowUpCompleted(actorId: string, caseId: string, referenceNumber: string, result: string) {
    return this.logEvent({
      actorId,
      action: 'FOLLOW_UP_COMPLETED',
      targetType: 'FollowUp',
      targetId: caseId,
      metadata: { referenceNumber, result },
    })
  }

  /**
   * Log clarification request
   */
  static async logClarificationRequest(actorId: string, caseId: string, referenceNumber: string) {
    return this.logEvent({
      actorId,
      action: 'CLARIFICATION_REQUESTED',
      targetType: 'Case',
      targetId: caseId,
      metadata: { referenceNumber },
    })
  }

  /**
   * Log clarification response
   */
  static async logClarificationResponse(actorId: string, caseId: string, referenceNumber: string) {
    return this.logEvent({
      actorId,
      action: 'CLARIFICATION_RESPONDED',
      targetType: 'Case',
      targetId: caseId,
      metadata: { referenceNumber },
    })
  }

  /**
   * Log data export
   */
  static async logDataExport(actorId: string, filters: any, fields: string[], recordCount: number, filename: string) {
    return this.logEvent({
      actorId,
      action: 'DATA_EXPORT',
      targetType: 'Export',
      metadata: { filters, fields, recordCount, filename },
    })
  }

  /**
   * Log failed export attempt
   */
  static async logExportFailed(actorId: string, filters: any, fields: string[], error: string) {
    return this.logEvent({
      actorId,
      action: 'DATA_EXPORT_FAILED',
      targetType: 'Export',
      metadata: { filters, fields, error },
    })
  }

  /**
   * Get audit log with filters
   */
  static async getAuditLog(filters: {
    actorId?: string
    action?: string
    targetType?: string
    targetId?: string
    from?: string
    to?: string
    page?: string
    limit?: string
  }) {
    try {
      const page = parseInt(filters.page || '1')
      const limit = parseInt(filters.limit || '50')
      const skip = (page - 1) * limit

      const where: any = {}

      if (filters.actorId) {
        where.actorId = filters.actorId
      }

      if (filters.action) {
        where.action = { contains: filters.action, mode: 'insensitive' }
      }

      if (filters.targetType) {
        where.targetType = filters.targetType
      }

      if (filters.targetId) {
        where.targetId = filters.targetId
      }

      if (filters.from || filters.to) {
        where.timestamp = {}
        if (filters.from) {
          where.timestamp.gte = new Date(filters.from)
        }
        if (filters.to) {
          where.timestamp.lte = new Date(filters.to)
        }
      }

      const [events, total] = await Promise.all([
        prisma.auditEvent.findMany({
          where,
          include: {
            actor: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: { timestamp: 'desc' },
          skip,
          take: limit,
        }),
        prisma.auditEvent.count({ where }),
      ])

      return {
        events,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      }
    } catch (error: any) {
      console.error('Get audit log error:', error)
      throw new Error('Failed to get audit log')
    }
  }

  /**
   * Get audit events for a specific target
   */
  static async getTargetHistory(targetType: string, targetId: string) {
    try {
      const events = await prisma.auditEvent.findMany({
        where: {
          targetType,
          targetId,
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

      return events
    } catch (error: any) {
      console.error('Get target history error:', error)
      throw new Error('Failed to get target history')
    }
  }

  /**
   * Check if user can modify audit records (only admins)
   */
  static canModifyAuditRecords(userRole: string): boolean {
    return userRole === 'ADMIN'
  }
}
