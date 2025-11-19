'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/auth-provider'
import { Sidebar } from '@/components/sidebar'
import { Navbar } from '@/components/navbar'
import { GaugeComponent } from '@/components/gauge'
import { MetricCard } from '@/components/metric-card'
import { PredictionCard } from '@/components/prediction-card'
import { LineChart } from '@/components/charts/line-chart'
import { AreaChart } from '@/components/charts/area-chart'
import { AnomalyCard } from '@/components/anomaly-card'
import { NILMChart } from '@/components/charts/nilm-chart'
import { Heatmap } from '@/components/heatmap'
import { GeoMap } from '@/components/geo-map'
import { InsightsCard } from '@/components/insights-card'
import { AutomationRules } from '@/components/automation-rules'
import { EventLog } from '@/components/event-log'
import { MonitoringPage } from './monitoring-page'
import { PredictionsPage } from './predictions-page'
import { AnomaliesPage } from './anomalies-page'
import { ReportsPage } from './reports-page'
import { SettingsPage } from './settings-page'

// Mock data generators
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

const generateAnomalies = (): Array<{ type: string; severity: 'critical' | 'warning' | 'info' }> => {
  const data = Array.from({ length: 50 }, () => 235 + Math.random() * 20 - 10)
  const energyData = Array.from({ length: 50 }, () => 42 + Math.random() * 15)
  const anomalies: Array<{ type: string; severity: 'critical' | 'warning' | 'info' }> = []

  for (let i = 0; i < data.length; i++) {
    if (i > 0 && energyData[i] > energyData[i - 1] * 1.4) {
      anomalies.push({ type: 'energy_theft', severity: 'critical' })
    }
    if (data[i] > 250) {
      anomalies.push({ type: 'high_voltage', severity: 'warning' })
    }
  }

  return [...new Map(anomalies.map((a) => [a.type, a])).values()]
}

