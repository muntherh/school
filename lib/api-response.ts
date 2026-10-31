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

export function successResponse<T>(data: T, pagination?: any): ApiResponse<T> {
  const response: ApiResponse<T> = { success: true, data }
  if (pagination) {
    response.pagination = pagination
  }
  return response
}

export function errorResponse(code: string, message: string, details?: any): ApiResponse {
  return {
    success: false,
    error: { code, message, details },
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
