import { NextRequest, NextResponse } from 'next/server'
import { routeAccess } from '@/lib/route-access'
import { requireActiveSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'

// Every figure is computed from the database within the caller's scope:
// teachers see their own reports, counsellors their assigned cases, the principal everything.
export async function GET(request: NextRequest) {
  const denied = await routeAccess(request)
  if (denied) return denied
  const user = await requireActiveSession()
  const scope = user.role === 'TEACHER' ? { reporterId: user.userId } : user.role === 'COUNSELLOR' ? { assignedToId: user.userId } : {}

  const trendStart = new Date()
  trendStart.setUTCDate(1)
  trendStart.setUTCHours(0, 0, 0, 0)
  trendStart.setUTCMonth(trendStart.getUTCMonth() - 5)

  const [statuses, categories, cases, followUps, completedFollowUps, interventions, approvals, pendingStaff, chartRows] = await Promise.all([
    prisma.case.groupBy({ by: ['status'], where: scope, _count: true }),
    prisma.case.groupBy({ by: ['category'], where: scope, _count: true }),
    prisma.case.findMany({ where: scope, orderBy: { submittedAt: 'desc' }, take: 10, select: { id: true, referenceNumber: true, status: true, category: true, incidentDate: true, student: { select: { name: true } } } }),
    prisma.followUp.findMany({ where: { case: scope, status: { in: ['PENDING', 'OVERDUE'] } }, orderBy: { dueDate: 'asc' }, select: { id: true, caseId: true, dueDate: true, status: true, nextStep: true, case: { select: { referenceNumber: true, student: { select: { name: true } } } } } }),
    prisma.followUp.count({ where: { case: scope, status: 'COMPLETED' } }),
    prisma.intervention.count({ where: { case: scope } }),
    user.role === 'PRINCIPAL' ? prisma.user.count({ where: { accountStatus: 'PENDING' } }) : 0,
    user.role === 'PRINCIPAL'
      ? prisma.user.findMany({ where: { accountStatus: 'PENDING' }, orderBy: { createdAt: 'asc' }, take: 5, select: { id: true, name: true, role: true, createdAt: true } })
      : [],
    prisma.case.findMany({ where: { ...scope, incidentDate: { gte: trendStart } }, select: { incidentDate: true, student: { select: { classGrade: true } } } }),
  ])

  // Monthly trend for the last six months (including empty months).
  const months: { name: string; key: string; count: number }[] = []
  for (let i = 0; i < 6; i++) {
    const d = new Date(trendStart)
    d.setUTCMonth(trendStart.getUTCMonth() + i)
    months.push({ key: d.toISOString().slice(0, 7), name: d.toLocaleString('en', { month: 'short', year: '2-digit', timeZone: 'UTC' }), count: 0 })
  }
  const classCounts = new Map<string, number>()
  for (const row of chartRows) {
    const m = months.find((x) => x.key === row.incidentDate.toISOString().slice(0, 7))
    if (m) m.count++
    const cls = row.student?.classGrade || 'Unknown'
    classCounts.set(cls, (classCounts.get(cls) || 0) + 1)
  }

  return NextResponse.json({
    success: true,
    data: {
      statuses: statuses.map((s) => ({ name: s.status, count: s._count })),
      categories: categories.map((s) => ({ name: s.category, count: s._count })),
      classes: [...classCounts.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true })),
      trend: months.map(({ name, count }) => ({ name, count })),
      cases,
      followUps,
      completedFollowUps,
      interventions,
      approvals,
      pendingStaff,
    },
  })
}
