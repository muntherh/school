'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { FormShell, FormError, textareaClass } from '@/components/form-shell'
import { useConfigList } from '@/hooks/use-config-list'
import { api } from '@/lib/api-client'
import { Save } from 'lucide-react'

export default function InterventionPage() {
  const params = useParams()
  const router = useRouter()
  const types = useConfigList('INTERVENTION_TYPES')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    type: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
    confidentialityLevel: 'STANDARD',
    outcome: '',
    nextStep: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (formData.notes.trim().length < 10) {
      setError('Session notes must be at least 10 characters.')
      return
    }
    setIsLoading(true)
    try {
      const response = await api.createIntervention(params.id as string, {
        type: formData.type,
        date: formData.date,
        notes: formData.notes,
        confidentialityLevel: formData.confidentialityLevel,
        outcome: formData.outcome || undefined,
        nextStep: formData.nextStep || undefined,
      })
      if (response.success) router.push(`/cases/${params.id}`)
      else setError(response.error?.message || 'Failed to save the intervention')
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
      title="Counselling Intervention"
      subtitle="Record a counselling session or support intervention for this case"
      cardTitle="Intervention Details"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 sm:grid-cols-2">
          <Select
            label="Intervention Type *"
            value={formData.type}
            onChange={(e) => handleChange('type', e.target.value)}
            options={[{ value: '', label: 'Select type' }, ...types.map((t) => ({ value: t, label: t }))]}
            required
          />
          <Input
            label="Session Date *"
            type="date"
            value={formData.date}
            onChange={(e) => handleChange('date', e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="intervention-notes" className="mb-1.5 block text-sm font-medium text-slate-700">Session Notes *</label>
          <textarea
            id="intervention-notes"
            className={textareaClass}
            placeholder="What was discussed or done, and what you observed."
            maxLength={5000}
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            required
          />
        </div>

        <Select
          label="Confidentiality *"
          value={formData.confidentialityLevel}
          onChange={(e) => handleChange('confidentialityLevel', e.target.value)}
          options={[
            { value: 'STANDARD', label: 'Standard: visible to the principal and assigned counsellor' },
            { value: 'CONFIDENTIAL', label: 'Confidential: counselling content, handle with care' },
            { value: 'RESTRICTED', label: 'Restricted: most sensitive, excluded from exports' },
          ]}
          required
        />

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="intervention-outcome" className="mb-1.5 block text-sm font-medium text-slate-700">Outcome / Progress</label>
            <textarea
              id="intervention-outcome"
              className={textareaClass}
              placeholder="Observed progress or result of the session (optional). This does not decide any sanction."
              maxLength={2000}
              value={formData.outcome}
              onChange={(e) => handleChange('outcome', e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="intervention-next-step" className="mb-1.5 block text-sm font-medium text-slate-700">Next Step</label>
            <textarea
              id="intervention-next-step"
              className={textareaClass}
              placeholder="Planned next step, if any (optional)."
              maxLength={2000}
              value={formData.nextStep}
              onChange={(e) => handleChange('nextStep', e.target.value)}
            />
          </div>
        </div>

        <FormError message={error} />

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.push(`/cases/${params.id}`)} disabled={isLoading}>Cancel</Button>
          <Button type="submit" isLoading={isLoading}>
            {!isLoading && <Save className="h-4 w-4" />}
            Save Intervention
          </Button>
        </div>
      </form>
    </FormShell>
  )
}
