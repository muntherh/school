'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { api } from '@/lib/api-client'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { FileText, Clock, CheckCircle, AlertCircle, Users, Shield } from 'lucide-react'

const COLORS = ['#10b981', '#64748b', '#94a3b8', '#475569', '#334155']

export default function PrincipalDashboard() {
  const router = useRouter()
  const [cases, setCases] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [stats, setStats] = useState({
    totalIncidents: 0,
    pendingReviews: 0,
    underReview: 0,
    actionsPending: 0,
    followUpsDue: 0,
    closedCases: 0,
    pendingApprovals: 0,
  })
  const [chartData, setChartData] = useState<any[]>([])
  const [categoryData, setCategoryData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const [casesResponse, usersResponse] = await Promise.all([
        api.getCases(),
        api.getUsers(),
      ])

      if (casesResponse.success && casesResponse.data) {
        const casesData = Array.isArray(casesResponse.data) ? casesResponse.data : []
        setCases(casesData)

        // Calculate stats
        const totalIncidents = casesData.length
        const pendingReviews = casesData.filter((c: any) => c.status === 'SUBMITTED').length
        const underReview = casesData.filter((c: any) => c.status === 'UNDER_REVIEW').length
        const actionsPending = casesData.filter((c: any) => c.status === 'ASSIGNED').length
        const closedCases = casesData.filter((c: any) => c.status === 'CLOSED').length

        setStats({
          totalIncidents,
          pendingReviews,
          underReview,
          actionsPending,
          followUpsDue: 0, // TODO: Calculate from follow-ups
          closedCases,
          pendingApprovals: 0, // TODO: Calculate from users
        })

        // Prepare chart data by date
        const dateMap: Record<string, number> = {}
        casesData.forEach((c: any) => {
          const date = new Date(c.incidentDate).toLocaleDateString()
          dateMap[date] = (dateMap[date] || 0) + 1
        })
        const dateData = Object.entries(dateMap)
          .slice(-7)
          .map(([date, count]) => ({ date, count }))
        setChartData(dateData)

        // Prepare category data
        const categoryMap: Record<string, number> = {}
        casesData.forEach((c: any) => {
          categoryMap[c.category] = (categoryMap[c.category] || 0) + 1
        })
        const catData = Object.entries(categoryMap).map(([name, value]) => ({ name, value }))
        setCategoryData(catData)
      }

      if (usersResponse.success && usersResponse.data) {
        const usersData = Array.isArray(usersResponse.data) ? usersResponse.data : []
        setUsers(usersData)
        const pendingApprovals = usersData.filter((u: any) => u.accountStatus === 'PENDING').length
        setStats(prev => ({ ...prev, pendingApprovals }))
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
      CLARIFICATION_REQUIRED: { variant: 'destructive', label: 'Clarification Required' },
      ASSIGNED: { variant: 'success', label: 'Assigned' },
      CLOSED: { variant: 'gray', label: 'Closed' },
    }
    const config = variants[status] || { variant: 'gray', label: status }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-4 w-48" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Principal Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">Overview of disciplinary management</p>
          </div>
          <Button onClick={() => router.push('/cases/new')} className="shadow-lg shadow-primary/25">
            <FileText className="w-4 h-4 mr-2" />
            New Report
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-xl shadow-emerald-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-emerald-100">Total Incidents</CardTitle>
              <div className="bg-white/20 p-2 rounded-lg">
                <FileText className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalIncidents}</div>
              <p className="text-xs text-emerald-100 mt-1">All time records</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-slate-500 to-slate-600 text-white border-0 shadow-xl shadow-slate-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-100">Pending Reviews</CardTitle>
              <div className="bg-white/20 p-2 rounded-lg">
                <Clock className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.pendingReviews}</div>
              <p className="text-xs text-slate-100 mt-1">Requires attention</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-gray-500 to-gray-600 text-white border-0 shadow-xl shadow-gray-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-100">Under Review</CardTitle>
              <div className="bg-white/20 p-2 rounded-lg">
                <AlertCircle className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.underReview}</div>
              <p className="text-xs text-gray-100 mt-1">In progress</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-xl shadow-emerald-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-emerald-100">Closed Cases</CardTitle>
              <div className="bg-white/20 p-2 rounded-lg">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.closedCases}</div>
              <p className="text-xs text-emerald-100 mt-1">Successfully resolved</p>
            </CardContent>
          </Card>
        </div>

        {/* Secondary Stats */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-slate-200 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700">Actions Pending</CardTitle>
              <div className="bg-emerald-100 p-2 rounded-lg">
                <Shield className="h-5 w-5 text-emerald-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{stats.actionsPending}</div>
              <p className="text-xs text-slate-500 mt-1">Awaiting disciplinary action</p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700">Pending Staff Approvals</CardTitle>
              <div className="bg-slate-100 p-2 rounded-lg">
                <Users className="h-5 w-5 text-slate-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{stats.pendingApprovals}</div>
              <p className="text-xs text-slate-500 mt-1">Staff accounts awaiting review</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-slate-200 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-800">Incidents by Date</CardTitle>
              <CardDescription className="text-slate-500">Last 7 days overview</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                  />
                  <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-800">Incidents by Category</CardTitle>
              <CardDescription className="text-slate-500">Distribution by type</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    className="text-sm"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="border-slate-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-800">Recent Cases</CardTitle>
            <CardDescription className="text-slate-500">Latest incident reports requiring attention</CardDescription>
          </CardHeader>
          <CardContent>
            {cases.length === 0 ? (
              <div className="text-center py-16">
                <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">No cases yet</h3>
                <p className="text-slate-500 mt-2">Incident reports will appear here once submitted.</p>
              </div>
            ) : (
              <div className="rounded-lg border border-slate-200 overflow-hidden">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead className="font-semibold text-slate-700">Reference</TableHead>
                      <TableHead className="font-semibold text-slate-700">Category</TableHead>
                      <TableHead className="font-semibold text-slate-700">Date</TableHead>
                      <TableHead className="font-semibold text-slate-700">Status</TableHead>
                      <TableHead className="font-semibold text-slate-700 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cases.slice(0, 10).map((caseItem) => (
                      <TableRow key={caseItem.id} className="hover:bg-slate-50 transition-colors">
                        <TableCell className="font-medium text-slate-900">{caseItem.referenceNumber}</TableCell>
                        <TableCell className="text-slate-600">{caseItem.category}</TableCell>
                        <TableCell className="text-slate-600">{new Date(caseItem.incidentDate).toLocaleDateString()}</TableCell>
                        <TableCell>{getStatusBadge(caseItem.status)}</TableCell>
                        <TableCell className="text-right">
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
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending Approvals */}
        {stats.pendingApprovals > 0 && (
          <Card className="border-slate-200 shadow-lg border-l-4 border-l-purple-500">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-800">Pending Staff Approvals</CardTitle>
              <CardDescription className="text-slate-500">Staff accounts awaiting approval</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-slate-200 overflow-hidden">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead className="font-semibold text-slate-700">Name</TableHead>
                      <TableHead className="font-semibold text-slate-700">Email</TableHead>
                      <TableHead className="font-semibold text-slate-700">Role</TableHead>
                      <TableHead className="font-semibold text-slate-700 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users
                      .filter((u) => u.accountStatus === 'PENDING')
                      .slice(0, 5)
                      .map((user) => (
                        <TableRow key={user.id} className="hover:bg-slate-50 transition-colors">
                          <TableCell className="font-medium text-slate-900">{user.name}</TableCell>
                          <TableCell className="text-slate-600">{user.email}</TableCell>
                          <TableCell>
                            <Badge variant="info" className="bg-purple-100 text-purple-700">
                              {user.role}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => router.push(`/users/${user.id}`)}
                              className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                            >
                              Review
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
