'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'

export default function UnauthorizedPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-white to-blue-100 px-4">
      <Card className="relative w-full max-w-md rounded-3xl border-slate-200 p-2 shadow-[var(--shadow-lift)] animate-scale-in">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 ring-1 ring-blue-600/15">
            <AlertCircle className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">Access Denied</CardTitle>
          <CardDescription>
            You don't have permission to access this resource.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-600 text-center">
            If you believe this is an error, please contact your system administrator.
          </p>
          <div className="flex justify-center">
            <Button onClick={() => window.history.back()}>Go Back</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
