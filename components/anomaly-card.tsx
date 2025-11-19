'use client'

interface Anomaly {
  type: string
  severity: 'critical' | 'warning' | 'info'
}

interface AnomalyCardProps {
  anomalies: Anomaly[]
  onAddEvent?: (type: 'alert' | 'info' | 'warning' | 'success', message: string) => void
}

export function AnomalyCard({ anomalies, onAddEvent }: AnomalyCardProps) {
  const anomalyLabels: Record<string, { label: string; emoji: string }> = {
    energy_theft: { label: 'Energy Theft', emoji: '⚠️' },
    broken_meter: { label: 'Broken Meter', emoji: '🔧' },
    stuck_meter: { label: 'Stuck Meter', emoji: '⏹️' },
    high_voltage: { label: 'High Voltage', emoji: '⚡' }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200 border-red-300 dark:border-red-700'
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200 border-yellow-300 dark:border-yellow-700'
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200 border-blue-300 dark:border-blue-700'
    }
  }

  const handleSendAlert = () => {
    const recipient = 'prasanna.pandharikar22@spit.ac.in'
    const subject = 'Shakti Smart Energy Grid - Critical Grid Alert'
    const body = `Anomalies detected: ${anomalies.map(a => a.type).join(', ')}`

    onAddEvent?.('alert', `Sending email to ${recipient}...`)

    // Call server API to send email via SMTP with structured anomaly details
    fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipient, subject, text: body, anomalies }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text()
          throw new Error(text || 'Failed to send email')
        }
        onAddEvent?.('info', `Alert email delivered to ${recipient}`)
      })
      .catch((err) => {
        console.error('Email send error:', err)
        onAddEvent?.('warning', `Failed to send alert email: ${err.message}`)
      })
  }

  return (
    <div className="rounded-2xl border border-border bg-card/80 backdrop-blur-sm p-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <span>🔍</span>
          Anomaly Detection Status
        </h3>
        {anomalies.length > 0 && (
          <button
            onClick={handleSendAlert}
            className="px-3 py-1 rounded-lg text-xs font-medium bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
          >
            Send Email Alert
          </button>
        )}
      </div>
      
      {anomalies.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-2xl mb-2">✅</div>
          <p className="text-muted-foreground">No anomalies detected. Grid operating normally.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {anomalies.map((anomaly, i) => {
            const info = anomalyLabels[anomaly.type] || { label: anomaly.type, emoji: '⚠️' }
            return (
              <div
                key={i}
                className={`p-4 rounded-lg border ${getSeverityColor(anomaly.severity)} flex items-center gap-3 animate-slide-in`}
              >
                <span className="text-xl">{info.emoji}</span>
                <div className="flex-1">
                  <p className="font-semibold text-sm">{info.label}</p>
                  <p className="text-xs opacity-75 capitalize">{anomaly.severity}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
