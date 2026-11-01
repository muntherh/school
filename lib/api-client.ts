const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || ''

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: any
  }
  pagination?: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 500,
    public details?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include', // Include cookies for session
  })

  const data = await response.json()

  if (!response.ok) {
    throw new ApiError(
      data.error?.code || 'API_ERROR',
      data.error?.message || 'An error occurred',
      response.status,
      data.error?.details
    )
  }

  return data
}

export const api = {
  // Auth
  login: (email: string, password: string) =>
    request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  logout: () =>
    request('/api/auth/logout', {
      method: 'POST',
    }),

  getCurrentUser: () =>
    request('/api/auth/me'),

  getAssignableUsers: () => request('/api/users/assignable'),

  // Users
  getUsers: (params?: { status?: string; role?: string; search?: string }) => {
    const queryString = params ? new URLSearchParams(params as any).toString() : ''
    return request(`/api/users${queryString ? `?${queryString}` : ''}`)
  },

  createUser: (data: any) =>
    request('/api/users', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateUserStatus: (userId: string, status: string) =>
    request(`/api/users/${userId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  // Students
  searchStudents: (params?: { studentId?: string; name?: string; classGrade?: string; activeStatus?: string }) => {
    const queryString = params ? new URLSearchParams(params as any).toString() : ''
    return request(`/api/students${queryString ? `?${queryString}` : ''}`)
  },

  createStudent: (data: any) =>
    request('/api/students', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Cases
  getCases: (params?: {
    status?: string
    studentId?: string
    reporterId?: string
    category?: string
    incidentDateFrom?: string
    incidentDateTo?: string
    page?: string
    limit?: string
  }) => {
    const queryString = params ? new URLSearchParams(params as any).toString() : ''
    return request(`/api/cases${queryString ? `?${queryString}` : ''}`)
  },

  getCase: (id: string) => request(`/api/cases/${id}`),

  createCase: (data: any) =>
    request('/api/cases', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateCase: (id: string, data: any) =>
    request(`/api/cases/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  updateCaseStatus: (id: string, status: string, reason?: string, version?: number) =>
    request(`/api/cases/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, reason, version }),
    }),

  assignCase: (id: string, assignedToId: string, rationale?: string) =>
    request(`/api/cases/${id}/assign`, {
      method: 'POST',
      body: JSON.stringify({ assignedToId, rationale }),
    }),

  requestClarification: (id: string, clarificationRequest: string) =>
    request(`/api/cases/${id}/clarification`, {
      method: 'POST',
      body: JSON.stringify({ clarificationRequest }),
    }),

  respondToClarification: (id: string, clarificationResponse: string) =>
    request(`/api/cases/${id}/clarification`, {
      method: 'PATCH',
      body: JSON.stringify({ clarificationResponse }),
    }),

  reopenCase: (id: string, reason: string) =>
    request(`/api/cases/${id}/reopen`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),

  // Reviews
  getCaseReviews: (caseId: string) => request(`/api/cases/${caseId}/reviews`),

  createCaseReview: (caseId: string, data: any) =>
    request(`/api/cases/${caseId}/reviews`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Actions
  getCaseActions: (caseId: string) => request(`/api/cases/${caseId}/actions`),

  createDisciplinaryAction: (caseId: string, data: any) =>
    request(`/api/cases/${caseId}/actions`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateActionStatus: (id: string, status: string) =>
    request(`/api/actions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  // Interventions
  getInterventions: (caseId: string) => request(`/api/cases/${caseId}/interventions`),

  createIntervention: (caseId: string, data: any) =>
    request(`/api/cases/${caseId}/interventions`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getConfidentialNotes: (interventionId: string) => request(`/api/interventions/${interventionId}/confidential-notes`),

  createConfidentialNote: (interventionId: string, notes: string) =>
    request(`/api/interventions/${interventionId}/confidential-notes`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    }),

  // Follow-ups
  getFollowUps: (caseId: string) => request(`/api/cases/${caseId}/follow-ups`),

  createFollowUp: (caseId: string, data: any) =>
    request(`/api/cases/${caseId}/follow-ups`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  completeFollowUp: (id: string, result: string, nextStep?: string) =>
    request(`/api/follow-ups/${id}/complete`, {
      method: 'POST',
      body: JSON.stringify({ result, nextStep }),
    }),

  // Audit Log
  getAuditLog: (params?: {
    actorId?: string
    action?: string
    targetType?: string
    targetId?: string
    from?: string
    to?: string
    page?: string
    limit?: string
  }) => {
    const queryString = params ? new URLSearchParams(params as any).toString() : ''
    return request(`/api/audit-log${queryString ? `?${queryString}` : ''}`)
  },

  // Configuration
  getConfiguration: (category?: string) => {
    const queryString = category ? `?category=${category}` : ''
    return request(`/api/configuration${queryString}`)
  },

  updateConfiguration: (key: string, value: any) =>
    request(`/api/configuration/${key}`, {
      method: 'PATCH',
      body: JSON.stringify({ value }),
    }),
}
