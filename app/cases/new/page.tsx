'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { StudentPicker, type PickedStudent } from '@/components/student-picker'
import { api, ApiError } from '@/lib/api-client'
import { AlertTriangle, ArrowLeft, Save, ShieldAlert } from 'lucide-react'

const textareaClass =
  'flex min-h-[130px] w-full rounded-xl border border-input bg-white px-4 py-3 text-sm text-slate-900 shadow-[0_1px_2px_rgb(15_23_42/0.04)] transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15 focus:outline-none'

export default function NewCasePage() {
  const router = useRouter()
  const [categories, setCategories] = useState<string[]>([])
  const [student, setStudent] = useState<PickedStudent | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [duplicateWarning, setDuplicateWarning] = useState('')
  const [formData, setFormData] = useState({
    category: '',
    incidentDate: new Date().toISOString().split('T')[0],
    incidentTime: '',
    location: '',
    description: '',
    witnesses: '',
    immediateSafetyConcern: false,
  })

  useEffect(() => {
    fetch('/api/configuration/INCIDENT_CATEGORIES')
      .then((r) => r.json())
      .then((r) => { if (r.success) setCategories(r.data.value) })
      .catch(() => {})
  }, [])

  const submit = async (confirmDuplicate = false) => {
    setError('')
    if (!student) {
      setError('Choose the student this incident is about.')
      return
    }
    if (formData.description.trim().length < 10) {
      setError('Description must be at least 10 characters.')
      return
    }
    setIsLoading(true)
    try {
      const payload = {
        studentId: student.id,
        category: formData.category,
        incidentDate: formData.incidentDate,
        ...(formData.incidentTime ? { incidentTime: new Date(`${formData.incidentDate}T${formData.incidentTime}`).toISOString() } : {}),
        location: formData.location || undefined,
        witnesses: formData.witnesses || undefined,
        description: formData.description,
        immediateSafetyConcern: formData.immediateSafetyConcern,
        ...(confirmDuplicate ? { confirmDuplicate: true } : {}),
      }
      const response = await api.createCase(payload)
      if (response.success && response.data) {
        router.push(`/cases/${(response.data as { id: string }).id}`)
      } else {
        setError(response.error?.message || 'Failed to create case')
      }
    } catch (err: any) {
      if (err instanceof ApiError && err.code === 'DUPLICATE_SUSPECTED') {
        setDuplicateWarning(err.message)
      } else {
        setError(err.message || 'An error occurred')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setDuplicateWarning('')
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push('/cases')}>
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="page-title">Submit Incident Report</h1>
            <p className="mt-1 text-sm text-slate-500">A report records what was observed. It is reviewed by the principal before any decision.</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Incident Details</CardTitle>
            <CardDescription>Fields marked * are required.</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(e) => { e.preventDefault(); submit(false) }}
              className="space-y-6"
            >
              <StudentPicker value={student} onChange={(s) => { setStudent(s); setDuplicateWarning('') }} />

              <div className="grid gap-6 sm:grid-cols-3">
                <Select
                  label="Category *"
                  value={formData.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  options={[{ value: '', label: 'Select category' }, ...categories.map((value) => ({ value, label: value }))]}
                  required
                />
                <Input
                  label="Incident Date *"
                  type="date"
                  max={new Date().toISOString().split('T')[0]}
                  value={formData.incidentDate}
                  onChange={(e) => handleChange('incidentDate', e.target.value)}
                  required
                />
                <Input
                  label="Incident Time"
                  type="time"
                  value={formData.incidentTime}
                  onChange={(e) => handleChange('incidentTime', e.target.value)}
                />
              </div>

              <Input
                label="Location"
                placeholder="Where did the incident occur?"
                maxLength={255}
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
              />

              <div>
                <label htmlFor="incident-description" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Description *
                </label>
                <textarea
                  id="incident-description"
                  className={textareaClass}
                  placeholder="Describe what you observed: what happened, who was involved and what was said or done."
                  maxLength={5000}
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  required
                />
                <p className="mt-1.5 text-xs text-slate-500">At least 10 characters. {formData.description.length}/5000</p>
              </div>

              <Input
                label="Witnesses"
                placeholder="Names of any witnesses (optional)"
                maxLength={2000}
                value={formData.witnesses}
                onChange={(e) => handleChange('witnesses', e.target.value)}
              />

              <label htmlFor="safety-concern" className="flex cursor-pointer items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/60 p-4">
                <input
                  id="safety-concern"
                  type="checkbox"
                  checked={formData.immediateSafetyConcern}
                  onChange={(e) => handleChange('immediateSafetyConcern', e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-amber-300 accent-amber-600"
                />
                <span>
                  <span className="flex items-center gap-1.5 text-sm font-semibold text-amber-900">
                    <ShieldAlert className="h-4 w-4" /> Immediate safety concern
                  </span>
                  <span className="text-sm text-amber-800">Tick if a student or staff member may be at risk. The case is highlighted for the principal.</span>
                </span>
              </label>

              {duplicateWarning && (
                <div role="alert" className="flex flex-col gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 sm:flex-row sm:items-center sm:justify-between">
                  <span className="flex items-start gap-2"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />{duplicateWarning}</span>
                  <Button type="button" size="sm" variant="outline" onClick={() => submit(true)} disabled={isLoading}>
                    Submit as a separate incident
                  </Button>
                </div>
              )}

              {error && (
                <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => router.push('/cases')} disabled={isLoading}>
                  Cancel
                </Button>
                <Button type="submit" isLoading={isLoading}>
                  {!isLoading && <Save className="h-4 w-4" />}
                  Submit Report
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
