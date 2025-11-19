'use client'

interface PredictionCardProps {
  title: string
  value: string
  trend: 'up' | 'down' | 'stable'
  onAddEvent?: (type: 'alert' | 'info' | 'warning' | 'success', message: string) => void
}

export function PredictionCard({
  title,
  value,
  trend,
  onAddEvent
}: PredictionCardProps) {
  const trendIcon = trend === 'up' ? '📈' : trend === 'down' ? '📉' : '→'
  const trendColor = trend === 'up' ? 'text-yellow-600 dark:text-yellow-400' : trend === 'down' ? 'text-emerald-600 dark:text-emerald-400' : 'text-blue-600 dark:text-blue-400'

  return (
    <div className="rounded-2xl border border-border bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-accent/50">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{title}</h3>
        <span className="text-lg">{trendIcon}</span>
      </div>
      
      <div className="space-y-3">
        <div className="text-3xl font-bold tracking-tight">{value}</div>
        
        <div className="flex items-center gap-2 pt-2">
          <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
            <div className={`h-full w-2/3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full`}></div>
          </div>
          <span className={`text-xs font-medium ${trendColor}`}>ML Predicted</span>
        </div>

        <button
          onClick={() => onAddEvent?.('info', 'Prediction updated')}
          className="text-xs text-primary hover:underline mt-2"
        >
          View details →
        </button>
      </div>
    </div>
  )
}
