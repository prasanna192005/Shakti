interface MetricCardProps {
  title: string
  value: string
  change?: string
  status?: 'online' | 'offline'
  icon?: string
}

export function MetricCard({
  title,
  value,
  change,
  status,
  icon,
}: MetricCardProps) {
  return (
    <div className="rounded-2xl border border-border bg-card/80 backdrop-blur-sm p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-primary/50">
      <div className="flex items-start justify-between mb-4">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{title}</h3>
        </div>
        {icon ? <span className="text-2xl">{icon}</span> : <span className="text-2xl" aria-hidden="true"></span>}
      </div>
      
      <div className="space-y-3">
        <div className="text-3xl font-bold tracking-tight">{value}</div>
        
        {status && (
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${status === 'online' ? 'bg-emerald-500 animate-pulse-glow' : 'bg-red-500'}`}></div>
            <span className={`text-xs font-medium ${status === 'online' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
              {status === 'online' ? 'System Operational' : 'System Down'}
            </span>
          </div>
        )}
        
        {change && (
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">{change}</p>
        )}
      </div>
    </div>
  )
}
