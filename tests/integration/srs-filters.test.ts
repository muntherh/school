import { describe, it, expect } from 'vitest'
import { CaseService } from '@/services/case.service'
import { StudentService } from '@/services/student.service'
import { prisma } from '@/lib/prisma'

async function fixture() {
  const reporter = await prisma.user.create({
    data: { name: 'Filter Teacher', staffIdentifier: 'T-FLT', email: 't-flt@example.com', passwordHash: 'hash', role: 'TEACHER', accountStatus: 'ACTIVE' },
  })
  const a = await prisma.student.create({ data: { studentId: 'STU-A1', name: 'Amal Saleh', classGrade: '10A' } })
  const b = await prisma.student.create({ data: { studentId: 'STU-B2', name: 'Badr Nasser', classGrade: '11B' } })
  const make = (studentId: string, ref: string, incidentDate: string, submittedAt: string, category = 'Behavioral Issue') =>
    prisma.case.create({
      data: { referenceNumber: ref, studentId, reporterId: reporter.id, incidentDate: new Date(incidentDate), submittedAt: new Date(submittedAt), category, description: 'Synthetic incident for filter tests' },
    })
  await make(a.id, 'INC-F-1', '2026-10-01T09:00:00Z', '2026-10-01T10:00:00Z')
  await make(b.id, 'INC-F-2', '2026-10-15T09:00:00Z', '2026-10-02T10:00:00Z')
  await make(a.id, 'INC-F-3', '2026-10-31T15:30:00Z', '2026-10-31T16:00:00Z', 'Attendance')
  return { a, b }
}

describe('Case list filters required by FR-DASH-05', () => {
  it('filters by class grade (case-insensitive)', async () => {
    await fixture()
    const { cases } = await CaseService.getCases({ classGrade: '10a' })
    expect(cases.map((c) => c.referenceNumber).sort()).toEqual(['INC-F-1', 'INC-F-3'])
  })

  it('treats a date-only "to" filter as the end of that day', async () => {
    await fixture()
    const { cases } = await CaseService.getCases({ incidentDateFrom: '2026-10-31', incidentDateTo: '2026-10-31' })
    expect(cases.map((c) => c.referenceNumber)).toEqual(['INC-F-3'])
  })

  it('sorts by incident date or submission date', async () => {
    await fixture()
    const byIncident = await CaseService.getCases({ sort: 'incident_asc' })
    expect(byIncident.cases.map((c) => c.referenceNumber)).toEqual(['INC-F-1', 'INC-F-2', 'INC-F-3'])
    const oldest = await CaseService.getCases({ sort: 'oldest' })
    expect(oldest.cases.map((c) => c.referenceNumber)).toEqual(['INC-F-1', 'INC-F-2', 'INC-F-3'])
    const newest = await CaseService.getCases({})
    expect(newest.cases[0].referenceNumber).toBe('INC-F-3')
  })

  it('searches by student name and identifier', async () => {
    await fixture()
    expect((await CaseService.getCases({ search: 'badr' })).cases.map((c) => c.referenceNumber)).toEqual(['INC-F-2'])
    expect((await CaseService.getCases({ search: 'STU-A1' })).cases).toHaveLength(2)
  })

  it('rejects an unknown sort value', async () => {
    await expect(CaseService.getCases({ sort: 'random' })).rejects.toThrow()
  })
})

describe('Student lookup required by FR-STU-01', () => {
  it('finds students by identifier or name with one query', async () => {
    await fixture()
    expect((await StudentService.searchStudents({ query: 'stu-b' })).map((s) => s.name)).toEqual(['Badr Nasser'])
    expect((await StudentService.searchStudents({ query: 'amal' })).map((s) => s.studentId)).toEqual(['STU-A1'])
  })
})

describe('Duplicate detection required by FR-INC-06', () => {
  it('finds a report for the same student and category on the same day', async () => {
    const { a } = await fixture()
    const dupes = await CaseService.checkForDuplicates(a.id, 'Attendance', new Date('2026-10-31T08:00:00Z'))
    expect(dupes.map((d) => d.referenceNumber)).toEqual(['INC-F-3'])
    expect(await CaseService.checkForDuplicates(a.id, 'Bullying', new Date('2026-10-31T08:00:00Z'))).toHaveLength(0)
  })
})
