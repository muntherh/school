'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { FormShell, FormError, textareaClass } from '@/components/form-shell'
import { useConfigList } from '@/hooks/use-config-list'
import { api } from '@/lib/api-client'
import { Save } from 'lucide-react'

type Staff = { id: string; name: string; role: string }

export default function DisciplinaryActionPage() {
  const { user } = useAuth()
  const params = useParams()
  const router = useRouter()
  const actionTypes = useConfigList('ACTION_TYPES')
  const [staff, setStaff] = useState<Staff[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const today = new Date().toISOString().split('T')[0]
  const [formData, setFormData] = useState({
    actionType: '',
    rationale: '',
    startDate: today,
    endDate: '',
    responsibleUserId: '',
  })

  useEffect(() => {
    api.getAssignableUsers()
      .then((r) => { if (r.success && Array.isArray(r.data)) setStaff(r.data as Staff[]) })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (user?.id && !formData.responsibleUserId) setFormData((prev) => ({ ...prev, responsibleUserId: user.id }))
  }, [user?.id, formData.responsibleUserId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (formData.rationale.trim().length < 10) {
      setError('Rationale must be at least 10 characters.')
      return
    }
    if (formData.endDate && formData.endDate < formData.startDate) {
      setError('End date cannot be before the start date.')
      return
    }
    setIsLoading(true)
    try {
      const response = await api.createDisciplinaryAction(params.id as string, {
        actionType: formData.actionType,
        rationale: formData.rationale,
        startDate: formData.startDate,
        ...(formData.endDate ? { endDate: formData.endDate } : {}),
        responsibleUserId: formData.responsibleUserId,
      })
      if (response.success) router.push(`/cases/${params.id}`)
      else setError(response.error?.message || 'Failed to save the action')
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => setFormData((prev) => ({ ...prev, [field]: value }))
  const staffOptions = staff.some((s) => s.id === user?.id) || !user ? staff : [{ id: user.id, name: user.name, role: user.role }, ...staff]

  return (
    <FormShell
      backHref={`/cases/${params.id}`}
      title="Disciplinary Action"
      subtitle="Record a school-approved measure, why it was chosen and who is responsible"
      cardTitle="Action Details"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 sm:grid-cols-2">
          <Select
            label="Action Type *"
            value={formData.actionType}
            onChange={(e) => handleChange('actionType', e.target.value)}
            options={[{ value: '', label: 'Select action type' }, ...actionTypes.map((t) => ({ value: t, label: t }))]}
            required
          />
          <Select
            label="Responsible Staff *"
            value={formData.responsibleUserId}
            onChange={(e) => handleChange('responsibleUserId', e.target.value)}
            options={[
              { value: '', label: 'Select staff member' },
              ...staffOptions.map((s) => ({ value: s.id, label: `${s.name} (${s.role.charAt(0) + s.role.slice(1).toLowerCase()})` })),
            ]}
            required
          />
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <Input label="Start Date *" type="date" value={formData.startDate} onChange={(e) => handleChange('startDate', e.target.value)} required />
          <Input label="End Date" type="date" min={formData.startDate} value={formData.endDate} onChange={(e) => handleChange('endDate', e.target.value)} />
        </div>

        <div>
          <label htmlFor="action-rationale" className="mb-1.5 block text-sm font-medium text-slate-700">Rationale *</label>
          <textarea
            id="action-rationale"
            className={textareaClass}
            placeholder="Why this measure is appropriate, with reference to the review decision."
            maxLength={5000}
            value={formData.rationale}
            onChange={(e) => handleChange('rationale', e.target.value)}
            required
          />
        </div>

        <FormError message={error} />

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.push(`/cases/${params.id}`)} disabled={isLoading}>Cancel</Button>
          <Button type="submit" isLoading={isLoading}>
            {!isLoading && <Save className="h-4 w-4" />}
            Save Action
          </Button>
        </div>
      </form>
    </FormShell>
  )
}
