'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/auth-provider'
import { Sidebar } from '@/components/sidebar'
import { Navbar } from '@/components/navbar'
import { GaugeComponent } from '@/components/gauge'
import { MetricCard } from '@/components/metric-card'
import { LineChart } from '@/components/charts/line-chart'
import { AreaChart } from '@/components/charts/area-chart'
import { AnomalyCard } from '@/components/anomaly-card'
import { EventLog } from '@/components/event-log'
import { MonitoringPage } from './monitoring-page'
import { PredictionsPage } from './predictions-page'
import { AnomaliesPage } from './anomalies-page'
import { ReportsPage } from './reports-page'
import { SettingsPage } from './settings-page'

const FIREBASE_URL = 'https://majorhaiyeproject-default-rtdb.firebaseio.com/NEW_DATA.json'
const FIREBASE_PUSH_CHARS = '-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz'

const decodeFirebasePushId = (id: string) => {
  let timestamp = 0
  for (let i = 0; i < 8 && i < id.length; i += 1) {
    const value = FIREBASE_PUSH_CHARS.indexOf(id[i])
    if (value === -1) return Date.now()
    timestamp = timestamp * 64 + value
  }
  return timestamp
}

// Robust numeric coercion helper
const toNumberSafe = (v: any, fallback = 0) => {
  const n = typeof v === 'number' ? v : (typeof v === 'string' && v.trim() !== '' ? Number(v) : NaN)
  return Number.isFinite(n) ? n : fallback
}

// More robust timestamp parser that accepts:
// - "YYYY-MM-DD_HH:MM:SS"
// - "YYYY-MM-DD HH:MM:SS"
// - ISO-like "YYYY-MM-DDTHH:MM:SS"
const parseNewDataTimestamp = (stamp: string) => {
  if (!stamp) return Date.now()
  // Normalize common separators
  let s = String(stamp).trim()
  s = s.replace(/_/g, 'T').replace(/ /g, 'T') // YYYY-MM-DDTHH:MM:SS

  // Try Date.parse directly
  let parsed = Date.parse(s)
  if (Number.isFinite(parsed)) return parsed

  // Try adding 'Z' (UTC) if missing timezone
  parsed = Date.parse(s + 'Z')
  if (Number.isFinite(parsed)) return parsed

  // If s still not parseable, try splitting components (YYYY-MM-DDTHH:MM:SS)
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?/)
  if (m) {
    const year = Number(m[1]), month = Number(m[2]) - 1, day = Number(m[3])
    const hour = Number(m[4]), minute = Number(m[5]), second = Number(m[6] || '0')
    // Use local time (keeps behavior consistent in client's timezone)
    return new Date(year, month, day, hour, minute, second).getTime()
  }

  // Last fallback: if stamp looks numeric (legacy push id), handle that
  const numeric = Number(stamp)
  if (Number.isFinite(numeric)) {
    if (numeric > 1e12) return numeric
    if (numeric > 1e9) return numeric * 1000
  }

  return Date.now()
}

interface PZEM {
  voltage: number
  current: number
  power: number
  energy: number
  frequency: number
  powerFactor: number
}

interface Reading {
  id: string
  timestamp: number
  pzem1: PZEM
  pzem2: PZEM
  activeSource?: number
}

type Anomaly = { type: string; severity: 'critical' | 'warning' | 'info' }

