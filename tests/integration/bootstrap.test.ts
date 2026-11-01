import { it, expect } from 'vitest'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { prisma } from '@/lib/prisma'
const run = promisify(execFile)
it('bootstraps one principal and refuses a second bootstrap without changing accounts', async () => {
  const env = { ...process.env, BOOTSTRAP_EMAIL: 'bootstrap@example.com', BOOTSTRAP_NAME: 'Initial Principal', BOOTSTRAP_STAFF_ID: 'FIRST', BOOTSTRAP_PASSWORD: 'test-password-long-enough' }
  await run(process.execPath, ['prisma/bootstrap-principal.js'], { env })
  const principal = await prisma.user.findUniqueOrThrow({ where: { email: env.BOOTSTRAP_EMAIL } })
  expect(principal.role).toBe('PRINCIPAL')
  expect(principal.accountStatus).toBe('ACTIVE')
  expect(principal.passwordHash).not.toBe(env.BOOTSTRAP_PASSWORD)
  await expect(run(process.execPath, ['prisma/bootstrap-principal.js'], { env })).rejects.toThrow()
  expect(await prisma.user.count()).toBe(1)
  expect(await prisma.auditEvent.count({ where: { action: 'FIRST_PRINCIPAL_CREATED' } })).toBe(1)
})
