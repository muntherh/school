'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth'
import {
  LayoutDashboard,
  FolderOpen,
  GraduationCap,
  Users,
  Settings,
  LogOut,
  ShieldCheck,
  ScrollText,
  FileDown,
  UserRound,
  X,
} from 'lucide-react'

type NavItem = {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  roles: string[]
  match?: (path: string) => boolean
}

const ALL = ['PRINCIPAL', 'TEACHER', 'COUNSELLOR', 'ADMIN']

const sections: { title: string; items: NavItem[] }[] = [
  {
    title: 'Workspace',
    items: [
      { name: 'Dashboard', href: '/', icon: LayoutDashboard, roles: ALL, match: (p) => p === '/' || p.startsWith('/dashboard') },
      { name: 'Cases', href: '/cases', icon: FolderOpen, roles: ['PRINCIPAL', 'TEACHER', 'COUNSELLOR'] },
      { name: 'Students', href: '/students', icon: GraduationCap, roles: ['PRINCIPAL', 'TEACHER', 'COUNSELLOR'] },
      { name: 'Reports', href: '/export', icon: FileDown, roles: ['PRINCIPAL'] },
    ],
  },
  {
    title: 'Administration',
    items: [
      { name: 'Staff', href: '/users', icon: Users, roles: ['PRINCIPAL', 'ADMIN'] },
      { name: 'Audit Log', href: '/audit-log', icon: ScrollText, roles: ['PRINCIPAL', 'ADMIN'] },
      { name: 'Settings', href: '/settings', icon: Settings, roles: ['PRINCIPAL', 'ADMIN'] },
    ],
  },
  {
    title: 'Account',
    items: [{ name: 'My Profile', href: '/profile', icon: UserRound, roles: ALL }],
  },
]

export const roleLabels: Record<string, string> = {
  PRINCIPAL: 'Principal',
  TEACHER: 'Teacher',
  COUNSELLOR: 'Counsellor',
  ADMIN: 'Technical Admin',
}

export function initials(name?: string) {
  if (!name) return 'U'
  return name
    .replace(/^(dr|mr|mrs|ms)\.?\s+/i, '')
    .split(/\s+/)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function BrandMark({ className }: { className?: string }) {
  return (
    <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-[0_6px_16px_-6px_rgb(37_99_235/0.6)]', className)}>
      <ShieldCheck className="h-5 w-5 text-white" strokeWidth={2.25} />
    </div>
  )
}

export function Sidebar({ onNavigate, onClose }: { onNavigate?: () => void; onClose?: () => void }) {
  const pathname = usePathname() || '/'
  const router = useRouter()
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  return (
    <aside className="relative flex h-full w-72 flex-col overflow-hidden border-r border-slate-200 bg-white text-slate-600">

      <div className="relative flex h-20 items-center gap-3 px-6">
        <BrandMark />
        <div className="leading-tight">
          <p className="text-[15px] font-bold tracking-tight text-slate-900">SDMS</p>
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">School Discipline</p>
        </div>
        {onClose && (
          <button onClick={onClose} aria-label="Close navigation" className="ml-auto rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <nav className="relative flex-1 space-y-7 overflow-y-auto px-4 py-4" aria-label="Main navigation">
        {sections.map((section) => {
          const items = section.items.filter((item) => (user?.role ? item.roles.includes(user.role) : false))
          if (!items.length) return null
          return (
            <div key={section.title}>
              <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">{section.title}</p>
              <ul className="space-y-1">
                {items.map((item) => {
                  const isActive = item.match ? item.match(pathname) : pathname === item.href || pathname.startsWith(item.href + '/')
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        onClick={onNavigate}
                        aria-current={isActive ? 'page' : undefined}
                        className={cn(
                          'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                          isActive
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        )}
                      >
                        {isActive && <span aria-hidden className="absolute -left-4 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-blue-600" />}
                        <item.icon className={cn('h-[18px] w-[18px] transition-colors', isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600')} />
                        {item.name}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          )
        })}
      </nav>

      <div className="relative m-4 rounded-2xl border border-slate-200 bg-slate-50 p-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
            {initials(user?.name)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-900">{user?.name}</p>
            <p className="truncate text-xs text-slate-500">{user ? roleLabels[user.role] || user.role : ''}</p>
          </div>
          <button
            onClick={handleLogout}
            aria-label="Sign Out"
            title="Sign out"
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white hover:text-red-600"
          >
            <LogOut className="h-[18px] w-[18px]" />
          </button>
        </div>
      </div>
    </aside>
  )
}
