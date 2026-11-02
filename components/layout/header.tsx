'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { CalendarDays, ChevronDown, LogOut, Menu, UserRound } from 'lucide-react'
import { initials, roleLabels } from './sidebar'

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

export function Header({ onMenu }: { onMenu?: () => void }) {
  const router = useRouter()
  const { user, logout } = useAuth()
  const today = new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-4 border-b border-slate-200 bg-white/90 px-4 backdrop-blur-xl supports-[backdrop-filter]:bg-white/80 sm:px-6 lg:px-8">
      <button
        onClick={onMenu}
        aria-label="Open navigation"
        className="-ml-1 rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-900">
          {greeting()}, {user?.name?.split(' ').slice(0, 2).join(' ') || 'there'}
        </p>
        <p className="hidden items-center gap-1.5 text-xs text-slate-500 sm:flex">
          <CalendarDays className="h-3.5 w-3.5" />
          {today}
        </p>
      </div>

      {user && (
        <span className="hidden rounded-full border border-blue-200/70 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 md:inline-flex">
          {roleLabels[user.role] || user.role}
        </span>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 rounded-full border border-slate-200 bg-white py-1 pl-1 pr-2.5 shadow-sm transition-colors hover:bg-slate-50" aria-label="Account menu">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
              {initials(user?.name)}
            </span>
            <ChevronDown className="h-4 w-4 text-slate-400" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-60 rounded-xl p-1.5">
          <DropdownMenuLabel className="px-2.5 py-2">
            <p className="text-sm font-semibold text-slate-900">{user?.name}</p>
            <p className="mt-0.5 truncate text-xs font-normal text-slate-500">{user?.email}</p>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => router.push('/profile')} className="rounded-lg px-2.5 py-2">
            <UserRound className="mr-2 h-4 w-4" />
            My profile
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleLogout} className="rounded-lg px-2.5 py-2 text-red-600 focus:bg-red-50 focus:text-red-700">
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
