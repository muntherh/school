'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useAuth } from '@/hooks/use-auth'
import { api } from '@/lib/api-client'
import { Search, Filter, Plus, User } from 'lucide-react'

export default function StudentsPage() {
  const router = useRouter()
  const { user: currentUser } = useAuth()
  const [students, setStudents] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState({
    studentId: '',
    name: '',
    classGrade: '',
    activeStatus: '',
  })

  useEffect(() => {
    loadStudents()
  }, [filters])

  const loadStudents = async () => {
    setIsLoading(true)
    try {
      const params: any = {}
      if (filters.studentId) params.studentId = filters.studentId
      if (filters.name) params.name = filters.name
      if (filters.classGrade) params.classGrade = filters.classGrade
      if (filters.activeStatus) params.activeStatus = filters.activeStatus

      const response = await api.searchStudents(params)
      if (response.success && response.data) {
        const studentsData = Array.isArray(response.data) ? response.data : []
        setStudents(studentsData)
      }
    } catch (error) {
      console.error('Failed to load students:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (activeStatus: boolean) => <Badge variant={activeStatus ? 'success' : 'gray'}>{activeStatus ? 'Active' : 'Inactive'}</Badge>

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">Students</h1>
            <p className="text-slate-600 mt-1">Search and view student information</p>
          </div>
          {currentUser?.role === 'PRINCIPAL' && <Button onClick={() => router.push('/students/new')} className="shadow-lg shadow-emerald-500/25">
            <Plus className="mr-2 h-4 w-4" />
            Add Student
          </Button>}
        </div>

        {/* Filters */}
        <Card className="border-slate-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-800">Search Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <Label>Student ID</Label>
                <Input
                  placeholder="e.g., STU001"
                  value={filters.studentId}
                  onChange={(e) => handleFilterChange('studentId', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  placeholder="Search by name..."
                  value={filters.name}
                  onChange={(e) => handleFilterChange('name', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Class Grade</Label>
                <Input
                  placeholder="e.g., 10A"
                  value={filters.classGrade}
                  onChange={(e) => handleFilterChange('classGrade', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={filters.activeStatus}
                  onValueChange={(value) => handleFilterChange('activeStatus', value === 'all' ? '' : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Students Table */}
        <Card className="border-slate-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-800">Student Records</CardTitle>
            <CardDescription className="text-slate-500">{students.length} students found</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-emerald-600" />
              </div>
            ) : students.length === 0 ? (
              <div className="text-center py-12">
                <User className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-semibold text-gray-900">No students found</h3>
                <p className="mt-1 text-sm text-gray-500">Try adjusting your search filters.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Class Grade</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.studentId}</TableCell>
                      <TableCell>{student.name}</TableCell>
                      <TableCell>{student.classGrade}</TableCell>
                      <TableCell>{getStatusBadge(student.activeStatus)}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/students/${student.id}`)}
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
