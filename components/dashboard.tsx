'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { DashboardLayout } from './layout/dashboard-layout'
import { roleLabels } from './layout/sidebar'
import { useAuth } from '@/hooks/use-auth'
import { StatusBadge, statusLabel } from './status-badge'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, AreaChart, Area } from 'recharts'
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  FileDown,
  FileSearch,
  FolderOpen,
  Gavel,
  HeartHandshake,
  Inbox,
  MessageSquareWarning,
  Plus,
  UserCheck,
  Users,
} from 'lucide-react'

type Count = { name: string; count: number }
type DashboardData = {
  statuses: Count[]
  categories: Count[]
  classes: Count[]
  trend: Count[]
  cases: { id: string; referenceNumber: string; status: string; category: string; incidentDate: string; student: { name: string } }[]
  followUps: { id: string; caseId: string; dueDate: string; status: string; nextStep?: string | null; case: { referenceNumber: string; student: { name: string } } }[]
  completedFollowUps: number
  interventions: number
  approvals: number
  pendingStaff: { id: string; name: string; role: string; createdAt: string }[]
}

type Stat = { label: string; value: number; icon: React.ComponentType<{ className?: string }>; tone: string; hint: string; href?: string }

const STATUS_BAR: Record<string, string> = {
  SUBMITTED: 'bg-sky-500',
  UNDER_REVIEW: 'bg-amber-500',
  CLARIFICATION_REQUIRED: 'bg-rose-500',
  ASSIGNED: 'bg-blue-600',
  ACTION_PENDING: 'bg-orange-500',
  FOLLOW_UP_PENDING: 'bg-violet-500',
  REOPENED: 'bg-cyan-500',
  REJECTED: 'bg-red-500',
  CLOSED: 'bg-slate-400',
}

const tooltipStyle = { borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 12px 32px -8px rgba(15,23,42,.14)', fontSize: 13 }

function StatCard({ label, value, icon: Icon, tone, hint, href }: Stat) {
  const body = (
    <>
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${tone}`}>
          <Icon className="h-[18px] w-[18px]" />
        </span>
      </div>
      <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 tabular-nums">{value}</p>
      <p className="mt-0.5 text-xs text-slate-400">{hint}</p>
    </>
  )
  const cls = 'block rounded-2xl border border-slate-200 bg-white p-4 shadow-[var(--shadow-soft)] transition-all duration-200 sm:p-5'
  return href ? (
    <Link href={href} className={`${cls} hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-[var(--shadow-lift)]`}>{body}</Link>
  ) : (
    <div className={cls}>{body}</div>
  )
}

function Panel({ title, subtitle, action, children, className = '' }: { title: string; subtitle?: string; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-[var(--shadow-soft)] ${className}`}>
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-900">{title}</h2>
          {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}

function Empty({ text }: { text: string }) {
  return (
    <div className="flex h-[220px] flex-col items-center justify-center text-center text-sm text-slate-500">
      <Inbox className="mb-3 h-8 w-8 text-slate-300" /> {text}
    </div>
  )
}

function CountBars({ data, color = '#2563eb', horizontal = false }: { data: Count[]; color?: string; horizontal?: boolean }) {
  if (!data.length) return <Empty text="No incidents recorded yet." />
  if (horizontal) {
    const sorted = [...data].sort((a, b) => b.count - a.count)
    return (
      <ResponsiveContainer width="100%" height={Math.max(160, sorted.length * 38 + 20)}>
        <BarChart data={sorted} layout="vertical" margin={{ top: 0, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid horizontal={false} stroke="#eef2f7" />
          <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
          <YAxis type="category" dataKey="name" width={140} tickLine={false} axisLine={false} tick={{ fill: '#475569', fontSize: 12 }} />
          <Tooltip cursor={{ fill: 'rgba(37,99,235,0.06)' }} contentStyle={tooltipStyle} />
          <Bar dataKey="count" name="Incidents" fill={color} radius={[0, 6, 6, 0]} maxBarSize={22} />
        </BarChart>
      </ResponsiveContainer>
    )
  }
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="#eef2f7" />
        <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} interval={0} />
        <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
        <Tooltip cursor={{ fill: 'rgba(37,99,235,0.06)' }} contentStyle={tooltipStyle} />
        <Bar dataKey="count" name="Incidents" fill={color} radius={[6, 6, 0, 0]} maxBarSize={48} />
      </BarChart>
    </ResponsiveContainer>
  )
}

const sum = (data: Count[], names: string[]) => data.filter((s) => names.includes(s.name)).reduce((n, s) => n + s.count, 0)
const fmtDate = (d: string) => new Date(d).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })
const startOfToday = () => new Date(new Date().toDateString())

