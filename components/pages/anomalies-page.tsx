'use client'

import { Sidebar } from '@/components/sidebar'
import { Navbar } from '@/components/navbar'
import AnomalyCard, { AnomalyItem } from '@/components/anomaly-card'
import { useState, useEffect } from 'react'
import { GoogleGenerativeAI } from "@google/generative-ai"
import axios from "axios"

// Props & types
interface AnomaliesPageProps {
  onNavigate: (page: string) => void
  onLogout: () => void
  currentPage: string
  anomalies: AnomalyItem[]
  onTrigger: () => void
  onAddEvent: (type: 'alert' | 'info' | 'warning' | 'success', msg: string) => void
  readings: any[]
}

export function AnomaliesPage({
  onNavigate,
  onLogout,
  currentPage,
  anomalies,
  onTrigger,
  onAddEvent,
  readings
}: AnomaliesPageProps) {

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [aiAnomalies, setAiAnomalies] = useState<AnomalyItem[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [lastRunAt, setLastRunAt] = useState<number | null>(null)

  // AI Anomaly detection using separate API key
  const detectAnomaliesAI = async () => {
    if (!readings || readings.length === 0) {
      setAiAnomalies([])
      setLoading(false)
      return
    }

    setLoading(true)
    try {
// 1. Attempt to grab the pool (and fallback to the specific anomaly key)
    const keyPool = process.env.GEMINI_KEYS_POOL;
    let selectedKey = process.env.NEXT_PUBLIC_GEMINI_KEY_ANOMALIES;

    // 2. Randomize if pool is available
    if (keyPool) {
      const keys = keyPool.split(',').map((k) => k.trim()).filter((k) => k);
      if (keys.length > 0) {
        selectedKey = keys[Math.floor(Math.random() * keys.length)];
      }
    }

    // 3. Validate existence
    if (!selectedKey) {
       throw new Error("Missing API Key: Ensure GEMINI_KEYS_POOL or NEXT_PUBLIC_GEMINI_KEY_ANOMALIES is set.");
    }

    // 4. Initialize
    const genAI = new GoogleGenerativeAI(selectedKey);      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })

      // Take recent readings and reduce size if huge
      const latest = readings.slice(0, 50)

      const prompt = `
You are an ML anomaly detection engine for a dual-source smart grid.
Analyze the following REAL sensor readings (JSON array).

Data:
${JSON.stringify(latest, null, 2)}

Return ONLY a JSON array of anomalies. If none, return [].
`

      const result = await model.generateContent(prompt)
      const text = result.response.text()

      const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim()
      const jsonMatch = cleaned.match(/\[[\s\S]*\]/)
      if (!jsonMatch) throw new Error("Invalid JSON from AI")

      const parsed = JSON.parse(jsonMatch[0])

      // Normalize
      const finalAnoms: AnomalyItem[] = parsed.map((a: any, i: number) => ({
        id: `ai-${Date.now()}-${i}`,
        type: String(a.type || 'AI: Unknown Anomaly'),
        severity: (a.severity === 'critical' || a.severity === 'warning') ? a.severity : 'info',
        explanation: String(a.explanation || 'No explanation provided'),
        timestamp: a.timestamp ? String(a.timestamp) : new Date().toISOString()
      }))

      setAiAnomalies(finalAnoms)
      setLastRunAt(Date.now())
      setLoading(false)

      // Log events in UI
      finalAnoms.forEach((an) => {
        if (an.severity === 'critical') onAddEvent('alert', an.type)
        else if (an.severity === 'warning') onAddEvent('warning', an.type)
        else onAddEvent('info', an.type)
      })

      // 🚨 EMERGENCY CALL TRIGGER FOR CRITICAL ANOMALIES
      const criticalAnomaly = finalAnoms.find(a => a.severity === "critical")

      if (criticalAnomaly) {
        try {
          const headers = {
            'Authorization': process.env.BLAND_API_KEY  // <---- replace this
          }

          const data = {
            "phone_number": "+918468845787",
            "voice": "e1289219-0ea2-4f22-a994-c542c2a48a0f",
            "wait_for_greeting": false,
            "record": true,
            "answered_by_enabled": true,
            "noise_cancellation": false,
            "interruption_threshold": 500,
            "block_interruptions": false,
            "max_duration": 12,
            "model": "base",
            "language": "en",
            "background_track": "none",
            "endpoint": "https://api.bland.ai",
            "voicemail_action": "hangup",
            "pathway_id": "24ed795d-5b46-40a0-bab7-2948a470bc1f"
          }

          await axios.post('https://api.bland.ai/v1/calls', data, { headers })

          console.log("📞 Bland.ai call triggered due to critical anomaly:", criticalAnomaly.type)
          onAddEvent("alert", "Emergency call triggered to +918468845787")

        } catch (err) {
          console.error("❌ Bland AI call failed:", err)
          onAddEvent("warning", "Failed to trigger emergency Bland AI call")
        }
      }

    } catch (err) {
      console.error('AI anomaly detection error:', err)
      setAiAnomalies([])
      setLoading(false)
    }
  }

  // Run on readings change with cooldown
  const COOLDOWN_MS = 45000

  useEffect(() => {
    if (!readings || readings.length === 0) return

    const now = Date.now()

    if (lastRunAt === null) {
      detectAnomaliesAI()
      return
    }

    if (now - lastRunAt >= COOLDOWN_MS) {
      detectAnomaliesAI()
    }
  }, [readings])


  // Combine legacy + AI anomalies
  const combined = [
    ...aiAnomalies,
    ...((anomalies || []).map((a, i) => ({
      id: `legacy-${i}-${a.type ?? i}`,
      type: a.type ?? 'Legacy Anomaly',
      severity: a.severity ?? 'info',
      explanation: (a as any).explanation ?? '',
      timestamp: (a as any).timestamp ?? new Date().toISOString()
    })))
  ]

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} onLogout={onLogout} onNavigate={onNavigate} currentPage={currentPage} />

      <div className="flex-1 flex flex-col w-full md:pl-64">
        <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} onLogout={onLogout} />

        <main className="p-6 space-y-6 flex-1 overflow-auto">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Anomaly Detection</h2>
            <p className="text-muted-foreground">ML-based anomaly engine • Explainable results</p>
            {lastRunAt && <p className="text-xs text-muted-foreground">AI last run: {new Date(lastRunAt).toLocaleString()}</p>}
          </div>

          <div className="flex gap-3 items-center">
            <button
              onClick={onTrigger}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors duration-200"
            >
              Trigger Test Anomaly
            </button>

            <button
              onClick={detectAnomaliesAI}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200"
            >
              Run AI Check Now
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-48">
              <div className="h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <AnomalyCard anomalies={combined} onAddEvent={onAddEvent} />
          )}
        </main>
      </div>
    </div>
  )
}

export default AnomaliesPage
