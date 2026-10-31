import { NextRequest, NextResponse } from 'next/server'
import { routeAccess } from '@/lib/route-access'
import { requireActiveSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'
export async function GET(request: NextRequest) {
 const denied = await routeAccess(request); if (denied) return denied
 const user = await requireActiveSession()
 const scope = user.role === 'TEACHER' ? {reporterId:user.userId} : user.role === 'COUNSELLOR' ? {assignedToId:user.userId} : {}
 const [statuses, categories, cases, followUps, interventions, approvals] = await Promise.all([
  prisma.case.groupBy({by:['status'], where:scope, _count:true}),
  prisma.case.groupBy({by:['category'], where:scope, _count:true}),
  prisma.case.findMany({where:scope, orderBy:{submittedAt:'desc'}, take:10, select:{id:true,referenceNumber:true,status:true,category:true,incidentDate:true,student:{select:{name:true}}}}),
  prisma.followUp.findMany({where:{case:scope,status:{in:['PENDING','OVERDUE']}},select:{id:true,caseId:true,dueDate:true,status:true}}),
  prisma.intervention.count({where:{case:scope}}),
  user.role === 'PRINCIPAL' ? prisma.user.count({where:{accountStatus:'PENDING'}}) : 0
 ])
 return NextResponse.json({success:true,data:{statuses:statuses.map(s=>({name:s.status,count:s._count})),categories:categories.map(s=>({name:s.category,count:s._count})),cases,followUps,interventions,approvals}})
}
