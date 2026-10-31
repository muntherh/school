'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { api } from '@/lib/api-client'
import { ArrowLeft, Save } from 'lucide-react'

export default function DisciplinaryActionPage() {
  const params = useParams()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    actionType: '',
    description: '',
    effectiveDate: new Date().toISOString().split('T')[0],
    status: 'PENDING',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await api.createDisciplinaryAction(params.id as string, formData)
      if (response.success) {
        router.push(`/cases/${params.id}`)
      } else {
        setError(response.error?.message || 'Failed to create disciplinary action')
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => router.push(`/cases/${params.id}`)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Disciplinary Action</h1>
              <p className="text-slate-600 mt-1">Record a disciplinary action for this case</p>
            </div>
          </div>
        </div>

        <Card className="border-slate-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-800">Action Details</CardTitle>
            <CardDescription className="text-slate-500">Document the disciplinary action to be taken</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <Select
                label="Action Type"
                value={formData.actionType}
                onChange={(e) => handleChange('actionType', e.target.value)}
                options={[
                  { value: '', label: 'Select action type' },
                  { value: 'Warning', label: 'Warning' },
                  { value: 'Probation', label: 'Probation' },
                  { value: 'Detention', label: 'Detention' },
                  { value: 'Suspension', label: 'Suspension' },
                  { value: 'Expulsion', label: 'Expulsion' },
                  { value: 'Community Service', label: 'Community Service' },
                  { value: 'Counselling Required', label: 'Counselling Required' },
                  { value: 'Other', label: 'Other' },
                ]}
                required
              />

              <Input
                label="Effective Date"
                type="date"
                value={formData.effectiveDate}
                onChange={(e) => handleChange('effectiveDate', e.target.value)}
                required
              />

              <Select
                label="Status"
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
                options={[
                  { value: 'PENDING', label: 'Pending' },
                  { value: 'IN_PROGRESS', label: 'In Progress' },
                  { value: 'COMPLETED', label: 'Completed' },
                ]}
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  className="flex min-h-[120px] w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                  placeholder="Describe the disciplinary action in detail..."
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  required
                />
              </div>

              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-200">
                  {error}
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(`/cases/${params.id}`)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" isLoading={isLoading} className="shadow-lg shadow-emerald-500/25">
                  <Save className="mr-2 h-4 w-4" />
                  Save Action
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
