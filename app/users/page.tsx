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
import { api } from '@/lib/api-client'
import { Search, Filter, Plus, Shield, CheckCircle, Clock, XCircle } from 'lucide-react'

export default function UsersPage() {
  const router = useRouter()
  const [users, setUsers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState({
    status: '',
    role: '',
    search: '',
  })

  useEffect(() => {
    loadUsers()
  }, [filters])

  const loadUsers = async () => {
    setIsLoading(true)
    try {
      const params: any = {}
      if (filters.status) params.status = filters.status
      if (filters.role) params.role = filters.role
      if (filters.search) params.search = filters.search

      const response = await api.getUsers(params)
      if (response.success && response.data) {
        const usersData = Array.isArray(response.data) ? response.data : []
        setUsers(usersData)
      }
    } catch (error) {
      console.error('Failed to load users:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      ACTIVE: { variant: 'success', label: 'Active', icon: CheckCircle },
      PENDING: { variant: 'warning', label: 'Pending', icon: Clock },
      DEACTIVATED: { variant: 'default', label: 'Deactivated', icon: XCircle },
      REJECTED: { variant: 'danger', label: 'Rejected', icon: XCircle },
    }
    const config = variants[status] || { variant: 'gray', label: status, icon: null }
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        {config.icon && <config.icon className="h-3 w-3" />}
        {config.label}
      </Badge>
    )
  }

  const getRoleBadge = (role: string) => {
    const variants: Record<string, any> = {
      PRINCIPAL: { variant: 'info', label: 'Principal' },
      TEACHER: { variant: 'success', label: 'Teacher' },
      COUNSELLOR: { variant: 'warning', label: 'Counsellor' },
      ADMIN: { variant: 'danger', label: 'Admin' },
    }
    const config = variants[role] || { variant: 'gray', label: role }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleStatusUpdate = async (userId: string, newStatus: string) => {
    try {
      const response = await api.updateUserStatus(userId, newStatus)
      if (response.success) {
        loadUsers()
      }
    } catch (error) {
      console.error('Failed to update user status:', error)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Staff Management</h1>
            <p className="text-slate-600 mt-1">Manage staff accounts and approvals</p>
          </div>
          <Button onClick={() => router.push('/users/new')} className="shadow-lg shadow-emerald-500/25">
            <Plus className="mr-2 h-4 w-4" />
            Add Staff
          </Button>
        </div>

        {/* Filters */}
        <Card className="border-slate-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-800">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by name or email..."
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
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="DEACTIVATED">Deactivated</SelectItem>
                    <SelectItem value="REJECTED">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select
                  value={filters.role}
                  onValueChange={(value) => handleFilterChange('role', value === 'all' ? '' : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Roles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="PRINCIPAL">Principal</SelectItem>
                    <SelectItem value="TEACHER">Teacher</SelectItem>
                    <SelectItem value="COUNSELLOR">Counsellor</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card className="border-slate-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-800">All Staff</CardTitle>
            <CardDescription className="text-slate-500">{users.length} total staff members</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-emerald-600" />
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-12">
                <Shield className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-semibold text-gray-900">No staff found</h3>
                <p className="mt-1 text-sm text-gray-500">Try adjusting your filters or add new staff.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell>{getStatusBadge(user.accountStatus)}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {user.accountStatus === 'PENDING' && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleStatusUpdate(user.id, 'ACTIVE')}
                              >
                                Approve
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleStatusUpdate(user.id, 'REJECTED')}
                              >
                                Reject
                              </Button>
                            </>
                          )}
                          {user.accountStatus === 'ACTIVE' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleStatusUpdate(user.id, 'DEACTIVATED')}
                            >
                              Deactivate
                            </Button>
                          )}
                          {user.accountStatus === 'DEACTIVATED' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleStatusUpdate(user.id, 'ACTIVE')}
                            >
                              Reactivate
                            </Button>
                          )}
                        </div>
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
