import { describe, it, expect, beforeEach } from 'vitest'
import { prisma } from '@/lib/prisma'
import { hasPermission, canAccessCase, canTransitionStatus, canViewConfidentialNotes } from '@/lib/permissions'

describe('Authorization Security Tests', () => {
  beforeEach(async () => {
    await prisma.user.deleteMany()
  })

  describe('Permission Checks', () => {
    it('should prevent teachers from creating users', () => {
      expect(hasPermission('TEACHER', 'canCreateUser')).toBe(false)
    })

    it('should prevent teachers from approving users', () => {
      expect(hasPermission('TEACHER', 'canApproveUser')).toBe(false)
    })

    it('should prevent teachers from viewing all users', () => {
      expect(hasPermission('TEACHER', 'canViewAllUsers')).toBe(false)
    })

    it('should prevent teachers from changing case status', () => {
      expect(hasPermission('TEACHER', 'canChangeCaseStatus')).toBe(false)
    })

    it('should prevent teachers from creating reviews', () => {
      expect(hasPermission('TEACHER', 'canCreateReview')).toBe(false)
    })

    it('should prevent teachers from creating disciplinary actions', () => {
      expect(hasPermission('TEACHER', 'canCreateAction')).toBe(false)
    })

    it('should prevent teachers from viewing confidential notes', () => {
      expect(hasPermission('TEACHER', 'canViewConfidentialNotes')).toBe(false)
    })

    it('should prevent teachers from exporting data', () => {
      expect(hasPermission('TEACHER', 'canExport')).toBe(false)
    })

    it('should prevent teachers from viewing audit log', () => {
      expect(hasPermission('TEACHER', 'canViewAuditLog')).toBe(false)
    })

    it('should prevent teachers from configuring system', () => {
      expect(hasPermission('TEACHER', 'canConfigure')).toBe(false)
    })

    it('should prevent counsellors from creating users', () => {
      expect(hasPermission('COUNSELLOR', 'canCreateUser')).toBe(false)
    })

    it('should prevent counsellors from approving users', () => {
      expect(hasPermission('COUNSELLOR', 'canApproveUser')).toBe(false)
    })

    it('should prevent counsellors from creating cases', () => {
      expect(hasPermission('COUNSELLOR', 'canCreateCase')).toBe(false)
    })

    it('should prevent counsellors from changing case status', () => {
      expect(hasPermission('COUNSELLOR', 'canChangeCaseStatus')).toBe(false)
    })

    it('should prevent counsellors from exporting data', () => {
      expect(hasPermission('COUNSELLOR', 'canExport')).toBe(false)
    })

    it('should allow principals to create users', () => {
      expect(hasPermission('PRINCIPAL', 'canCreateUser')).toBe(true)
    })

    it('should allow principals to approve users', () => {
      expect(hasPermission('PRINCIPAL', 'canApproveUser')).toBe(true)
    })

    it('should allow principals to view all users', () => {
      expect(hasPermission('PRINCIPAL', 'canViewAllUsers')).toBe(true)
    })

    it('should allow principals to change case status', () => {
      expect(hasPermission('PRINCIPAL', 'canChangeCaseStatus')).toBe(true)
    })

    it('should allow principals to export data', () => {
      expect(hasPermission('PRINCIPAL', 'canExport')).toBe(true)
    })

    it('should allow admins to create users', () => {
      expect(hasPermission('ADMIN', 'canCreateUser')).toBe(true)
    })

    it('should allow admins to approve users', () => {
      expect(hasPermission('ADMIN', 'canApproveUser')).toBe(true)
    })

    it('should allow admins to export data', () => {
      expect(hasPermission('ADMIN', 'canExport')).toBe(true)
    })
  })

  describe('Case Access Control', () => {
    it('should allow principal to access any case', () => {
      expect(canAccessCase('PRINCIPAL', 'user1', 'user2', null)).toBe(true)
      expect(canAccessCase('PRINCIPAL', 'user1', 'user2', 'user3')).toBe(true)
    })

    it('should allow teacher to access own cases only', () => {
      expect(canAccessCase('TEACHER', 'user1', 'user1', null)).toBe(true)
      expect(canAccessCase('TEACHER', 'user1', 'user2', null)).toBe(false)
    })

    it('should allow counsellor to access assigned cases', () => {
      expect(canAccessCase('COUNSELLOR', 'user1', 'user2', 'user1')).toBe(true)
      expect(canAccessCase('COUNSELLOR', 'user1', 'user2', 'user3')).toBe(false)
    })

    it('should prevent admin from accessing cases', () => {
      expect(canAccessCase('ADMIN', 'user1', 'user2', null)).toBe(false)
    })
  })

  describe('Status Transition Control', () => {
    it('should allow principal to change case status', () => {
      expect(canTransitionStatus('SUBMITTED', 'UNDER_REVIEW', 'PRINCIPAL')).toBe(true)
      expect(canTransitionStatus('UNDER_REVIEW', 'ASSIGNED', 'PRINCIPAL')).toBe(true)
    })

    it('should prevent teacher from changing case status', () => {
      expect(canTransitionStatus('SUBMITTED', 'UNDER_REVIEW', 'TEACHER')).toBe(false)
      expect(canTransitionStatus('UNDER_REVIEW', 'ASSIGNED', 'TEACHER')).toBe(false)
    })

    it('should prevent counsellor from changing case status', () => {
      expect(canTransitionStatus('SUBMITTED', 'UNDER_REVIEW', 'COUNSELLOR')).toBe(false)
    })

    it('should allow teacher to resubmit after clarification', () => {
      expect(canTransitionStatus('CLARIFICATION_REQUIRED', 'SUBMITTED', 'TEACHER')).toBe(true)
    })

    it('should prevent invalid status transitions', () => {
      expect(canTransitionStatus('SUBMITTED', 'CLOSED', 'PRINCIPAL')).toBe(false)
      expect(canTransitionStatus('CLOSED', 'SUBMITTED', 'PRINCIPAL')).toBe(false)
    })
  })

  describe('Confidential Note Access', () => {
    it('should allow principal to view all confidential notes', () => {
      expect(canViewConfidentialNotes('PRINCIPAL', 'user1', 'user2')).toBe(true)
    })

    it('should allow counsellor to view own notes', () => {
      expect(canViewConfidentialNotes('COUNSELLOR', 'user1', 'user1')).toBe(true)
    })

    it('should prevent counsellor from viewing others notes', () => {
      expect(canViewConfidentialNotes('COUNSELLOR', 'user1', 'user2')).toBe(false)
    })

    it('should prevent teacher from viewing confidential notes', () => {
      expect(canViewConfidentialNotes('TEACHER', 'user1', 'user1')).toBe(false)
    })

    it('should prevent admin from viewing confidential notes', () => {
      expect(canViewConfidentialNotes('ADMIN', 'user1', 'user1')).toBe(false)
    })
  })
})
