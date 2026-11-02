'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { useEffect } from 'react'

export default function PendingApprovalPage() {
  const router = useRouter()
  const { user, logout } = useAuth()

  useEffect(() => {
    // If user is not pending, redirect them
    if (user && user.accountStatus !== 'PENDING') {
      router.push('/')
    }
  }, [user, router])

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-white to-blue-100 px-4">
      <Card className="relative w-full max-w-md rounded-3xl border-slate-200 p-2 shadow-[var(--shadow-lift)] animate-scale-in">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 ring-1 ring-blue-600/15">
            <Clock className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">Account Pending Approval</CardTitle>
          <CardDescription>
            Your account is awaiting administrator approval
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-600 text-center">
            Your account has been created but requires approval from a Principal or Administrator before you can access the system.
          </p>
          <p className="text-sm text-slate-600 text-center">
            You will be notified once your account has been approved. Please check back later or contact your administrator if you need immediate access.
          </p>
          <div className="flex justify-center">
            <Button variant="outline" onClick={handleLogout}>
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
