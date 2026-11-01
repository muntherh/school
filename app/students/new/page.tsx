'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { api } from '@/lib/api-client'
import { ArrowLeft, Users } from 'lucide-react'

export default function NewStudentPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    studentId: '',
    name: '',
    classGrade: '',
    activeStatus: true,
    contactInfo: '',
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await api.createStudent(formData)
      if (response.success) {
        router.push('/students')
      } else {
        setError(response.error?.message || 'Failed to create student')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create student')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/students')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Add New Student
            </h1>
            <p className="text-slate-600 mt-1">Create a new student record</p>
          </div>
        </div>

        <Card className="border-slate-200 shadow-lg max-w-2xl">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-800">Student Information</CardTitle>
            <CardDescription className="text-slate-500">
              Enter the details for the new student
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="studentId">Student ID</Label>
                <Input
                  id="studentId"
                  placeholder="STU-001"
                  value={formData.studentId}
                  onChange={(e) => handleInputChange('studentId', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="Jane Smith"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="classGrade">Class/Grade</Label>
                <Input
                  id="classGrade"
                  placeholder="Grade 10 - Section A"
                  value={formData.classGrade}
                  onChange={(e) => handleInputChange('classGrade', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactInfo">Contact Information (Optional)</Label>
                <Input
                  id="contactInfo"
                  placeholder="Parent/guardian contact details"
                  value={formData.contactInfo}
                  onChange={(e) => handleInputChange('contactInfo', e.target.value)}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="activeStatus"
                  checked={formData.activeStatus}
                  onCheckedChange={(checked) => handleInputChange('activeStatus', checked)}
                />
                <Label htmlFor="activeStatus" className="cursor-pointer">
                  Active Student
                </Label>
              </div>

              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-200">
                  {error}
                </div>
              )}

              <div className="flex items-center gap-3 pt-4">
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating...' : 'Create Student Record'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/students')}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Users className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">Important Notes</p>
              <ul className="list-disc list-inside space-y-1 text-blue-700">
                <li>Student ID must be unique within the system</li>
                <li>Active students can be associated with new incident reports</li>
                <li>Contact information is optional but recommended for follow-ups</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
