'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { api } from '@/lib/api-client'
import { ArrowLeft, Save, UserPlus } from 'lucide-react'

export default function FollowUpPage() {
  const params = useParams()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [users, setUsers] = useState<any[]>([])
  const [formData, setFormData] = useState({
    dueDate: '',
    assignedUserId: '',
    notes: '',
    status: 'PENDING',
  })

  useEffect(() => {
    loadUsers()
  }, [])

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await api.createFollowUp(params.id as string, {
        dueDate: formData.dueDate,
        assignedUserId: formData.assignedUserId,
        notes: formData.notes,
      })
      if (response.success) {
        router.push(`/cases/${params.id}`)
      } else {
        setError(response.error?.message || 'Failed to create follow-up')
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
              <h1 className="page-title">Create Follow-up</h1>
              <p className="text-slate-600 mt-1">Schedule a follow-up activity and assign to staff</p>
            </div>
          </div>
        </div>

        <Card className="border-slate-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-800">Follow-up Details</CardTitle>
            <CardDescription className="text-slate-500">Schedule and document a follow-up activity</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Due Date"
                type="date"
                value={formData.dueDate}
                onChange={(e) => handleChange('dueDate', e.target.value)}
                required
              />

              <Select
                label="Assign To"
                value={formData.assignedUserId}
                onChange={(e) => handleChange('assignedUserId', e.target.value)}
                options={[
                  { value: '', label: 'Select staff member' },
                  ...users.filter(u => ['PRINCIPAL', 'COUNSELLOR', 'TEACHER'].includes(u.role)).map(u => ({
                    value: u.id,
                    label: `${u.name} (${u.role})`
                  }))
                ]}
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
                  Follow-up Notes *
                </label>
                <textarea
                  className="flex min-h-[120px] w-full rounded-xl border border-input bg-white px-4 py-3 text-sm text-slate-900 shadow-[0_1px_2px_rgb(15_23_42/0.04)] transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15 focus:outline-none"
                  placeholder="Describe the follow-up activity, goals, and expected outcomes..."
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
                  <UserPlus className="mr-2 h-4 w-4" />
                  Assign & Save Follow-up
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
