import { NextRequest, NextResponse } from 'next/server'
import { requireActiveSession } from './session'
import { prisma } from './prisma'
import { canAccessCase } from './permissions'

// Every API route calls this server-side boundary before accessing any records.
export async function routeAccess(request: NextRequest) {
  const deny = (status = 403) => NextResponse.json({ success: false, error: { code: 'ACCESS_DENIED', message: 'Access denied' } }, { status })
  let user
  try { user = await requireActiveSession() } catch { return deny(401) }
  const path = request.nextUrl.pathname.split('/').filter(Boolean)
  const resource = path[1], id = path[2], operation = path[3]
  const write = !['GET', 'HEAD', 'OPTIONS'].includes(request.method)
  if (write) {
    const origin = request.headers.get('origin')
    if (origin && origin !== new URL(process.env.NEXT_PUBLIC_APP_URL || request.url).origin) return deny()
    if (request.method !== 'DELETE' && !request.headers.get('content-type')?.includes('application/json')) return deny(415)
  }
  const principal = user.role === 'PRINCIPAL'
  const admin = principal || user.role === 'ADMIN'
  if (resource === 'configuration' && !write && ['INCIDENT_CATEGORIES','ACTION_TYPES','INTERVENTION_TYPES'].includes(id)) return null
  if (['audit', 'audit-log', 'configuration'].includes(resource)) return admin ? null : deny()
  if (resource === 'export') return principal ? null : deny()
  if (resource === 'users') {
    if (id === 'assignable' && !write) return null
    if (!admin && id !== user.userId) return deny()
    if (write && !principal) return deny()
    return null
  }
  if (resource === 'students') return (user.role !== 'ADMIN' && (!write || principal)) ? null : deny()
  if (resource === 'dashboard') return user.role !== 'ADMIN' ? null : deny()
  if (!['cases', 'actions', 'interventions', 'follow-ups'].includes(resource)) return deny()
  if (user.role === 'ADMIN') return deny()
  if (!id) return !write || principal || user.role === 'TEACHER' ? null : deny()
  let caseId = id
  if (resource === 'actions') caseId = (await prisma.disciplinaryAction.findUnique({ where: { id } }))?.caseId || ''
  if (resource === 'interventions') caseId = (await prisma.intervention.findUnique({ where: { id } }))?.caseId || ''
  if (resource === 'follow-ups') caseId = (await prisma.followUp.findUnique({ where: { id } }))?.caseId || ''
  const record = await prisma.case.findUnique({ where: { id: caseId } })
  if (!record || !canAccessCase(user.role as any, user.userId!, record.reporterId, record.assignedToId)) return deny()
  if (user.role === 'TEACHER' && (resource === 'interventions' || operation === 'interventions')) return deny()
  if (write && !principal) {
    if (user.role === 'TEACHER') {
      if (resource !== 'cases' || (operation ? operation !== 'clarification' || request.method !== 'PATCH' : !['SUBMITTED', 'CLARIFICATION_REQUIRED'].includes(record.status))) return deny()
    } else if (!['interventions', 'follow-ups'].includes(resource) && !['interventions', 'follow-ups'].includes(operation)) return deny()
  }
  return null
}
