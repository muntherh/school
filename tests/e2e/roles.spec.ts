import { test, expect, type Page, type APIRequestContext } from '@playwright/test'
import { PrismaClient, type Role } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { randomUUID } from 'node:crypto'

const db = new PrismaClient()
const prefix = `e2e-${randomUUID()}`
const password = 'Test-only-password-2026!'
const users: Record<string, { id: string; email: string }> = {}
let caseId: string, otherCaseId: string, studentId: string

test.beforeAll(async () => {
  if (!new URL(process.env.DATABASE_URL || '').pathname.endsWith('_test')) throw new Error('E2E requires a dedicated _test database')
  const passwordHash = await bcrypt.hash(password, 10)
  for (const [key, role] of Object.entries({ teacher: 'TEACHER', other: 'TEACHER', principal: 'PRINCIPAL', counsellor: 'COUNSELLOR', admin: 'ADMIN' })) {
    users[key] = await db.user.create({ data: { name: `${prefix}-${key}`, staffIdentifier: `${prefix}-${key}`, email: `${prefix}-${key}@example.com`, passwordHash, role: role as Role, accountStatus: 'ACTIVE' } })
  }
  const student = await db.student.create({ data: { name: 'Synthetic test student', studentId: prefix, classGrade: '10A' } })
  studentId = student.id
  const record = await db.case.create({ data: { referenceNumber: `${prefix}-case`, studentId, reporterId: users.teacher.id, assignedToId: users.counsellor.id, incidentDate: new Date(), category: 'Behaviour', description: 'Synthetic incident for automated acceptance testing' } })
  caseId = record.id
  otherCaseId = (await db.case.create({ data: { referenceNumber: `${prefix}-other`, studentId, reporterId: users.other.id, incidentDate: new Date(), category: 'Behaviour', description: 'Unrelated incident that must remain inaccessible' } })).id
  await db.intervention.create({ data: { caseId, counsellorId: users.counsellor.id, type: 'Counselling', date: new Date(), notes: 'Sensitive intervention text', confidentialityLevel: 'CONFIDENTIAL' } })
})

test.afterAll(async () => {
  await db.case.deleteMany({ where: { referenceNumber: { startsWith: prefix } } })
  await db.student.deleteMany({ where: { studentId: prefix } })
  await db.auditEvent.deleteMany({ where: { actorId: { in: Object.values(users).map(u => u.id) } } })
  await db.user.deleteMany({ where: { staffIdentifier: { startsWith: prefix } } })
  await db.$disconnect()
})

async function login(request: APIRequestContext, role: string) {
  const response = await request.post('/api/auth/login', { data: { email: users[role].email, password } })
  expect(response.status()).toBe(200)
}

test('teacher signs in, opens own case, and cannot read another case or interventions', async ({ page }) => {
  await page.goto('/login')
  await page.getByLabel('Email Address').fill(users.teacher.email)
  await page.getByLabel('Password', { exact: true }).fill(password)
  await page.getByRole('button', { name: 'Sign In', exact: true }).click()
  await expect(page).toHaveURL(/dashboard\/teacher/)
  await page.goto(`/cases/${caseId}`)
  await expect(page.getByRole('heading', { name: `${prefix}-case`, exact: true })).toBeVisible()
  const own = await page.request.get(`/api/cases/${caseId}`)
  expect(own.status()).toBe(200)
  expect(await own.text()).not.toContain('Sensitive intervention text')
  expect((await page.request.get(`/api/cases/${otherCaseId}`)).status()).toBe(403)
  expect((await page.request.get(`/api/cases/${caseId}/interventions`)).status()).toBe(403)
  expect((await page.request.post(`/api/cases/${caseId}/reviews`, { data: { result: 'CLOSED', notes: 'Not permitted' } })).status()).toBe(403)
})

test('principal records a closure decision through the review form', async ({ page }) => {
  await login(page.request, 'principal')
  await page.goto(`/cases/${otherCaseId}/review`)
  await page.getByLabel('Review Result').selectOption('CLOSED')
  await page.locator('textarea').fill('Principal verified this synthetic case needs no further action.')
  await page.getByRole('button', { name: 'Submit Review' }).click()
  await expect(page).toHaveURL(new RegExp(`/cases/${otherCaseId}$`))
  const record = await db.case.findUniqueOrThrow({ where: { id: otherCaseId }, include: { reviews: true } })
  expect(record.status).toBe('CLOSED')
  expect(record.reviews).toHaveLength(1)
  expect(await db.auditEvent.count({ where: { targetId: otherCaseId, action: 'CASE_DECISION_RECORDED' } })).toBe(1)
})

test('counsellor only reads assigned cases and cannot make principal decisions', async ({ page }) => {
  await login(page.request, 'counsellor')
  expect((await page.request.get(`/api/cases/${caseId}`)).status()).toBe(200)
  expect((await page.request.get(`/api/cases/${otherCaseId}`)).status()).toBe(403)
  expect((await page.request.post(`/api/cases/${caseId}/reviews`, { data: { result: 'CLOSED', notes: 'Not permitted' } })).status()).toBe(403)
  await page.goto('/dashboard/counsellor')
  await expect(page.getByRole('heading', { name: /dashboard/i }).first()).toBeVisible()
})

test('technical admin cannot access case content and deactivation invalidates sessions', async ({ page }) => {
  await login(page.request, 'admin')
  expect((await page.request.get(`/api/cases/${caseId}`)).status()).toBe(403)
  expect((await page.request.get('/api/export/cases')).status()).toBe(403)
  await db.user.update({ where: { id: users.admin.id }, data: { accountStatus: 'DEACTIVATED' } })
  expect((await page.request.get('/api/users')).status()).toBe(401)
})
