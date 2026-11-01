'use client'

import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { api } from '@/lib/api-client'
import { Search, Filter, ChevronLeft, ChevronRight, ClipboardList } from 'lucide-react'

export default function AuditLogPage() {
  const [auditEvents, setAuditEvents] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState({
    action: '',
    targetType: '',
    from: '',
    to: '',
  })
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  })

  useEffect(() => {
    loadAuditLog()
  }, [filters, pagination.page])

  const loadAuditLog = async () => {
    setIsLoading(true)
    try {
      const params: any = {
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      }

      if (filters.action) params.action = filters.action
      if (filters.targetType) params.targetType = filters.targetType
      if (filters.from) params.from = filters.from
      if (filters.to) params.to = filters.to

      const response = await api.getAuditLog(params)
      if (response.success && response.data) {
        const auditData = Array.isArray(response.data) ? response.data : []
        setAuditEvents(auditData)
        if (response.pagination) {
          setPagination(response.pagination)
        }
      }
    } catch (error) {
      console.error('Failed to load audit log:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }))
  }

  const getActionBadge = (action: string) => {
    const variants: Record<string, any> = {
      CASE_CREATED: { variant: 'success', label: 'Case Created' },
      CASE_UPDATED: { variant: 'info', label: 'Case Updated' },
      CASE_STATUS_CHANGED: { variant: 'warning', label: 'Status Changed' },
      USER_CREATED: { variant: 'success', label: 'User Created' },
      USER_STATUS_CHANGED: { variant: 'warning', label: 'User Status Changed' },
      STUDENT_CREATED: { variant: 'success', label: 'Student Created' },
      STUDENT_UPDATED: { variant: 'info', label: 'Student Updated' },
      INTERVENTION_CREATED: { variant: 'success', label: 'Intervention Created' },
      ACTION_CREATED: { variant: 'success', label: 'Action Created' },
      FOLLOW_UP_CREATED: { variant: 'success', label: 'Follow-up Created' },
      FOLLOW_UP_COMPLETED: { variant: 'info', label: 'Follow-up Completed' },
      LOGOUT: { variant: 'default', label: 'Logout' },
      LOGIN: { variant: 'default', label: 'Login' },
    }
    const config = variants[action] || { variant: 'gray', label: action }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Audit Log
            </h1>
            <p className="text-muted-foreground mt-1">View system activity and security events</p>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <Label>Action</Label>
                <Select
                  value={filters.action}
                  onValueChange={(value) => handleFilterChange('action', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Actions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Actions</SelectItem>
                    <SelectItem value="CASE_CREATED">Case Created</SelectItem>
                    <SelectItem value="CASE_UPDATED">Case Updated</SelectItem>
                    <SelectItem value="CASE_STATUS_CHANGED">Status Changed</SelectItem>
                    <SelectItem value="USER_CREATED">User Created</SelectItem>
                    <SelectItem value="USER_STATUS_CHANGED">User Status Changed</SelectItem>
                    <SelectItem value="STUDENT_CREATED">Student Created</SelectItem>
                    <SelectItem value="INTERVENTION_CREATED">Intervention Created</SelectItem>
                    <SelectItem value="ACTION_CREATED">Action Created</SelectItem>
                    <SelectItem value="FOLLOW_UP_CREATED">Follow-up Created</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Target Type</Label>
                <Select
                  value={filters.targetType}
                  onValueChange={(value) => handleFilterChange('targetType', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="CASE">Case</SelectItem>
                    <SelectItem value="USER">User</SelectItem>
                    <SelectItem value="STUDENT">Student</SelectItem>
                    <SelectItem value="INTERVENTION">Intervention</SelectItem>
                    <SelectItem value="ACTION">Action</SelectItem>
                    <SelectItem value="FOLLOW_UP">Follow-up</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>From Date</Label>
                <Input
                  type="date"
                  value={filters.from}
                  onChange={(e) => handleFilterChange('from', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>To Date</Label>
                <Input
                  type="date"
                  value={filters.to}
                  onChange={(e) => handleFilterChange('to', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Audit Log Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Audit Events</CardTitle>
            <CardDescription>
              {pagination.total} total events
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-emerald-600" />
              </div>
            ) : auditEvents.length === 0 ? (
              <div className="text-center py-16">
                <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ClipboardList className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold">No audit events found</h3>
                <p className="text-muted-foreground mt-2">Try adjusting your filters.</p>
              </div>
            ) : (
              <>
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead className="font-semibold">Timestamp</TableHead>
                        <TableHead className="font-semibold">Actor</TableHead>
                        <TableHead className="font-semibold">Action</TableHead>
                        <TableHead className="font-semibold">Target Type</TableHead>
                        <TableHead className="font-semibold">Target ID</TableHead>
                        <TableHead className="font-semibold">IP Address</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {auditEvents.map((event) => (
                        <TableRow key={event.id}>
                          <TableCell className="text-sm">
                            {new Date(event.timestamp).toLocaleString()}
                          </TableCell>
                          <TableCell className="font-medium">{event.actorName || 'System'}</TableCell>
                          <TableCell>{getActionBadge(event.action)}</TableCell>
                          <TableCell>{event.targetType}</TableCell>
                          <TableCell className="text-sm font-mono">{event.targetId || '-'}</TableCell>
                          <TableCell className="text-sm font-mono">{event.ipAddress || '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6 pt-4 border-t">
                    <p className="text-sm text-muted-foreground">
                      Page {pagination.page} of {pagination.totalPages} • {pagination.total} total events
                    </p>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page === 1}
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page === pagination.totalPages}
                      >
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
