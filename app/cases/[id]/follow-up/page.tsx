'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { FormShell, FormError, textareaClass } from '@/components/form-shell'
import { api } from '@/lib/api-client'
import { CalendarPlus } from 'lucide-react'

type Staff = { id: string; name: string; role: string }

export default function FollowUpPage() {
  const params = useParams()
  const router = useRouter()
  const [users, setUsers] = useState<Staff[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({ dueDate: '', assignedUserId: '', nextStep: '' })

  useEffect(() => {
    api.getAssignableUsers()
      .then((r) => { if (r.success && Array.isArray(r.data)) setUsers(r.data as Staff[]) })
      .catch(() => {})
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    try {
      const response = await api.createFollowUp(params.id as string, {
        dueDate: formData.dueDate,
        assignedUserId: formData.assignedUserId,
        nextStep: formData.nextStep || undefined,
      })
      if (response.success) router.push(`/cases/${params.id}`)
      else setError(response.error?.message || 'Failed to create the follow-up')
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => setFormData((prev) => ({ ...prev, [field]: value }))

  return (
    <FormShell
      backHref={`/cases/${params.id}`}
      title="Create Follow-up"
      subtitle="Schedule a follow-up and choose who is responsible for it"
      cardTitle="Follow-up Details"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 sm:grid-cols-2">
          <Input
            label="Due Date *"
            type="date"
            min={new Date().toISOString().split('T')[0]}
            value={formData.dueDate}
            onChange={(e) => handleChange('dueDate', e.target.value)}
            required
          />
          <Select
            label="Assign To *"
            value={formData.assignedUserId}
            onChange={(e) => handleChange('assignedUserId', e.target.value)}
            options={[
              { value: '', label: 'Select staff member' },
              ...users.map((u) => ({ value: u.id, label: `${u.name} (${u.role.charAt(0) + u.role.slice(1).toLowerCase()})` })),
            ]}
            required
          />
        </div>

        <div>
          <label htmlFor="follow-up-next-step" className="mb-1.5 block text-sm font-medium text-slate-700">What should happen</label>
          <textarea
            id="follow-up-next-step"
            className={textareaClass}
            placeholder="The check-in or activity planned for this date, and what to look for."
            maxLength={2000}
            value={formData.nextStep}
            onChange={(e) => handleChange('nextStep', e.target.value)}
          />
        </div>

        <FormError message={error} />

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.push(`/cases/${params.id}`)} disabled={isLoading}>Cancel</Button>
          <Button type="submit" isLoading={isLoading}>
            {!isLoading && <CalendarPlus className="h-4 w-4" />}
            Assign &amp; Save Follow-up
          </Button>
        </div>
      </form>
    </FormShell>
  )
}
