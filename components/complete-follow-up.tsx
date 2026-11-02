'use client'
import { useState } from 'react'
import { api } from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { CheckCircle2 } from 'lucide-react'

export function CompleteFollowUp({ id, onComplete }: { id: string; onComplete: () => void }) {
  const [result, setResult] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  return (
    <form
      className="space-y-2"
      onSubmit={async (e) => {
        e.preventDefault()
        setError('')
        setSaving(true)
        try {
          await api.completeFollowUp(id, result)
          onComplete()
        } catch (err: any) {
          setError(err.message)
        } finally {
          setSaving(false)
        }
      }}
    >
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          aria-label="Follow-up outcome"
          placeholder="Describe the outcome…"
          required
          maxLength={2000}
          value={result}
          onChange={(e) => setResult(e.target.value)}
          className="h-10 flex-1 rounded-xl border border-input bg-white px-3.5 text-sm text-slate-900 placeholder:text-slate-400 hover:border-slate-300 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/15"
        />
        <Button type="submit" size="sm" className="h-10" isLoading={saving}>
          {!saving && <CheckCircle2 className="h-4 w-4" />}
          Complete follow-up
        </Button>
      </div>
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
    </form>
  )
}
