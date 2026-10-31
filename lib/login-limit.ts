const buckets = new Map<string,{count:number;expires:number}>()
export function allowLogin(key:string, now=Date.now()) {
 for (const [k,v] of buckets) if(v.expires<=now) buckets.delete(k)
 const bucket=buckets.get(key)||{count:0,expires:now+15*60*1000}
 bucket.count++;buckets.set(key,bucket)
 return bucket.count<=10
}
