'use client'
import { CaseHistory } from '@/components/case-history'
import { CompleteFollowUp } from '@/components/complete-follow-up'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/status-badge'
import { Select } from '@/components/ui/select'
import { api } from '@/lib/api-client'
import { useAuth } from '@/hooks/use-auth'
import { ArrowLeft, Clock, FileText, AlertCircle, MessageSquare, UserPlus, Gavel, HeartHandshake, CalendarDays, MapPin, Users, UserRound, GraduationCap, RotateCcw, ClipboardCheck, Lock } from 'lucide-react'

function Detail({ icon: Icon, label, children }: { icon: React.ComponentType<{ className?: string }>; label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-4">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-slate-500 shadow-sm ring-1 ring-slate-200/70">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wider text-slate-400">{label}</p>
        <div className="mt-0.5 text-sm font-semibold text-slate-900">{children}</div>
      </div>
    </div>
  )
}

function RecordSection({ icon: Icon, title, description, count, children }: { icon: React.ComponentType<{ className?: string }>; title: string; description: string; count: number; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="flex-row items-center gap-3 space-y-0 border-b border-slate-100 pb-5">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
          <Icon className="h-5 w-5" />
        </span>
        <div className="flex-1">
          <CardTitle className="text-base">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">{count}</span>
      </CardHeader>
      <CardContent className="divide-y divide-slate-100 p-0">{children}</CardContent>
    </Card>
  )
}

function ActionButton({ onClick, icon: Icon, children, variant = 'outline' }: { onClick: () => void; icon: React.ComponentType<{ className?: string }>; children: React.ReactNode; variant?: 'default' | 'outline' }) {
  return (
    <Button onClick={onClick} variant={variant} className="h-11 w-full justify-start">
      <Icon className="h-4 w-4" />
      {children}
    </Button>
  )
}

