'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/status-badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/hooks/use-auth'
import { api } from '@/lib/api-client'
import { Search, Plus, ChevronLeft, ChevronRight, FolderSearch, ArrowRight } from 'lucide-react'

export default function CasesPage() {
  const router = useRouter()
  const { user: currentUser } = useAuth()
  const [cases, setCases] = useState<any[]>([])
  const [categories, setCategories] = useState<string[]>([])
  useEffect(() => {
    fetch('/api/configuration/INCIDENT_CATEGORIES')
      .then(r => r.json())
      .then(r => { if (r.success && Array.isArray(r.data?.value)) setCategories(r.data.value) })
      .catch(() => {})
  }, [])
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    search: '',
  })
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  })

  useEffect(() => {
    loadCases()
  }, [filters, pagination.page])

  const loadCases = async () => {
    setIsLoading(true)
    try {
      const params: any = {
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      }

      if (filters.search) params.search = filters.search
      if (filters.status) params.status = filters.status
      if (filters.category) params.category = filters.category

      const response = await api.getCases(params)
      if (response.success && response.data) {
        const casesData = Array.isArray(response.data) ? response.data : []
        setCases(casesData)
        if (response.pagination) {
          setPagination(response.pagination)
        }
      }
    } catch (error) {
      console.error('Failed to load cases:', error)
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="page-title">
              Cases
            </h1>
            <p className="mt-1 text-sm text-slate-500">View, filter and manage disciplinary cases</p>
          </div>
          {['PRINCIPAL','TEACHER'].includes(currentUser?.role || '') && <Button onClick={() => router.push('/cases/new')}>
            <Plus className="h-4 w-4" />
            New Case
          </Button>}
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-5">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Search</Label>
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    placeholder="Search by reference or description..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={filters.status}
                  onValueChange={(value) => handleFilterChange('status', value === 'all' ? '' : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="SUBMITTED">Submitted</SelectItem>
                    <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
                    <SelectItem value="CLARIFICATION_REQUIRED">Clarification Required</SelectItem>
                    <SelectItem value="ASSIGNED">Assigned</SelectItem>
                    <SelectItem value="ACTION_PENDING">Action Pending</SelectItem>
                    <SelectItem value="FOLLOW_UP_PENDING">Follow-up Pending</SelectItem>
                    <SelectItem value="REOPENED">Reopened</SelectItem>
                    <SelectItem value="REJECTED">Rejected</SelectItem>
                    <SelectItem value="CLOSED">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={filters.category}
                  onValueChange={(value) => handleFilterChange('category', value === 'all' ? '' : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cases Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">All Cases</CardTitle>
            <CardDescription>
              {pagination.total} total cases
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Skeleton className="h-10 w-10 rounded-full" />
              </div>
            ) : cases.length === 0 ? (
              <div className="text-center py-16">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
                  <FolderSearch className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold">No cases found</h3>
                <p className="text-muted-foreground mt-2">Try adjusting your filters or submit a new case.</p>
              </div>
            ) : (
              <>
                <div className="overflow-hidden rounded-xl border border-slate-200">
                  <Table>
                    <TableHeader className="bg-slate-50/80">
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Reference</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right"><span className="sr-only">Actions</span></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cases.map((caseItem) => (
                        <TableRow key={caseItem.id} className="group cursor-pointer" onClick={() => router.push(`/cases/${caseItem.id}`)}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-100 to-slate-200 text-xs font-semibold text-slate-600">
                                {(caseItem.student?.name || '?').split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                              </span>
                              <div className="min-w-0">
                                <p className="font-semibold text-slate-900">{caseItem.student?.name || '—'}</p>
                                <p className="text-xs text-slate-500">{caseItem.student?.studentId} · {caseItem.student?.classGrade}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell><span className="block max-w-[14rem] truncate font-mono text-xs text-slate-500" title={caseItem.referenceNumber}>{caseItem.referenceNumber}</span></TableCell>
                          <TableCell>{caseItem.category}</TableCell>
                          <TableCell className="whitespace-nowrap tabular-nums text-slate-500">{new Date(caseItem.incidentDate).toLocaleDateString()}</TableCell>
                          <TableCell><StatusBadge status={caseItem.status} /></TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => { e.stopPropagation(); router.push(`/cases/${caseItem.id}`) }}
                            >
                              View <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6 pt-4 border-t">
                    <p className="text-sm text-muted-foreground">
                      Page {pagination.page} of {pagination.totalPages} • {pagination.total} total cases
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
