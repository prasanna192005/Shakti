'use client'

import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface DataPoint {
  time: string
  value: number
}

interface LineChartProps {
  title: string
  data: DataPoint[]
  color: string
}

export function LineChart({ title, data, color }: LineChartProps) {
  return (
    <div className="rounded-2xl border border-border bg-card/80 backdrop-blur-sm p-6 shadow-lg">
      <h3 className="text-lg font-semibold mb-6">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <RechartsLineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="time" stroke="var(--muted-foreground)" />
          <YAxis stroke="var(--muted-foreground)" />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--card)',
              border: `1px solid var(--border)`,
              borderRadius: '0.75rem',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
            }}
            labelStyle={{ color: 'var(--foreground)' }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            dot={false}
            strokeWidth={3}
            isAnimationActive={true}
            animationDuration={1000}
          />
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  )
}
