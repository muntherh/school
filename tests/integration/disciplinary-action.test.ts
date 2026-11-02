import { describe, it, expect } from 'vitest'
import { DisciplinaryActionService } from '@/services/disciplinary-action.service'
import { prisma } from '@/lib/prisma'

async function fixture() {
  const student = await prisma.student.create({ data: { studentId: 'STU-ACT', name: 'Action Student', classGrade: '9B' } })
  const principal = await prisma.user.create({
    data: { name: 'Action Principal', staffIdentifier: 'P-ACT', email: 'p-act@example.com', passwordHash: 'hash', role: 'PRINCIPAL', accountStatus: 'ACTIVE' },
  })
  const record = await prisma.case.create({
    data: {
      referenceNumber: 'INC-2026-ACTION',
      studentId: student.id,
      reporterId: principal.id,
      incidentDate: new Date(),
      category: 'Behavioral Issue',
      description: 'Synthetic incident for disciplinary action tests',
    },
  })
  return { principal, record }
}

describe('DisciplinaryActionService.createAction', () => {
  it('creates an action and keeps the responsible user', async () => {
    const { principal, record } = await fixture()
    const action = await DisciplinaryActionService.createAction({
      caseId: record.id,
      actionType: 'Parent Meeting',
      rationale: 'Meeting with parents to agree on expectations.',
      startDate: new Date().toISOString(),
      responsibleUserId: principal.id,
    })
    expect(action.caseId).toBe(record.id)
    expect(action.responsibleUserId).toBe(principal.id)
    expect(action.status).toBe('PENDING')
  })

  it('rejects an action without a responsible user', async () => {
    const { record } = await fixture()
    await expect(
      DisciplinaryActionService.createAction({
        caseId: record.id,
        actionType: 'Warning',
        rationale: 'Missing the responsible staff member.',
      } as any)
    ).rejects.toThrow()
  })
})
