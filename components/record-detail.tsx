'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { DashboardLayout } from './layout/dashboard-layout'
import { initials, roleLabels } from './layout/sidebar'
import { StatusBadge } from './status-badge'
import { ArrowLeft, ArrowRight, AlertCircle, BadgeCheck, CalendarDays, FolderOpen, Hash, Mail, Phone, School, ShieldCheck } from 'lucide-react'

const fmtDate = (v?: string | null) =>
  v ? new Date(v).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' }) : '—'

function Field({ icon: Icon, label, children }: { icon: React.ComponentType<{ className?: string }>; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-4">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-slate-500 shadow-sm ring-1 ring-slate-200/70">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <dt className="text-xs font-medium uppercase tracking-wider text-slate-400">{label}</dt>
        <dd className="mt-0.5 break-words text-sm font-semibold text-slate-900">{children}</dd>
      </div>
    </div>
  )
}

export function RecordDetail({ kind }: { kind: 'students' | 'users' }) {
  const { id } = useParams()
  const [data, setData] = useState<any>()
  const [cases, setCases] = useState<any[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`/api/${kind}/${id}`)
      .then((r) => r.json())
      .then((r) => {
        if (!r.success) throw Error(r.error?.message || 'Record unavailable')
        setData(r.data)
      })
      .catch((e) => setError(e.message))
    if (kind === 'students')
      fetch(`/api/cases?studentId=${id}&limit=100`)
        .then((r) => r.json())
        .then((r) => setCases(r.data || []))
  }, [id, kind])

  const backLabel = kind === 'students' ? 'Back to students' : 'Back to staff'

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Link href={'/' + kind} className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900">
          <ArrowLeft className="h-4 w-4" /> {backLabel}
        </Link>

        {error ? (
          <div role="alert" className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            <AlertCircle className="h-5 w-5" /> {error}
          </div>
        ) : !data ? (
          <div className="space-y-6">
            <div className="h-40 animate-pulse rounded-3xl bg-slate-200/60" />
            <div className="h-64 animate-pulse rounded-2xl bg-slate-200/60" />
          </div>
        ) : (
          <>
            <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-900 via-navy-800 to-blue-700 px-6 py-8 text-white shadow-[var(--shadow-lift)] sm:px-8">
              <div aria-hidden className="absolute inset-0 bg-grid-light [mask-image:linear-gradient(to_left,black,transparent_70%)]" />
              <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white text-xl font-bold text-blue-700 shadow-lg">
                  {initials(data.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-300">
                    {kind === 'students' ? 'Student record' : 'Staff member'}
                  </p>
                  <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">{data.name}</h1>
                  <p className="mt-1 text-sm text-blue-100">
                    {kind === 'students' ? `${data.studentId} · Class ${data.classGrade}` : `${roleLabels[data.role] || data.role} · ${data.staffIdentifier}`}
                  </p>
                </div>
                <div>
                  {kind === 'students' ? (
                    <StatusBadge status={data.activeStatus ? 'ACTIVE' : 'DEACTIVATED'} className="px-3 py-1 text-sm" />
                  ) : (
                    <StatusBadge status={data.accountStatus} className="px-3 py-1 text-sm" />
                  )}
                </div>
              </div>
            </section>

            <div className={kind === 'students' ? 'grid gap-6 lg:grid-cols-3' : ''}>
              <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[var(--shadow-soft)]">
                <h2 className="text-base font-semibold text-slate-900">Details</h2>
                <dl className={`mt-5 grid gap-3 ${kind === 'users' ? 'sm:grid-cols-2 lg:grid-cols-3' : ''}`}>
                  {kind === 'students' ? (
                    <>
                      <Field icon={Hash} label="Student ID">{data.studentId}</Field>
                      <Field icon={School} label="Class / Grade">{data.classGrade}</Field>
                      <Field icon={Phone} label="Contact">{data.contactInfo || '—'}</Field>
                    </>
                  ) : (
                    <>
                      <Field icon={Mail} label="Email">{data.email}</Field>
                      <Field icon={Hash} label="Staff ID">{data.staffIdentifier}</Field>
                      <Field icon={ShieldCheck} label="Role">{roleLabels[data.role] || data.role}</Field>
                      <Field icon={BadgeCheck} label="Account status"><StatusBadge status={data.accountStatus} /></Field>
                      <Field icon={CalendarDays} label="Joined">{fmtDate(data.createdAt)}</Field>
                      <Field icon={CalendarDays} label="Approved">{fmtDate(data.approvedAt)}</Field>
                    </>
                  )}
                </dl>
              </section>

              {kind === 'students' && (
                <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[var(--shadow-soft)] lg:col-span-2">
                  <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <FolderOpen className="h-5 w-5" />
                    </span>
                    <div>
                      <h2 className="text-base font-semibold text-slate-900">Authorized case history</h2>
                      <p className="text-sm text-slate-500">Cases you are permitted to view</p>
                    </div>
                  </div>
                  {cases.length ? (
                    <ul className="divide-y divide-slate-100">
                      {cases.map((c) => (
                        <li key={c.id}>
                          <Link href={'/cases/' + c.id} className="group flex flex-col gap-2 px-6 py-4 transition-colors hover:bg-slate-50/80 sm:flex-row sm:items-center sm:justify-between">
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-slate-900">{c.category}</p>
                              <p className="truncate font-mono text-xs text-slate-500">{c.referenceNumber}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-xs text-slate-500">{fmtDate(c.incidentDate)}</span>
                              <StatusBadge status={c.status} />
                              <ArrowRight className="hidden h-4 w-4 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-slate-500 sm:block" />
                            </div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="px-6 py-10 text-center text-sm text-slate-500">No accessible cases.</p>
                  )}
                </section>
              )}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
