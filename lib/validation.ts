import { z } from 'zod'

// Enums
export const RoleEnum = z.enum(['TEACHER', 'PRINCIPAL', 'COUNSELLOR', 'ADMIN'])
export const AccountStatusEnum = z.enum(['PENDING', 'ACTIVE', 'DEACTIVATED', 'REJECTED'])
export const CaseStatusEnum = z.enum([
  'DRAFT',
  'SUBMITTED',
  'UNDER_REVIEW',
  'CLARIFICATION_REQUIRED',
  'ASSIGNED',
  'ACTION_PENDING',
  'FOLLOW_UP_PENDING',
  'CLOSED',
  'REOPENED',
  'REJECTED',
])
export const ConfidentialityLevelEnum = z.enum(['STANDARD', 'CONFIDENTIAL', 'RESTRICTED'])
export const ActionStatusEnum = z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'])
export const FollowUpStatusEnum = z.enum(['PENDING', 'OVERDUE', 'COMPLETED', 'CANCELLED'])

// User schemas
export const createUserSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  staffIdentifier: z.string().min(1, 'Staff identifier is required').max(50),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: RoleEnum,
})

// Public self-registration. Role is intentionally NOT accepted from the client;
// every self-registered account is created as a PENDING TEACHER and must be
// approved by a Principal before it can sign in.
export const registerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128),
})

export const updateUserSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  email: z.string().email().optional(),
  role: RoleEnum.optional(),
})

export const updateUserStatusSchema = z.object({
  status: AccountStatusEnum,
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

// Student schemas
export const createStudentSchema = z.object({
  studentId: z.string().min(1, 'Student ID is required').max(50),
  name: z.string().min(1, 'Name is required').max(255),
  classGrade: z.string().min(1, 'Class/grade is required').max(50),
  activeStatus: z.boolean().optional().default(true),
  contactInfo: z.string().max(500).optional(),
})

export const updateStudentSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  classGrade: z.string().min(1).max(50).optional(),
  activeStatus: z.boolean().optional(),
  contactInfo: z.string().max(500).optional(),
})

