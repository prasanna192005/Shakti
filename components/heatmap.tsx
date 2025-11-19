'use client'

export function Heatmap() {
  // Generate mock heatmap data (7 days x 24 hours)
  const generateHeatmapData = () => {
    return Array.from({ length: 7 }, (_, day) =>
      Array.from({ length: 24 }, (_, hour) => ({
        day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][day],
        hour,
        value: 40 + Math.random() * 50,
      }))
    ).flat()
  }

  const data = generateHeatmapData()

  const getColor = (value: number) => {
    if (value > 80) return 'bg-red-500'
    if (value > 60) return 'bg-orange-500'
    if (value > 40) return 'bg-yellow-500'
    if (value > 20) return 'bg-green-500'
    return 'bg-blue-500'
  }

  return (
    <div className="rounded-2xl border border-border bg-card/80 backdrop-blur-sm p-6 shadow-lg">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Energy Consumption Heatmap</h3>
          <p className="text-sm text-muted-foreground">Daily hourly energy usage pattern</p>
        </div>

        <div className="overflow-x-auto">
          <div className="space-y-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
              <div key={day} className="flex gap-1">
                <div className="w-10 flex items-center justify-center text-xs font-semibold text-muted-foreground">
                  {day}
                </div>
                <div className="flex gap-1 flex-wrap">
                  {Array.from({ length: 24 }, (_, hour) => {
                    const value = 40 + Math.random() * 50
                    return (
                      <div
                        key={hour}
                        className={`w-6 h-6 rounded-sm ${getColor(value)} hover:ring-2 hover:ring-primary transition-all cursor-pointer`}
                        title={`${hour}:00 - ${value.toFixed(0)}W`}
                      />
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs pt-4 border-t border-border/50">
          <span className="text-muted-foreground">Low</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded-sm bg-blue-500" />
            <div className="w-3 h-3 rounded-sm bg-green-500" />
            <div className="w-3 h-3 rounded-sm bg-yellow-500" />
            <div className="w-3 h-3 rounded-sm bg-orange-500" />
            <div className="w-3 h-3 rounded-sm bg-red-500" />
          </div>
          <span className="text-muted-foreground">High</span>
        </div>
      </div>
    </div>
  )
}
