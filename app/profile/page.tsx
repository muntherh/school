'use client'
import { useAuth } from '@/hooks/use-auth'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { initials, roleLabels } from '@/components/layout/sidebar'
import { StatusBadge } from '@/components/status-badge'
import { Info, Mail, ShieldCheck, UserRound } from 'lucide-react'

export default function Profile() {
  const { user } = useAuth()
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="page-title">My profile</h1>
          <p className="mt-1 text-sm text-slate-500">Your account details in the School Disciplinary Management System</p>
        </div>

        <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[var(--shadow-soft)]">
          <div className="relative h-28 overflow-hidden bg-gradient-to-br from-navy-900 via-navy-800 to-blue-700">
            <div aria-hidden className="absolute inset-0 bg-grid-light" />
          </div>
          <div className="px-6 pb-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-4">
                <div className="relative -mt-10 flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-2xl font-bold text-blue-700 shadow-lg ring-4 ring-white">
                  {initials(user?.name)}
                </div>
                <div className="pt-3">
                  <p className="text-xl font-bold tracking-tight text-slate-900">{user?.name}</p>
                  <p className="text-sm text-slate-500">{user ? roleLabels[user.role] || user.role : ''}</p>
                </div>
              </div>
              {user && <StatusBadge status={user.accountStatus} className="mt-4 self-start px-3 py-1 text-sm" />}
            </div>

            <dl className="mt-8 grid gap-3 sm:grid-cols-3">
              {[
                { icon: UserRound, label: 'Full name', value: user?.name },
                { icon: Mail, label: 'Email', value: user?.email },
                { icon: ShieldCheck, label: 'Role', value: user ? roleLabels[user.role] || user.role : '' },
              ].map((f) => (
                <div key={f.label} className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-slate-500 shadow-sm ring-1 ring-slate-200/70">
                    <f.icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <dt className="text-xs font-medium uppercase tracking-wider text-slate-400">{f.label}</dt>
                    <dd className="mt-0.5 break-words text-sm font-semibold text-slate-900">{f.value}</dd>
                  </div>
                </div>
              ))}
            </dl>

            <p className="mt-6 flex items-center gap-2 rounded-xl bg-sky-50 px-4 py-3 text-sm text-sky-800">
              <Info className="h-4 w-4 shrink-0" />
              Contact the principal to update your account details.
            </p>
          </div>
        </section>
      </div>
    </DashboardLayout>
  )
}
