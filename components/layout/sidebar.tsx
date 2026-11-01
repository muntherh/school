'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth'
import {
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  LogOut,
  Shield,
  ClipboardList,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const navigation = [
  { name: 'Reports', href: '/export', icon: FileText, roles: ['PRINCIPAL'] },
  { name: 'Profile', href: '/profile', icon: Users, roles: ['PRINCIPAL','TEACHER','COUNSELLOR','ADMIN'] },
  { name: 'Dashboard', href: '/', icon: LayoutDashboard, roles: ['PRINCIPAL', 'TEACHER', 'COUNSELLOR', 'ADMIN'] },
  { name: 'Cases', href: '/cases', icon: FileText, roles: ['PRINCIPAL', 'TEACHER', 'COUNSELLOR'] },
  { name: 'Students', href: '/students', icon: Users, roles: ['PRINCIPAL', 'TEACHER', 'COUNSELLOR'] },
  { name: 'Staff', href: '/users', icon: Shield, roles: ['PRINCIPAL', 'ADMIN'] },
  { name: 'Audit Log', href: '/audit-log', icon: ClipboardList, roles: ['PRINCIPAL', 'ADMIN'] },
  { name: 'Settings', href: '/settings', icon: Settings, roles: ['PRINCIPAL', 'ADMIN'] },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()

  const filteredNavigation = navigation.filter((item) =>
    user?.role ? item.roles.includes(user.role) : false
  )

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  return (
    <div className="flex h-full w-48 md:w-64 flex-col bg-white border-r border-slate-200">
      <div className="flex h-16 items-center border-b border-slate-200 px-6">
        <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">SDMS</h1>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {filteredNavigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
              )}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>
      <div className="border-t border-slate-200 p-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900"
        >
          <LogOut className="mr-3 h-5 w-5" />
          Sign Out
        </button>
      </div>
    </div>
  )
}
