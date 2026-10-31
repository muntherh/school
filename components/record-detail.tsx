'use client'
import { useEffect,useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { DashboardLayout } from './layout/dashboard-layout'
export function RecordDetail({kind}:{kind:'students'|'users'}) {
 const {id}=useParams();const [data,setData]=useState<any>();const [cases,setCases]=useState<any[]>([]);const [error,setError]=useState('')
 useEffect(()=>{fetch(`/api/${kind}/${id}`).then(r=>r.json()).then(r=>{if(!r.success)throw Error(r.error?.message||'Record unavailable');setData(r.data)}).catch(e=>setError(e.message));if(kind==='students')fetch(`/api/cases?studentId=${id}&limit=100`).then(r=>r.json()).then(r=>setCases(r.data||[]))},[id,kind])
 return <DashboardLayout><Link href={'/'+kind}>Back to {kind}</Link>{error?<p role="alert">{error}</p>:!data?<p>Loading…</p>:<div className="bg-white rounded-xl border p-6 mt-4"><h1 className="text-3xl font-bold">{data.name}</h1><dl>{Object.entries(data).filter(([k])=>!['id','name','approvedBy'].includes(k)).map(([k,v])=><div className="py-2" key={k}><dt className="font-semibold">{k}</dt><dd>{String(v??'—')}</dd></div>)}</dl>{kind==='students'&&<><h2 className="text-xl mt-6">Authorized case history</h2>{cases.map(c=><p key={c.id}><Link href={'/cases/'+c.id}>{c.referenceNumber} · {c.status}</Link></p>)}{!cases.length&&<p>No accessible cases.</p>}</>}</div>}</DashboardLayout>
}
