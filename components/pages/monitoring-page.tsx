'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/sidebar'
import { Navbar } from '@/components/navbar'
import { GaugeComponent } from '@/components/gauge'
import { LineChart } from '@/components/charts/line-chart'
import { AreaChart } from '@/components/charts/area-chart'
import { MetricCard } from '@/components/metric-card'

const generateVoltageData = () =>
  Array.from({ length: 12 }, (_, i) => ({
    time: `${23 - i}:00`,
    value: 230 + Math.random() * 30 - 15,
  })).reverse()

const generateEnergyData = () =>
  Array.from({ length: 7 }, (_, i) => ({
    day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
    value: 45 + Math.random() * 35,
  }))

export function MonitoringPage({ onNavigate, onLogout, currentPage }) {
  const [currentValues, setCurrentValues] = useState({
    voltage: 235,
    current: 12.5,
    powerFactor: 0.95,
    frequency: 50,
  })
  const [voltageData, setVoltageData] = useState(generateVoltageData())
  const [energyData, setEnergyData] = useState(generateEnergyData())
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentValues((prev) => ({
        voltage: 230 + Math.random() * 30 - 15,
        current: 8 + Math.random() * 10,
        powerFactor: 0.92 + Math.random() * 0.07,
        frequency: 49.95 + Math.random() * 0.1,
      }))
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} onLogout={onLogout} onNavigate={onNavigate} currentPage={currentPage} />

      <div className="flex-1 flex flex-col w-full md:pl-64">
        <Navbar
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          onLogout={onLogout}
        />

        <main className="p-6 space-y-6 flex-1 overflow-auto">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Real-time Monitoring</h2>
            <p className="text-muted-foreground">Live grid parameters and real-time metrics</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <GaugeComponent title="Voltage" value={currentValues.voltage} max={300} unit="V" color="from-cyan-500 to-blue-600" />
            <GaugeComponent title="Current" value={currentValues.current} max={20} unit="A" color="from-emerald-500 to-teal-600" />
            <GaugeComponent title="Power Factor" value={currentValues.powerFactor} max={1} unit="PF" color="from-purple-500 to-pink-600" decimals={2} />
          </div>

          <MetricCard title="Grid Frequency" value={`${currentValues.frequency.toFixed(2)} Hz`} change="Normal" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <LineChart title="Voltage Monitoring (12 Hours)" data={voltageData} color="rgb(6, 182, 212)" />
            <AreaChart title="Energy Flow (7 Days)" data={energyData} color="rgb(34, 197, 94)" />
          </div>
        </main>
      </div>
    </div>
  )
}
