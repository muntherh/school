// Creates the first real principal without adding demo users or student records.
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const prisma = new PrismaClient()
async function main() {
  const email = process.env.BOOTSTRAP_EMAIL?.trim().toLowerCase()
  const name = process.env.BOOTSTRAP_NAME?.trim()
  const staffIdentifier = process.env.BOOTSTRAP_STAFF_ID?.trim()
  const password = process.env.BOOTSTRAP_PASSWORD
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !name || !staffIdentifier || !password || password.length < 12) {
    throw new Error('Set BOOTSTRAP_EMAIL, BOOTSTRAP_NAME, BOOTSTRAP_STAFF_ID and BOOTSTRAP_PASSWORD (at least 12 characters) through a secure environment.')
  }
  await prisma.$transaction(async tx => {
    // Serialize bootstrap attempts and refuse changes once an active principal exists.
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(736367)`
    if (await tx.user.count({ where: { role: 'PRINCIPAL', accountStatus: 'ACTIVE' } })) throw new Error('An active principal already exists. Use staff management.')
    await tx.user.create({ data: { email, name, staffIdentifier, passwordHash: await bcrypt.hash(password, 12), role: 'PRINCIPAL', accountStatus: 'ACTIVE', approvedAt: new Date() } })
    await tx.auditEvent.create({ data: { action: 'FIRST_PRINCIPAL_CREATED', targetType: 'User' } })
  })
  console.log('Initial principal created. Remove bootstrap secrets from the environment.')
}
main().catch(error => { console.error(error.message); process.exitCode = 1 }).finally(() => prisma.$disconnect())
