'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/sidebar'
import { Navbar } from '@/components/navbar'

export function ReportsPage({ onNavigate, onLogout, currentPage }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const reports = [
    { name: 'Monthly Energy Report', date: 'Nov 2024', size: '2.4 MB' },
    { name: 'Grid Performance Analysis', date: 'Nov 15, 2024', size: '1.8 MB' },
    { name: 'Anomaly Detection Report', date: 'Nov 20, 2024', size: '890 KB' },
    { name: 'Load Forecasting Study', date: 'Nov 2024', size: '3.1 MB' },
  ]

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} onLogout={onLogout} onNavigate={onNavigate} currentPage={currentPage} />

      <div className="flex-1 flex flex-col w-full md:pl-64">
        <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} onLogout={onLogout} />

        <main className="p-6 space-y-6 flex-1 overflow-auto">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Reports</h2>
            <p className="text-muted-foreground">Generate and view system reports</p>
          </div>

          <div className="space-y-3">
            {reports.map((report, idx) => (
              <div key={idx} className="bg-card border border-border rounded-lg p-4 flex items-center justify-between hover:bg-muted transition-colors">
                <div>
                  <h3 className="font-medium">{report.name}</h3>
                  <p className="text-sm text-muted-foreground">{report.date}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">{report.size}</span>
                  <button className="px-3 py-1 bg-primary text-primary-foreground rounded hover:opacity-90">Download</button>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}
