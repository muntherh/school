'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { BrandMark } from '@/components/layout/sidebar'
import { Shield, Lock, Mail, FileCheck2, HeartHandshake, ScrollText, AlertCircle } from 'lucide-react'

const features = [
  { icon: FileCheck2, title: 'Structured incident reporting', text: 'Teachers submit complete, consistent reports in minutes.' },
  { icon: HeartHandshake, title: 'Counselling & follow-up', text: 'Assigned counsellors record interventions and track progress.' },
  { icon: ScrollText, title: 'Full audit trail', text: 'Every decision is recorded and access is strictly role-based.' },
]

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await login(email, password)
      router.push('/')
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.')
    } finally {
      setIsLoading(false)
    }
  }

  const fieldClass =
    'h-12 w-full rounded-xl border border-input bg-white pl-11 pr-4 text-sm text-slate-900 shadow-[0_1px_2px_rgb(15_23_42/0.04)] placeholder:text-slate-400 transition-all duration-200 hover:border-slate-300 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/15'

  return (
    <div className="flex min-h-screen bg-white">
      {/* Brand panel */}
      <section className="relative hidden flex-1 flex-col justify-between overflow-hidden bg-gradient-to-br from-blue-700 via-blue-600 to-blue-500 p-12 text-white lg:flex xl:p-16">
        <div aria-hidden className="absolute inset-0 bg-grid-light [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
        <div className="relative flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-blue-600 shadow-lg">
            <Shield className="h-5 w-5" strokeWidth={2.25} />
          </div>
          <div className="leading-tight">
            <p className="text-[15px] font-bold tracking-tight">SDMS</p>
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-blue-100">School Discipline</p>
          </div>
        </div>

        <div className="relative max-w-xl animate-slide-up">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-blue-100">School Disciplinary Management System</p>
          <h2 className="mt-4 text-4xl font-bold leading-tight tracking-tight xl:text-5xl">
            Fair, transparent student conduct management.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-blue-100">
            One secure place for reporting incidents, principal decisions, counselling and follow-ups.
          </p>
          <ul className="mt-10 space-y-5">
            {features.map((f) => (
              <li key={f.title} className="flex gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/25">
                  <f.icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-semibold">{f.title}</p>
                  <p className="text-sm text-blue-100">{f.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-blue-200">© {new Date().getFullYear()} School Disciplinary Management System</p>
      </section>

      {/* Form panel */}
      <section className="flex w-full items-center justify-center bg-white px-4 py-12 lg:w-[34rem] lg:px-12">
        <div className="w-full max-w-sm animate-fade-in">
          <div className="mb-8 flex justify-center lg:hidden">
            <BrandMark className="h-14 w-14" />
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Welcome Back</h1>
          <p className="mt-2 text-sm text-slate-500">Sign in to the School Disciplinary Management System</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                Email Address
              </Label>
              <div className="relative">
                <Mail aria-hidden className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  placeholder="your.email@school.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className={fieldClass}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-slate-700">
                Password
              </Label>
              <div className="relative">
                <Lock aria-hidden className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className={fieldClass}
                />
              </div>
            </div>

            {error && (
              <div role="alert" className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 animate-slide-up">
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button type="submit" size="lg" className="h-12 w-full" isLoading={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-8 flex items-center justify-center gap-2 border-t border-slate-100 pt-6 text-xs text-slate-500">
            <Shield className="h-3.5 w-3.5" />
            <span>Secure login powered by your school network</span>
          </div>
          <p className="mt-3 text-center text-xs text-slate-500">
            Need account access?{' '}
            <a
              href={`mailto:${process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'admin@school.edu'}`}
              className="font-medium text-blue-700 transition-colors hover:text-blue-800 hover:underline"
            >
              Contact your administrator
            </a>
          </p>
        </div>
      </section>
    </div>
  )
}
