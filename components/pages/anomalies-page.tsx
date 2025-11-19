'use client'

import { Sidebar } from '@/components/sidebar'
import { Navbar } from '@/components/navbar'
import { AnomalyCard } from '@/components/anomaly-card'
import { useState } from 'react'

export function AnomaliesPage({ onNavigate, onLogout, currentPage, anomalies, onTrigger, onAddEvent }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} onLogout={onLogout} onNavigate={onNavigate} currentPage={currentPage} />

      <div className="flex-1 flex flex-col w-full md:pl-64">
        <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} onLogout={onLogout} />

        <main className="p-6 space-y-6 flex-1 overflow-auto">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Anomaly Detection</h2>
            <p className="text-muted-foreground">Detected anomalies and system alerts</p>
          </div>

          <button
            onClick={onTrigger}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors duration-200"
          >
            Trigger Test Anomaly
          </button>

          <AnomalyCard anomalies={anomalies} onAddEvent={onAddEvent} />
        </main>
      </div>
    </div>
  )
}
