"use client"

import React from "react"
import {
  LineChart as ReLineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts"

export function LineChart({
  title,
  data,
  color = "rgb(14,165,233)",
  height = 300,
}: {
  title: string
  data: any[]
  color?: string
  height?: number
}) {
  if (!data || data.length === 0) return null

  // Auto-scale Y axis
  const values = data.map((d) => d.value)
  const min = Math.min(...values)
  const max = Math.max(...values)

  // Add padding for visibility
  const padding = 5
  const domain = [
    Math.floor(min - padding),
    Math.ceil(max + padding),
  ]

  return (
    <div className="rounded-xl border p-4 shadow-sm bg-card">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>

      <ResponsiveContainer width="100%" height={height}>
        <ReLineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis dataKey="time" />
          <YAxis domain={domain} />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={3}
            dot={false}
          />
        </ReLineChart>
      </ResponsiveContainer>
    </div>
  )
}
