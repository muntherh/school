'use client'
import { useEffect, useState } from 'react'
import { History } from 'lucide-react'
import { humanize } from './status-badge'

type HistoryEvent = { id: string; timestamp: string; action: string; actor?: { name?: string } | null }

export function CaseHistory({ id }: { id: string }) {
  const [events, setEvents] = useState<HistoryEvent[]>([])
  const [error, setError] = useState('')
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    fetch(`/api/cases/${id}/history`)
      .then((r) => r.json())
      .then((r) => {
        if (!r.success) throw Error('History unavailable')
        setEvents(r.data)
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoaded(true))
  }, [id])

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[var(--shadow-soft)]">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
          <History className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-base font-semibold text-slate-900">Case history</h2>
          <p className="text-sm text-slate-500">Audit trail of every change</p>
        </div>
      </div>
      {error && <p role="alert" className="mt-4 text-sm text-red-600">{error}</p>}
      <ol className="relative mt-6 space-y-5 before:absolute before:bottom-2 before:left-[7px] before:top-2 before:w-px before:bg-slate-200">
        {events.map((e, i) => (
          <li key={e.id} className="relative pl-7">
            <span
              aria-hidden
              className={`absolute left-0 top-1 h-[15px] w-[15px] rounded-full border-[3px] border-white ring-1 ${i === events.length - 1 ? 'bg-blue-500 ring-blue-200' : 'bg-slate-300 ring-slate-200'}`}
            />
            <p className="text-sm font-semibold text-slate-800">{humanize(e.action)}</p>
            <p className="mt-0.5 text-xs text-slate-500">
              {e.actor?.name || 'System'} · <time dateTime={e.timestamp}>{new Date(e.timestamp).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</time>
            </p>
          </li>
        ))}
      </ol>
      {loaded && !events.length && !error && <p className="mt-2 text-sm text-slate-500">No recorded events.</p>}
    </section>
  )
}
