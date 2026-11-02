'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { DashboardLayout } from './layout/dashboard-layout'
import { roleLabels } from './layout/sidebar'
import { useAuth } from '@/hooks/use-auth'
import { StatusBadge, statusLabel } from './status-badge'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  CalendarClock,
  FileDown,
  FolderOpen,
  HeartHandshake,
  Inbox,
  Plus,
  UserCheck,
} from 'lucide-react'

type DashboardData = {
  statuses: { name: string; count: number }[]
  categories: { name: string; count: number }[]
  cases: { id: string; referenceNumber: string; status: string; category: string; incidentDate: string; student: { name: string } }[]
  followUps: { id: string; caseId: string; dueDate: string; status: string }[]
  interventions: number
  approvals: number
}

const STATUS_BAR: Record<string, string> = {
  SUBMITTED: 'from-sky-400 to-sky-500',
  UNDER_REVIEW: 'from-amber-400 to-amber-500',
  CLARIFICATION_REQUIRED: 'from-rose-400 to-rose-500',
  ASSIGNED: 'from-emerald-400 to-emerald-500',
  ACTION_PENDING: 'from-orange-400 to-orange-500',
  FOLLOW_UP_PENDING: 'from-violet-400 to-violet-500',
  REOPENED: 'from-cyan-400 to-cyan-500',
  REJECTED: 'from-red-400 to-red-500',
  CLOSED: 'from-slate-300 to-slate-400',
}

function StatCard({ label, value, icon: Icon, tone, hint, delay }: { label: string; value: number; icon: React.ComponentType<{ className?: string }>; tone: string; hint: string; delay: number }) {
  return (
    <div
      className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[var(--shadow-soft)] sm:p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)] animate-slide-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl sm:h-10 sm:w-10 ${tone}`}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <p className="mt-3 text-2xl font-bold tracking-tight text-slate-900 tabular-nums sm:text-3xl">{value}</p>
      <p className="mt-1 text-xs text-slate-400">{hint}</p>
    </div>
  )
}

function SkeletonBlock({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-2xl bg-slate-200/60 ${className}`} />
}

