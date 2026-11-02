'use client'

import { useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useRouter } from 'next/navigation'
import { FullPageLoader } from '@/components/layout/dashboard-layout'

export default function HomePage() {
  const { user, isLoading, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login')
      } else if (user?.accountStatus === 'PENDING') {
        router.push('/pending-approval')
      } else if (user?.accountStatus === 'DEACTIVATED') {
        router.push('/unauthorized')
      } else if (user?.accountStatus === 'REJECTED') {
        router.push('/unauthorized')
      } else if (user?.role === 'PRINCIPAL') {
        router.push('/dashboard/principal')
      } else if (user?.role === 'TEACHER') {
        router.push('/dashboard/teacher')
      } else if (user?.role === 'COUNSELLOR') {
        router.push('/dashboard/counsellor')
      } else if (user?.role === 'ADMIN') {
        router.push('/users')
      }
    }
  }, [isLoading, isAuthenticated, user, router])

  if (isLoading) return <FullPageLoader />

  return null
}
