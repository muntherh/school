const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  // SAFETY CHECK: Prevent running seed in production
  if (process.env.NODE_ENV === 'production') {
    console.error('ERROR: Seed script cannot run in production environment.')
    console.error('This script is for development and testing only.')
    console.error('It uses fictional test data that should not be loaded into production.')
    process.exit(1)
  }

  console.log('Starting seed...')
  console.log('Environment:', process.env.NODE_ENV)
  console.log('WARNING: This will create fictional test data only suitable for development.')

  // Hash passwords. All seeded demo accounts share this password.
  // Demo login: principal@school.edu / password@123
  const passwordHash = await bcrypt.hash('password@123', 10)

  // Create users
  const principal = await prisma.user.upsert({
    where: { email: 'principal@school.edu' },
    // Refresh the password on re-seed so the demo login stays principal@school.edu / password@123.
    update: { passwordHash, accountStatus: 'ACTIVE' },
    create: {
      name: 'Dr. Jane Smith',
      staffIdentifier: 'PRINCIPAL001',
      email: 'principal@school.edu',
      passwordHash,
      role: 'PRINCIPAL',
      accountStatus: 'ACTIVE',
      approvedAt: new Date(),
    },
  })

  const teacher1 = await prisma.user.upsert({
    where: { email: 'teacher1@school.edu' },
    update: {},
    create: {
      name: 'John Johnson',
      staffIdentifier: 'TEACHER001',
      email: 'teacher1@school.edu',
      passwordHash,
      role: 'TEACHER',
      accountStatus: 'ACTIVE',
      approvedAt: new Date(),
      approvedBy: principal.id,
    },
  })

  const teacher2 = await prisma.user.upsert({
    where: { email: 'teacher2@school.edu' },
    update: {},
    create: {
      name: 'Mary Williams',
      staffIdentifier: 'TEACHER002',
      email: 'teacher2@school.edu',
      passwordHash,
      role: 'TEACHER',
      accountStatus: 'ACTIVE',
      approvedAt: new Date(),
      approvedBy: principal.id,
    },
  })

  const counsellor = await prisma.user.upsert({
    where: { email: 'counsellor@school.edu' },
    update: {},
    create: {
      name: 'Dr. Robert Davis',
      staffIdentifier: 'COUNSELLOR001',
      email: 'counsellor@school.edu',
      passwordHash,
      role: 'COUNSELLOR',
      accountStatus: 'ACTIVE',
      approvedAt: new Date(),
      approvedBy: principal.id,
    },
  })

  const admin = await prisma.user.upsert({
    where: { email: 'admin@school.edu' },
    update: {},
    create: {
      name: 'System Administrator',
      staffIdentifier: 'ADMIN001',
      email: 'admin@school.edu',
      passwordHash,
      role: 'ADMIN',
      accountStatus: 'ACTIVE',
      approvedAt: new Date(),
      approvedBy: principal.id,
    },
  })

  // Create students
  const student1 = await prisma.student.upsert({
    where: { studentId: 'STU001' },
    update: {},
    create: {
      studentId: 'STU001',
      name: 'Alice Brown',
      classGrade: '10A',
      activeStatus: true,
      contactInfo: 'parent1@example.com',
    },
  })

  const student2 = await prisma.student.upsert({
    where: { studentId: 'STU002' },
    update: {},
    create: {
      studentId: 'STU002',
      name: 'Bob Miller',
      classGrade: '10A',
      activeStatus: true,
      contactInfo: 'parent2@example.com',
    },
  })

  const student3 = await prisma.student.upsert({
    where: { studentId: 'STU003' },
    update: {},
    create: {
      studentId: 'STU003',
      name: 'Carol Garcia',
      classGrade: '10B',
      activeStatus: true,
      contactInfo: 'parent3@example.com',
    },
  })

  const student4 = await prisma.student.upsert({
    where: { studentId: 'STU004' },
    update: {},
    create: {
      studentId: 'STU004',
      name: 'David Martinez',
      classGrade: '11A',
      activeStatus: true,
      contactInfo: 'parent4@example.com',
    },
  })

  const student5 = await prisma.student.upsert({
    where: { studentId: 'STU005' },
    update: {},
    create: {
      studentId: 'STU005',
      name: 'Emma Wilson',
      classGrade: '11B',
      activeStatus: true,
      contactInfo: 'parent5@example.com',
    },
  })

  // Create configuration
  const incidentCategories = await prisma.configuration.upsert({
    where: { key: 'INCIDENT_CATEGORIES' },
    update: {},
    create: {
      key: 'INCIDENT_CATEGORIES',
      value: [
        'Academic Misconduct',
        'Behavioral Issue',
        'Attendance',
        'Bullying',
        'Dress Code Violation',
        'Disrespect',
        'Fighting',
        'Other',
      ],
      category: 'INCIDENT',
      description: 'Available incident categories for reporting',
    },
  })

  const actionTypes = await prisma.configuration.upsert({
    where: { key: 'ACTION_TYPES' },
    update: {},
    create: {
      key: 'ACTION_TYPES',
      value: [
        'Warning',
        'Detention',
        'Suspension',
        'Counselling',
        'Restorative Activity',
        'Parent Meeting',
        'Community Service',
      ],
      category: 'ACTION',
      description: 'Available disciplinary action types',
    },
  })

  const interventionTypes = await prisma.configuration.upsert({
    where: { key: 'INTERVENTION_TYPES' },
    update: {},
    create: {
      key: 'INTERVENTION_TYPES',
      value: [
        'Individual Counselling',
        'Group Session',
        'Peer Mediation',
        'Family Meeting',
        'Referral to External Services',
        'Behavioral Support Plan',
      ],
      category: 'INTERVENTION',
      description: 'Available intervention types for counsellors',
    },
  })

  console.log('Seed completed successfully!')
  console.log('Created users:', { principal, teacher1, teacher2, counsellor, admin })
  console.log('Created students:', { student1, student2, student3, student4, student5 })
  console.log('Created configuration:', { incidentCategories, actionTypes, interventionTypes })
}

main()
  .catch((e) => {
    console.error('Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
