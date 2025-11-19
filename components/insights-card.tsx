'use client'

export function InsightsCard() {
  const insights = [
    { icon: '⚡', title: 'Peak Hours Detected', description: 'Load peaks between 6-9 PM', reason: 'Evening consumption' },
    { icon: '🔋', title: 'Efficiency Opportunity', description: 'Solar generation available', reason: 'Daytime production' },
    { icon: '📊', title: 'Load Trend', description: 'Increasing 2% week-over-week', reason: 'Growing demand' },
  ]

  return (
    <div className="rounded-2xl border border-border bg-card/80 backdrop-blur-sm p-6 shadow-lg">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Energy Insights & Recommendations</h3>

        <div className="space-y-3">
          {insights.map((insight, i) => (
            <div key={i} className="p-4 rounded-lg bg-muted/30 border border-border/50 hover:border-primary/50 transition-colors">
              <div className="flex gap-3">
                <span className="text-2xl flex-shrink-0">{insight.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{insight.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{insight.description}</p>
                  <div className="mt-2 inline-flex px-2 py-1 rounded text-xs bg-primary/10 text-primary font-medium">
                    {insight.reason}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
          <p className="text-xs font-semibold mb-2">Recommended Actions:</p>
          <ul className="text-xs space-y-1 text-muted-foreground">
            <li>• Shift flexible loads to off-peak hours</li>
            <li>• Check for efficiency improvements during peak</li>
            <li>• Enable solar priority mode for next 2 hours</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
