import {NextRequest,NextResponse} from 'next/server'
import {routeAccess} from '@/lib/route-access'
import {prisma} from '@/lib/prisma'
export async function GET(request:NextRequest,{params}:{params:Promise<{id:string}>}){
 const denied=await routeAccess(request);if(denied)return denied
 const {id}=await params
 const record=await prisma.case.findUnique({where:{id},select:{reviews:{select:{id:true}},actions:{select:{id:true}},interventions:{select:{id:true}},followUps:{select:{id:true}}}})
 if(!record)return NextResponse.json({success:false},{status:404})
 const ids=[id,...record.reviews.map(x=>x.id),...record.actions.map(x=>x.id),...record.interventions.map(x=>x.id),...record.followUps.map(x=>x.id)]
 const data=await prisma.auditEvent.findMany({where:{targetId:{in:ids}},orderBy:{timestamp:'asc'},select:{id:true,action:true,timestamp:true,actor:{select:{name:true}}}})
 return NextResponse.json({success:true,data})
}
