'use client'

import { useAuth } from '@/hooks/use-auth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Sidebar } from './sidebar'
import { Header } from './header'
import { Skeleton } from '@/components/ui/skeleton'

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAuthenticated } = useAuth()
  const router = useRouter()

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

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="flex h-screen flex-col">
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto bg-slate-50 p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
