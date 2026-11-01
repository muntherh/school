import { NextRequest, NextResponse } from 'next/server'
import { routeAccess } from '@/lib/route-access'
import { prisma } from '@/lib/prisma'
export async function GET(request: NextRequest) {
 const denied = await routeAccess(request); if (denied) return denied
 const data = await prisma.user.findMany({ where: { accountStatus: 'ACTIVE', role: { in: ['PRINCIPAL','COUNSELLOR','TEACHER'] } }, select: { id: true, name: true, role: true } })
 return NextResponse.json({ success: true, data })
}
