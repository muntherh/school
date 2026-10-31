'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { api } from '@/lib/api-client'
import { useAuth } from '@/hooks/use-auth'
import { ArrowLeft, Clock, User, FileText, AlertCircle, CheckCircle, MessageSquare, UserPlus } from 'lucide-react'

export default function CaseDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [caseData, setCaseData] = useState<any>(null)
  const [reviews, setReviews] = useState<any[]>([])
  const [actions, setActions] = useState<any[]>([])
  const [interventions, setInterventions] = useState<any[]>([])
  const [followUps, setFollowUps] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showClarificationForm, setShowClarificationForm] = useState(false)
  const [showAssignForm, setShowAssignForm] = useState(false)
  const [clarificationText, setClarificationText] = useState('')
  const [assignedToId, setAssignedToId] = useState('')
  const [rationale, setRationale] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    loadCaseData()
    loadUsers()
  }, [params.id])

  const loadCaseData = async () => {
    setIsLoading(true)
    try {
      const [caseResponse, reviewsResponse, actionsResponse, interventionsResponse, followUpsResponse] = await Promise.all([
        api.getCase(params.id as string),
        api.getCaseReviews(params.id as string),
        api.getCaseActions(params.id as string),
        api.getInterventions(params.id as string),
        api.getFollowUps(params.id as string),
      ])

      if (caseResponse.success && caseResponse.data) {
        setCaseData(caseResponse.data)
      }
      if (reviewsResponse.success && reviewsResponse.data) {
        setReviews(Array.isArray(reviewsResponse.data) ? reviewsResponse.data : [])
      }
      if (actionsResponse.success && actionsResponse.data) {
        setActions(Array.isArray(actionsResponse.data) ? actionsResponse.data : [])
      }
      if (interventionsResponse.success && interventionsResponse.data) {
        setInterventions(Array.isArray(interventionsResponse.data) ? interventionsResponse.data : [])
      }
      if (followUpsResponse.success && followUpsResponse.data) {
        setFollowUps(Array.isArray(followUpsResponse.data) ? followUpsResponse.data : [])
      }
    } catch (error) {
      console.error('Failed to load case data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadUsers = async () => {
    try {
      const response = await api.getUsers({ status: 'ACTIVE' })
      if (response.success && response.data) {
        setUsers(Array.isArray(response.data) ? response.data : [])
      }
    } catch (error) {
      console.error('Failed to load users:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      SUBMITTED: { variant: 'info', label: 'Submitted' },
      UNDER_REVIEW: { variant: 'warning', label: 'Under Review' },
      CLARIFICATION_REQUIRED: { variant: 'danger', label: 'Clarification Required' },
      ASSIGNED: { variant: 'success', label: 'Assigned' },
      ACTION_PENDING: { variant: 'warning', label: 'Action Pending' },
      FOLLOW_UP_PENDING: { variant: 'info', label: 'Follow-up Pending' },
      CLOSED: { variant: 'default', label: 'Closed' },
      REJECTED: { variant: 'danger', label: 'Rejected' },
    }
    const config = variants[status] || { variant: 'gray', label: status }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const handleRequestClarification = async () => {
    setError('')
    try {
      const response = await api.requestClarification(params.id as string, clarificationText)
      if (response.success) {
        setShowClarificationForm(false)
        setClarificationText('')
        loadCaseData()
      } else {
        setError(response.error?.message || 'Failed to request clarification')
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    }
  }

  const handleRespondToClarification = async () => {
    setError('')
    try {
      const response = await api.respondToClarification(params.id as string, clarificationText)
      if (response.success) {
        setShowClarificationForm(false)
        setClarificationText('')
        loadCaseData()
      } else {
        setError(response.error?.message || 'Failed to respond')
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    }
  }

  const handleAssignCase = async () => {
    setError('')
    try {
      const response = await api.assignCase(params.id as string, assignedToId, rationale)
      if (response.success) {
        setShowAssignForm(false)
        setAssignedToId('')
        setRationale('')
        loadCaseData()
      } else {
        setError(response.error?.message || 'Failed to assign case')
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    }
  }

  const canCreateReview = user?.role === 'PRINCIPAL'
  const canCreateIntervention = user?.role === 'PRINCIPAL' || user?.role === 'COUNSELLOR'
  const canCreateAction = user?.role === 'PRINCIPAL'
  const canAssign = user?.role === 'PRINCIPAL'
  const canRequestClarification = user?.role === 'PRINCIPAL'
  const canRespondToClarification = user?.role === 'TEACHER' && caseData?.status === 'CLARIFICATION_REQUIRED'

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
        </div>
      </DashboardLayout>
    )
  }

  if (!caseData) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">Case not found</h3>
          <Button onClick={() => router.push('/cases')} className="mt-4">
            Back to Cases
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              onClick={() => router.push('/cases')}
              className="text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                {caseData.referenceNumber}
              </h1>
              <p className="text-slate-600 mt-1">{caseData.category}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {getStatusBadge(caseData.status)}
            {caseData.assignedTo && (
              <Badge variant="success" className="bg-emerald-100 text-emerald-700 border-emerald-200">
                Assigned to {caseData.assignedTo.name}
              </Badge>
            )}
          </div>
        </div>

        {/* Case Details */}
        <Card className="border-slate-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-800">Case Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-slate-600 mb-1">Incident Date</p>
                <p className="text-lg font-semibold text-slate-900">{new Date(caseData.incidentDate).toLocaleDateString()}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-slate-600 mb-1">Reported On</p>
                <p className="text-lg font-semibold text-slate-900">{new Date(caseData.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="md:col-span-2 bg-slate-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-slate-600 mb-2">Description</p>
                <p className="text-lg text-slate-900 whitespace-pre-wrap leading-relaxed">{caseData.description}</p>
              </div>
              {caseData.location && (
                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-slate-600 mb-1">Location</p>
                  <p className="text-lg font-semibold text-slate-900">{caseData.location}</p>
                </div>
              )}
              {caseData.witnesses && (
                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-slate-600 mb-1">Witnesses</p>
                  <p className="text-lg font-semibold text-slate-900">{caseData.witnesses}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Workflow Actions */}
        <Card className="border-slate-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-800">Workflow Actions</CardTitle>
            <CardDescription className="text-slate-500">Available actions based on case status and your role</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {canRequestClarification && caseData.status !== 'CLARIFICATION_REQUIRED' && caseData.status !== 'CLOSED' && (
              <Button 
                onClick={() => setShowClarificationForm(!showClarificationForm)}
                className="shadow-md shadow-emerald-500/20"
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Request Clarification
              </Button>
            )}

            {canRespondToClarification && (
              <Button 
                onClick={() => setShowClarificationForm(!showClarificationForm)}
                className="shadow-md shadow-emerald-500/20"
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Respond to Clarification
              </Button>
            )}

            {canAssign && caseData.status !== 'CLOSED' && caseData.status !== 'ASSIGNED' && (
              <Button 
                onClick={() => setShowAssignForm(!showAssignForm)}
                className="shadow-md shadow-slate-500/20"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Assign Case
              </Button>
            )}

            {showClarificationForm && (
              <div className="border border-slate-200 rounded-xl p-6 space-y-4 bg-slate-50">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    {canRequestClarification ? 'Clarification Request' : 'Clarification Response'}
                  </label>
                  <textarea
                    className="flex min-h-[120px] w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm focus:border-blue-500 focus:ring-blue-500/20"
                    placeholder="Enter details..."
                    value={clarificationText}
                    onChange={(e) => setClarificationText(e.target.value)}
                  />
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}
                <div className="flex space-x-3">
                  <Button 
                    onClick={canRequestClarification ? handleRequestClarification : handleRespondToClarification}
                    className="shadow-md"
                  >
                    Submit
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowClarificationForm(false)}
                    className="border-slate-200 text-slate-700 hover:bg-slate-100"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {showAssignForm && (
              <div className="border border-slate-200 rounded-xl p-6 space-y-4 bg-slate-50">
                <Select
                  label="Assign To"
                  value={assignedToId}
                  onChange={(e) => setAssignedToId(e.target.value)}
                  options={[
                    { value: '', label: 'Select staff member' },
                    ...users.filter(u => ['PRINCIPAL', 'COUNSELLOR'].includes(u.role)).map(u => ({
                      value: u.id,
                      label: `${u.name} (${u.role})`
                    }))
                  ]}
                />
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Rationale</label>
                  <textarea
                    className="flex min-h-[100px] w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm focus:border-blue-500 focus:ring-blue-500/20"
                    placeholder="Why assign this case to this person?"
                    value={rationale}
                    onChange={(e) => setRationale(e.target.value)}
                  />
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}
                <div className="flex space-x-3">
                  <Button onClick={handleAssignCase} className="shadow-md">Assign</Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowAssignForm(false)}
                    className="border-slate-200 text-slate-700 hover:bg-slate-100"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Reviews */}
        {reviews.length > 0 && (
          <Card className="border-slate-200 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-800">Reviews</CardTitle>
              <CardDescription className="text-slate-500">Principal reviews and decisions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-slate-200 overflow-hidden">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead className="font-semibold text-slate-700">Date</TableHead>
                      <TableHead className="font-semibold text-slate-700">Reviewer</TableHead>
                      <TableHead className="font-semibold text-slate-700">Result</TableHead>
                      <TableHead className="font-semibold text-slate-700">Notes</TableHead>
                      <TableHead className="font-semibold text-slate-700">Clarification Request</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reviews.map((review) => (
                      <TableRow key={review.id} className="hover:bg-slate-50 transition-colors">
                        <TableCell className="text-slate-900">{new Date(review.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell className="text-slate-600">{review.reviewerName}</TableCell>
                        <TableCell>
                          <Badge variant={review.result === 'APPROVED' ? 'success' : 'warning'} className={review.result === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}>
                            {review.result}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-600">{review.notes}</TableCell>
                        <TableCell className="text-slate-600">{review.clarificationRequest}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Disciplinary Actions */}
        {actions.length > 0 && (
          <Card className="border-slate-200 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-800">Disciplinary Actions</CardTitle>
              <CardDescription className="text-slate-500">Actions taken for this case</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-slate-200 overflow-hidden">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead className="font-semibold text-slate-700">Action Type</TableHead>
                      <TableHead className="font-semibold text-slate-700">Description</TableHead>
                      <TableHead className="font-semibold text-slate-700">Status</TableHead>
                      <TableHead className="font-semibold text-slate-700">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {actions.map((action) => (
                      <TableRow key={action.id} className="hover:bg-slate-50 transition-colors">
                        <TableCell className="text-slate-900">{action.actionType}</TableCell>
                        <TableCell className="text-slate-600">{action.description}</TableCell>
                        <TableCell>
                          <Badge variant={action.status === 'COMPLETED' ? 'success' : 'warning'} className={action.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}>
                            {action.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-600">{new Date(action.createdAt).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Interventions */}
        {interventions.length > 0 && (
          <Card className="border-slate-200 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-800">Counselling Interventions</CardTitle>
              <CardDescription className="text-slate-500">Intervention records</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-slate-200 overflow-hidden">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead className="font-semibold text-slate-700">Type</TableHead>
                      <TableHead className="font-semibold text-slate-700">Date</TableHead>
                      <TableHead className="font-semibold text-slate-700">Notes</TableHead>
                      <TableHead className="font-semibold text-slate-700">Counsellor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {interventions.map((intervention) => (
                      <TableRow key={intervention.id} className="hover:bg-slate-50 transition-colors">
                        <TableCell className="text-slate-900">{intervention.type}</TableCell>
                        <TableCell className="text-slate-600">{new Date(intervention.interventionDate).toLocaleDateString()}</TableCell>
                        <TableCell className="text-slate-600">{intervention.notes}</TableCell>
                        <TableCell className="text-slate-600">{intervention.counsellorName}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Follow-ups */}
        {followUps.length > 0 && (
          <Card className="border-slate-200 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-800">Follow-ups</CardTitle>
              <CardDescription className="text-slate-500">Follow-up activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-slate-200 overflow-hidden">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead className="font-semibold text-slate-700">Due Date</TableHead>
                      <TableHead className="font-semibold text-slate-700">Status</TableHead>
                      <TableHead className="font-semibold text-slate-700">Notes</TableHead>
                      <TableHead className="font-semibold text-slate-700">Completed Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {followUps.map((followUp) => (
                      <TableRow key={followUp.id} className="hover:bg-slate-50 transition-colors">
                        <TableCell className="text-slate-900">{new Date(followUp.dueDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge variant={followUp.status === 'COMPLETED' ? 'success' : 'warning'} className={followUp.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}>
                            {followUp.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-600">{followUp.notes}</TableCell>
                        <TableCell className="text-slate-600">
                          {followUp.completedAt ? new Date(followUp.completedAt).toLocaleDateString() : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Additional Action Buttons */}
        <Card className="border-slate-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-800">Additional Actions</CardTitle>
            <CardDescription className="text-slate-500">More actions for this case</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {canCreateReview && caseData.status !== 'CLOSED' && (
              <Button 
                onClick={() => router.push(`/cases/${caseData.id}/review`)}
                className="shadow-md shadow-emerald-500/20"
              >
                <FileText className="mr-2 h-4 w-4" />
                Add Review
              </Button>
            )}
            {canCreateIntervention && caseData.status !== 'CLOSED' && (
              <Button 
                onClick={() => router.push(`/cases/${caseData.id}/intervention`)}
                className="shadow-md shadow-slate-500/20"
              >
                <User className="mr-2 h-4 w-4" />
                Add Intervention
              </Button>
            )}
            {canCreateAction && caseData.status !== 'CLOSED' && (
              <Button 
                onClick={() => router.push(`/cases/${caseData.id}/action`)}
                className="shadow-md shadow-gray-500/20"
              >
                <AlertCircle className="mr-2 h-4 w-4" />
                Add Disciplinary Action
              </Button>
            )}
            {canCreateIntervention && caseData.status !== 'CLOSED' && (
              <Button 
                onClick={() => router.push(`/cases/${caseData.id}/follow-up`)}
                className="shadow-md shadow-teal-500/20"
              >
                <Clock className="mr-2 h-4 w-4" />
                Add Follow-up
              </Button>
            )}
            {user?.role === 'PRINCIPAL' && caseData.status === 'CLOSED' && (
              <Button 
                onClick={() => router.push(`/cases/${caseData.id}/reopen`)}
                variant="outline"
                className="border-slate-200 text-slate-700 hover:bg-slate-100"
              >
                Reopen Case
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
