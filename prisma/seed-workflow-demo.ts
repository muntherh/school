import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding workflow demonstration data...')

  // Clean existing data
  await prisma.followUp.deleteMany()
  await prisma.intervention.deleteMany()
  await prisma.disciplinaryAction.deleteMany()
  await prisma.caseReview.deleteMany()
  await prisma.case.deleteMany()
  await prisma.student.deleteMany()
  await prisma.auditEvent.deleteMany()
  await prisma.user.deleteMany()

  // Create users
  const hashedPassword = await bcrypt.hash('password123', 10)

  const principal = await prisma.user.create({
    data: {
      name: 'Dr. Sarah Johnson',
      staffIdentifier: 'PRINCIPAL001',
      email: 'principal@school.edu',
      passwordHash: hashedPassword,
      role: 'PRINCIPAL',
      accountStatus: 'ACTIVE',
      approvedAt: new Date(),
    },
  })

  const teacher1 = await prisma.user.create({
    data: {
      name: 'Mr. Michael Chen',
      staffIdentifier: 'TEACHER001',
      email: 'teacher@school.edu',
      passwordHash: hashedPassword,
      role: 'TEACHER',
      accountStatus: 'ACTIVE',
      approvedAt: new Date(),
    },
  })

  const teacher2 = await prisma.user.create({
    data: {
      name: 'Ms. Emily Davis',
      staffIdentifier: 'TEACHER002',
      email: 'teacher2@school.edu',
      passwordHash: hashedPassword,
      role: 'TEACHER',
      accountStatus: 'ACTIVE',
      approvedAt: new Date(),
    },
  })

  const counsellor = await prisma.user.create({
    data: {
      name: 'Dr. James Wilson',
      staffIdentifier: 'COUNSELLOR001',
      email: 'counsellor@school.edu',
      passwordHash: hashedPassword,
      role: 'COUNSELLOR',
      accountStatus: 'ACTIVE',
      approvedAt: new Date(),
    },
  })

  console.log('✅ Created users')

  // Create students
  const student1 = await prisma.student.create({
    data: {
      studentId: 'STU001',
      name: 'Alex Thompson',
      classGrade: '10A',
      activeStatus: true,
      contactInfo: 'parent1@email.com',
    },
  })

  const student2 = await prisma.student.create({
    data: {
      studentId: 'STU002',
      name: 'Jordan Martinez',
      classGrade: '10B',
      activeStatus: true,
      contactInfo: 'parent2@email.com',
    },
  })

  const student3 = await prisma.student.create({
    data: {
      studentId: 'STU003',
      name: 'Taylor Kim',
      classGrade: '11A',
      activeStatus: true,
      contactInfo: 'parent3@email.com',
    },
  })

  console.log('✅ Created students')

  // Create cases demonstrating the workflow

  // Case 1: Submitted by teacher, awaiting review
  const case1 = await prisma.case.create({
    data: {
      referenceNumber: 'CASE-2024-001',
      studentId: student1.id,
      reporterId: teacher1.id,
      incidentDate: new Date('2024-01-15'),
      category: 'Behavioral Issue',
      description: 'Student was disruptive during class, repeatedly interrupting the lesson and refusing to follow instructions. The behavior escalated when the student was asked to leave the classroom.',
      location: 'Science Lab, Room 205',
      witnesses: 'Ms. Emily Davis (co-teacher), two other students',
      status: 'SUBMITTED',
      version: 0,
    },
  })

  // Case 2: Under review by principal
  const case2 = await prisma.case.create({
    data: {
      referenceNumber: 'CASE-2024-002',
      studentId: student2.id,
      reporterId: teacher2.id,
      incidentDate: new Date('2024-01-18'),
      category: 'Academic Dishonesty',
      description: 'Student was found copying answers from another student during the mathematics examination. The incident was witnessed by the proctor.',
      location: 'Examination Hall',
      witnesses: 'Proctor Mr. Robert Brown',
      status: 'UNDER_REVIEW',
      version: 0,
    },
  })

  // Case 3: Clarification required
  const case3 = await prisma.case.create({
    data: {
      referenceNumber: 'CASE-2024-003',
      studentId: student3.id,
      reporterId: teacher1.id,
      incidentDate: new Date('2024-01-20'),
      category: 'Safety Violation',
      description: 'Student was observed running in the hallway during passing period, nearly colliding with another student. No injury occurred.',
      location: 'Main Hallway, 2nd Floor',
      witnesses: 'Hall monitor',
      status: 'CLARIFICATION_REQUIRED',
      version: 0,
    },
  })

  // Add clarification request review for case 3
  await prisma.caseReview.create({
    data: {
      caseId: case3.id,
      reviewerId: principal.id,
      result: 'CLARIFICATION_REQUIRED',
      clarificationRequest: 'Please provide more details about the severity of the incident. Was there any actual risk of injury? Have there been previous similar incidents with this student?',
      notes: 'Need additional context before making a decision',
    },
  })

  // Case 4: Assigned to counsellor
  const case4 = await prisma.case.create({
    data: {
      referenceNumber: 'CASE-2024-004',
      studentId: student1.id,
      reporterId: teacher2.id,
      incidentDate: new Date('2024-01-10'),
      category: 'Behavioral Issue',
      description: 'Student displayed aggressive behavior towards a classmate during group work. Verbal threats were reported.',
      location: 'Classroom 302',
      witnesses: 'Multiple students in the group',
      status: 'ASSIGNED',
      assignedToId: counsellor.id,
      assignedAt: new Date('2024-01-11'),
      version: 0,
    },
  })

  // Add review for case 4
  await prisma.caseReview.create({
    data: {
      caseId: case4.id,
      reviewerId: principal.id,
      result: 'APPROVED',
      notes: 'Assign to counsellor for intervention and behavioral assessment',
    },
  })

  // Case 5: Action pending
  const case5 = await prisma.case.create({
    data: {
      referenceNumber: 'CASE-2024-005',
      studentId: student2.id,
      reporterId: teacher1.id,
      incidentDate: new Date('2024-01-05'),
      category: 'Behavioral Issue',
      description: 'Student repeatedly violated school dress code policy despite multiple warnings. Continued defiance of school rules.',
      location: 'Various locations',
      witnesses: 'Multiple staff members',
      status: 'ACTION_PENDING',
      version: 0,
    },
  })

  // Add review and disciplinary action for case 5
  await prisma.caseReview.create({
    data: {
      caseId: case5.id,
      reviewerId: principal.id,
      result: 'APPROVED',
      notes: 'Disciplinary action recommended: Detention and parent meeting',
    },
  })

  await prisma.disciplinaryAction.create({
    data: {
      caseId: case5.id,
      actionType: 'Detention',
      rationale: 'Repeated violation of dress code policy despite warnings',
      startDate: new Date('2024-01-12'),
      endDate: new Date('2024-01-12'),
      responsibleUserId: principal.id,
      status: 'PENDING',
    },
  })

  // Case 6: Follow-up pending
  const case6 = await prisma.case.create({
    data: {
      referenceNumber: 'CASE-2024-006',
      studentId: student3.id,
      reporterId: teacher2.id,
      incidentDate: new Date('2024-01-02'),
      category: 'Behavioral Issue',
      description: 'Student involved in a minor altercation during lunch period. Both students were separated and counseled.',
      location: 'Cafeteria',
      witnesses: 'Lunch monitors',
      status: 'FOLLOW_UP_PENDING',
      version: 0,
    },
  })

  // Add intervention and follow-up for case 6
  await prisma.intervention.create({
    data: {
      caseId: case6.id,
      counsellorId: counsellor.id,
      type: 'Individual Counselling',
      date: new Date('2024-01-03'),
      notes: 'Initial counselling session conducted. Student expressed remorse and understanding of the incident. Discussed conflict resolution strategies.',
      outcome: 'Student showed positive attitude and willingness to improve behavior',
      nextStep: 'Schedule follow-up session in one week',
      confidentialityLevel: 'STANDARD',
    },
  })

  await prisma.followUp.create({
    data: {
      caseId: case6.id,
      dueDate: new Date('2024-01-17'),
      assignedUserId: counsellor.id,
      status: 'PENDING',
      notes: 'Check on student behavior and reinforce conflict resolution strategies discussed in counselling',
    },
  })

  // Case 7: Closed
  const case7 = await prisma.case.create({
    data: {
      referenceNumber: 'CASE-2024-007',
      studentId: student1.id,
      reporterId: teacher1.id,
      incidentDate: new Date('2023-12-15'),
      category: 'Attendance Issue',
      description: 'Student had three unexcused absences in one week. Parent was contacted and issue was resolved.',
      location: 'N/A',
      status: 'CLOSED',
      closedAt: new Date('2023-12-20'),
      closedBy: principal.id,
      version: 0,
    },
  })

  await prisma.caseReview.create({
    data: {
      caseId: case7.id,
      reviewerId: principal.id,
      result: 'CLOSED',
      notes: 'Issue resolved after parent meeting. No further action required.',
    },
  })

  console.log('✅ Created demonstration cases')

  // Create audit events for demonstration
  await prisma.auditEvent.createMany({
    data: [
      {
        actorId: teacher1.id,
        action: 'CASE_CREATED',
        targetType: 'Case',
        targetId: case1.id,
        metadata: { referenceNumber: 'CASE-2024-001' },
      },
      {
        actorId: principal.id,
        action: 'CASE_STATUS_TRANSITION',
        targetType: 'Case',
        targetId: case2.id,
        metadata: { fromStatus: 'SUBMITTED', toStatus: 'UNDER_REVIEW' },
      },
      {
        actorId: principal.id,
        action: 'CLARIFICATION_REQUESTED',
        targetType: 'Case',
        targetId: case3.id,
      },
      {
        actorId: principal.id,
        action: 'CASE_ASSIGNED',
        targetType: 'Case',
        targetId: case4.id,
        metadata: { assignedToId: counsellor.id },
      },
    ],
  })

  console.log('✅ Created audit events')

  console.log('\n🎉 Workflow demonstration data seeded successfully!')
  console.log('\n📋 Test Accounts:')
  console.log('   Principal: principal@school.edu / password123')
  console.log('   Teacher:   teacher@school.edu / password123')
  console.log('   Counsellor: counsellor@school.edu / password123')
  console.log('\n📊 Cases Created:')
  console.log('   CASE-2024-001: Submitted (awaiting review)')
  console.log('   CASE-2024-002: Under Review')
  console.log('   CASE-2024-003: Clarification Required')
  console.log('   CASE-2024-004: Assigned to Counsellor')
  console.log('   CASE-2024-005: Action Pending')
  console.log('   CASE-2024-006: Follow-up Pending')
  console.log('   CASE-2024-007: Closed')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding data:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
