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
import { humanize } from '@/components/status-badge'
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
    const variant = /FAILED|DEACTIVATED|REJECTED/.test(action)
      ? 'destructive'
      : /LOGIN|LOGOUT/.test(action)
        ? 'secondary'
        : /CREATED|APPROVED|SUBMITTED|COMPLETED|REACTIVATED/.test(action)
          ? 'success'
          : /CLOSED|DECISION|STATUS|REOPENED|CLARIFICATION/.test(action)
            ? 'warning'
            : 'info'
    return <Badge variant={variant as any}>{humanize(action)}</Badge>
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">
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
                    <SelectItem value="LOGIN_SUCCESS">Login Success</SelectItem>
                    <SelectItem value="LOGIN_FAILED">Login Failed</SelectItem>
                    <SelectItem value="LOGOUT">Logout</SelectItem>
                    <SelectItem value="CASE_CREATED">Case Created</SelectItem>
                    <SelectItem value="CASE_DECISION_RECORDED">Case Decision Recorded</SelectItem>
                    <SelectItem value="CASE_ASSIGNED">Case Assigned</SelectItem>
                    <SelectItem value="CASE_STATUS_CHANGED">Case Status Changed</SelectItem>
                    <SelectItem value="CASE_REOPENED">Case Reopened</SelectItem>
                    <SelectItem value="CLARIFICATION_REQUESTED">Clarification Requested</SelectItem>
                    <SelectItem value="CLARIFICATION_RESPONDED">Clarification Responded</SelectItem>
                    <SelectItem value="INTERVENTION_CREATED">Intervention Created</SelectItem>
                    <SelectItem value="DISCIPLINARY_ACTION_CREATED">Disciplinary Action Created</SelectItem>
                    <SelectItem value="FOLLOW_UP_ASSIGNED">Follow Up Assigned</SelectItem>
                    <SelectItem value="FOLLOW_UP_COMPLETED">Follow Up Completed</SelectItem>
                    <SelectItem value="USER_CREATED">User Created</SelectItem>
                    <SelectItem value="USER_ACCOUNT_APPROVED">User Account Approved</SelectItem>
                    <SelectItem value="USER_ACCOUNT_DEACTIVATED">User Account Deactivated</SelectItem>
                    <SelectItem value="STUDENT_CREATED">Student Created</SelectItem>
                    <SelectItem value="DATA_EXPORT">Data Export</SelectItem>
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
                    <SelectItem value="CASE_REVIEW">Case Review</SelectItem>
                    <SelectItem value="USER">User</SelectItem>
                    <SelectItem value="STUDENT">Student</SelectItem>
                    <SelectItem value="INTERVENTION">Intervention</SelectItem>
                    <SelectItem value="DISCIPLINARY_ACTION">Disciplinary Action</SelectItem>
                    <SelectItem value="FOLLOW_UP">Follow-up</SelectItem>
                    <SelectItem value="EXPORT">Export</SelectItem>
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
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
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
                <div className="overflow-hidden rounded-xl border border-slate-200">
                  <Table>
                    <TableHeader className="bg-slate-50/80">
                      <TableRow>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>Actor</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Target Type</TableHead>
                        <TableHead>Target ID</TableHead>
                        <TableHead>IP Address</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {auditEvents.map((event) => (
                        <TableRow key={event.id}>
                          <TableCell className="whitespace-nowrap text-sm tabular-nums text-slate-500">
                            {new Date(event.timestamp).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                          </TableCell>
                          <TableCell className="font-medium text-slate-900">{event.actor?.name || event.actorName || 'System'}</TableCell>
                          <TableCell>{getActionBadge(event.action)}</TableCell>
                          <TableCell className="text-xs font-medium uppercase tracking-wide text-slate-500">{event.targetType}</TableCell>
                          <TableCell><span className="block max-w-[10rem] truncate font-mono text-xs text-slate-500" title={event.targetId || ''}>{event.targetId || '—'}</span></TableCell>
                          <TableCell className="font-mono text-xs text-slate-500">{event.ipAddress || '—'}</TableCell>
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
