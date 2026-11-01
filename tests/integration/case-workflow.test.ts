import { describe, it, expect, beforeEach, beforeAll, afterAll } from 'vitest'
import { CaseWorkflowService } from '@/lib/workflow/case-workflow'
import { prisma } from '@/lib/prisma'
import { AuditService } from '@/services/audit.service'

describe('Case Workflow Service', () => {
  let principalId: string
  let teacherId: string
  let counsellorId: string
  let studentId: string
  let caseId: string

  beforeEach(async () => {
    // Create test users
    const principal = await prisma.user.create({
      data: {
        name: 'Test Principal',
        staffIdentifier: 'PRINCIPAL_TEST',
        email: 'principal@test.edu',
        passwordHash: 'hash',
        role: 'PRINCIPAL',
        accountStatus: 'ACTIVE',
      },
    })
    principalId = principal.id

    const teacher = await prisma.user.create({
      data: {
        name: 'Test Teacher',
        staffIdentifier: 'TEACHER_TEST',
        email: 'teacher@test.edu',
        passwordHash: 'hash',
        role: 'TEACHER',
        accountStatus: 'ACTIVE',
      },
    })
    teacherId = teacher.id

    const counsellor = await prisma.user.create({
      data: {
        name: 'Test Counsellor',
        staffIdentifier: 'COUNSELLOR_TEST',
        email: 'counsellor@test.edu',
        passwordHash: 'hash',
        role: 'COUNSELLOR',
        accountStatus: 'ACTIVE',
      },
    })
    counsellorId = counsellor.id

    const student = await prisma.student.create({
      data: {
        studentId: 'STU_TEST',
        name: 'Test Student',
        classGrade: '10A',
        activeStatus: true,
      },
    })
    studentId = student.id
  })

  beforeEach(async () => {
    // Clean up test data before each test
    await prisma.followUp.deleteMany()
    await prisma.intervention.deleteMany()
    await prisma.disciplinaryAction.deleteMany()
    await prisma.caseReview.deleteMany()
    await prisma.case.deleteMany()
    await prisma.auditEvent.deleteMany()

    // Create a test case
    const testCase = await prisma.case.create({
      data: {
        referenceNumber: 'TEST-CASE-001',
        studentId,
        reporterId: teacherId,
        incidentDate: new Date(),
        category: 'Behavioral Issue',
        description: 'Test case description',
        status: 'SUBMITTED',
        version: 0,
      },
    })
    caseId = testCase.id
  })


  describe('Status Transitions', () => {
    it('should allow valid transition from SUBMITTED to UNDER_REVIEW', async () => {
      const result = await CaseWorkflowService.transitionStatus(
        caseId,
        'UNDER_REVIEW',
        principalId,
        'PRINCIPAL',
        'Initial review'
      )

      expect(result.success).toBe(true)
      expect(result.case?.status).toBe('UNDER_REVIEW')
      expect(result.case?.version).toBe(1)
    })

    it('should allow valid transition from UNDER_REVIEW to ASSIGNED', async () => {
      // First transition to UNDER_REVIEW
      await CaseWorkflowService.transitionStatus(caseId, 'UNDER_REVIEW', principalId, 'PRINCIPAL')

      const result = await CaseWorkflowService.transitionStatus(
        caseId,
        'ASSIGNED',
        principalId,
        'PRINCIPAL',
        'Assign to counsellor'
      )

      expect(result.success).toBe(true)
      expect(result.case?.status).toBe('ASSIGNED')
    })

    it('should allow valid transition from SUBMITTED to CLARIFICATION_REQUIRED', async () => {
      const result = await CaseWorkflowService.transitionStatus(
        caseId,
        'CLARIFICATION_REQUIRED',
        principalId,
        'PRINCIPAL',
        'Need more information'
      )

      expect(result.success).toBe(true)
      expect(result.case?.status).toBe('CLARIFICATION_REQUIRED')
    })

    it('should allow teacher to resubmit from CLARIFICATION_REQUIRED', async () => {
      // First transition to CLARIFICATION_REQUIRED
      await CaseWorkflowService.transitionStatus(caseId, 'CLARIFICATION_REQUIRED', principalId, 'PRINCIPAL')

      const result = await CaseWorkflowService.transitionStatus(
        caseId,
        'SUBMITTED',
        teacherId,
        'TEACHER',
        'Provided clarification'
      )

      expect(result.success).toBe(true)
      expect(result.case?.status).toBe('SUBMITTED')
    })

    it('should reject invalid status transition', async () => {
      const result = await CaseWorkflowService.transitionStatus(
        caseId,
        'CLOSED',
        principalId,
        'PRINCIPAL',
        'Cannot close directly'
      )

      expect(result.success).toBe(false)
      expect(result.error).toContain('Invalid status transition')
    })

    it('should reject transition by unauthorized role', async () => {
      const result = await CaseWorkflowService.transitionStatus(
        caseId,
        'UNDER_REVIEW',
        teacherId,
        'TEACHER',
        'Teacher cannot review'
      )

      expect(result.success).toBe(false)
      expect(result.error).toContain('Invalid status transition')
    })

    it('should reject transition with version mismatch (optimistic locking)', async () => {
      // Get current version
      const currentCase = await prisma.case.findUnique({ where: { id: caseId } })

      // Try to update with wrong version
      const result = await CaseWorkflowService.transitionStatus(
        caseId,
        'UNDER_REVIEW',
        principalId,
        'PRINCIPAL',
        'Test',
        999 // Wrong version
      )

      expect(result.success).toBe(false)
      expect(result.error).toContain('modified by another user')
    })

    it('should set closedAt and closedBy when transitioning to CLOSED', async () => {
      // Transition through valid path to CLOSED
      await CaseWorkflowService.transitionStatus(caseId, 'UNDER_REVIEW', principalId, 'PRINCIPAL')
      await CaseWorkflowService.transitionStatus(caseId, 'ASSIGNED', principalId, 'PRINCIPAL')
      await CaseWorkflowService.transitionStatus(caseId, 'ACTION_PENDING', principalId, 'PRINCIPAL')

      const result = await CaseWorkflowService.transitionStatus(
        caseId,
        'CLOSED',
        principalId,
        'PRINCIPAL',
        'Case resolved'
      )

      expect(result.success).toBe(true)
      expect(result.case?.closedAt).not.toBeNull()
      expect(result.case?.closedBy).toBe(principalId)
    })

    it('should set reopenedAt and reopenedBy when reopening a case', async () => {
      // Close the case first
      await prisma.case.update({
        where: { id: caseId },
        data: { status: 'CLOSED', closedAt: new Date(), closedBy: principalId },
      })

      const result = await CaseWorkflowService.transitionStatus(
        caseId,
        'REOPENED',
        principalId,
        'PRINCIPAL',
        'New information received'
      )

      expect(result.success).toBe(true)
      expect(result.case?.reopenedAt).not.toBeNull()
      expect(result.case?.reopenedBy).toBe(principalId)
      expect(result.case?.reopenReason).toBe('New information received')
    })
  })

  describe('Case Assignment', () => {
    it('should assign case to staff member', async () => {
      const result = await CaseWorkflowService.assignCase({
        caseId,
        assignedToId: counsellorId,
        assignedBy: principalId,
        rationale: 'Requires counselling intervention',
      })

      expect(result.success).toBe(true)
      expect(result.case?.assignedToId).toBe(counsellorId)
      expect(result.case?.assignedAt).not.toBeNull()
      expect(result.case?.status).toBe('ASSIGNED')
    })

    it('should reject assignment for closed case', async () => {
      await prisma.case.update({
        where: { id: caseId },
        data: { status: 'CLOSED' },
      })

      const result = await CaseWorkflowService.assignCase({
        caseId,
        assignedToId: counsellorId,
        assignedBy: principalId,
        rationale: 'Test',
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('Cannot assign case')
    })

    it('should reject assignment to inactive user', async () => {
      // Deactivate counsellor
      await prisma.user.update({
        where: { id: counsellorId },
        data: { accountStatus: 'DEACTIVATED' },
      })

      const result = await CaseWorkflowService.assignCase({
        caseId,
        assignedToId: counsellorId,
        assignedBy: principalId,
        rationale: 'Test',
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('not active')

      // Reactivate for other tests
      await prisma.user.update({
        where: { id: counsellorId },
        data: { accountStatus: 'ACTIVE' },
      })
    })
  })

  describe('Clarification Workflow', () => {
    it('should request clarification from reporter', async () => {
      const result = await CaseWorkflowService.requestClarification({
        caseId,
        requestedBy: principalId,
        clarificationRequest: 'Please provide witness names and exact time of incident',
      })

      expect(result.success).toBe(true)
      expect(result.case?.status).toBe('CLARIFICATION_REQUIRED')

      // Check that review was created
      const review = await prisma.caseReview.findFirst({
        where: { caseId },
      })
      expect(review?.clarificationRequest).toBe('Please provide witness names and exact time of incident')
    })

    it('should allow teacher to respond to clarification', async () => {
      // First request clarification
      await CaseWorkflowService.requestClarification({
        caseId,
        requestedBy: principalId,
        clarificationRequest: 'Need more details',
      })

      const result = await CaseWorkflowService.respondToClarification({
        caseId,
        respondedBy: teacherId,
        clarificationResponse: 'Witnesses: John Doe and Jane Smith. Time: 10:30 AM',
      })

      expect(result.success).toBe(true)
      expect(result.case?.status).toBe('SUBMITTED')
      expect(result.case?.description).toContain('Clarification Response')
    })

    it('should reject clarification request for closed case', async () => {
      await prisma.case.update({
        where: { id: caseId },
        data: { status: 'CLOSED' },
      })

      const result = await CaseWorkflowService.requestClarification({
        caseId,
        requestedBy: principalId,
        clarificationRequest: 'Test',
      })

      expect(result.success).toBe(false)
      expect(await prisma.caseReview.count({ where: { caseId } })).toBe(0)
    })
  })

  describe('Decision Recording', () => {
    it('should record decision with rationale', async () => {
      const result = await CaseWorkflowService.recordDecision(
        caseId,
        'APPROVED',
        'Incident verified, proceed with counselling',
        principalId,
        counsellorId
      )

      expect(result.success).toBe(true)

      // Check review was created
      const review = await prisma.caseReview.findFirst({
        where: { caseId },
      })
      expect(review?.result).toBe('APPROVED')
      expect(review?.notes).toBe('Incident verified, proceed with counselling')
    })

    it('should assign case when decision includes assignment', async () => {
      const result = await CaseWorkflowService.recordDecision(
        caseId,
        'APPROVED',
        'Assign to counsellor',
        principalId,
        counsellorId
      )

      expect(result.success).toBe(true)
      expect(result.case?.status).toBe('ASSIGNED')
      expect(result.case?.assignedToId).toBe(counsellorId)
    })

    it('does not leave reviews or assignments after an invalid decision', async () => {
      const result = await CaseWorkflowService.recordDecision(caseId, 'APPROVED', 'Assign', principalId, 'missing-user')
      expect(result.success).toBe(false)
      expect(await prisma.caseReview.count({ where: { caseId } })).toBe(0)
      expect((await prisma.case.findUnique({ where: { id: caseId } }))?.status).toBe('SUBMITTED')
    })

    it('rejects decisions by a teacher', async () => {
      const record = await prisma.case.findUniqueOrThrow({ where: { id: caseId } })
      const result = await CaseWorkflowService.recordDecision(caseId, 'CLOSED', 'Close', record.reporterId)
      expect(result.success).toBe(false)
      expect(await prisma.caseReview.count({ where: { caseId } })).toBe(0)
    })

    it('should close case when decision is CLOSED', async () => {
      const result = await CaseWorkflowService.recordDecision(
        caseId,
        'CLOSED',
        'No further action required',
        principalId
      )

      expect(result.success).toBe(true)
      expect(result.case?.status).toBe('CLOSED')
    })
  })

  describe('Audit Logging', () => {
    it('should log status transition audit event', async () => {
      await CaseWorkflowService.transitionStatus(
        caseId,
        'UNDER_REVIEW',
        principalId,
        'PRINCIPAL',
        'Test'
      )

      const auditEvents = await prisma.auditEvent.findMany({
        where: { action: 'CASE_STATUS_TRANSITION' },
      })

      expect(auditEvents.length).toBeGreaterThan(0)
      expect(auditEvents[0].actorId).toBe(principalId)
      expect(auditEvents[0].targetId).toBe(caseId)
    })

    it('should log case assignment audit event', async () => {
      await CaseWorkflowService.assignCase({
        caseId,
        assignedToId: counsellorId,
        assignedBy: principalId,
        rationale: 'Test',
      })

      const auditEvents = await prisma.auditEvent.findMany({
        where: { action: 'CASE_ASSIGNED' },
      })

      expect(auditEvents.length).toBeGreaterThan(0)
      expect(auditEvents[0].metadata).toMatchObject({
        assignedToId: counsellorId,
      })
    })

    it('should log clarification request audit event', async () => {
      await CaseWorkflowService.requestClarification({
        caseId,
        requestedBy: principalId,
        clarificationRequest: 'Test',
      })

      const auditEvents = await prisma.auditEvent.findMany({
        where: { action: 'CLARIFICATION_REQUESTED' },
      })

      expect(auditEvents.length).toBeGreaterThan(0)
    })
  })
})
