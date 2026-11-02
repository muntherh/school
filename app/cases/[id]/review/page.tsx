'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { api } from '@/lib/api-client'
import { ArrowLeft, Save } from 'lucide-react'

export default function CaseReviewPage() {
  const params = useParams()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    result: '',
    notes: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await api.createCaseReview(params.id as string, formData)
      if (response.success) {
        router.push(`/cases/${params.id}`)
      } else {
        setError(response.error?.message || 'Failed to create review')
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
              <h1 className="page-title">Case Review</h1>
              <p className="text-slate-600 mt-1">Review and make a decision on this case</p>
            </div>
          </div>
        </div>

        <Card className="border-slate-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-800">Review Decision</CardTitle>
            <CardDescription className="text-slate-500">Review the case and provide your decision</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <Select
                label="Review Result"
                value={formData.result}
                onChange={(e) => handleChange('result', e.target.value)}
                options={[
                  { value: '', label: 'Select result' },
                  { value: 'APPROVED', label: 'Approve - Action Required' },
                  { value: 'REJECTED', label: 'Reject Case' },
                  { value: 'CLOSED', label: 'Close - No Further Action' },
                ]}
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Review Notes *
                </label>
                <textarea
                  className="flex min-h-[120px] w-full rounded-xl border border-input bg-white px-4 py-3 text-sm text-slate-900 shadow-[0_1px_2px_rgb(15_23_42/0.04)] transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15 focus:outline-none"
                  placeholder="Provide detailed notes about your decision..."
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
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
                  Submit Review
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
