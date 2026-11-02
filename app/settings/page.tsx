'use client'
import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Button } from '@/components/ui/button'
import { humanize } from '@/components/status-badge'
import { AlertCircle, CheckCircle2, SlidersHorizontal, Save } from 'lucide-react'

type ConfigRow = { key: string; value: unknown; description?: string; category?: string; updatedAt?: string }

export default function Settings() {
  const [rows, setRows] = useState<ConfigRow[]>([])
  const [message, setMessage] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null)
  const [saving, setSaving] = useState('')

  useEffect(() => {
    fetch('/api/configuration')
      .then((r) => r.json())
      .then((r) => {
        if (!r.success) throw Error('Access denied')
        setRows(r.data)
      })
      .catch((e) => setMessage({ kind: 'error', text: e.message }))
  }, [])

  async function save(key: string, value: string) {
    setSaving(key)
    try {
      const parsed = JSON.parse(value)
      const r = await fetch('/api/configuration/' + key, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: parsed }),
      })
      if (!r.ok) throw Error('Could not save configuration')
      setMessage({ kind: 'ok', text: `${humanize(key)} saved` })
    } catch (e: any) {
      setMessage({ kind: 'error', text: e instanceof SyntaxError ? 'The value must be valid JSON' : e.message })
    } finally {
      setSaving('')
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="mt-1 text-sm text-slate-500">Lists used across forms. Values are stored as JSON arrays.</p>
        </div>

        <p
          role="status"
          className={
            message
              ? `flex items-center gap-2 rounded-xl px-4 py-3 text-sm ${message.kind === 'ok' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-700'}`
              : 'sr-only'
          }
        >
          {message && (message.kind === 'ok' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />)}
          {message?.text}
        </p>

        <div className="grid gap-6 lg:grid-cols-2">
          {rows.map((row) => (
            <form
              key={row.key}
              className="flex flex-col rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[var(--shadow-soft)]"
              onSubmit={(e) => {
                e.preventDefault()
                save(row.key, new FormData(e.currentTarget).get('value') as string)
              }}
            >
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <SlidersHorizontal className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <label className="block text-base font-semibold text-slate-900" htmlFor={row.key}>
                    {humanize(row.key)}
                  </label>
                  {row.description && <p className="text-sm text-slate-500">{row.description}</p>}
                </div>
              </div>
              {Array.isArray(row.value) && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {(row.value as unknown[]).map((v) => (
                    <span key={String(v)} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                      {String(v)}
                    </span>
                  ))}
                </div>
              )}
              <textarea
                id={row.key}
                name="value"
                spellCheck={false}
                className="mt-4 w-full flex-1 rounded-xl border border-input bg-slate-50/60 p-4 font-mono text-[13px] leading-relaxed text-slate-800 transition-all hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/15"
                rows={6}
                defaultValue={JSON.stringify(row.value, null, 2)}
              />
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  {row.updatedAt ? `Updated ${new Date(row.updatedAt).toLocaleDateString()}` : ''}
                </span>
                <Button type="submit" size="sm" isLoading={saving === row.key}>
                  {saving !== row.key && <Save className="h-4 w-4" />}
                  Save
                </Button>
              </div>
            </form>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
