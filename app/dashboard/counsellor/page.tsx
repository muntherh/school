'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { api } from '@/lib/api-client'
import { FileText, Calendar, CheckCircle, AlertTriangle, Heart } from 'lucide-react'

export default function CounsellorDashboard() {
  const router = useRouter()
  const [cases, setCases] = useState<any[]>([])
  const [interventions, setInterventions] = useState<any[]>([])
  const [followUps, setFollowUps] = useState<any[]>([])
  const [stats, setStats] = useState({
    assignedCases: 0,
    upcomingFollowUps: 0,
    overdueFollowUps: 0,
    totalInterventions: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const [casesResponse] = await Promise.all([
        api.getCases(),
      ])

      if (casesResponse.success && casesResponse.data) {
        const casesData = Array.isArray(casesResponse.data) ? casesResponse.data : []
        setCases(casesData)
        
        // Calculate stats
        const assignedCases = casesData.filter((c: any) => ['ASSIGNED', 'UNDER_REVIEW'].includes(c.status)).length
        
        setStats({
          assignedCases,
          upcomingFollowUps: 0, // TODO: Calculate from follow-ups
          overdueFollowUps: 0, // TODO: Calculate from follow-ups
          totalInterventions: 0, // TODO: Calculate from interventions
        })
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
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Counsellor Dashboard</h1>
            <p className="text-slate-600 mt-1">Manage interventions and follow-ups</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-xl shadow-emerald-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-emerald-100">Assigned Cases</CardTitle>
              <div className="bg-white/20 p-2 rounded-lg">
                <FileText className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.assignedCases}</div>
              <p className="text-xs text-emerald-100 mt-1">Cases requiring attention</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-slate-500 to-slate-600 text-white border-0 shadow-xl shadow-slate-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-100">Upcoming Follow-ups</CardTitle>
              <div className="bg-white/20 p-2 rounded-lg">
                <Calendar className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.upcomingFollowUps}</div>
              <p className="text-xs text-slate-100 mt-1">Scheduled activities</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-gray-500 to-gray-600 text-white border-0 shadow-xl shadow-gray-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-100">Overdue Follow-ups</CardTitle>
              <div className="bg-white/20 p-2 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.overdueFollowUps}</div>
              <p className="text-xs text-gray-100 mt-1">Requires immediate attention</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-teal-500 to-teal-600 text-white border-0 shadow-xl shadow-teal-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-teal-100">Total Interventions</CardTitle>
              <div className="bg-white/20 p-2 rounded-lg">
                <Heart className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalInterventions}</div>
              <p className="text-xs text-teal-100 mt-1">All time interventions</p>
            </CardContent>
          </Card>
        </div>

        {/* Assigned Cases */}
        <Card className="border-slate-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-800">Assigned Cases</CardTitle>
            <CardDescription className="text-slate-500">Cases requiring counselling intervention</CardDescription>
          </CardHeader>
          <CardContent>
            {cases.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-semibold text-gray-900">No assigned cases</h3>
                <p className="mt-1 text-sm text-gray-500">Cases assigned to you will appear here.</p>
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
                  {cases
                    .filter((c) => ['ASSIGNED', 'UNDER_REVIEW'].includes(c.status))
                    .map((caseItem) => (
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

        {/* Upcoming Follow-ups */}
        <Card className="border-slate-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-800">Upcoming Follow-ups</CardTitle>
            <CardDescription className="text-slate-500">Scheduled follow-up activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">No upcoming follow-ups</h3>
              <p className="mt-1 text-sm text-gray-500">Follow-ups will be listed here when scheduled.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
