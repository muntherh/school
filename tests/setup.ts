import { prisma } from '@/lib/prisma'
import { beforeAll, afterAll, beforeEach } from 'vitest'

beforeAll(async () => {
  // Setup test database connection if needed
  // For now, we'll use the same database
})

afterAll(async () => {
  // Cleanup after all tests
  await prisma.$disconnect()
})

beforeEach(async () => {
  // Clean up database before each test
  // This is a simple approach - in production, use transactions or test database
  const deleteOrder = [
    'ConfidentialNote',
    'FollowUp',
    'Intervention',
    'DisciplinaryAction',
    'CaseReview',
    'AuditEvent',
    'ExportLog',
    'Case',
    'User',
    'Student',
    'Configuration',
  ] as const

  for (const model of deleteOrder) {
    await prisma.$executeRawUnsafe(`DELETE FROM "${model}"`)
  }
})
