import { expect } from 'vitest'
function needsDatabase() { return !expect.getState().testPath?.includes('/unit/') }
if (process.env.DATABASE_URL && !new URL(process.env.DATABASE_URL).pathname.endsWith('_test')) throw new Error('Tests require a dedicated database whose name ends with _test')
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
  if (!needsDatabase()) return
  if (!process.env.DATABASE_URL) throw new Error('Dedicated _test database required')
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