// Case schemas
export const createCaseSchema = z.object({
  studentId: z.string().uuid('Invalid student ID'),
  incidentDate: z.union([z.string().refine(v => Number.isFinite(Date.parse(v)), 'Invalid date'), z.date()]),
  incidentTime: z.union([z.string().refine(v => Number.isFinite(Date.parse(v)), 'Invalid date'), z.date()]).optional(),
  category: z.string().min(1, 'Category is required'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(5000),
  location: z.string().max(255).optional(),
  witnesses: z.string().max(2000).optional(),
  immediateSafetyConcern: z.boolean().optional().default(false),
})

export const updateCaseSchema = z.object({
  description: z.string().min(10).max(5000).optional(),
  location: z.string().max(255).optional(),
  witnesses: z.string().max(2000).optional(),
})

export const updateCaseStatusSchema = z.object({
  status: CaseStatusEnum,
  reason: z.string().max(1000).optional(),
})

export const reopenCaseSchema = z.object({
  reason: z.string().min(1, 'Reason is required for reopening').max(1000),
})

// Case Review schemas
export const createCaseReviewSchema = z.object({
  result: z.string().min(1, 'Result is required'),
  clarificationRequest: z.string().max(2000).optional(),
  notes: z.string().max(2000).optional(),
})

export const respondToClarificationSchema = z.object({
  response: z.string().min(1, 'Response is required').max(2000),
})

// Disciplinary Action schemas
export const createDisciplinaryActionSchema = z.object({
  actionType: z.string().min(1, 'Action type is required'),
  rationale: z.string().min(10, 'Rationale must be at least 10 characters').max(5000),
  startDate: z.union([z.string().refine(v => Number.isFinite(Date.parse(v)), 'Invalid date'), z.date()]).optional(),
  endDate: z.union([z.string().refine(v => Number.isFinite(Date.parse(v)), 'Invalid date'), z.date()]).optional(),
  responsibleUserId: z.string().uuid('Invalid user ID'),
})

export const updateDisciplinaryActionSchema = z.object({
  status: ActionStatusEnum,
})

// Intervention schemas
export const createInterventionSchema = z.object({
  type: z.string().min(1, 'Type is required'),
  date: z.union([z.string().refine(v => Number.isFinite(Date.parse(v)), 'Invalid date'), z.date()]),
  notes: z.string().min(10, 'Notes must be at least 10 characters').max(5000),
  confidentialityLevel: ConfidentialityLevelEnum.optional().default('STANDARD'),
  outcome: z.string().max(2000).optional(),
  nextStep: z.string().max(2000).optional(),
})

export const updateInterventionSchema = z.object({
  type: z.string().min(1).optional(),
  date: z.union([z.string().refine(v => Number.isFinite(Date.parse(v)), 'Invalid date'), z.date()]).optional(),
  notes: z.string().min(10).max(5000).optional(),
  confidentialityLevel: ConfidentialityLevelEnum.optional(),
  outcome: z.string().max(2000).optional(),
  nextStep: z.string().max(2000).optional(),
})

export const createConfidentialNoteSchema = z.object({
  notes: z.string().min(1, 'Notes are required').max(5000),
})

// Follow-up schemas
export const createFollowUpSchema = z.object({
  dueDate: z.union([z.string().refine(v => Number.isFinite(Date.parse(v)), 'Invalid date'), z.date()]),
  assignedUserId: z.string().uuid('Invalid user ID'),
  nextStep: z.string().max(2000).optional(),
})

export const updateFollowUpSchema = z.object({
  completionDate: z.union([z.string().refine(v => Number.isFinite(Date.parse(v)), 'Invalid date'), z.date()]).optional(),
  result: z.string().max(2000).optional(),
  nextStep: z.string().max(2000).optional(),
  status: FollowUpStatusEnum.optional(),
})

// Configuration schemas
export const updateConfigurationSchema = z.object({
  value: z.any(),
})

// Export schemas
export const exportCasesSchema = z.object({
  filters: z.object({
    status: z.array(CaseStatusEnum).optional(),
    incidentDateFrom: z.union([z.string().refine(v => Number.isFinite(Date.parse(v)), 'Invalid date'), z.date()]).optional(),
    incidentDateTo: z.union([z.string().refine(v => Number.isFinite(Date.parse(v)), 'Invalid date'), z.date()]).optional(),
    category: z.array(z.string()).optional(),
    studentId: z.string().uuid().optional(),
  }),
  fields: z.array(z.string()),
})

// Query parameter schemas
export const caseFilterSchema = z.object({
  search: z.string().trim().max(200).optional(),
  assignedToId: z.string().uuid().optional(),
  status: CaseStatusEnum.optional(),
  studentId: z.string().uuid().optional(),
  reporterId: z.string().uuid().optional(),
  category: z.string().optional(),
  incidentDateFrom: z.string().optional(),
  incidentDateTo: z.string().optional(),
  classGrade: z.string().trim().max(50).optional(),
  sort: z.enum(['newest', 'oldest', 'incident_desc', 'incident_asc']).optional(),
  page: z.string().regex(/^[1-9]\d*$/).optional().default('1'),
  limit: z.string().regex(/^[1-9]\d*$/).refine(v => Number(v) <= 100).optional().default('20'),
})

export const studentFilterSchema = z.object({
  query: z.string().trim().max(100).optional(),
  studentId: z.string().optional(),
  name: z.string().optional(),
  classGrade: z.string().optional(),
  activeStatus: z.string().optional(),
})

export const auditFilterSchema = z.object({
  actorId: z.string().uuid().optional(),
  action: z.string().optional(),
  targetType: z.string().optional(),
  targetId: z.string().uuid().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  page: z.string().regex(/^[1-9]\d*$/).optional().default('1'),
  limit: z.string().optional().default('50'),
})
