'use client'

import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const NILMData = [
  { appliance: 'AC', power: 850, percentage: 35 },
  { appliance: 'Fridge', power: 520, percentage: 22 },
  { appliance: 'Heater', power: 480, percentage: 20 },
  { appliance: 'Lights', power: 240, percentage: 10 },
  { appliance: 'Other', power: 170, percentage: 13 }
]

export function NILMChart() {
  return (
    <div className="rounded-2xl border border-border bg-card/80 backdrop-blur-sm p-6 shadow-lg">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">Appliance-Level Load Disaggregation (NILM)</h3>
          <p className="text-sm text-muted-foreground">Estimated power consumption by appliance</p>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <RechartsBarChart data={NILMData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="appliance" stroke="var(--muted-foreground)" />
            <YAxis stroke="var(--muted-foreground)" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--card)',
                border: `1px solid var(--border)`,
                borderRadius: '0.75rem'
              }}
              labelStyle={{ color: 'var(--foreground)' }}
            />
            <Bar dataKey="power" fill="rgb(6, 182, 212)" radius={[8, 8, 0, 0]} />
          </RechartsBarChart>
        </ResponsiveContainer>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-4">
          {NILMData.map((item, i) => (
            <div key={i} className="p-3 rounded-lg bg-muted/50 border border-border">
              <p className="text-xs text-muted-foreground mb-1">{item.appliance}</p>
              <p className="text-lg font-bold">{item.percentage}%</p>
              <p className="text-xs text-muted-foreground">{item.power}W</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