export function Dashboard() {
  const { user } = useAuth()
  const [data, setData] = useState<DashboardData>()
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/dashboard')
      .then((r) => r.json())
      .then((r) => {
        if (!r.success) throw Error('Unable to load dashboard')
        setData(r.data)
      })
      .catch((e) => setError(e.message))
  }, [])

  const role = user?.role || ''
  const total = data?.statuses.reduce((n, s) => n + s.count, 0) || 0
  const overdue = data?.followUps.filter((f) => new Date(f.dueDate) < new Date()).length || 0
  const open = total - (data?.statuses.find((s) => s.name === 'CLOSED')?.count || 0)

  const stats = data
    ? [
        { label: 'Total reports', value: total, icon: FolderOpen, tone: 'bg-emerald-50 text-emerald-600', hint: `${open} still open` },
        { label: 'Open follow-ups', value: data.followUps.length, icon: CalendarClock, tone: 'bg-sky-50 text-sky-600', hint: 'Pending or overdue' },
        { label: 'Overdue follow-ups', value: overdue, icon: AlertTriangle, tone: overdue ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-500', hint: overdue ? 'Needs attention' : 'All on schedule' },
        ...(role !== 'TEACHER' ? [{ label: 'Interventions', value: data.interventions, icon: HeartHandshake, tone: 'bg-violet-50 text-violet-600', hint: 'Counselling records' }] : []),
        ...(role === 'PRINCIPAL' ? [{ label: 'Pending staff approvals', value: data.approvals, icon: UserCheck, tone: 'bg-amber-50 text-amber-600', hint: 'Awaiting your review' }] : []),
      ]
    : []

  const sortedStatuses = [...(data?.statuses || [])].sort((a, b) => b.count - a.count)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-3xl bg-ink-950 px-6 py-8 text-white shadow-[var(--shadow-lift)] sm:px-10 sm:py-10">
          <div aria-hidden className="absolute inset-0 bg-grid-ink [mask-image:radial-gradient(ellipse_at_top_right,black,transparent_70%)]" />
          <div aria-hidden className="absolute -right-20 -top-28 h-80 w-80 rounded-full bg-emerald-500/25 blur-3xl" />
          <div aria-hidden className="absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-gold-500/10 blur-3xl" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                {roleLabels[role] || role} workspace
              </p>
              <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                <span className="text-gradient-brand">{roleLabels[role] || 'My'}</span> Dashboard
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-400">
                {role === 'TEACHER' && 'Track the incidents you have reported and respond to any clarification requests.'}
                {role === 'COUNSELLOR' && 'Your assigned cases, counselling interventions and upcoming follow-ups at a glance.'}
                {role === 'PRINCIPAL' && 'A complete overview of school conduct cases, decisions and staff activity.'}
                {role === 'ADMIN' && 'System overview for technical administration.'}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {['TEACHER', 'PRINCIPAL'].includes(role) && (
                <Link href="/cases/new" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-b from-emerald-400 to-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-[var(--shadow-glow)] transition hover:brightness-110">
                  <Plus className="h-4 w-4" /> Submit incident
                </Link>
              )}
              <Link href="/cases" className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/10">
                All cases <ArrowRight className="h-4 w-4" />
              </Link>
              {role === 'PRINCIPAL' && (
                <>
                  <Link href="/users" className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/10">
                    <UserCheck className="h-4 w-4" /> Staff approvals
                  </Link>
                  <Link href="/export" className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/10">
                    <FileDown className="h-4 w-4" /> Export reports
                  </Link>
                </>
              )}
            </div>
          </div>
        </section>

        {error && (
          <div role="alert" className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertTriangle className="h-5 w-5" /> {error}
          </div>
        )}

        {!data && !error && (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[0, 1, 2, 3].map((i) => <SkeletonBlock key={i} className="h-32" />)}
            </div>
            <SkeletonBlock className="h-80" />
          </div>
        )}

        {data && (
          <>
            <div className={`grid grid-cols-2 gap-3 sm:gap-4 ${stats.length > 4 ? 'xl:grid-cols-5' : stats.length === 4 ? 'xl:grid-cols-4' : 'xl:grid-cols-3'}`}>
              {stats.map((s, i) => <StatCard key={s.label} {...s} delay={i * 60} />)}
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[var(--shadow-soft)] lg:col-span-2">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-semibold text-slate-900">Incidents by category</h2>
                    <p className="text-sm text-slate-500">Distribution of reported incidents</p>
                  </div>
                </div>
                {data.categories.length ? (
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={data.categories} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="barFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#34d399" />
                          <stop offset="100%" stopColor="#059669" />
                        </linearGradient>
                      </defs>
                      <CartesianGrid vertical={false} stroke="#eef1f5" />
                      <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                      <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                      <Tooltip
                        cursor={{ fill: 'rgba(16,185,129,0.06)' }}
                        contentStyle={{ borderRadius: 12, border: '1px solid #e5e8ee', boxShadow: '0 12px 32px -8px rgba(15,23,42,.14)', fontSize: 13 }}
                      />
                      <Bar dataKey="count" name="Cases" fill="url(#barFill)" radius={[8, 8, 0, 0]} maxBarSize={56} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-[260px] flex-col items-center justify-center text-center text-sm text-slate-500">
                    <Inbox className="mb-3 h-8 w-8 text-slate-300" /> No incidents recorded yet.
                  </div>
                )}
              </section>

              <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[var(--shadow-soft)]">
                <h2 className="text-base font-semibold text-slate-900">Case status</h2>
                <p className="text-sm text-slate-500">Where every case currently stands</p>
                <ul className="mt-6 space-y-4">
                  {sortedStatuses.map((s) => (
                    <li key={s.name}>
                      <div className="mb-1.5 flex items-center justify-between text-sm">
                        <span className="font-medium text-slate-700">{statusLabel(s.name)}</span>
                        <span className="tabular-nums text-slate-500">{s.count}</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${STATUS_BAR[s.name] || 'from-slate-300 to-slate-400'}`}
                          style={{ width: `${total ? Math.max(6, (s.count / total) * 100) : 0}%` }}
                        />
                      </div>
                    </li>
                  ))}
                  {!sortedStatuses.length && <li className="text-sm text-slate-500">No cases yet.</li>}
                </ul>
              </section>
            </div>

            <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[var(--shadow-soft)]">
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">Recent cases</h2>
                  <p className="text-sm text-slate-500">The latest reports in your scope</p>
                </div>
                <Link href="/cases" className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-700 hover:text-emerald-800">
                  View all <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
              {data.cases.length ? (
                <ul className="divide-y divide-slate-100">
                  {data.cases.map((c) => (
                    <li key={c.id}>
                      <Link href={'/cases/' + c.id} className="group flex flex-col gap-2 px-6 py-4 transition-colors hover:bg-slate-50/80 sm:flex-row sm:items-center sm:gap-4">
                        <div className="flex min-w-0 flex-1 items-center gap-4">
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-100 to-slate-200 text-xs font-semibold text-slate-600">
                            {c.student.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-900">{c.student.name}</p>
                            <p className="truncate text-xs text-slate-500">
                              {c.category} · <span className="font-mono">{c.referenceNumber}</span>
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 pl-14 sm:pl-0">
                          <span className="text-xs text-slate-500 tabular-nums">{new Date(c.incidentDate).toLocaleDateString()}</span>
                          <StatusBadge status={c.status} />
                          <ArrowRight className="hidden h-4 w-4 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-slate-500 sm:block" />
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
                  <Inbox className="mb-3 h-10 w-10 text-slate-300" />
                  <p className="text-sm font-medium text-slate-700">No cases yet.</p>
                  <p className="text-sm text-slate-500">New reports will appear here.</p>
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