export default function DashboardPage() {
  const { logout } = useAuth()
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [readings, setReadings] = useState<Reading[]>([])
  const [latest, setLatest] = useState<Reading | null>(null)
  const [events, setEvents] = useState<Array<{ id: number; timestamp: Date; type: 'alert' | 'info' | 'warning' | 'success'; message: string }>>([])
  const [anomalies, setAnomalies] = useState<Anomaly[]>([])
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  const addEvent = (type: 'alert' | 'info' | 'warning' | 'success', message: string) => {
    setEvents(prev => [{
      id: Date.now(),
      timestamp: new Date(),
      type,
      message,
    }, ...prev.slice(0, 19)])
  }

  useEffect(() => {
    const controller = new AbortController()

    const fetchLive = async () => {
      try {
        const res = await fetch(FIREBASE_URL + '?t=' + Date.now(), {
          signal: controller.signal,
          cache: 'no-store',
        })

        if (!res.ok) throw new Error('Network error')

        const data = await res.json()

        const basePzem: PZEM = { voltage: 0, current: 0, power: 0, energy: 0, frequency: 0, powerFactor: 0 }
        const normalizePzem = (raw: any): PZEM => {
          // Coerce numeric strings to numbers safely
          return {
            voltage: toNumberSafe(raw?.voltage ?? raw?.V ?? raw?.v, 0),
            current: toNumberSafe(raw?.current ?? raw?.I ?? raw?.i, 0),
            power: toNumberSafe(raw?.power ?? raw?.P ?? raw?.p, 0),
            energy: toNumberSafe(raw?.energy ?? raw?.E ?? raw?.e, 0),
            frequency: toNumberSafe(raw?.frequency ?? raw?.F ?? raw?.f, 0),
            powerFactor: toNumberSafe(raw?.powerFactor ?? raw?.pf ?? raw?.PF ?? raw?.power_factor, 0),
          }
        }

        const mapNewDataFormat = () => {
          if (!data || typeof data !== 'object') return null
          if (!('pzem1' in data) && !('pzem2' in data)) return null

          const combined: Record<string, { timestamp: number; pzem1: PZEM; pzem2: PZEM }> = {}

          const ensureEntry = (stamp: string) => {
            if (!combined[stamp]) {
              combined[stamp] = {
                timestamp: parseNewDataTimestamp(stamp),
                pzem1: { ...basePzem },
                pzem2: { ...basePzem },
              }
            }
            return combined[stamp]
          }

          Object.entries((data as any)?.pzem1 || {}).forEach(([stamp, payload]) => {
            const entry = ensureEntry(stamp)
            entry.pzem1 = normalizePzem(payload)
          })

          Object.entries((data as any)?.pzem2 || {}).forEach(([stamp, payload]) => {
            const entry = ensureEntry(stamp)
            entry.pzem2 = normalizePzem(payload)
          })

          return Object.entries(combined).map(([id, entry]) => ({
            id,
            timestamp: entry.timestamp,
            pzem1: entry.pzem1,
            pzem2: entry.pzem2,
          }))
        }

        const mapLegacyFormat = () => Object.entries(data || {})
          .map(([id, val]: [string, any]) => {
            const pushTimestamp = decodeFirebasePushId(id)
            return {
              id,
              timestamp: (val?.timestamp ? parseNewDataTimestamp(String(val.timestamp)) : normalizeTimestamp(val?.timestamp, pushTimestamp)),
              pzem1: (val?.pzem1 ? {
                voltage: toNumberSafe(val.pzem1.voltage, 0),
                current: toNumberSafe(val.pzem1.current, 0),
                power: toNumberSafe(val.pzem1.power, 0),
                energy: toNumberSafe(val.pzem1.energy, 0),
                frequency: toNumberSafe(val.pzem1.frequency, 0),
                powerFactor: toNumberSafe(val.pzem1.powerFactor ?? val.pzem1.pf, 0),
              } : basePzem),
              pzem2: (val?.pzem2 ? {
                voltage: toNumberSafe(val.pzem2.voltage, 0),
                current: toNumberSafe(val.pzem2.current, 0),
                power: toNumberSafe(val.pzem2.power, 0),
                energy: toNumberSafe(val.pzem2.energy, 0),
                frequency: toNumberSafe(val.pzem2.frequency, 0),
                powerFactor: toNumberSafe(val.pzem2.powerFactor ?? val.pzem2.pf, 0),
              } : basePzem),
              activeSource: val?.activeSource,
            }
          })

        const normalizeTimestamp = (raw: unknown, fallback: number) => {
          const numeric = typeof raw === 'number' ? raw : Number(raw as any)
          if (!Number.isFinite(numeric)) return fallback
          if (numeric > 1e12) return numeric
          if (numeric > 1e9) return numeric * 1000
          return fallback
        }

        const readingsArray: Reading[] = (mapNewDataFormat() ?? mapLegacyFormat())
          .sort((a, b) => b.timestamp - a.timestamp)

        if (readingsArray.length === 0) {
          // If no data present, do not flip loading off - keep trying
          return
        }

        setReadings(readingsArray)
        setLatest(readingsArray[0])
        setLoading(false)

        // Live anomaly detection (same rules as before)
        const p1 = readingsArray[0].pzem1
        const p2 = readingsArray[0].pzem2
        const newAnoms: Anomaly[] = []

        if (p1.voltage > 260 || p2.voltage > 260) newAnoms.push({ type: 'High Voltage Detected (>260V)', severity: 'critical' })
        if (p1.voltage < 180 || p2.voltage < 180) newAnoms.push({ type: 'Low Voltage Alert (<180V)', severity: 'warning' })

        if (p1.power > 6000 || p2.power > 6000) newAnoms.push({ type: 'Circuit Overload (>6kW)', severity: 'critical' })

        if (p1.voltage > 200 && p1.current < 0.01) newAnoms.push({ type: 'PZEM-1: Suspiciously Low Load', severity: 'warning' })
        if (p2.voltage > 200 && p2.current < 0.01) newAnoms.push({ type: 'PZEM-2: Suspiciously Low Load', severity: 'warning' })

        if (newAnoms.length > 0) {
          setAnomalies(prev => {
            const next: Anomaly[] = [...newAnoms, ...prev]
            return next.slice(0, 10)
          })
          newAnoms.forEach(a => {
            if (a.severity === 'critical') addEvent('alert', a.type)
            else if (a.severity === 'warning') addEvent('warning', a.type)
          })
        }

      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('Live fetch error:', err)
          addEvent('warning', 'Live connection interrupted')
        }
      }
    }

    fetchLive()
    const interval = setInterval(fetchLive, 2000)

    return () => {
      controller.abort()
      clearInterval(interval)
    }
  }, [])

  // Today's energy (kWh)
  const energyToday = (() => {
  if (readings.length === 0) return 0;

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const start = todayStart.getTime();

  const today = readings.filter(r => r.timestamp >= start);
  if (today.length < 2) return 0;

  const earliest = today[today.length - 1];
  const latest = today[0];

  // For each PZEM, calculate safely
  const calc = (eStart: number, eEnd: number) => {
    // If device reset, eStart will be greater than eEnd
    if (eStart > eEnd) return eEnd; // treat start as zero
    return eEnd - eStart;
  };

  const p1 = calc(earliest.pzem1.energy, latest.pzem1.energy);
  const p2 = calc(earliest.pzem2.energy, latest.pzem2.energy);

  return Number((p1 + p2).toFixed(3));
})();



  // Live Chart Data – Last 20 readings (Voltage in V)
  const pzem1Live = readings.slice(0, 20).map(r => ({
    time: new Date(r.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    value: Number(r.pzem1.voltage.toFixed(1))
  })).reverse()

  const pzem2Live = readings.slice(0, 20).map(r => ({
    time: new Date(r.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    value: Number(r.pzem2.voltage.toFixed(1))
  })).reverse()

  // Daily Energy (Last 7 Days)
  const dailyEnergy = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - i))
    date.setHours(0, 0, 0, 0)
    const next = new Date(date)
    next.setDate(next.getDate() + 1)

    const dayReadings = readings.filter(r => r.timestamp >= date.getTime() && r.timestamp < next.getTime())
    if (dayReadings.length < 2) return { day: date.toLocaleDateString('en-IN', { weekday: 'short' }), value: 0 }

    const first = dayReadings[dayReadings.length - 1]
    const last = dayReadings[0]
    const energy = (last.pzem1.energy + last.pzem2.energy) - (first.pzem1.energy + first.pzem2.energy)

    return { day: date.toLocaleDateString('en-IN', { weekday: 'short' }), value: Number(energy.toFixed(3)) }
  })

  const triggerAnomaly = () => {
    addEvent('alert', 'DEMO: Critical Anomaly Triggered!')
    setAnomalies(prev => {
      const next: Anomaly[] = [{ type: 'Manual Test Anomaly', severity: 'critical' }, ...prev]
      return next.slice(0, 10)
    })
  }

  // Page routing
  if (currentPage !== 'dashboard') {
    switch (currentPage) {
      // case 'monitoring': return <MonitoringPage onNavigate={setCurrentPage} onLogout={logout} currentPage={currentPage} />
      case 'predictions': return <PredictionsPage onNavigate={setCurrentPage} onLogout={logout} currentPage={currentPage} readings={readings} />
      case 'anomalies': return <AnomaliesPage onNavigate={setCurrentPage} onLogout={logout} currentPage={currentPage} anomalies={anomalies} onTrigger={triggerAnomaly} onAddEvent={addEvent} />
      case 'reports': return <ReportsPage onNavigate={setCurrentPage} onLogout={logout} currentPage={currentPage} />
      case 'settings': return <SettingsPage onNavigate={setCurrentPage} onLogout={logout} currentPage={currentPage} />
      default: return null
    }
  }

  if (loading || !latest) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center flex-col gap-6">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
        <p className="text-2xl font-bold">Shakti Smart Grid</p>
        <p className="text-lg text-muted-foreground">Establishing live connection...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} onLogout={logout} onNavigate={setCurrentPage} currentPage={currentPage} />

      <div className="flex-1 flex flex-col w-full md:pl-64">
        <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} onLogout={logout} />

        <main className="p-6 space-y-8">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3">
                Shakti Smart Grid
                <span className="flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
              </h1>
              <p className="text-lg text-muted-foreground">Real-Time • Dual PZEM • Current in mA • Tamper Alerts</p>
            </div>
            <button onClick={triggerAnomaly} className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg transition-all">
              Trigger Anomaly (Demo)
            </button>
          </div>

          {/* LIVE GAUGES – Now in mA */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <GaugeComponent title="PZEM-1 Voltage" value={latest.pzem1.voltage} max={300} unit="V" color="from-blue-500 to-cyan-500" />
            <GaugeComponent
              title="PZEM-1 Current"
              value={+(latest.pzem1.current * 1000).toFixed(1)}
              max={30000}
              unit="mA"
              color="from-green-500 to-emerald-600"
            />
            <GaugeComponent title="PZEM-2 Voltage" value={latest.pzem2.voltage} max={300} unit="V" color="from-orange-500 to-red-600" />
            <GaugeComponent
              title="PZEM-2 Current"
              value={+(latest.pzem2.current * 1000).toFixed(1)}
              max={30000}
              unit="mA"
              color="from-purple-500 to-pink-600"
            />
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <MetricCard title="PZEM-1 Power" value={`${latest.pzem1.power.toFixed(1)} W`} change={latest.pzem1.current > 0.01 ? 'LIVE' : 'Standby'} />
            <MetricCard title="PZEM-1 Current" value={`${(latest.pzem1.current * 1000).toFixed(1)} mA`} change={latest.pzem1.current > 0.005 ? 'Active' : 'Idle'} />
            <MetricCard title="PZEM-2 Power" value={`${latest.pzem2.power.toFixed(1)} W`} change={latest.pzem2.current > 0.01 ? 'LIVE' : 'Standby'} />
            <MetricCard title="PZEM-2 Current" value={`${(latest.pzem2.current * 1000).toFixed(1)} mA`} change={latest.pzem2.current > 0.005 ? 'Active' : 'Idle'} />
            <MetricCard title="Total Power" value={`${(latest.pzem1.power + latest.pzem2.power).toFixed(1)} W`} />
            <MetricCard title="Energy Today" value={`${energyToday} kWh`} />
          </div>

          {/* LIVE CHARTS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <LineChart title="PZEM-1 Voltage (Live)" data={pzem1Live} color="rgb(14, 165, 233)" height={320} />
            <LineChart title="PZEM-2 Voltage (Live)" data={pzem2Live} color="rgb(251, 146, 60)" height={320} />
          </div>

          {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <AreaChart title="Daily Energy (7 Days)" data={dailyEnergy} color="rgb(34, 197, 94)" height={320} />
            <AnomalyCard anomalies={anomalies} onAddEvent={addEvent} />
          </div> */}

          <EventLog events={events} />
        </main>
      </div>
    </div>
  )
}
