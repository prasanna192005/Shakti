'use client'

import { useState } from 'react'

interface Rule {
  id: number
  condition: string
  action: string
  enabled: boolean
  trigger?: string
}

interface AutomationRulesProps {
  onAddEvent?: (type: 'alert' | 'info' | 'warning' | 'success', message: string) => void
}

export function AutomationRules({ onAddEvent }: AutomationRulesProps) {
  const [rules, setRules] = useState<Rule[]>([
    { id: 1, condition: 'Power > 2000W', action: 'Show Alert', enabled: true, trigger: 'Active' },
    { id: 2, condition: 'Voltage < 170V', action: 'Turn Off Relay', enabled: true },
    { id: 3, condition: 'Grid Offline', action: 'Enable Backup', enabled: false },
    { id: 4, condition: 'Temperature > 80°C', action: 'Reduce Load', enabled: true },
  ])

  const toggleRule = (id: number) => {
    setRules((prev) =>
      prev.map((rule) =>
        rule.id === id
          ? { ...rule, enabled: !rule.enabled }
          : rule
      )
    )
    const rule = rules.find((r) => r.id === id)
    onAddEvent?.('info', `Rule "${rule?.condition}" toggled`)
  }

  return (
    <div className="rounded-2xl border border-border bg-card/80 backdrop-blur-sm p-6 shadow-lg">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Automation Rules</h3>
            <p className="text-sm text-muted-foreground">Manage automated grid actions</p>
          </div>
          <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
            + Add Rule
          </button>
        </div>

        <div className="space-y-2">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className={`p-4 rounded-lg border transition-all ${
                rule.enabled
                  ? 'border-border bg-muted/30'
                  : 'border-border/50 bg-muted/10 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <p className="font-semibold text-sm">{rule.condition}</p>
                    {rule.trigger && (
                      <span className="px-2 py-1 rounded text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200">
                        {rule.trigger}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Action: {rule.action}</p>
                </div>
                <button
                  onClick={() => toggleRule(rule.id)}
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                    rule.enabled ? 'bg-green-500' : 'bg-muted'
                  }`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${
                      rule.enabled ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
