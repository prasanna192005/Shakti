'use client'

import { useEffect, useState } from 'react'

interface GaugeComponentProps {
  title: string
  value: number
  max: number
  unit: string
  color: string
  decimals?: number
}

export function GaugeComponent({
  title,
  value,
  max,
  unit,
  color,
  decimals = 1
}: GaugeComponentProps) {
  const percentage = (value / max) * 100
  const rotation = (percentage / 100) * 180 - 90

  const getStatusColor = () => {
    if (percentage > 90) return 'text-red-500'
    if (percentage > 75) return 'text-yellow-500'
    return 'text-emerald-500'
  }

  return (
    <div className="rounded-2xl border border-border bg-card/80 backdrop-blur-sm p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
      <h3 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wide">{title}</h3>
      
      <div className="relative flex flex-col items-center justify-center mb-6">
        {/* Gauge Background */}
        <div className="relative w-48 h-24">
          {/* Gauge Track */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 100">
            {/* Background Arc */}
            <path
              d="M 30 100 A 70 70 0 0 1 170 100"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-muted"
            />
            {/* Value Arc */}
            <path
              d="M 30 100 A 70 70 0 0 1 170 100"
              fill="none"
              stroke="url(#gaugeGradient)"
              strokeWidth="8"
              strokeDasharray={`${(percentage / 100) * 220} 220`}
              className="transition-all duration-500"
            />
            <defs>
              <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgb(6, 182, 212)" />
                <stop offset="50%" stopColor="rgb(59, 130, 246)" />
                <stop offset="100%" stopColor="rgb(147, 51, 234)" />
              </linearGradient>
            </defs>
            {/* Needle */}
            <line
              x1="100"
              y1="100"
              x2={100 + Math.cos((rotation * Math.PI) / 180) * 60}
              y2={100 + Math.sin((rotation * Math.PI) / 180) * 60}
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              className="text-foreground transition-all duration-300"
            />
            <circle cx="100" cy="100" r="6" fill="currentColor" className="text-foreground" />
          </svg>
        </div>

        {/* Value Display */}
        <div className="text-center mt-4">
          <div className={`text-3xl font-bold ${getStatusColor()} transition-colors duration-300`}>
            {value.toFixed(decimals)}
          </div>
          <div className="text-sm text-muted-foreground">{unit}</div>
        </div>
      </div>

      {/* Status Indicator */}
      <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t border-border/50">
        <span>0 {unit}</span>
        <span className={`inline-block w-2 h-2 rounded-full ${getStatusColor().replace('text-', 'bg-')}`}></span>
        <span>{max} {unit}</span>
      </div>
    </div>
  )
}
