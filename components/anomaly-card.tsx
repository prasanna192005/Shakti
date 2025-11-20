'use client'

import { useState } from 'react'

export type AnomalyItem = {
  id: string
  type: string
  severity: 'critical' | 'warning' | 'info'
  explanation?: string
  timestamp?: string
}

interface AnomalyCardProps {
  anomalies: AnomalyItem[]
  onAddEvent?: (type: 'alert' | 'info' | 'warning' | 'success', msg: string) => void
}

function severityColor(sev: AnomalyItem['severity']) {
  switch (sev) {
    case 'critical': return 'bg-red-100 text-red-800 border-red-200'
    case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    default: return 'bg-sky-100 text-sky-800 border-sky-200'
  }
}

export default function AnomalyCard({ anomalies, onAddEvent }: AnomalyCardProps) {
  const [openMap, setOpenMap] = useState<Record<string, boolean>>({})

  if (!anomalies || anomalies.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-6 text-center text-muted-foreground">
        No anomalies detected
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {anomalies.map((an) => {
        const isOpen = !!openMap[an.id]

        return (
          <div key={an.id} className="bg-card border border-border rounded-lg p-4 shadow-sm">
            <div className="flex items-start justify-between gap-4">

              {/* Left Section */}
              <div className="flex items-start gap-3">
                <div
                  className={`px-3 py-1 rounded-full text-sm font-medium border ${severityColor(an.severity)}`}
                >
                  {an.severity.toUpperCase()}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-lg font-semibold">{an.type}</h4>
                    {an.timestamp && (
                      <span className="text-xs text-muted-foreground">
                        {new Date(an.timestamp).toLocaleString()}
                      </span>
                    )}
                  </div>

                  {/* Short explanation preview */}
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {an.explanation ?? 'No explanation available.'}
                  </p>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() =>
                    setOpenMap((prev) => ({ ...prev, [an.id]: !prev[an.id] }))
                  }
                  className="text-sm text-muted-foreground hover:text-foreground transition"
                >
                  {isOpen ? 'Hide Explanation' : 'Explain'}
                </button>

                <button
                  onClick={() =>
                    onAddEvent &&
                    onAddEvent(
                      an.severity === 'critical'
                        ? 'alert'
                        : an.severity === 'warning'
                        ? 'warning'
                        : 'info',
                      `${an.type} acknowledged`
                    )
                  }
                  className="px-3 py-1 bg-gray-100 rounded text-sm hover:bg-gray-200 transition text-black"
                >
                  Acknowledge
                </button>
              </div>
            </div>

            {/* Explanation Panel */}
            {isOpen && (
              <div className="mt-3 border-t pt-3 text-sm text-muted-foreground whitespace-pre-wrap">
                {an.explanation}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
