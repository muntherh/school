import { describe, it, expect } from 'vitest'
import { AuthService } from '@/services/auth.service'

describe('AuthService', () => {
  describe('hashPassword', () => {
    it('should hash a password', async () => {
      const password = 'testPassword123'
      const hash = await AuthService.hashPassword(password)
      
      expect(hash).toBeDefined()
      expect(hash).not.toBe(password)
      expect(hash.length).toBeGreaterThan(0)
    })

    it('should generate different hashes for the same password', async () => {
      const password = 'testPassword123'
      const hash1 = await AuthService.hashPassword(password)
      const hash2 = await AuthService.hashPassword(password)
      
      expect(hash1).not.toBe(hash2)
    })
  })

  describe('verifyPassword', () => {
    it('should verify correct password', async () => {
      const password = 'testPassword123'
      const hash = await AuthService.hashPassword(password)
      
      const isValid = await AuthService.verifyPassword(password, hash)
      expect(isValid).toBe(true)
    })

    it('should reject incorrect password', async () => {
      const password = 'testPassword123'
      const hash = await AuthService.hashPassword(password)
      
      const isValid = await AuthService.verifyPassword('wrongPassword', hash)
      expect(isValid).toBe(false)
    })
  })
})
