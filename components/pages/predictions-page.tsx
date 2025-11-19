'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/sidebar'
import { Navbar } from '@/components/navbar'
import { PredictionCard } from '@/components/prediction-card'

export function PredictionsPage({ onNavigate, onLogout, currentPage }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const predictions = [
    { title: 'Peak Load (Next 6 Hours)', value: '285 kW', trend: 'up', change: '+8% from average' },
    { title: 'Energy Demand (Tomorrow)', value: '450 kWh', trend: 'down', change: '-3% from yesterday' },
    { title: 'Grid Stability Index', value: '94%', trend: 'stable', change: 'Within normal range' },
    { title: 'Renewable Generation (4h)', value: '120 kW', trend: 'up', change: 'Solar peak expected' },
  ]

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} onLogout={onLogout} onNavigate={onNavigate} currentPage={currentPage} />

      <div className="flex-1 flex flex-col w-full md:pl-64">
        <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} onLogout={onLogout} />

        <main className="p-6 space-y-6 flex-1 overflow-auto">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Predictive Analytics</h2>
            <p className="text-muted-foreground">AI-powered forecasting and trend analysis</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {predictions.map((pred, idx) => (
              <div key={idx} className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">{pred.title}</h3>
                <div className="text-2xl font-bold mb-2">{pred.value}</div>
                <p className="text-sm text-muted-foreground">{pred.change}</p>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}
