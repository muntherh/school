import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { loginSchema, createUserSchema } from '@/lib/validation'

export interface AuthResult {
  success: boolean
  user?: {
    id: string
    name: string
    email: string
    role: string
    accountStatus: string
  }
  error?: string
}

export interface SessionUser {
  id: string
  name: string
  email: string
  role: string
  accountStatus: string
}

export class AuthService {
  /**
   * Hash a password using bcrypt
   */
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10)
  }

  /**
   * Verify a password against a hash
   */
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash)
  }

  /**
   * Authenticate a user with email and password
   */
  static async login(email: string, password: string): Promise<AuthResult> {
    try {
      // Validate input
      const validatedData = loginSchema.parse({ email, password })

      // Find user by email
      const user = await prisma.user.findUnique({
        where: { email: validatedData.email },
      })

      if (!user) {
        return { success: false, error: 'Invalid credentials' }
      }

      // Check if account is active
      if (user.accountStatus !== 'ACTIVE') {
        return { success: false, error: 'Account is not active' }
      }

      // Verify password
      const isValidPassword = await this.verifyPassword(validatedData.password, user.passwordHash)

      if (!isValidPassword) {
        return { success: false, error: 'Invalid credentials' }
      }

      // Return user data (excluding password hash)
      return {
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          accountStatus: user.accountStatus,
        },
      }
    } catch (error: any) {
      console.error('Login error:', error)
      return { success: false, error: 'Authentication failed' }
    }
  }

  /**
   * Create a new user
   */
  static async createUser(data: {
    name: string
    staffIdentifier: string
    email: string
    password: string
    role: string
  }) {
    try {
      // Validate input
      const validatedData = createUserSchema.parse(data)

      // Check if user already exists
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { email: validatedData.email },
            { staffIdentifier: validatedData.staffIdentifier },
          ],
        },
      })

      if (existingUser) {
        throw new Error('User with this email or staff identifier already exists')
      }

      // Hash password
      const passwordHash = await this.hashPassword(validatedData.password)

      // Create user
      const user = await prisma.user.create({
        data: {
          name: validatedData.name,
          staffIdentifier: validatedData.staffIdentifier,
          email: validatedData.email,
          passwordHash,
          role: validatedData.role,
          accountStatus: 'PENDING', // New accounts require approval
        },
        select: {
          id: true,
          name: true,
          email: true,
          staffIdentifier: true,
          role: true,
          accountStatus: true,
          createdAt: true,
        },
      })

      return user
    } catch (error: any) {
      console.error('Create user error:', error)
      throw new Error(error.message || 'Failed to create user')
    }
  }

  /**
   * Get user by ID
   */
  static async getUserById(id: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          email: true,
          staffIdentifier: true,
          role: true,
          accountStatus: true,
          createdAt: true,
          approvedAt: true,
        },
      })

      return user
    } catch (error: any) {
      console.error('Get user error:', error)
      throw new Error('Failed to get user')
    }
  }

  /**
   * Update user account status
   */
  static async updateUserStatus(
    userId: string,
    status: 'PENDING' | 'ACTIVE' | 'DEACTIVATED' | 'REJECTED',
    approverId: string
  ) {
    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          accountStatus: status,
          approvedAt: status === 'ACTIVE' ? new Date() : null,
          approvedBy: status === 'ACTIVE' ? approverId : null,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          accountStatus: true,
          approvedAt: true,
        },
      })

      return user
    } catch (error: any) {
      console.error('Update user status error:', error)
      throw new Error('Failed to update user status')
    }
  }

  /**
   * Update user information
   */
  static async updateUser(userId: string, data: Partial<{ name: string; email: string; role: string }>) {
    try {
      const updateData: any = {}
      if (data.name) updateData.name = data.name
      if (data.email) updateData.email = data.email
      if (data.role) updateData.role = data.role as any // Cast to satisfy Prisma enum type
      
      const user = await prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: {
          id: true,
          name: true,
          email: true,
          staffIdentifier: true,
          role: true,
          accountStatus: true,
        },
      })

      return user
    } catch (error: any) {
      console.error('Update user error:', error)
      throw new Error('Failed to update user')
    }
  }
}
