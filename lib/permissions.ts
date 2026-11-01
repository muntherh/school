export type UserRole = 'TEACHER' | 'PRINCIPAL' | 'COUNSELLOR' | 'ADMIN'
export type UserAccountStatus = 'PENDING' | 'ACTIVE' | 'DEACTIVATED' | 'REJECTED'
export type CaseStatusCode = 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'CLARIFICATION_REQUIRED' | 'ASSIGNED' | 'ACTION_PENDING' | 'FOLLOW_UP_PENDING' | 'CLOSED' | 'REOPENED' | 'REJECTED'

/**
 * Permission definitions for each role
 */
export const ROLE_PERMISSIONS: Record<
  UserRole,
  {
    canCreateUser: boolean
    canApproveUser: boolean
    canViewAllUsers: boolean
    canViewOwnProfile: boolean
    canUpdateOwnProfile: boolean
    canCreateCase: boolean
    canViewAllCases: boolean
    canViewOwnCases: boolean
    canUpdateOwnCase: boolean
    canChangeCaseStatus: boolean
    canReopenCase: boolean
    canCreateReview: boolean
    canCreateAction: boolean
    canViewAllInterventions: boolean
    canCreateIntervention: boolean
    canViewConfidentialNotes: boolean
    canCreateFollowUp: boolean
    canExport: boolean
    canViewAuditLog: boolean
    canConfigure: boolean
  }
> = {
  TEACHER: {
    canCreateUser: false,
    canApproveUser: false,
    canViewAllUsers: false,
    canViewOwnProfile: true,
    canUpdateOwnProfile: true,
    canCreateCase: true,
    canViewAllCases: false,
    canViewOwnCases: true,
    canUpdateOwnCase: true,
    canChangeCaseStatus: false,
    canReopenCase: false,
    canCreateReview: false,
    canCreateAction: false,
    canViewAllInterventions: false,
    canCreateIntervention: false,
    canViewConfidentialNotes: false,
    canCreateFollowUp: false,
    canExport: false,
    canViewAuditLog: false,
    canConfigure: false,
  },
  PRINCIPAL: {
    canCreateUser: true,
    canApproveUser: true,
    canViewAllUsers: true,
    canViewOwnProfile: true,
    canUpdateOwnProfile: true,
    canCreateCase: true,
    canViewAllCases: true,
    canViewOwnCases: true,
    canUpdateOwnCase: true,
    canChangeCaseStatus: true,
    canReopenCase: true,
    canCreateReview: true,
    canCreateAction: true,
    canViewAllInterventions: true,
    canCreateIntervention: true,
    canViewConfidentialNotes: true,
    canCreateFollowUp: true,
    canExport: true,
    canViewAuditLog: true,
    canConfigure: true,
  },
  COUNSELLOR: {
    canCreateUser: false,
    canApproveUser: false,
    canViewAllUsers: false,
    canViewOwnProfile: true,
    canUpdateOwnProfile: true,
    canCreateCase: false,
    canViewAllCases: false,
    canViewOwnCases: false,
    canUpdateOwnCase: false,
    canChangeCaseStatus: false,
    canReopenCase: false,
    canCreateReview: false,
    canCreateAction: false,
    canViewAllInterventions: true,
    canCreateIntervention: true,
    canViewConfidentialNotes: true,
    canCreateFollowUp: true,
    canExport: false,
    canViewAuditLog: false,
    canConfigure: false,
  },
  ADMIN: {
    canCreateUser: false,
    canApproveUser: false,
    canViewAllUsers: true,
    canViewOwnProfile: true,
    canUpdateOwnProfile: true,
    canCreateCase: false,
    canViewAllCases: false,
    canViewOwnCases: false,
    canUpdateOwnCase: false,
    canChangeCaseStatus: false,
    canReopenCase: false,
    canCreateReview: false,
    canCreateAction: false,
    canViewAllInterventions: false,
    canCreateIntervention: false,
    canViewConfidentialNotes: false,
    canCreateFollowUp: false,
    canExport: false,
    canViewAuditLog: true,
    canConfigure: true,
  },
}

/**
 * Valid case status transitions
 * Key: current status, Value: array of allowed next statuses
 */
