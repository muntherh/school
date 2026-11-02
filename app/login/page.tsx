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
    'h-12 w-full rounded-xl border border-white/10 bg-white/[0.04] pl-11 pr-4 text-sm text-white placeholder:text-slate-500 transition-all duration-200 hover:border-white/20 focus:border-emerald-400/70 focus:bg-white/[0.06] focus:outline-none focus:ring-4 focus:ring-emerald-500/15'

  return (
    <div className="relative flex min-h-screen overflow-hidden bg-ink-950 text-white">
      {/* Ambient background */}
      <div aria-hidden className="absolute inset-0 bg-grid-ink [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
      <div aria-hidden className="absolute -left-40 -top-40 h-[32rem] w-[32rem] rounded-full bg-emerald-500/20 blur-[120px]" />
      <div aria-hidden className="absolute -bottom-40 right-0 h-[28rem] w-[28rem] rounded-full bg-gold-500/10 blur-[120px]" />

      {/* Brand panel */}
      <section className="relative hidden flex-1 flex-col justify-between p-12 lg:flex xl:p-16">
        <div className="flex items-center gap-3">
          <BrandMark />
          <div className="leading-tight">
            <p className="text-[15px] font-semibold tracking-tight">SDMS</p>
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500">Student Conduct</p>
          </div>
        </div>

        <div className="max-w-xl animate-slide-up">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-emerald-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> School Disciplinary Management System
          </p>
          <h2 className="mt-6 text-5xl font-bold leading-[1.1] tracking-tight">
            Fair, transparent <br />
            <span className="text-gradient-brand">student conduct</span> management.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-slate-400">
            One secure place for reporting incidents, principal decisions, counselling and follow-ups.
          </p>
          <ul className="mt-10 space-y-5">
            {features.map((f) => (
              <li key={f.title} className="flex gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-emerald-300">
                  <f.icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-semibold text-white">{f.title}</p>
                  <p className="text-sm text-slate-400">{f.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-slate-600">© {new Date().getFullYear()} School Disciplinary Management System</p>
      </section>

      {/* Form panel */}
      <section className="relative flex w-full items-center justify-center px-4 py-12 lg:w-[34rem] lg:border-l lg:border-white/[0.06] lg:bg-white/[0.015] lg:px-12">
        <div className="w-full max-w-sm animate-fade-in">
          <div className="mb-8 flex justify-center lg:hidden">
            <BrandMark className="h-14 w-14" />
          </div>

          <h1 className="text-3xl font-bold tracking-tight">Welcome Back</h1>
          <p className="mt-2 text-sm text-slate-400">Sign in to the School Disciplinary Management System</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-slate-300">
                Email Address
              </Label>
              <div className="relative">
                <Mail aria-hidden className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
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
              <Label htmlFor="password" className="text-sm font-medium text-slate-300">
                Password
              </Label>
              <div className="relative">
                <Lock aria-hidden className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
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
              <div role="alert" className="flex items-start gap-2 rounded-xl border border-red-500/25 bg-red-500/10 p-3 text-sm text-red-300 animate-slide-up">
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button type="submit" size="lg" className="h-12 w-full" isLoading={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-8 flex items-center justify-center gap-2 border-t border-white/[0.06] pt-6 text-xs text-slate-500">
            <Shield className="h-3.5 w-3.5" />
            <span>Secure login powered by your school network</span>
          </div>
          <p className="mt-3 text-center text-xs text-slate-500">
            Need account access?{' '}
            <a
              href={`mailto:${process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'admin@school.edu'}`}
              className="font-medium text-emerald-400 transition-colors hover:text-emerald-300 hover:underline"
            >
              Contact your administrator
            </a>
          </p>
        </div>
      </section>
    </div>
  )
}
