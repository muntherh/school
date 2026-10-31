'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { api } from '@/lib/api-client'
import { Plus, FileText, Clock, CheckCircle, AlertCircle } from 'lucide-react'

export default function TeacherDashboard() {
  const router = useRouter()
  const [cases, setCases] = useState<any[]>([])
  const [stats, setStats] = useState({
    submitted: 0,
    awaitingReview: 0,
    clarification: 0,
    processed: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const response = await api.getCases()
      if (response.success && response.data) {
        const casesData = Array.isArray(response.data) ? response.data : []
        setCases(casesData)
        
        // Calculate stats
        const submitted = casesData.length
        const awaitingReview = casesData.filter((c: any) => c.status === 'SUBMITTED').length
        const clarification = casesData.filter((c: any) => c.status === 'CLARIFICATION_REQUIRED').length
        const processed = casesData.filter((c: any) => ['ASSIGNED', 'CLOSED'].includes(c.status)).length
        
        setStats({ submitted, awaitingReview, clarification, processed })
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      SUBMITTED: { variant: 'info', label: 'Submitted' },
      UNDER_REVIEW: { variant: 'warning', label: 'Under Review' },
      CLARIFICATION_REQUIRED: { variant: 'danger', label: 'Clarification Required' },
      ASSIGNED: { variant: 'success', label: 'Assigned' },
      CLOSED: { variant: 'default', label: 'Closed' },
    }
    const config = variants[status] || { variant: 'gray', label: status }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-emerald-600" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Teacher Dashboard</h1>
            <p className="text-slate-600 mt-1">Manage your incident reports</p>
          </div>
          <Button onClick={() => router.push('/cases/new')}>
            <Plus className="mr-2 h-4 w-4" />
            Submit Incident
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-xl shadow-emerald-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-emerald-100">Submitted Reports</CardTitle>
              <div className="bg-white/20 p-2 rounded-lg">
                <FileText className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.submitted}</div>
              <p className="text-xs text-emerald-100 mt-1">All time records</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-slate-500 to-slate-600 text-white border-0 shadow-xl shadow-slate-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-100">Awaiting Review</CardTitle>
              <div className="bg-white/20 p-2 rounded-lg">
                <Clock className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.awaitingReview}</div>
              <p className="text-xs text-slate-100 mt-1">Requires attention</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-gray-500 to-gray-600 text-white border-0 shadow-xl shadow-gray-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-100">Needs Clarification</CardTitle>
              <div className="bg-white/20 p-2 rounded-lg">
                <AlertCircle className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.clarification}</div>
              <p className="text-xs text-gray-100 mt-1">Action required</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-teal-500 to-teal-600 text-white border-0 shadow-xl shadow-teal-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-teal-100">Processed</CardTitle>
              <div className="bg-white/20 p-2 rounded-lg">
                <CheckCircle className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.processed}</div>
              <p className="text-xs text-teal-100 mt-1">Successfully resolved</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Cases Table */}
        <Card className="border-slate-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-800">Your Incident Reports</CardTitle>
            <CardDescription className="text-slate-500">View and manage your submitted incident reports</CardDescription>
          </CardHeader>
          <CardContent>
            {cases.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-semibold text-gray-900">No reports yet</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by submitting your first incident report.</p>
                <div className="mt-6">
                  <Button onClick={() => router.push('/cases/new')}>
                    <Plus className="mr-2 h-4 w-4" />
                    Submit Incident
                  </Button>
                </div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reference</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cases.map((caseItem) => (
                    <TableRow key={caseItem.id}>
                      <TableCell className="font-medium">{caseItem.referenceNumber}</TableCell>
                      <TableCell>{caseItem.category}</TableCell>
                      <TableCell>{new Date(caseItem.incidentDate).toLocaleDateString()}</TableCell>
                      <TableCell>{getStatusBadge(caseItem.status)}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/cases/${caseItem.id}`)}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