export const CASE_STATUS_TRANSITIONS: Record<CaseStatusCode, CaseStatusCode[]> = {
  DRAFT: ['SUBMITTED'],
  SUBMITTED: ['UNDER_REVIEW', 'CLARIFICATION_REQUIRED', 'ASSIGNED', 'REJECTED'],
  UNDER_REVIEW: ['CLARIFICATION_REQUIRED', 'ASSIGNED', 'ACTION_PENDING', 'REJECTED'],
  CLARIFICATION_REQUIRED: ['SUBMITTED', 'UNDER_REVIEW'],
  ASSIGNED: ['ACTION_PENDING'],
  ACTION_PENDING: ['FOLLOW_UP_PENDING', 'CLOSED'],
  FOLLOW_UP_PENDING: ['CLOSED'],
  CLOSED: ['REOPENED'],
  REOPENED: ['UNDER_REVIEW'],
  REJECTED: [], // No transitions from rejected
}

/**
 * Check if a user has a specific permission
 */
export function hasPermission(role: UserRole, permission: keyof typeof ROLE_PERMISSIONS.TEACHER): boolean {
  return ROLE_PERMISSIONS[role]?.[permission] === true
}

/**
 * Check if a user can access a specific case
 */
export function canAccessCase(
  userRole: UserRole,
  userId: string,
  caseReporterId: string,
  caseAssignedTo?: string | null
): boolean {
  // Principal can access all cases
  if (userRole === 'PRINCIPAL') return true

  // Teacher can only access own cases
  if (userRole === 'TEACHER') {
    return userId === caseReporterId
  }

  // Counsellor can access assigned cases
  if (userRole === 'COUNSELLOR') {
    return caseAssignedTo === userId
  }

  // Admin has limited access (can be configured)
  if (userRole === 'ADMIN') {
    return false // Admin typically doesn't access case content
  }

  return false
}

/**
 * Check if a user can perform a status transition
 */
export function canTransitionStatus(
  currentStatus: CaseStatusCode,
  newStatus: CaseStatusCode,
  userRole: UserRole
): boolean {
  // Only Principal can change status (except teacher resubmitting)
  if (userRole !== 'PRINCIPAL') {
    // Special case: Teacher can resubmit after clarification
    if (userRole === 'TEACHER' && currentStatus === 'CLARIFICATION_REQUIRED' && newStatus === 'SUBMITTED') {
      return true
    }
    return false
  }

  const allowedTransitions = CASE_STATUS_TRANSITIONS[currentStatus]
  return allowedTransitions.includes(newStatus)
}

/**
 * Check if a user can view confidential notes
 */
export function canViewConfidentialNotes(userRole: UserRole, noteCreatedBy: string, userId: string): boolean {
  // Principal can view all confidential notes
  if (userRole === 'PRINCIPAL') return true

  // Counsellor can view notes they created
  if (userRole === 'COUNSELLOR' && noteCreatedBy === userId) return true

  return false
}

/**
 * Check if account is active
 */
export function isAccountActive(status: UserAccountStatus): boolean {
  return status === 'ACTIVE'
}

/**
 * Check if user can export data
 */
export function canExportData(userRole: UserRole): boolean {
  return hasPermission(userRole, 'canExport')
}

/**
 * Check if user can view audit log
 */
export function canViewAuditLog(userRole: UserRole): boolean {
  return hasPermission(userRole, 'canViewAuditLog')
}

/**
 * Check if user can configure system
 */
export function canConfigureSystem(userRole: UserRole): boolean {
  return hasPermission(userRole, 'canConfigure')
}

/**
 * Get allowed fields for export based on role
 */
export function getExportFields(userRole: UserRole): string[] {
  if (userRole === 'ADMIN') return []
  const baseFields = [
    'referenceNumber',
    'studentId',
    'studentName',
    'classGrade',
    'incidentDate',
    'category',
    'status',
    'submittedAt',
    'reporterName',
  ]

  const extendedFields = [
    'description',
    'location',
    'decision',
    'decisionDate',
    'actionType',
    'actionStartDate',
    'actionEndDate',
    'interventionType',
    'interventionDate',
    'followUpStatus',
    'closedAt',
  ]

  // Principal and Admin get extended fields
  if (userRole === 'PRINCIPAL') {
    return [...baseFields, ...extendedFields]
  }

  // Other roles get base fields only
  return baseFields
}

/**
 * Filter fields based on user permissions
 */
export function filterSensitiveFields(data: any, userRole: UserRole, resourceType: string): any {
  const filtered = { ...data }

  // Remove password hash if present
  delete filtered.passwordHash

  // Remove confidential notes unless authorized
  if (resourceType === 'intervention' && !hasPermission(userRole, 'canViewConfidentialNotes')) {
    delete filtered.confidentialNotes
  }

  // Remove sensitive audit metadata
  if (resourceType === 'audit' && !hasPermission(userRole, 'canViewAuditLog')) {
    delete filtered.ipAddress
    delete filtered.userAgent
  }

  return filtered
}
