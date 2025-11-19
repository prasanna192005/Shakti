'use client'

interface Event {
  id: number
  timestamp: Date
  type: 'alert' | 'info' | 'warning' | 'success'
  message: string
}

interface EventLogProps {
  events: Event[]
}

export function EventLog({ events }: EventLogProps) {
  const getEventColor = (type: string) => {
    switch (type) {
      case 'alert':
        return 'text-red-600 dark:text-red-400'
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400'
      case 'success':
        return 'text-green-600 dark:text-green-400'
      default:
        return 'text-blue-600 dark:text-blue-400'
    }
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'alert':
        return '🚨'
      case 'warning':
        return '⚠️'
      case 'success':
        return '✅'
      default:
        return 'ℹ️'
    }
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins}m ago`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="rounded-2xl border border-border bg-card/80 backdrop-blur-sm p-6 shadow-lg">
      <h3 className="text-lg font-semibold mb-4">Event Log</h3>
      
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {events.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No events logged</p>
        ) : (
          events.map((event, idx) => (
            <div key={`${event.id}-${event.timestamp.getTime()}-${idx}`} className="flex gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
              <span className="text-lg flex-shrink-0">{getEventIcon(event.type)}</span>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${getEventColor(event.type)}`}>{event.message}</p>
                <p className="text-xs text-muted-foreground mt-1">{formatTime(event.timestamp)}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