export function Dashboard() {
  const { user } = useAuth()
  const [data, setData] = useState<DashboardData>()
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/dashboard')
      .then((r) => r.json())
      .then((r) => {
        if (!r.success) throw Error('Unable to load the dashboard. Refresh the page to try again.')
        setData(r.data)
      })
      .catch((e) => setError(e.message))
  }, [])

  const role = user?.role || ''
  const st = data?.statuses || []
  const total = st.reduce((n, s) => n + s.count, 0)
  const overdue = data?.followUps.filter((f) => f.status === 'OVERDUE' || new Date(f.dueDate) < startOfToday()) || []
  const upcoming = data?.followUps.filter((f) => !overdue.includes(f)) || []

  let stats: Stat[] = []
  if (data && role === 'PRINCIPAL') {
    stats = [
      { label: 'Total reported incidents', value: total, icon: FolderOpen, tone: 'bg-blue-50 text-blue-600', hint: 'All cases in the school', href: '/cases' },
      { label: 'Pending reviews', value: sum(st, ['SUBMITTED', 'REOPENED']), icon: FileSearch, tone: 'bg-sky-50 text-sky-600', hint: 'Waiting for your review', href: '/cases?status=SUBMITTED' },
      { label: 'Under review / investigation', value: sum(st, ['UNDER_REVIEW', 'CLARIFICATION_REQUIRED', 'ASSIGNED']), icon: ClipboardCheck, tone: 'bg-amber-50 text-amber-600', hint: 'Including clarification & assigned' },
      { label: 'Actions pending', value: sum(st, ['ACTION_PENDING']), icon: Gavel, tone: 'bg-orange-50 text-orange-600', hint: 'Approved, action not recorded', href: '/cases?status=ACTION_PENDING' },
      { label: 'Follow-ups due', value: data.followUps.length, icon: CalendarClock, tone: overdue.length ? 'bg-rose-50 text-rose-600' : 'bg-violet-50 text-violet-600', hint: overdue.length ? `${overdue.length} overdue` : 'None overdue' },
      { label: 'Closed cases', value: sum(st, ['CLOSED', 'REJECTED']), icon: CheckCircle2, tone: 'bg-slate-100 text-slate-600', hint: 'Closed or rejected', href: '/cases?status=CLOSED' },
    ]
  } else if (data && role === 'TEACHER') {
    stats = [
      { label: 'Submitted reports', value: total, icon: FolderOpen, tone: 'bg-blue-50 text-blue-600', hint: 'All reports you submitted', href: '/cases' },
      { label: 'Awaiting review', value: sum(st, ['SUBMITTED', 'UNDER_REVIEW', 'REOPENED']), icon: FileSearch, tone: 'bg-sky-50 text-sky-600', hint: 'Not yet decided' },
      { label: 'Requiring clarification', value: sum(st, ['CLARIFICATION_REQUIRED']), icon: MessageSquareWarning, tone: sum(st, ['CLARIFICATION_REQUIRED']) ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-500', hint: 'Please respond', href: '/cases?status=CLARIFICATION_REQUIRED' },
      { label: 'Processed & closed', value: sum(st, ['ASSIGNED', 'ACTION_PENDING', 'FOLLOW_UP_PENDING', 'CLOSED', 'REJECTED']), icon: CheckCircle2, tone: 'bg-emerald-50 text-emerald-600', hint: `${sum(st, ['CLOSED', 'REJECTED'])} closed` },
    ]
  } else if (data && role === 'COUNSELLOR') {
    stats = [
      { label: 'Assigned cases', value: total, icon: FolderOpen, tone: 'bg-blue-50 text-blue-600', hint: `${total - sum(st, ['CLOSED', 'REJECTED'])} still open`, href: '/cases' },
      { label: 'Upcoming follow-ups', value: upcoming.length, icon: CalendarClock, tone: 'bg-sky-50 text-sky-600', hint: 'Scheduled and on time' },
      { label: 'Overdue follow-ups', value: overdue.length, icon: AlertTriangle, tone: overdue.length ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-500', hint: overdue.length ? 'Needs attention' : 'All on schedule' },
      { label: 'Intervention records', value: data.interventions, icon: HeartHandshake, tone: 'bg-violet-50 text-violet-600', hint: 'Sessions documented' },
      { label: 'Completed follow-ups', value: data.completedFollowUps, icon: CheckCircle2, tone: 'bg-emerald-50 text-emerald-600', hint: `${data.completedFollowUps + data.followUps.length ? Math.round((data.completedFollowUps / (data.completedFollowUps + data.followUps.length)) * 100) : 0}% completion` },
    ]
  }

  const statusRows = [...st].sort((a, b) => b.count - a.count)
  const intro: Record<string, string> = {
    TEACHER: 'Track the incidents you reported and respond to clarification requests.',
    COUNSELLOR: 'Your assigned cases, counselling interventions and follow-ups.',
    PRINCIPAL: 'School-wide overview of reported incidents, decisions and staff access.',
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-blue-600 to-blue-500 px-6 py-7 text-white shadow-[var(--shadow-lift)] sm:px-8">
          <div aria-hidden className="absolute inset-0 bg-grid-light [mask-image:linear-gradient(to_left,black,transparent_70%)]" />
          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-100">{roleLabels[role] || role} workspace</p>
              <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">{roleLabels[role] || 'My'} Dashboard</h1>
              <p className="mt-1.5 max-w-xl text-sm text-blue-100">{intro[role]}</p>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {['TEACHER', 'PRINCIPAL'].includes(role) && (
                <Link href="/cases/new" className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-blue-700 shadow-sm transition hover:bg-blue-50">
                  <Plus className="h-4 w-4" /> Submit incident
                </Link>
              )}
              <Link href="/cases" className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20">
                All cases <ArrowRight className="h-4 w-4" />
              </Link>
              {role === 'PRINCIPAL' && (
                <Link href="/export" className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20">
                  <FileDown className="h-4 w-4" /> Export reports
                </Link>
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
          <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-6">
            {[0, 1, 2, 3, 4, 5].map((i) => <div key={i} className="h-28 animate-pulse rounded-2xl bg-slate-200/60" />)}
          </div>
        )}

        {data && (
          <>
            <div className={`grid grid-cols-2 gap-3 sm:gap-4 ${stats.length === 6 ? 'md:grid-cols-3 xl:grid-cols-6' : stats.length === 5 ? 'md:grid-cols-3 xl:grid-cols-5' : 'xl:grid-cols-4'}`}>
              {stats.map((s) => <StatCard key={s.label} {...s} />)}
            </div>

            {role === 'PRINCIPAL' && (
              <>
                <div className="grid gap-6 lg:grid-cols-2">
                  <Panel title="Incident trend" subtitle="Incidents by month, last 6 months">
                    <ResponsiveContainer width="100%" height={240}>
                      <AreaChart data={data.trend} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#2563eb" stopOpacity={0.25} />
                            <stop offset="100%" stopColor="#2563eb" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid vertical={false} stroke="#eef2f7" />
                        <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                        <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                        <Tooltip contentStyle={tooltipStyle} />
                        <Area type="monotone" dataKey="count" name="Incidents" stroke="#2563eb" strokeWidth={2.5} fill="url(#trendFill)" dot={{ r: 3, fill: '#2563eb' }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </Panel>
                  <Panel title="By category" subtitle="All incidents by category">
                    <CountBars data={data.categories} horizontal />
                  </Panel>
                  <Panel title="By class" subtitle="Incidents in the last 6 months by class">
                    <CountBars data={data.classes} color="#0ea5e9" />
                  </Panel>
                  <Panel title="By status" subtitle="Where every case currently stands">
                    <StatusList rows={statusRows} total={total} />
                  </Panel>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                  <RecentCases cases={data.cases} className="lg:col-span-2" />
                  <Panel
                    title="Pending staff approvals"
                    subtitle={`${data.approvals} account${data.approvals === 1 ? '' : 's'} waiting`}
                    action={<Link href="/users" className="text-sm font-semibold text-blue-700 hover:text-blue-800">Manage</Link>}
                  >
                    {data.pendingStaff.length ? (
                      <ul className="divide-y divide-slate-100">
                        {data.pendingStaff.map((u) => (
                          <li key={u.id}>
                            <Link href={`/users/${u.id}`} className="flex items-center justify-between gap-3 py-3 hover:text-blue-700">
                              <span className="flex items-center gap-3">
                                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-50 text-amber-600"><UserCheck className="h-4 w-4" /></span>
                                <span>
                                  <span className="block text-sm font-semibold text-slate-900">{u.name}</span>
                                  <span className="block text-xs text-slate-500">{roleLabels[u.role] || u.role} · requested {fmtDate(u.createdAt)}</span>
                                </span>
                              </span>
                              <ArrowRight className="h-4 w-4 text-slate-300" />
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="flex flex-col items-center py-8 text-center text-sm text-slate-500">
                        <Users className="mb-2 h-8 w-8 text-slate-300" /> No accounts are waiting for approval.
                      </div>
                    )}
                  </Panel>
                </div>
              </>
            )}

            {role === 'TEACHER' && (
              <div className="grid gap-6 lg:grid-cols-3">
                <RecentCases cases={data.cases} className="lg:col-span-2" title="My reports" subtitle="Your latest reports and their current status" />
                <Panel title="Status of my reports">
                  <StatusList rows={statusRows} total={total} />
                </Panel>
              </div>
            )}

            {role === 'COUNSELLOR' && (
              <div className="grid gap-6 lg:grid-cols-3">
                <Panel title="Follow-ups" subtitle="Overdue first, then upcoming" className="lg:col-span-2">
                  {data.followUps.length ? (
                    <ul className="divide-y divide-slate-100">
                      {[...overdue, ...upcoming].map((f) => {
                        const late = overdue.includes(f)
                        return (
                          <li key={f.id}>
                            <Link href={`/cases/${f.caseId}`} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-slate-900">{f.case.student.name}</p>
                                <p className="truncate text-xs text-slate-500">{f.nextStep || 'Follow-up'} · <span className="font-mono">{f.case.referenceNumber}</span></p>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className={`text-xs tabular-nums ${late ? 'font-semibold text-rose-600' : 'text-slate-500'}`}>Due {fmtDate(f.dueDate)}</span>
                                <StatusBadge status={late ? 'OVERDUE' : 'PENDING'} />
                              </div>
                            </Link>
                          </li>
                        )
                      })}
                    </ul>
                  ) : (
                    <div className="flex flex-col items-center py-10 text-center text-sm text-slate-500">
                      <CalendarClock className="mb-2 h-8 w-8 text-slate-300" /> No open follow-ups.
                    </div>
                  )}
                </Panel>
                <Panel title="Case status">
                  <StatusList rows={statusRows} total={total} />
                </Panel>
                <RecentCases cases={data.cases} className="lg:col-span-3" title="Assigned cases" subtitle="Cases assigned to you" />
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  )
}

function StatusList({ rows, total }: { rows: Count[]; total: number }) {
  if (!rows.length) return <p className="text-sm text-slate-500">No cases yet.</p>
  return (
    <ul className="space-y-4">
      {rows.map((s) => (
        <li key={s.name}>
          <div className="mb-1.5 flex items-center justify-between text-sm">
            <span className="font-medium text-slate-700">{statusLabel(s.name)}</span>
            <span className="tabular-nums text-slate-500">{s.count}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div className={`h-full rounded-full ${STATUS_BAR[s.name] || 'bg-slate-400'}`} style={{ width: `${total ? Math.max(6, (s.count / total) * 100) : 0}%` }} />
          </div>
        </li>
      ))}
    </ul>
  )
}

function RecentCases({ cases, className = '', title = 'Recent case activity', subtitle = 'Latest reports in your scope' }: { cases: DashboardData['cases']; className?: string; title?: string; subtitle?: string }) {
  return (
    <section className={`overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[var(--shadow-soft)] ${className}`}>
      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
        <div>
          <h2 className="text-base font-semibold text-slate-900">{title}</h2>
          <p className="text-sm text-slate-500">{subtitle}</p>
        </div>
        <Link href="/cases" className="inline-flex items-center gap-1 text-sm font-semibold text-blue-700 hover:text-blue-800">
          View all <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
      {cases.length ? (
        <ul className="divide-y divide-slate-100">
          {cases.map((c) => (
            <li key={c.id}>
              <Link href={'/cases/' + c.id} className="group flex flex-col gap-2 px-6 py-3.5 transition-colors hover:bg-slate-50 sm:flex-row sm:items-center sm:gap-4">
                <div className="flex min-w-0 flex-1 items-center gap-3.5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-semibold text-blue-700">
                    {c.student.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">{c.student.name}</p>
                    <p className="truncate text-xs text-slate-500">{c.category} · <span className="font-mono">{c.referenceNumber}</span></p>
                  </div>
                </div>
                <div className="flex items-center gap-4 pl-12 sm:pl-0">
                  <span className="text-xs tabular-nums text-slate-500">{new Date(c.incidentDate).toLocaleDateString()}</span>
                  <StatusBadge status={c.status} />
                  <ArrowRight className="hidden h-4 w-4 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-slate-500 sm:block" />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
          <Inbox className="mb-3 h-10 w-10 text-slate-300" />
          <p className="text-sm font-medium text-slate-700">No cases yet.</p>
          <p className="text-sm text-slate-500">New reports will appear here.</p>
        </div>
      )}
    </section>
  )
}
