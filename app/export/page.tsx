'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { api } from '@/lib/api-client'
import { useAuth } from '@/hooks/use-auth'
import { Download, AlertTriangle, FileText, Filter, CheckCircle } from 'lucide-react'

export default function ExportPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [isExporting, setIsExporting] = useState(false)
  const [showWarning, setShowWarning] = useState(false)
  const [warningAcknowledged, setWarningAcknowledged] = useState(false)
  const [stats, setStats] = useState<any>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    status: '',
    category: '',
    classGrade: '',
  })

  const [selectedFields, setSelectedFields] = useState<string[]>([
    'referenceNumber',
    'studentId',
    'studentName',
    'classGrade',
    'incidentDate',
    'category',
    'status',
    'submittedAt',
    'reporterName',
  ])

  const [includeConfidential, setIncludeConfidential] = useState(false)

  const baseFields = [
    { value: 'referenceNumber', label: 'Reference Number' },
    { value: 'studentId', label: 'Student ID' },
    { value: 'studentName', label: 'Student Name' },
    { value: 'classGrade', label: 'Class Grade' },
    { value: 'incidentDate', label: 'Incident Date' },
    { value: 'category', label: 'Category' },
    { value: 'status', label: 'Status' },
    { value: 'submittedAt', label: 'Submitted Date' },
    { value: 'reporterName', label: 'Reporter Name' },
  ]

  const extendedFields = [
    { value: 'description', label: 'Description' },
    { value: 'location', label: 'Location' },
    { value: 'witnesses', label: 'Witnesses' },
    { value: 'decision', label: 'Decision' },
    { value: 'decisionDate', label: 'Decision Date' },
    { value: 'actionType', label: 'Action Type' },
    { value: 'actionStartDate', label: 'Action Start Date' },
    { value: 'actionEndDate', label: 'Action End Date' },
    { value: 'interventionType', label: 'Intervention Type' },
    { value: 'interventionDate', label: 'Intervention Date' },
    { value: 'followUpStatus', label: 'Follow-up Status' },
    { value: 'followUpDueDate', label: 'Follow-up Due Date' },
    { value: 'closedAt', label: 'Closed Date' },
  ]

  const confidentialFields = [
    { value: 'confidentialNotes', label: 'Confidential Notes' },
  ]

  const canViewExtended = user?.role === 'PRINCIPAL' || user?.role === 'ADMIN'
  const canViewConfidential = user?.role === 'PRINCIPAL' || user?.role === 'COUNSELLOR'

  useEffect(() => {
    loadStats()
  }, [filters])

  const loadStats = async () => {
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value)
      })

      const response = await fetch(`/api/export/cases/stats?${params.toString()}`, {
        credentials: 'include',
      })
      const data = await response.json()
      if (data.success) {
        setStats(data.data)
      }
    } catch (error) {
      console.error('Failed to load stats:', error)
    }
  }

  const handleFieldToggle = (field: string) => {
    setSelectedFields(prev =>
      prev.includes(field)
        ? prev.filter(f => f !== field)
        : [...prev, field]
    )
  }

  const handleExport = async () => {
    if (!warningAcknowledged) {
      setShowWarning(true)
      return
    }

    setIsExporting(true)
    setError('')
    setSuccess(false)

    try {
      const response = await fetch('/api/export/cases', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filters,
          fields: selectedFields,
          includeConfidential,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Export failed')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = response.headers.get('Content-Disposition')?.split('filename=')[1]?.replace(/"/g, '') || 'export.csv'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      setSuccess(true)
      setShowWarning(false)
      setWarningAcknowledged(false)
    } catch (err: any) {
      setError(err.message || 'Failed to export data')
    } finally {
      setIsExporting(false)
    }
  }

  const handleWarningAcknowledge = () => {
    setWarningAcknowledged(true)
    setShowWarning(false)
    handleExport()
  }

  if (user?.role !== 'PRINCIPAL' && user?.role !== 'ADMIN') {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900">Access Denied</h3>
            <p className="text-gray-600">Only principals and admins can export data</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Export Cases</h1>
          <p className="text-slate-600 mt-1">Export case data to CSV with filters and field selection</p>
        </div>

        {/* Warning Banner */}
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-yellow-800">Sensitive Data Warning</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  This export contains sensitive student information. By downloading this file, you agree to:
                </p>
                <ul className="text-sm text-yellow-700 mt-2 list-disc list-inside space-y-1">
                  <li>Store the file securely and delete it when no longer needed</li>
                  <li>Not share the file with unauthorized personnel</li>
                  <li>Follow all applicable data protection laws and school policies</li>
                  <li>Report any data breaches immediately</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        {stats && (
          <Card>
            <CardHeader>
              <CardTitle>Export Statistics</CardTitle>
              <CardDescription>Preview of data matching your filters</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Records</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalCount}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Export Limit</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.maxExportLimit}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Status</p>
                  {stats.requiresPagination ? (
                    <Badge variant="danger">Exceeds Limit</Badge>
                  ) : (
                    <Badge variant="success">Within Limit</Badge>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Categories</p>
                  <p className="text-lg font-semibold text-gray-900">{stats.categoryCounts?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="mr-2 h-5 w-5" />
              Filters
            </CardTitle>
            <CardDescription>Filter cases before export</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="Date From"
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
              />
              <Input
                label="Date To"
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
              />
              <Select
                label="Status"
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                options={[
                  { value: '', label: 'All Statuses' },
                  { value: 'SUBMITTED', label: 'Submitted' },
                  { value: 'UNDER_REVIEW', label: 'Under Review' },
                  { value: 'CLARIFICATION_REQUIRED', label: 'Clarification Required' },
                  { value: 'ASSIGNED', label: 'Assigned' },
                  { value: 'ACTION_PENDING', label: 'Action Pending' },
                  { value: 'FOLLOW_UP_PENDING', label: 'Follow-up Pending' },
                  { value: 'CLOSED', label: 'Closed' },
                  { value: 'REJECTED', label: 'Rejected' },
                ]}
              />
              <Input
                label="Category"
                placeholder="e.g., Behavioral Issue"
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
              />
              <Input
                label="Class Grade"
                placeholder="e.g., 10A"
                value={filters.classGrade}
                onChange={(e) => setFilters(prev => ({ ...prev, classGrade: e.target.value }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Field Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Field Selection
            </CardTitle>
            <CardDescription>Select fields to include in export</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Base Fields</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {baseFields.map(field => (
                  <label key={field.value} className="flex items-center space-x-2 cursor-pointer">
                    <Checkbox
                      checked={selectedFields.includes(field.value)}
                      onCheckedChange={() => handleFieldToggle(field.value)}
                    />
                    <span className="text-sm">{field.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {canViewExtended && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Extended Fields</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {extendedFields.map(field => (
                    <label key={field.value} className="flex items-center space-x-2 cursor-pointer">
                      <Checkbox
                        checked={selectedFields.includes(field.value)}
                        onCheckedChange={() => handleFieldToggle(field.value)}
                      />
                      <span className="text-sm">{field.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {canViewConfidential && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Confidential Fields</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {confidentialFields.map(field => (
                    <label key={field.value} className="flex items-center space-x-2 cursor-pointer">
                      <Checkbox
                        checked={selectedFields.includes(field.value)}
                        onCheckedChange={() => handleFieldToggle(field.value)}
                      />
                      <span className="text-sm">{field.label}</span>
                    </label>
                  ))}
                </div>
                <label className="flex items-center space-x-2 mt-3 cursor-pointer">
                  <Checkbox
                    checked={includeConfidential}
                    onCheckedChange={(checked: boolean) => setIncludeConfidential(checked)}
                  />
                  <span className="text-sm">Include confidential notes in export</span>
                </label>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Export Button */}
        <div className="flex justify-end space-x-3">
          <Button
            variant="outline"
            onClick={() => router.back()}
            disabled={isExporting}
          >
 Cancel
          </Button>
          <Button
            onClick={handleExport}
            isLoading={isExporting}
            disabled={selectedFields.length === 0 || (stats?.requiresPagination)}
          >
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>

        {/* Warning Modal */}
        {showWarning && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="max-w-md w-full mx-4">
              <CardHeader>
                <CardTitle className="flex items-center text-yellow-600">
                  <AlertTriangle className="mr-2 h-5 w-5" />
                  Confirm Export
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">
                  You are about to export {stats?.totalCount || 0} case records containing sensitive student information.
                </p>
                <p className="text-sm text-gray-600">
                  By proceeding, you acknowledge that you have read and agree to the data handling requirements listed above.
                </p>
                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowWarning(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleWarningAcknowledge}>
                    I Understand, Export
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <h3 className="font-semibold text-green-800">Export Successful</h3>
                  <p className="text-sm text-green-700">Your CSV file has been downloaded.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error Message */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <div>
                  <h3 className="font-semibold text-red-800">Export Failed</h3>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
