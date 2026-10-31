'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { DashboardLayout } from './layout/dashboard-layout'
import { useAuth } from '@/hooks/use-auth'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts'
export function Dashboard() {
 const {user}=useAuth(); const [data,setData]=useState<any>(); const [error,setError]=useState('')
 useEffect(()=>{fetch('/api/dashboard').then(r=>r.json()).then(r=>{if(!r.success) throw Error('Unable to load dashboard');setData(r.data)}).catch(e=>setError(e.message))},[])
 const total=data?.statuses.reduce((n:number,s:any)=>n+s.count,0)||0
 return <DashboardLayout><h1 className="text-3xl font-bold mb-6">{user?.role.toLowerCase()} dashboard</h1>{error&&<p role="alert">{error}</p>}{!data&&!error?<p>Loading…</p>:data&&<>
 <div className="grid sm:grid-cols-3 gap-4 mb-6">{[['Total reports',total],['Open follow-ups',data.followUps.length],['Overdue follow-ups',data.followUps.filter((f:any)=>new Date(f.dueDate)<new Date()).length],...(user?.role !== 'TEACHER' ? [['Interventions',data.interventions]] : []),...(user?.role==='PRINCIPAL'?[['Pending staff approvals',data.approvals]]:[]),...data.statuses.map((s:any)=>[s.name,s.count])].map(([label,value])=><div className="bg-white border rounded-xl p-5" key={label}><p>{label}</p><strong className="text-3xl">{value}</strong></div>)}</div>
 <div className="bg-white rounded-xl border p-4 mb-6"><h2>Incidents by category</h2><ResponsiveContainer width="100%" height={240}><BarChart data={data.categories}><XAxis dataKey="name"/><YAxis allowDecimals={false}/><Tooltip/><Bar dataKey="count" fill="#2563eb"/></BarChart></ResponsiveContainer></div>
 <div className="flex gap-4 mb-4"><Link href="/cases">All cases</Link>{['TEACHER','PRINCIPAL'].includes(user?.role||'')&&<Link href="/cases/new">Submit incident</Link>}{user?.role==='PRINCIPAL'&&<><Link href="/users">Staff approvals</Link><Link href="/export">Export reports</Link></>}</div>
 <h2 className="text-xl font-semibold">Recent cases</h2><ul>{data.cases.map((c:any)=><li className="bg-white border rounded p-4 my-2" key={c.id}><Link href={'/cases/'+c.id}>{c.referenceNumber} · {c.student.name} · {c.status}</Link></li>)}</ul>{!data.cases.length&&<p>No cases yet.</p>}
 </>}</DashboardLayout>
}
