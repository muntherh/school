import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type Variant = 'info' | 'warning' | 'destructive' | 'success' | 'gray' | 'violet' | 'secondary'

const STATUS: Record<string, { label: string; variant: Variant; dot: string }> = {
  SUBMITTED: { label: 'Submitted', variant: 'info', dot: 'bg-sky-500' },
  UNDER_REVIEW: { label: 'Under Review', variant: 'warning', dot: 'bg-amber-500' },
  CLARIFICATION_REQUIRED: { label: 'Clarification Required', variant: 'destructive', dot: 'bg-red-500' },
  ASSIGNED: { label: 'Assigned', variant: 'success', dot: 'bg-emerald-500' },
  ACTION_PENDING: { label: 'Action Pending', variant: 'warning', dot: 'bg-amber-500' },
  FOLLOW_UP_PENDING: { label: 'Follow-up Pending', variant: 'violet', dot: 'bg-violet-500' },
  REOPENED: { label: 'Reopened', variant: 'info', dot: 'bg-sky-500' },
  REJECTED: { label: 'Rejected', variant: 'destructive', dot: 'bg-red-500' },
  CLOSED: { label: 'Closed', variant: 'gray', dot: 'bg-slate-400' },
  // Review results / action / follow-up states
  APPROVED: { label: 'Approved', variant: 'success', dot: 'bg-emerald-500' },
  PENDING: { label: 'Pending', variant: 'warning', dot: 'bg-amber-500' },
  IN_PROGRESS: { label: 'In Progress', variant: 'info', dot: 'bg-sky-500' },
  COMPLETED: { label: 'Completed', variant: 'success', dot: 'bg-emerald-500' },
  OVERDUE: { label: 'Overdue', variant: 'destructive', dot: 'bg-red-500' },
  CANCELLED: { label: 'Cancelled', variant: 'gray', dot: 'bg-slate-400' },
  // Account states
  ACTIVE: { label: 'Active', variant: 'success', dot: 'bg-emerald-500' },
  DEACTIVATED: { label: 'Deactivated', variant: 'gray', dot: 'bg-slate-400' },
}

export function humanize(value: string) {
  return value
    .toLowerCase()
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

export function statusLabel(status: string) {
  return STATUS[status]?.label ?? humanize(status)
}

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const config = STATUS[status] ?? { label: humanize(status), variant: 'secondary' as Variant, dot: 'bg-slate-400' }
  return (
    <Badge variant={config.variant} className={cn('gap-1.5', className)}>
      <span aria-hidden className={cn('h-1.5 w-1.5 rounded-full', config.dot)} />
      {config.label}
    </Badge>
  )
}
