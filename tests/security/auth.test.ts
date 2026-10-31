import { describe, it, expect, beforeEach } from 'vitest'
import { AuthService } from '@/services/auth.service'
import { prisma } from '@/lib/prisma'

describe('Authentication Security Tests', () => {
  beforeEach(async () => {
    await prisma.user.deleteMany()
  })

  describe('Login Security', () => {
    it('should reject login with invalid credentials', async () => {
      const result = await AuthService.login('nonexistent@example.com', 'wrongpassword')
      
      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('should reject login for inactive accounts', async () => {
      const user = await prisma.user.create({
        data: {
          name: 'Test User',
          staffIdentifier: 'STAFF001',
          email: 'test@example.com',
          passwordHash: await (await import('bcryptjs')).default.hash('password123', 10),
          role: 'TEACHER',
          accountStatus: 'PENDING',
        },
      })

      const result = await AuthService.login('test@example.com', 'password123')
      
      expect(result.success).toBe(false)
      expect(result.error).toContain('not active')
    })

    it('should reject login for deactivated accounts', async () => {
      const user = await prisma.user.create({
        data: {
          name: 'Test User',
          staffIdentifier: 'STAFF001',
          email: 'test@example.com',
          passwordHash: await (await import('bcryptjs')).default.hash('password123', 10),
          role: 'TEACHER',
          accountStatus: 'DEACTIVATED',
        },
      })

      const result = await AuthService.login('test@example.com', 'password123')
      
      expect(result.success).toBe(false)
      expect(result.error).toContain('not active')
    })

    it('should reject login for rejected accounts', async () => {
      const user = await prisma.user.create({
        data: {
          name: 'Test User',
          staffIdentifier: 'STAFF001',
          email: 'test@example.com',
          passwordHash: await (await import('bcryptjs')).default.hash('password123', 10),
          role: 'TEACHER',
          accountStatus: 'REJECTED',
        },
      })

      const result = await AuthService.login('test@example.com', 'password123')
      
      expect(result.success).toBe(false)
      expect(result.error).toContain('not active')
    })

    it('should allow login for active accounts', async () => {
      const user = await prisma.user.create({
        data: {
          name: 'Test User',
          staffIdentifier: 'STAFF001',
          email: 'test@example.com',
          passwordHash: await (await import('bcryptjs')).default.hash('password123', 10),
          role: 'TEACHER',
          accountStatus: 'ACTIVE',
          approvedAt: new Date(),
        },
      })

      const result = await AuthService.login('test@example.com', 'password123')
      
      expect(result.success).toBe(true)
      expect(result.user).toBeDefined()
      expect(result.user?.id).toBe(user.id)
      expect(result.user?.role).toBe('TEACHER')
    })
  })

  describe('Password Security', () => {
    it('should hash passwords with bcrypt', async () => {
      const password = 'testPassword123'
      const hash = await AuthService.hashPassword(password)
      
      expect(hash).not.toBe(password)
      expect(hash.length).toBeGreaterThan(50) // bcrypt hashes are typically 60 chars
    })

    it('should not store plain text passwords', async () => {
      const password = 'testPassword123'
      const hash = await AuthService.hashPassword(password)
      
      expect(hash).not.toContain(password)
    })

    it('should verify correct passwords', async () => {
      const password = 'testPassword123'
      const hash = await AuthService.hashPassword(password)
      
      const isValid = await AuthService.verifyPassword(password, hash)
      expect(isValid).toBe(true)
    })

    it('should reject incorrect passwords', async () => {
      const password = 'testPassword123'
      const hash = await AuthService.hashPassword(password)
      
      const isValid = await AuthService.verifyPassword('wrongpassword', hash)
      expect(isValid).toBe(false)
    })
  })
})
