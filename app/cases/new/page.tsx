'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { api } from '@/lib/api-client'
import { ArrowLeft, Save } from 'lucide-react'

export default function NewCasePage() {
  const router = useRouter()
  const [categories, setCategories] = useState<string[]>([])
  useEffect(() => { fetch('/api/configuration/INCIDENT_CATEGORIES').then(r=>r.json()).then(r=>{if(r.success) setCategories(r.data.value)}) }, [])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    studentId: '',
    category: '',
    incidentDate: new Date().toISOString().split('T')[0],
    location: '',
    description: '',
    witnesses: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await api.createCase(formData)
      if (response.success && response.data) {
        const data = response.data as { id: string }
        router.push(`/cases/${data.id}`)
      } else {
        setError(response.error?.message || 'Failed to create case')
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
            <Button variant="ghost" onClick={() => router.push('/cases')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="page-title">Submit Incident Report</h1>
              <p className="text-slate-600 mt-1">Create a new disciplinary case</p>
            </div>
          </div>
        </div>

        <Card className="border-slate-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-800">Incident Details</CardTitle>
            <CardDescription className="text-slate-500">Provide details about the incident</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Student ID"
                placeholder="Enter student ID (e.g., STU001)"
                value={formData.studentId}
                onChange={(e) => handleChange('studentId', e.target.value)}
                required
              />

              <Select
                label="Category"
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
                options={[{value:'',label:'Select category'}, ...categories.map(value=>({value,label:value}))]}
                required
              />

              <Input
                label="Incident Date"
                type="date"
                value={formData.incidentDate}
                onChange={(e) => handleChange('incidentDate', e.target.value)}
                required
              />

              <Input
                label="Location"
                placeholder="Where did the incident occur?"
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  className="flex min-h-[120px] w-full rounded-xl border border-input bg-white px-4 py-3 text-sm text-slate-900 shadow-[0_1px_2px_rgb(15_23_42/0.04)] transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15 focus:outline-none"
                  placeholder="Describe the incident in detail..."
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  required
                />
              </div>

              <Input
                label="Witnesses"
                placeholder="Names of any witnesses (optional)"
                value={formData.witnesses}
                onChange={(e) => handleChange('witnesses', e.target.value)}
              />

              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-200">
                  {error}
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/cases')}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" isLoading={isLoading} className="shadow-lg shadow-emerald-500/25">
                  <Save className="mr-2 h-4 w-4" />
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
