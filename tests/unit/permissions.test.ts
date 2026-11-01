import { describe, it, expect } from 'vitest'
import {
  hasPermission,
  canAccessCase,
  canTransitionStatus,
  canViewConfidentialNotes,
  isAccountActive,
  canExportData,
  canViewAuditLog,
  canConfigureSystem,
  getExportFields,
  CASE_STATUS_TRANSITIONS,
} from '@/lib/permissions'

describe('Permissions', () => {
  describe('hasPermission', () => {
    it('should return true for valid permissions', () => {
      expect(hasPermission('PRINCIPAL', 'canCreateUser')).toBe(true)
      expect(hasPermission('TEACHER', 'canCreateCase')).toBe(true)
    })

    it('should return false for invalid permissions', () => {
      expect(hasPermission('TEACHER', 'canCreateUser')).toBe(false)
      expect(hasPermission('COUNSELLOR', 'canCreateUser')).toBe(false)
    })
  })

  describe('canAccessCase', () => {
    it('should allow principal to access any case', () => {
      expect(canAccessCase('PRINCIPAL', 'user1', 'user2', null)).toBe(true)
    })

    it('should allow teacher to access own cases', () => {
      expect(canAccessCase('TEACHER', 'user1', 'user1', null)).toBe(true)
    })

    it('should deny teacher access to other cases', () => {
      expect(canAccessCase('TEACHER', 'user1', 'user2', null)).toBe(false)
    })

    it('should allow counsellor to access assigned cases', () => {
      expect(canAccessCase('COUNSELLOR', 'user1', 'user2', 'user1')).toBe(true)
    })

    it('should deny counsellor access to unassigned cases', () => {
      expect(canAccessCase('COUNSELLOR', 'user1', 'user2', 'user3')).toBe(false)
    })
  })

  describe('canTransitionStatus', () => {
    it('should allow valid transitions', () => {
      expect(canTransitionStatus('SUBMITTED', 'UNDER_REVIEW', 'PRINCIPAL')).toBe(true)
      expect(canTransitionStatus('UNDER_REVIEW', 'ASSIGNED', 'PRINCIPAL')).toBe(true)
    })

    it('should deny invalid transitions', () => {
      expect(canTransitionStatus('SUBMITTED', 'CLOSED', 'PRINCIPAL')).toBe(false)
      expect(canTransitionStatus('CLOSED', 'SUBMITTED', 'PRINCIPAL')).toBe(false)
    })

    it('should allow teacher to resubmit after clarification', () => {
      expect(canTransitionStatus('CLARIFICATION_REQUIRED', 'SUBMITTED', 'TEACHER')).toBe(true)
    })

    it('should deny non-principal status changes', () => {
      expect(canTransitionStatus('SUBMITTED', 'UNDER_REVIEW', 'TEACHER')).toBe(false)
    })
  })

  describe('canViewConfidentialNotes', () => {
    it('should allow principal to view all confidential notes', () => {
      expect(canViewConfidentialNotes('PRINCIPAL', 'user1', 'user2')).toBe(true)
    })

    it('should allow counsellor to view own notes', () => {
      expect(canViewConfidentialNotes('COUNSELLOR', 'user1', 'user1')).toBe(true)
    })

    it('should deny counsellor access to others notes', () => {
      expect(canViewConfidentialNotes('COUNSELLOR', 'user1', 'user2')).toBe(false)
    })

    it('should deny teacher access to confidential notes', () => {
      expect(canViewConfidentialNotes('TEACHER', 'user1', 'user1')).toBe(false)
    })
  })

  describe('isAccountActive', () => {
    it('should return true for active status', () => {
      expect(isAccountActive('ACTIVE')).toBe(true)
    })

    it('should return false for non-active statuses', () => {
      expect(isAccountActive('PENDING')).toBe(false)
      expect(isAccountActive('DEACTIVATED')).toBe(false)
      expect(isAccountActive('REJECTED')).toBe(false)
    })
  })

  describe('canExportData', () => {
    it('should allow principal export and deny technical admin export', () => {
      expect(canExportData('PRINCIPAL')).toBe(true)
      expect(canExportData('ADMIN')).toBe(false)
    })

    it('should deny teacher and counsellor export', () => {
      expect(canExportData('TEACHER')).toBe(false)
      expect(canExportData('COUNSELLOR')).toBe(false)
    })
  })

  describe('canViewAuditLog', () => {
    it('should allow principal and admin to view audit log', () => {
      expect(canViewAuditLog('PRINCIPAL')).toBe(true)
      expect(canViewAuditLog('ADMIN')).toBe(true)
    })

    it('should deny teacher and counsellor access', () => {
      expect(canViewAuditLog('TEACHER')).toBe(false)
      expect(canViewAuditLog('COUNSELLOR')).toBe(false)
    })
  })

  describe('canConfigureSystem', () => {
    it('should allow principal and admin to configure', () => {
      expect(canConfigureSystem('PRINCIPAL')).toBe(true)
      expect(canConfigureSystem('ADMIN')).toBe(true)
    })

    it('should deny teacher and counsellor access', () => {
      expect(canConfigureSystem('TEACHER')).toBe(false)
      expect(canConfigureSystem('COUNSELLOR')).toBe(false)
    })
  })

  describe('getExportFields', () => {
    it('should return extended fields for principal', () => {
      const fields = getExportFields('PRINCIPAL')
      expect(fields).toContain('description')
      expect(fields).toContain('decision')
    })

    it('should expose no export fields to technical admin', () => {
      expect(getExportFields('ADMIN')).toEqual([])
    })

    it('should return base fields for teacher', () => {
      const fields = getExportFields('TEACHER')
      expect(fields).toContain('referenceNumber')
      expect(fields).not.toContain('description')
    })

    it('should return base fields for counsellor', () => {
      const fields = getExportFields('COUNSELLOR')
      expect(fields).toContain('referenceNumber')
      expect(fields).not.toContain('description')
    })
  })

  describe('CASE_STATUS_TRANSITIONS', () => {
    it('should have valid transitions for DRAFT', () => {
      expect(CASE_STATUS_TRANSITIONS.DRAFT).toContain('SUBMITTED')
    })

    it('should have valid transitions for SUBMITTED', () => {
      expect(CASE_STATUS_TRANSITIONS.SUBMITTED).toContain('UNDER_REVIEW')
      expect(CASE_STATUS_TRANSITIONS.SUBMITTED).toContain('CLARIFICATION_REQUIRED')
    })

    it('should have valid transitions for CLOSED', () => {
      expect(CASE_STATUS_TRANSITIONS.CLOSED).toContain('REOPENED')
    })

    it('should have no transitions for REJECTED', () => {
      expect(CASE_STATUS_TRANSITIONS.REJECTED).toEqual([])
    })
  })
})
