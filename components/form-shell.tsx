'use client'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const textareaClass =
  'flex min-h-[120px] w-full rounded-xl border border-input bg-white px-4 py-3 text-sm text-slate-900 shadow-[0_1px_2px_rgb(15_23_42/0.04)] transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15 focus:outline-none'

/** Shared page frame for the case workflow forms: back link, heading and a card. */
export function FormShell({
  backHref,
  title,
  subtitle,
  cardTitle,
  cardDescription = 'Fields marked * are required.',
  children,
}: {
  backHref: string
  title: string
  subtitle: string
  cardTitle: string
  cardDescription?: string
  children: React.ReactNode
}) {
  const router = useRouter()
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push(backHref)}>
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="page-title">{title}</h1>
            <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>{cardTitle}</CardTitle>
            <CardDescription>{cardDescription}</CardDescription>
          </CardHeader>
          <CardContent>{children}</CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

export function FormError({ message }: { message: string }) {
  if (!message) return null
  return (
    <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
      {message}
    </div>
  )
}
