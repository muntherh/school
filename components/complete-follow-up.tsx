'use client'
import {useState} from 'react'
import {api} from '@/lib/api-client'
export function CompleteFollowUp({id,onComplete}:{id:string;onComplete:()=>void}){const [result,setResult]=useState('');const [error,setError]=useState('');return <form onSubmit={async e=>{e.preventDefault();try{await api.completeFollowUp(id,result);onComplete()}catch(e:any){setError(e.message)}}}><input aria-label="Follow-up outcome" required maxLength={2000} value={result} onChange={e=>setResult(e.target.value)} className="border p-2"/><button className="p-2 text-blue-700">Complete follow-up</button>{error&&<p role="alert">{error}</p>}</form>}
