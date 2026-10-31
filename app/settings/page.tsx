'use client'

import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { api } from '@/lib/api-client'
import { Settings, Save, RefreshCw } from 'lucide-react'

export default function SettingsPage() {
  const [configurations, setConfigurations] = useState<Record<string, any>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadConfigurations()
  }, [])

  const loadConfigurations = async () => {
    setIsLoading(true)
    try {
      const response = await api.getConfiguration()
      if (response.success && response.data) {
        setConfigurations(response.data)
      }
    } catch (error) {
      console.error('Failed to load configurations:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdate = async (key: string, value: any) => {
    setIsSaving(true)
    setMessage('')
    try {
      const response = await api.updateConfiguration(key, value)
      if (response.success) {
        setConfigurations(prev => ({ ...prev, [key]: value }))
        setMessage('Configuration updated successfully')
        setTimeout(() => setMessage(''), 3000)
      } else {
        setMessage('Failed to update configuration')
      }
    } catch (error) {
      console.error('Failed to update configuration:', error)
      setMessage('Failed to update configuration')
    } finally {
      setIsSaving(false)
    }
  }

  const configSections = [
    {
      title: 'General Settings',
      category: 'general',
      fields: [
        { key: 'schoolName', label: 'School Name', type: 'text' },
        { key: 'schoolAddress', label: 'School Address', type: 'text' },
        { key: 'schoolPhone', label: 'School Phone', type: 'text' },
        { key: 'schoolEmail', label: 'School Email', type: 'email' },
      ],
    },
    {
      title: 'Case Management',
      category: 'cases',
      fields: [
        { key: 'defaultCategory', label: 'Default Category', type: 'text' },
        { key: 'autoAssignPrincipal', label: 'Auto-assign to Principal', type: 'boolean' },
        { key: 'requireClarificationTimeout', label: 'Clarification Timeout (days)', type: 'number' },
      ],
    },
    {
      title: 'Security',
      category: 'security',
      fields: [
        { key: 'sessionTimeout', label: 'Session Timeout (minutes)', type: 'number' },
        { key: 'maxLoginAttempts', label: 'Max Login Attempts', type: 'number' },
        { key: 'passwordMinLength', label: 'Minimum Password Length', type: 'number' },
      ],
    },
    {
      title: 'Notifications',
      category: 'notifications',
      fields: [
        { key: 'emailNotificationsEnabled', label: 'Email Notifications', type: 'boolean' },
        { key: 'notificationEmail', label: 'Notification Email', type: 'email' },
      ],
    },
  ]

  const renderField = (key: string, label: string, type: string, value: any) => {
    const handleChange = (newValue: any) => {
      handleUpdate(key, newValue)
    }

    switch (type) {
      case 'boolean':
        return (
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id={key}
              checked={value === true}
              onChange={(e) => handleChange(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
            />
            <Label htmlFor={key} className="cursor-pointer">
              {value === true ? 'Enabled' : 'Disabled'}
            </Label>
          </div>
        )
      case 'number':
        return (
          <Input
            type="number"
            value={value || ''}
            onChange={(e) => handleChange(e.target.value ? Number(e.target.value) : null)}
            className="w-full"
          />
        )
      case 'textarea':
        return (
          <Textarea
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            rows={3}
          />
        )
      default:
        return (
          <Input
            type={type}
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            className="w-full"
          />
        )
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Settings
            </h1>
            <p className="text-muted-foreground mt-1">Manage system configuration</p>
          </div>
          <Button
            variant="outline"
            onClick={loadConfigurations}
            disabled={isLoading}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {message && (
          <div className={`p-3 rounded-lg border ${
            message.includes('success')
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            {message}
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-emerald-600" />
          </div>
        ) : (
          <div className="space-y-6">
            {configSections.map((section) => (
              <Card key={section.category} className="border-slate-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-slate-800">
                    {section.title}
                  </CardTitle>
                  <CardDescription className="text-slate-500">
                    Configure {section.title.toLowerCase()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {section.fields.map((field) => (
                      <div key={field.key} className="space-y-2">
                        <Label htmlFor={field.key}>{field.label}</Label>
                        {renderField(
                          field.key,
                          field.label,
                          field.type,
                          configurations[field.key]
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}

            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-blue-900 flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  System Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-blue-800">
                  <div className="flex justify-between">
                    <span>Version:</span>
                    <Badge variant="outline">1.0.0 (MVP)</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Environment:</span>
                    <Badge variant="outline">{process.env.NODE_ENV || 'development'}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Database:</span>
                    <Badge variant="outline">PostgreSQL</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
