'use client'

import { useAuth } from '@/hooks/use-auth'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Sidebar } from './sidebar'
import { Header } from './header'

export function FullPageLoader() {
  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 rounded-full border-4 border-emerald-100" />
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-emerald-500" />
        </div>
        <p className="text-sm font-medium text-slate-500">Loading…</p>
      </div>
    </div>
  )
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAuthenticated } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isLoading, isAuthenticated, router])

  useEffect(() => {
    if (!isLoading && isAuthenticated && user?.accountStatus === 'PENDING') {
      router.push('/pending-approval')
    }
  }, [isLoading, isAuthenticated, user, router])

  useEffect(() => setMobileOpen(false), [pathname])

  if (isLoading) return <FullPageLoader />
  if (!isAuthenticated) return null

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop navigation */}
      <div className="hidden lg:flex">
        <Sidebar />
      </div>

      {/* Mobile navigation drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-ink-950/60 backdrop-blur-sm animate-fade-in" onClick={() => setMobileOpen(false)} />
          <div className="relative h-full w-72 max-w-[85vw] animate-slide-up shadow-2xl">
            <Sidebar onNavigate={() => setMobileOpen(false)} onClose={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header onMenu={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-7xl px-4 py-6 animate-fade-in sm:px-6 lg:px-8 lg:py-8">{children}</div>
        </main>
      </div>
    </div>
  )
}