export default function CaseDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [caseData, setCaseData] = useState<any>(null)
  const [reviews, setReviews] = useState<any[]>([])
  const [actions, setActions] = useState<any[]>([])
  const [interventions, setInterventions] = useState<any[]>([])
  const [followUps, setFollowUps] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showClarificationForm, setShowClarificationForm] = useState(false)
  const [showAssignForm, setShowAssignForm] = useState(false)
  const [clarificationText, setClarificationText] = useState('')
  const [assignedToId, setAssignedToId] = useState('')
  const [rationale, setRationale] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    loadCaseData()
    loadUsers()
  }, [params.id])

  const loadCaseData = async () => {
    setIsLoading(true)
    try {
      const response = await api.getCase(params.id as string)
      if (response.success && response.data) {
        const record = response.data as any
        setCaseData(record); setReviews(record.reviews || []); setActions(record.actions || [])
        setInterventions(record.interventions || []); setFollowUps(record.followUps || [])
      }
    } catch (error) {
      console.error('Failed to load case data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadUsers = async () => {
    try {
      const response = await api.getAssignableUsers()
      if (response.success && response.data) {
        setUsers(Array.isArray(response.data) ? response.data : [])
      }
    } catch (error) {
      console.error('Failed to load users:', error)
    }
  }

  const handleRequestClarification = async () => {
    setError('')
    try {
      const response = await api.requestClarification(params.id as string, clarificationText)
      if (response.success) {
        setShowClarificationForm(false)
        setClarificationText('')
        loadCaseData()
      } else {
        setError(response.error?.message || 'Failed to request clarification')
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    }
  }

  const handleRespondToClarification = async () => {
    setError('')
    try {
      const response = await api.respondToClarification(params.id as string, clarificationText)
      if (response.success) {
        setShowClarificationForm(false)
        setClarificationText('')
        loadCaseData()
      } else {
        setError(response.error?.message || 'Failed to respond')
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    }
  }

  const handleAssignCase = async () => {
    setError('')
    try {
      const response = await api.assignCase(params.id as string, assignedToId, rationale)
      if (response.success) {
        setShowAssignForm(false)
        setAssignedToId('')
        setRationale('')
        loadCaseData()
      } else {
        setError(response.error?.message || 'Failed to assign case')
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    }
  }

  const canCreateReview = user?.role === 'PRINCIPAL'
  const canCreateIntervention = user?.role === 'PRINCIPAL' || user?.role === 'COUNSELLOR'
  const canCreateAction = user?.role === 'PRINCIPAL'
  const canAssign = user?.role === 'PRINCIPAL'
  const canRequestClarification = user?.role === 'PRINCIPAL'
  const canRespondToClarification = user?.role === 'TEACHER' && caseData?.status === 'CLARIFICATION_REQUIRED'

  const isClosed = caseData?.status === 'CLOSED'
  const textareaClass = 'flex min-h-[110px] w-full rounded-xl border border-input bg-white px-4 py-3 text-sm text-slate-900 shadow-[0_1px_2px_rgb(15_23_42/0.04)] transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15 focus:outline-none'

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="h-36 animate-pulse rounded-3xl bg-slate-200/60" />
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="h-96 animate-pulse rounded-2xl bg-slate-200/60 lg:col-span-2" />
            <div className="h-96 animate-pulse rounded-2xl bg-slate-200/60" />
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!caseData) {
    return (
      <DashboardLayout>
        <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center shadow-[var(--shadow-soft)]">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
            <AlertCircle className="h-7 w-7 text-slate-400" />
          </div>
          <h3 className="mt-4 text-base font-semibold text-slate-900">Case not found</h3>
          <p className="mt-1 text-sm text-slate-500">It may have been removed or you may not have access to it.</p>
          <Button onClick={() => router.push('/cases')} className="mt-6">
            Back to Cases
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  const fmt = (d?: string | null) => (d ? new Date(d).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : '—')

  const hasAnyAction =
    (canRequestClarification && caseData.status !== 'CLARIFICATION_REQUIRED' && !isClosed) ||
    canRespondToClarification ||
    (canAssign && !isClosed && caseData.status !== 'ASSIGNED') ||
    (canCreateReview && !isClosed) ||
    (canCreateIntervention && !isClosed) ||
    (canCreateAction && !isClosed) ||
    (user?.role === 'PRINCIPAL' && isClosed)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <button
          onClick={() => router.push('/cases')}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to cases
        </button>

        {/* Case header */}
        <section className="relative overflow-hidden rounded-3xl bg-ink-950 px-6 py-7 text-white shadow-[var(--shadow-lift)] sm:px-8">
          <div aria-hidden className="absolute inset-0 bg-grid-ink [mask-image:radial-gradient(ellipse_at_top_right,black,transparent_70%)]" />
          <div aria-hidden className="absolute -right-16 -top-24 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl" />
          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">Case file · {caseData.category}</p>
              <h1 className="mt-2 break-all font-mono text-lg font-semibold tracking-tight text-white sm:text-xl">
                {caseData.referenceNumber}
              </h1>
              <p className="mt-2 text-sm text-slate-400">
                Reported by <span className="text-slate-200">{caseData.reporter?.name || '—'}</span> on {fmt(caseData.submittedAt)}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={caseData.status} className="px-3 py-1 text-sm" />
              {caseData.assignedTo && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm font-medium text-slate-200">
                  <UserRound className="h-3.5 w-3.5 text-emerald-300" /> Assigned to {caseData.assignedTo.name}
                </span>
              )}
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main column */}
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Case Information</CardTitle>
                <CardDescription>Incident details as reported</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  {caseData.student && (
                    <Detail icon={GraduationCap} label="Student">
                      {caseData.student.name}
                      <span className="ml-1 font-normal text-slate-500">· {caseData.student.studentId} · {caseData.student.classGrade}</span>
                    </Detail>
                  )}
                  <Detail icon={CalendarDays} label="Incident Date">{fmt(caseData.incidentDate)}</Detail>
                  <Detail icon={Clock} label="Reported On">{fmt(caseData.submittedAt)}</Detail>
                  {caseData.location && <Detail icon={MapPin} label="Location">{caseData.location}</Detail>}
                  {caseData.witnesses && <Detail icon={Users} label="Witnesses">{caseData.witnesses}</Detail>}
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-5">
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Description</p>
                  <p className="mt-2 whitespace-pre-wrap text-[15px] leading-relaxed text-slate-800">{caseData.description}</p>
                </div>
              </CardContent>
            </Card>

            {reviews.length > 0 && (
              <RecordSection icon={ClipboardCheck} title="Reviews" description="Principal reviews and decisions" count={reviews.length}>
                {reviews.map((review) => (
                  <div key={review.id} className="px-6 py-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-slate-900">{review.reviewer?.name}</p>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-500">{fmt(review.reviewDate)}</span>
                        <StatusBadge status={review.result} />
                      </div>
                    </div>
                    {review.notes && <p className="mt-2 text-sm leading-relaxed text-slate-600">{review.notes}</p>}
                    {review.clarificationRequest && (
                      <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
                        <span className="font-semibold">Clarification: </span>{review.clarificationRequest}
                      </p>
                    )}
                  </div>
                ))}
              </RecordSection>
            )}

            {actions.length > 0 && (
              <RecordSection icon={Gavel} title="Disciplinary Actions" description="Actions taken for this case" count={actions.length}>
                {actions.map((action) => (
                  <div key={action.id} className="px-6 py-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-slate-900">{action.actionType}</p>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-500">{fmt(action.createdAt)}</span>
                        <StatusBadge status={action.status} />
                      </div>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">{action.rationale}</p>
                    {action.responsibleUser?.name && <p className="mt-1 text-xs text-slate-400">Responsible: {action.responsibleUser.name}</p>}
                  </div>
                ))}
              </RecordSection>
            )}

            {interventions.length > 0 && (
              <RecordSection icon={HeartHandshake} title="Counselling Interventions" description="Intervention records" count={interventions.length}>
                {interventions.map((intervention) => (
                  <div key={intervention.id} className="px-6 py-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-slate-900">{intervention.type}</p>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-500">{fmt(intervention.date)}</span>
                        {intervention.confidentialityLevel && intervention.confidentialityLevel !== 'STANDARD' && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2 py-0.5 text-xs font-semibold text-violet-700 ring-1 ring-inset ring-violet-600/20">
                            <Lock className="h-3 w-3" /> {intervention.confidentialityLevel.charAt(0) + intervention.confidentialityLevel.slice(1).toLowerCase()}
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">{intervention.notes}</p>
                    {intervention.counsellor?.name && <p className="mt-1 text-xs text-slate-400">Counsellor: {intervention.counsellor.name}</p>}
                  </div>
                ))}
              </RecordSection>
            )}

            {followUps.length > 0 && (
              <RecordSection icon={Clock} title="Follow-ups" description="Follow-up activities" count={followUps.length}>
                {followUps.map((followUp) => (
                  <div key={followUp.id} className="px-6 py-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-slate-900">Due {fmt(followUp.dueDate)}</p>
                      <div className="flex items-center gap-3">
                        {followUp.completionDate && <span className="text-xs text-slate-500">Completed {fmt(followUp.completionDate)}</span>}
                        <StatusBadge status={followUp.status} />
                      </div>
                    </div>
                    {followUp.nextStep && <p className="mt-2 text-sm leading-relaxed text-slate-600">{followUp.nextStep}</p>}
                    {followUp.assignedUser?.name && <p className="mt-1 text-xs text-slate-400">Assigned to {followUp.assignedUser.name}</p>}
                    {['PRINCIPAL', 'COUNSELLOR'].includes(user?.role || '') && ['PENDING', 'OVERDUE'].includes(followUp.status) && (
                      <div className="mt-3">
                        <CompleteFollowUp id={followUp.id} onComplete={() => loadCaseData()} />
                      </div>
                    )}
                  </div>
                ))}
              </RecordSection>
            )}
          </div>

          {/* Side column */}
          <div className="space-y-6">
            {hasAnyAction && (
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-base">Workflow Actions</CardTitle>
                  <CardDescription>Available actions based on case status and your role</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2.5">
                  {canCreateReview && !isClosed && (
                    <ActionButton variant="default" icon={FileText} onClick={() => router.push(`/cases/${caseData.id}/review`)}>Add Review</ActionButton>
                  )}
                  {canRequestClarification && caseData.status !== 'CLARIFICATION_REQUIRED' && !isClosed && (
                    <ActionButton icon={MessageSquare} onClick={() => { setShowAssignForm(false); setShowClarificationForm(!showClarificationForm) }}>Request Clarification</ActionButton>
                  )}
                  {canRespondToClarification && (
                    <ActionButton variant="default" icon={MessageSquare} onClick={() => setShowClarificationForm(!showClarificationForm)}>Respond to Clarification</ActionButton>
                  )}
                  {canAssign && !isClosed && caseData.status !== 'ASSIGNED' && (
                    <ActionButton icon={UserPlus} onClick={() => { setShowClarificationForm(false); setShowAssignForm(!showAssignForm) }}>Assign Case</ActionButton>
                  )}

                  {showClarificationForm && (
                    <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/80 p-4 animate-scale-in">
                      <label htmlFor="clarification-text" className="block text-sm font-semibold text-slate-700">
                        {canRequestClarification ? 'Clarification Request' : 'Clarification Response'}
                      </label>
                      <textarea
                        id="clarification-text"
                        className={textareaClass}
                        placeholder="Enter details..."
                        value={clarificationText}
                        onChange={(e) => setClarificationText(e.target.value)}
                      />
                      {error && <p className="text-sm text-red-600">{error}</p>}
                      <div className="flex gap-2">
                        <Button size="sm" onClick={canRequestClarification ? handleRequestClarification : handleRespondToClarification}>Submit</Button>
                        <Button size="sm" variant="ghost" onClick={() => setShowClarificationForm(false)}>Cancel</Button>
                      </div>
                    </div>
                  )}

                  {showAssignForm && (
                    <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/80 p-4 animate-scale-in">
                      <Select
                        label="Assign To"
                        value={assignedToId}
                        onChange={(e) => setAssignedToId(e.target.value)}
                        options={[
                          { value: '', label: 'Select staff member' },
                          ...users.filter(u => ['PRINCIPAL', 'COUNSELLOR'].includes(u.role)).map(u => ({
                            value: u.id,
                            label: `${u.name} (${u.role.charAt(0) + u.role.slice(1).toLowerCase()})`
                          }))
                        ]}
                      />
                      <div>
                        <label htmlFor="assign-rationale" className="mb-1.5 block text-sm font-medium text-slate-700">Rationale</label>
                        <textarea
                          id="assign-rationale"
                          className={textareaClass}
                          placeholder="Why assign this case to this person?"
                          value={rationale}
                          onChange={(e) => setRationale(e.target.value)}
                        />
                      </div>
                      {error && <p className="text-sm text-red-600">{error}</p>}
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleAssignCase}>Assign</Button>
                        <Button size="sm" variant="ghost" onClick={() => setShowAssignForm(false)}>Cancel</Button>
                      </div>
                    </div>
                  )}

                  {canCreateIntervention && !isClosed && (
                    <ActionButton icon={HeartHandshake} onClick={() => router.push(`/cases/${caseData.id}/intervention`)}>Add Intervention</ActionButton>
                  )}
                  {canCreateAction && !isClosed && (
                    <ActionButton icon={Gavel} onClick={() => router.push(`/cases/${caseData.id}/action`)}>Add Disciplinary Action</ActionButton>
                  )}
                  {canCreateIntervention && !isClosed && (
                    <ActionButton icon={Clock} onClick={() => router.push(`/cases/${caseData.id}/follow-up`)}>Add Follow-up</ActionButton>
                  )}
                  {user?.role === 'PRINCIPAL' && isClosed && (
                    <ActionButton icon={RotateCcw} onClick={() => router.push(`/cases/${caseData.id}/reopen`)}>Reopen Case</ActionButton>
                  )}
                </CardContent>
              </Card>
            )}

            <CaseHistory id={caseData.id} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