export default function DashboardPage() {
  const { logout } = useAuth()
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [voltageData, setVoltageData] = useState(generateVoltageData())
  const [energyData, setEnergyData] = useState(generateEnergyData())
  const [anomalies, setAnomalies] = useState<Array<{ type: string; severity: 'critical' | 'warning' | 'info' }>>(generateAnomalies())
  const [currentValues, setCurrentValues] = useState({
    voltage: 235,
    current: 12.5,
    powerFactor: 0.95,
    energyToday: 248.5,
    gridStatus: 'ONLINE',
  })
  const [events, setEvents] = useState<Array<{ id: number; timestamp: Date; type: 'alert' | 'info' | 'warning' | 'success'; message: string }>>([
    { id: 1, timestamp: new Date(Date.now() - 300000), type: 'alert', message: 'High voltage detected' },
    { id: 2, timestamp: new Date(Date.now() - 600000), type: 'info', message: 'Grid synchronized' },
  ])
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentValues((prev) => ({
        voltage: 230 + Math.random() * 30 - 15,
        current: 8 + Math.random() * 10,
        powerFactor: 0.92 + Math.random() * 0.07,
        energyToday: prev.energyToday + Math.random() * 2,
        gridStatus: Math.random() > 0.05 ? 'ONLINE' : 'OFFLINE',
      }))
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const predictedPower = (currentValues.energyToday * 1.05 - Math.random() * 5).toFixed(1)

  const addEvent = (type: 'alert' | 'info' | 'warning' | 'success', message: string) => {
    const newEvent: { id: number; timestamp: Date; type: 'alert' | 'info' | 'warning' | 'success'; message: string } = {
      id: events.length + 1,
      timestamp: new Date(),
      type,
      message,
    }
    setEvents((prev) => [newEvent, ...prev.slice(0, 19)])
  }

  const triggerAnomaly = () => {
    const newAnomaly: { type: string; severity: 'critical' | 'warning' | 'info' } = { type: 'high_voltage', severity: 'critical' }
    setAnomalies((prev) => {
      const updated = [newAnomaly, ...prev]
      return updated.slice(0, 5)
    })
    setCurrentValues((prev) => ({
      ...prev,
      voltage: 270 + Math.random() * 20,
    }))
    const message = 'Critical: High voltage anomaly triggered - Voltage spike detected above safe threshold'
    addEvent('alert', message)

    // Send email alert via server API
    const recipient = 'prasanna.pandharikar22@spit.ac.in'
    const subject = 'Shakti Smart Energy Grid - Critical Grid Alert'
    const anomaliesForEmail = [newAnomaly, ...anomalies].slice(0, 5)

    fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipient, subject, text: message, anomalies: anomaliesForEmail }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text()
          throw new Error(text || 'Failed to send email')
        }
        addEvent('info', `Alert email delivered to ${recipient}`)
      })
      .catch((err) => {
        console.error('send-email error', err)
        addEvent('warning', `Failed to send alert email: ${err.message}`)
      })
  }

  if (currentPage === 'monitoring') return <MonitoringPage onNavigate={setCurrentPage} onLogout={logout} currentPage={currentPage} />
  if (currentPage === 'predictions') return <PredictionsPage onNavigate={setCurrentPage} onLogout={logout} currentPage={currentPage} />
  if (currentPage === 'anomalies') return <AnomaliesPage onNavigate={setCurrentPage} onLogout={logout} currentPage={currentPage} anomalies={anomalies} onTrigger={triggerAnomaly} onAddEvent={addEvent} />
  if (currentPage === 'reports') return <ReportsPage onNavigate={setCurrentPage} onLogout={logout} currentPage={currentPage} />
  if (currentPage === 'settings') return <SettingsPage onNavigate={setCurrentPage} onLogout={logout} currentPage={currentPage} />

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} onLogout={logout} onNavigate={setCurrentPage} currentPage={currentPage} />

      {/* Main content wrapper with sidebar offset */}
      <div className="flex-1 flex flex-col w-full md:pl-64">
        <Navbar
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          onLogout={logout}
        />

        <main className="p-6 space-y-6 flex-1 overflow-auto">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Energy Grid Monitor</h2>
            <p className="text-muted-foreground">Real-time monitoring and predictive analytics</p>
          </div>

          <button
            onClick={triggerAnomaly}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors duration-200"
          >
            Trigger Anomaly (Demo)
          </button>

          {/* Gauges */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <GaugeComponent
              title="Voltage"
              value={currentValues.voltage}
              max={300}
              unit="V"
              color="from-cyan-500 to-blue-600"
            />
            <GaugeComponent
              title="Current"
              value={currentValues.current}
              max={20}
              unit="A"
              color="from-emerald-500 to-teal-600"
            />
            <GaugeComponent
              title="Power Factor"
              value={currentValues.powerFactor}
              max={1}
              unit="PF"
              color="from-purple-500 to-pink-600"
              decimals={2}
            />
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <MetricCard
              title="Total Energy Today"
              value={`${currentValues.energyToday.toFixed(1)} kWh`}
              change="+12.5% vs yesterday"
              icon="⚡"
            />
            <MetricCard
              title="Grid Status"
              value={currentValues.gridStatus}
              status={currentValues.gridStatus === 'ONLINE' ? 'online' : 'offline'}
              icon="🔗"
            />
            <PredictionCard
              title="Predicted Power (Next Hour)"
              value={`${predictedPower} kWh`}
              trend="stable"
              onAddEvent={addEvent}
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <LineChart title="Voltage Last 12 Hours" data={voltageData} color="rgb(6, 182, 212)" />
            <AreaChart title="Energy Consumption (7 Days)" data={energyData} color="rgb(34, 197, 94)" />
          </div>

          {/* NILM */}
          <div>
            <NILMChart />
          </div>

          {/* Heatmap and Geo */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Heatmap />
            <GeoMap />
          </div>

          {/* Anomalies and Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AnomalyCard anomalies={anomalies} onAddEvent={addEvent} />
            <InsightsCard />
          </div>

          {/* Automation Rules */}
          <AutomationRules onAddEvent={addEvent} />

          {/* Event Log */}
          <EventLog events={events} />
        </main>
      </div>
    </div>
  )
}
