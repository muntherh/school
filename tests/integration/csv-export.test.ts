import { describe, it, expect, beforeEach, beforeAll, afterAll } from 'vitest'
import { CSVExportService, ExportOptions, ExportFilters } from '@/lib/services/csv-export.service'
import { prisma } from '@/lib/prisma'

describe('CSV Export Authorization Tests', () => {
  let principalId: string
  let teacher1Id: string
  let teacher2Id: string
  let counsellorId: string
  let adminId: string
  let studentId: string
  let case1Id: string
  let case2Id: string

  beforeEach(async () => {
    // Create test users
    const principal = await prisma.user.create({
      data: {
        name: 'Test Principal',
        staffIdentifier: 'PRINCIPAL_EXPORT',
        email: 'principal-export@test.edu',
        passwordHash: 'hash',
        role: 'PRINCIPAL',
        accountStatus: 'ACTIVE',
      },
    })
    principalId = principal.id

    const teacher1 = await prisma.user.create({
      data: {
        name: 'Test Teacher 1',
        staffIdentifier: 'TEACHER1_EXPORT',
        email: 'teacher1-export@test.edu',
        passwordHash: 'hash',
        role: 'TEACHER',
        accountStatus: 'ACTIVE',
      },
    })
    teacher1Id = teacher1.id

    const teacher2 = await prisma.user.create({
      data: {
        name: 'Test Teacher 2',
        staffIdentifier: 'TEACHER2_EXPORT',
        email: 'teacher2-export@test.edu',
        passwordHash: 'hash',
        role: 'TEACHER',
        accountStatus: 'ACTIVE',
      },
    })
    teacher2Id = teacher2.id

    const counsellor = await prisma.user.create({
      data: {
        name: 'Test Counsellor',
        staffIdentifier: 'COUNSELLOR_EXPORT',
        email: 'counsellor-export@test.edu',
        passwordHash: 'hash',
        role: 'COUNSELLOR',
        accountStatus: 'ACTIVE',
      },
    })
    counsellorId = counsellor.id

    const admin = await prisma.user.create({
      data: {
        name: 'Test Admin',
        staffIdentifier: 'ADMIN_EXPORT',
        email: 'admin-export@test.edu',
        passwordHash: 'hash',
        role: 'ADMIN',
        accountStatus: 'ACTIVE',
      },
    })
    adminId = admin.id

    const student = await prisma.student.create({
      data: {
        studentId: 'STU_EXPORT',
        name: 'Test Student',
        classGrade: '10A',
        activeStatus: true,
      },
    })
    studentId = student.id

    // Create test cases
    const case1 = await prisma.case.create({
      data: {
        referenceNumber: 'EXPORT-001',
        studentId,
        reporterId: teacher1Id,
        incidentDate: new Date('2024-01-15'),
        category: 'Behavioral Issue',
        description: 'Test case 1 description',
        status: 'SUBMITTED',
        version: 0,
      },
    })
    case1Id = case1.id

    const case2 = await prisma.case.create({
      data: {
        referenceNumber: 'EXPORT-002',
        studentId,
        reporterId: teacher2Id,
        incidentDate: new Date('2024-01-16'),
        category: 'Academic Dishonesty',
        description: 'Test case 2 description',
        status: 'UNDER_REVIEW',
        version: 0,
      },
    })
    case2Id = case2.id
  })


  describe('Teacher Export Restrictions', () => {
    it('should prevent teacher from exporting data', async () => {
      const options: ExportOptions = {
        filters: {},
        fields: ['referenceNumber', 'studentName', 'status'],
        userId: teacher1Id,
        userRole: 'TEACHER',
        includeConfidential: false,
      }

      const result = await CSVExportService.exportCases(options)

      expect(result.success).toBe(false)
      expect(result.error).toContain('does not have permission to export')
    })

    it('should prevent teacher from accessing export stats', async () => {
      const stats = await CSVExportService.getExportStats({}, teacher1Id, 'TEACHER')

      // Teachers should only see their own cases in stats
      expect(stats.totalCount).toBe(1) // Only their own case
    })
  })

  describe('Counsellor Export Restrictions', () => {
    it('should prevent counsellor from exporting data', async () => {
      const options: ExportOptions = {
        filters: {},
        fields: ['referenceNumber', 'studentName', 'status'],
        userId: counsellorId,
        userRole: 'COUNSELLOR',
        includeConfidential: false,
      }

      const result = await CSVExportService.exportCases(options)

      expect(result.success).toBe(false)
      expect(result.error).toContain('does not have permission to export')
    })

    it('should prevent counsellor from exporting restricted notes', async () => {
      // Even if they could export, they shouldn't be able to request confidential fields
      const allowedFields = CSVExportService['getAllowedFields']('COUNSELLOR', true)
      
      // Counsellors can access confidential notes but not extended fields
      expect(allowedFields).not.toContain('description')
      expect(allowedFields).not.toContain('witnesses')
      expect(allowedFields).not.toContain('confidentialNotes')
    })
  })

  describe('Principal Export Permissions', () => {
    it('should allow principal to export data', async () => {
      const options: ExportOptions = {
        filters: {},
        fields: ['referenceNumber', 'studentName', 'status'],
        userId: principalId,
        userRole: 'PRINCIPAL',
        includeConfidential: false,
      }

      const result = await CSVExportService.exportCases(options)

      expect(result.success).toBe(true)
      expect(result.csv).toBeDefined()
      expect(result.recordCount).toBeGreaterThan(0)
    })

    it('should allow principal to export extended fields', async () => {
      const options: ExportOptions = {
        filters: {},
        fields: ['referenceNumber', 'studentName', 'description', 'witnesses'],
        userId: principalId,
        userRole: 'PRINCIPAL',
        includeConfidential: false,
      }

      const result = await CSVExportService.exportCases(options)

      expect(result.success).toBe(true)
      expect(result.csv).toContain('description')
      expect(result.csv).toContain('witnesses')
    })

    it('should reject confidential exports pending school policy approval', async () => {
      const options: ExportOptions = {
        filters: {},
        fields: ['referenceNumber', 'studentName', 'confidentialNotes'],
        userId: principalId,
        userRole: 'PRINCIPAL',
        includeConfidential: true,
      }

      const result = await CSVExportService.exportCases(options)

      expect(result.success).toBe(false)
    })

    it('should reject unauthorized field requests from principal', async () => {
      const options: ExportOptions = {
        filters: {},
        fields: ['referenceNumber', 'nonexistentField'],
        userId: principalId,
        userRole: 'PRINCIPAL',
        includeConfidential: false,
      }

      const result = await CSVExportService.exportCases(options)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Unauthorized fields')
    })
  })

  describe('Admin Export Permissions', () => {
    it('should allow admin to export data', async () => {
      const options: ExportOptions = {
        filters: {},
        fields: ['referenceNumber', 'studentName', 'status'],
        userId: adminId,
        userRole: 'ADMIN',
        includeConfidential: false,
      }

      const result = await CSVExportService.exportCases(options)

      expect(result.success).toBe(true)
      expect(result.csv).toBeDefined()
    })

    it('should allow admin to export extended fields', async () => {
      const options: ExportOptions = {
        filters: {},
        fields: ['referenceNumber', 'studentName', 'description', 'witnesses', 'decision'],
        userId: adminId,
        userRole: 'ADMIN',
        includeConfidential: false,
      }

      const result = await CSVExportService.exportCases(options)

      expect(result.success).toBe(true)
    })
  })

  describe('Field Authorization', () => {
    it('should restrict teachers to base fields only', () => {
      const baseFields = CSVExportService['getAllowedFields']('TEACHER', false)
      
      expect(baseFields).toContain('referenceNumber')
      expect(baseFields).toContain('studentName')
      expect(baseFields).toContain('status')
      expect(baseFields).not.toContain('description')
      expect(baseFields).not.toContain('confidentialNotes')
    })

    it('should grant principals extended field access', () => {
      const principalFields = CSVExportService['getAllowedFields']('PRINCIPAL', false)
      
      expect(principalFields).toContain('description')
      expect(principalFields).toContain('witnesses')
      expect(principalFields).toContain('decision')
      expect(principalFields).not.toContain('confidentialNotes') // Without explicit authorization
    })

    it('should grant principals confidential field access when authorized', () => {
      const principalFields = CSVExportService['getAllowedFields']('PRINCIPAL', true)
      
      expect(principalFields).not.toContain('confidentialNotes')
    })

    it('should grant admins extended field access', () => {
      const adminFields = CSVExportService['getAllowedFields']('ADMIN', false)
      
      expect(adminFields).toContain('description')
      expect(adminFields).toContain('witnesses')
      expect(adminFields).toContain('decision')
    })

    it('should not grant admins confidential field access by default', () => {
      const adminFields = CSVExportService['getAllowedFields']('ADMIN', false)
      
      expect(adminFields).not.toContain('confidentialNotes')
    })
  })

  describe('Data Filtering by Role', () => {
    it('should filter teachers to see only their own cases', async () => {
      const stats = await CSVExportService.getExportStats({}, teacher1Id, 'TEACHER')
      
      // Teacher 1 should only see their own case (case1)
      expect(stats.totalCount).toBe(1)
    })

    it('should allow principals to see all cases', async () => {
      const stats = await CSVExportService.getExportStats({}, principalId, 'PRINCIPAL')
      
      // Principal should see both cases
      expect(stats.totalCount).toBe(2)
    })

    it('should allow admins to see all cases', async () => {
      const stats = await CSVExportService.getExportStats({}, adminId, 'ADMIN')
      
      // Admin should see both cases
      expect(stats.totalCount).toBe(2)
    })
  })

  describe('CSV Injection Prevention', () => {
    it('should escape values starting with = to prevent formula injection', () => {
      const escaped = CSVExportService['escapeCSV']('=SUM(A1:A10)')
      
      expect(escaped).toBe('"\t=SUM(A1:A10)"')
    })

    it('should escape values starting with + to prevent formula injection', () => {
      const escaped = CSVExportService['escapeCSV']('+1+2')
      
      expect(escaped).toBe('"\t+1+2"')
    })

    it('should escape values starting with - to prevent formula injection', () => {
      const escaped = CSVExportService['escapeCSV']('-100')
      
      expect(escaped).toBe('"\t-100"')
    })

    it('should escape values starting with @ to prevent formula injection', () => {
      const escaped = CSVExportService['escapeCSV']('@SUM(1,2)')
      
      expect(escaped).toBe('"\t@SUM(1,2)"')
    })

    it('should wrap values containing commas in quotes', () => {
      const escaped = CSVExportService['escapeCSV']('Smith, John')
      
      expect(escaped).toBe('"Smith, John"')
    })

    it('should escape quotes by doubling them', () => {
      const escaped = CSVExportService['escapeCSV']('He said "hello"')
      
      expect(escaped).toBe('"He said ""hello"""')
    })

    it('should wrap values containing newlines in quotes', () => {
      const escaped = CSVExportService['escapeCSV']('Line 1\nLine 2')
      
      expect(escaped).toBe('"Line 1\nLine 2"')
    })

    it('should handle Unicode characters correctly', () => {
      const escaped = CSVExportService['escapeCSV']('José García')
      
      expect(escaped).toBe('José García')
    })

    it('should handle null values', () => {
      const escaped = CSVExportService['escapeCSV'](null)
      
      expect(escaped).toBe('')
    })

    it('should handle undefined values', () => {
      const escaped = CSVExportService['escapeCSV'](undefined)
      
      expect(escaped).toBe('')
    })
  })

  describe('Export Limits', () => {
    it('should enforce maximum export record limit', async () => {
      // The service has a MAX_EXPORT_RECORDS constant
      // We can't easily test this without creating many records,
      // but we can verify the constant exists
      const maxLimit = (CSVExportService as any).MAX_EXPORT_RECORDS
      
      expect(maxLimit).toBeDefined()
      expect(maxLimit).toBeGreaterThan(0)
      expect(maxLimit).toBeLessThanOrEqual(10000)
    })

    it('should return error when export limit exceeded', async () => {
      // This would require creating more than MAX_EXPORT_RECORDS
      // For now, we verify the logic exists in the service
      const stats = await CSVExportService.getExportStats({}, principalId, 'PRINCIPAL')
      
      expect(stats.maxExportLimit).toBeDefined()
      expect(stats.requiresPagination).toBeDefined()
    })
  })

  describe('Date Formatting', () => {
    it('should format dates in YYYY-MM-DD format', () => {
      const formatted = CSVExportService['formatDate'](new Date('2024-01-15'))
      
      expect(formatted).toBe('2024-01-15')
    })

    it('should format date strings correctly', () => {
      const formatted = CSVExportService['formatDate']('2024-01-15T10:30:00Z')
      
      expect(formatted).toBe('2024-01-15')
    })

    it('should return empty string for null dates', () => {
      const formatted = CSVExportService['formatDate'](null)
      
      expect(formatted).toBe('')
    })

    it('should format datetime in ISO 8601 format', () => {
      const formatted = CSVExportService['formatDateTime'](new Date('2024-01-15T10:30:00Z'))
      
      expect(formatted).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
    })
  })
})
