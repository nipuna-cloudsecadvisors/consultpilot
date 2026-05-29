import { cn } from '@/lib/utils'

const CONFIG: Record<string, { label: string; cls: string }> = {
  // Client
  active:      { label: 'Active',       cls: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  prospect:    { label: 'Prospect',     cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  inactive:    { label: 'Inactive',     cls: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' },
  // Engagement / Project
  planning:    { label: 'Planning',     cls: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' },
  in_progress: { label: 'In Progress',  cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  review:      { label: 'In Review',    cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  in_review:   { label: 'In Review',    cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  completed:   { label: 'Completed',    cls: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  on_hold:     { label: 'On Hold',      cls: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  // Control
  not_started: { label: 'Not Started',  cls: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' },
  done:        { label: 'Done',         cls: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  na:          { label: 'N/A',          cls: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500' },
  // Finding severity
  critical:    { label: 'Critical',     cls: 'bg-red-200 text-red-800 dark:bg-red-900/50 dark:text-red-300' },
  high:        { label: 'High',         cls: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
  medium:      { label: 'Medium',       cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  low:         { label: 'Low',          cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  info:        { label: 'Info',         cls: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' },
  // Finding status
  open:        { label: 'Open',         cls: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  resolved:    { label: 'Resolved',     cls: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  accepted:    { label: 'Accepted',     cls: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' },
  // Report
  draft:       { label: 'Draft',        cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  final:       { label: 'Final',        cls: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  // Notification
  pending:     { label: 'Pending',      cls: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' },
  sent:        { label: 'Sent',         cls: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  failed:      { label: 'Failed',       cls: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
}

export function StatusBadge({ status }: { status: string }) {
  const c = CONFIG[status] ?? { label: status, cls: 'bg-gray-100 text-gray-600' }
  return (
    <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', c.cls)}>
      {c.label}
    </span>
  )
}
