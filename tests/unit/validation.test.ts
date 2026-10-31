import { describe, it, expect } from 'vitest'
import {
  createUserSchema,
  loginSchema,
  createStudentSchema,
  createCaseSchema,
  updateCaseStatusSchema,
  createInterventionSchema,
  createFollowUpSchema,
  caseFilterSchema,
} from '@/lib/validation'
import { ZodError } from 'zod'

describe('Validation Schemas', () => {
  describe('createUserSchema', () => {
    it('should validate valid user data', () => {
      const data = {
        name: 'John Doe',
        staffIdentifier: 'STAFF001',
        email: 'john@example.com',
        password: 'password123',
        role: 'TEACHER',
      }
      const result = createUserSchema.parse(data)
      expect(result).toEqual(data)
    })

    it('should reject invalid email', () => {
      const data = {
        name: 'John Doe',
        staffIdentifier: 'STAFF001',
        email: 'invalid-email',
        password: 'password123',
        role: 'TEACHER',
      }
      expect(() => createUserSchema.parse(data)).toThrow(ZodError)
    })

    it('should reject short password', () => {
      const data = {
        name: 'John Doe',
        staffIdentifier: 'STAFF001',
        email: 'john@example.com',
        password: 'short',
        role: 'TEACHER',
      }
      expect(() => createUserSchema.parse(data)).toThrow(ZodError)
    })

    it('should reject invalid role', () => {
      const data = {
        name: 'John Doe',
        staffIdentifier: 'STAFF001',
        email: 'john@example.com',
        password: 'password123',
        role: 'INVALID_ROLE',
      }
      expect(() => createUserSchema.parse(data)).toThrow(ZodError)
    })
  })

  describe('loginSchema', () => {
    it('should validate valid login data', () => {
      const data = {
        email: 'john@example.com',
        password: 'password123',
      }
      const result = loginSchema.parse(data)
      expect(result).toEqual(data)
    })

    it('should reject invalid email', () => {
      const data = {
        email: 'invalid-email',
        password: 'password123',
      }
      expect(() => loginSchema.parse(data)).toThrow(ZodError)
    })

    it('should reject empty password', () => {
      const data = {
        email: 'john@example.com',
        password: '',
      }
      expect(() => loginSchema.parse(data)).toThrow(ZodError)
    })
  })

  describe('createStudentSchema', () => {
    it('should validate valid student data', () => {
      const data = {
        studentId: 'STU001',
        name: 'Alice Smith',
        classGrade: '10A',
        activeStatus: true,
        contactInfo: 'parent@example.com',
      }
      const result = createStudentSchema.parse(data)
      expect(result).toEqual(data)
    })

    it('should reject missing required fields', () => {
      const data = {
        studentId: 'STU001',
      }
      expect(() => createStudentSchema.parse(data)).toThrow(ZodError)
    })
  })

  describe('createCaseSchema', () => {
    it('should validate valid case data', () => {
      const data = {
        studentId: '550e8400-e29b-41d4-a716-446655440000',
        incidentDate: '2024-01-15',
        category: 'Behavioral Issue',
        description: 'Student was disruptive in class',
        immediateSafetyConcern: false,
      }
      const result = createCaseSchema.parse(data)
      expect(result).toBeDefined()
    })

    it('should reject short description', () => {
      const data = {
        studentId: '550e8400-e29b-41d4-a716-446655440000',
        incidentDate: '2024-01-15',
        category: 'Behavioral Issue',
        description: 'Short',
      }
      expect(() => createCaseSchema.parse(data)).toThrow(ZodError)
    })

    it('should reject invalid UUID', () => {
      const data = {
        studentId: 'invalid-uuid',
        incidentDate: '2024-01-15',
        category: 'Behavioral Issue',
        description: 'Student was disruptive in class',
      }
      expect(() => createCaseSchema.parse(data)).toThrow(ZodError)
    })
  })

  describe('updateCaseStatusSchema', () => {
    it('should validate valid status update', () => {
      const data = {
        status: 'UNDER_REVIEW',
        reason: 'Review needed',
      }
      const result = updateCaseStatusSchema.parse(data)
      expect(result).toEqual(data)
    })

    it('should reject invalid status', () => {
      const data = {
        status: 'INVALID_STATUS',
      }
      expect(() => updateCaseStatusSchema.parse(data)).toThrow(ZodError)
    })
  })

  describe('createInterventionSchema', () => {
    it('should validate valid intervention data', () => {
      const data = {
        type: 'Individual Counselling',
        date: '2024-01-15',
        notes: 'Student discussed their concerns',
        confidentialityLevel: 'STANDARD',
      }
      const result = createInterventionSchema.parse(data)
      expect(result).toEqual(data)
    })

    it('should reject short notes', () => {
      const data = {
        type: 'Individual Counselling',
        date: '2024-01-15',
        notes: 'Short',
      }
      expect(() => createInterventionSchema.parse(data)).toThrow(ZodError)
    })
  })

  describe('createFollowUpSchema', () => {
    it('should validate valid follow-up data', () => {
      const data = {
        dueDate: '2024-01-20',
        assignedUserId: '550e8400-e29b-41d4-a716-446655440000',
        nextStep: 'Schedule meeting with parents',
      }
      const result = createFollowUpSchema.parse(data)
      expect(result).toBeDefined()
    })

    it('should reject invalid user UUID', () => {
      const data = {
        dueDate: '2024-01-20',
        assignedUserId: 'invalid-uuid',
      }
      expect(() => createFollowUpSchema.parse(data)).toThrow(ZodError)
    })
  })

  describe('caseFilterSchema', () => {
    it('should validate valid filters', () => {
      const data = {
        status: 'SUBMITTED',
        page: '1',
        limit: '20',
      }
      const result = caseFilterSchema.parse(data)
      expect(result).toEqual(data)
    })

    it('should use default values for pagination', () => {
      const data = {}
      const result = caseFilterSchema.parse(data)
      expect(result.page).toBe('1')
      expect(result.limit).toBe('20')
    })
  })
})
