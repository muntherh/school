import { describe, it, expect, beforeEach } from 'vitest'
import { CaseService } from '@/services/case.service'
import { prisma } from '@/lib/prisma'

describe('CaseService', () => {
  beforeEach(async () => {
    // Clean up before each test
    await prisma.case.deleteMany()
    await prisma.student.deleteMany()
    await prisma.user.deleteMany()
  })

  describe('generateReferenceNumber', () => {
    it('should generate a unique reference number', async () => {
      const ref1 = await CaseService.generateReferenceNumber()
      const ref2 = await CaseService.generateReferenceNumber()
      
      expect(ref1).toBeDefined()
      expect(ref2).toBeDefined()
      expect(ref1).not.toBe(ref2)
      expect(ref1).toMatch(/^INC-\d{4}-\d{4}$/)
    })
  })

  describe('checkForDuplicates', () => {
    it('should find duplicate cases within 24 hours', async () => {
      const student = await prisma.student.create({
        data: {
          studentId: 'STU001',
          name: 'Test Student',
          classGrade: '10A',
        },
      })

      const user = await prisma.user.create({
        data: {
          name: 'Test User',
          staffIdentifier: 'STAFF001',
          email: 'test@example.com',
          passwordHash: 'hash',
          role: 'TEACHER',
          accountStatus: 'ACTIVE',
        },
      })

      const incidentDate = new Date('2024-01-15')
      
      await prisma.case.create({
        data: {
          referenceNumber: 'INC-2024-0001',
          studentId: student.id,
          reporterId: user.id,
          incidentDate,
          category: 'Behavioral Issue',
          description: 'Test description',
          status: 'SUBMITTED',
        },
      })

      const duplicates = await CaseService.checkForDuplicates(
        student.id,
        'Behavioral Issue',
        incidentDate
      )

      expect(duplicates).toHaveLength(1)
    })

    it('should not find duplicates outside 24 hours', async () => {
      const student = await prisma.student.create({
        data: {
          studentId: 'STU001',
          name: 'Test Student',
          classGrade: '10A',
        },
      })

      const user = await prisma.user.create({
        data: {
          name: 'Test User',
          staffIdentifier: 'STAFF001',
          email: 'test@example.com',
          passwordHash: 'hash',
          role: 'TEACHER',
          accountStatus: 'ACTIVE',
        },
      })

      const incidentDate1 = new Date('2024-01-15')
      const incidentDate2 = new Date('2024-01-17') // 2 days later
      
      await prisma.case.create({
        data: {
          referenceNumber: 'INC-2024-0001',
          studentId: student.id,
          reporterId: user.id,
          incidentDate: incidentDate1,
          category: 'Behavioral Issue',
          description: 'Test description',
          status: 'SUBMITTED',
        },
      })

      const duplicates = await CaseService.checkForDuplicates(
        student.id,
        'Behavioral Issue',
        incidentDate2
      )

      expect(duplicates).toHaveLength(0)
    })
  })
})
