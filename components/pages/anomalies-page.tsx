'use client'

import { Sidebar } from '@/components/sidebar'
import { Navbar } from '@/components/navbar'
import AnomalyCard, { AnomalyItem } from '@/components/anomaly-card'
import { useState, useEffect } from 'react'
import axios from "axios"

// Props
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

  // 🔥 AI anomaly detection using OpenRouter (DeepSeek)
  const detectAnomaliesAI = async () => {
    if (!readings || readings.length === 0) {
      setAiAnomalies([])
      setLoading(false)
      return
    }

    setLoading(true)

    try {
      // Load API key
      const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY
      if (!apiKey) {
        throw new Error("Missing NEXT_PUBLIC_OPENROUTER_API_KEY")
      }

      const latest = readings.slice(0, 50)

      const prompt = `
You are an AI anomaly detection engine for a smart grid.
Analyze the following REAL sensor readings (JSON array):

${JSON.stringify(latest, null, 2)}

Return ONLY a JSON array:
[
  { "type": "Voltage Spike", "severity": "warning", "explanation": "...", "timestamp": "..." }
]

If no anomalies → return [] ONLY.
`

      // 🔥 OpenRouter request with DeepSeek
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "SmartGrid Anomaly Detector"
        },
        body: JSON.stringify({
          model: "deepseek/deepseek-chat",
          max_tokens: 300,      // Important: prevents token cost errors
          temperature: 0.4,
          messages: [
            { role: "system", content: "You detect anomalies and return JSON only." },
            { role: "user", content: prompt }
          ]
        })
      })

      if (!res.ok) {
        const text = await res.text()
        console.error("AI error:", text)
        throw new Error(text)
      }

      const data = await res.json()
      const text = data?.choices?.[0]?.message?.content || ""

      // Extract JSON array
      const cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim()
      const jsonMatch = cleaned.match(/\[[\s\S]*\]/)

      if (!jsonMatch) throw new Error("Invalid JSON from AI")
      const parsed = JSON.parse(jsonMatch[0])

      // Normalize anomalies
      const final: AnomalyItem[] = parsed.map((a: any, i: number) => ({
        id: `ai-${Date.now()}-${i}`,
        type: String(a.type || 'AI: Unknown'),
        severity: ['critical', 'warning'].includes(a.severity) ? a.severity : 'info',
        explanation: String(a.explanation || 'No explanation provided'),
        timestamp: a.timestamp || new Date().toISOString()
      }))

      setAiAnomalies(final)
      setLastRunAt(Date.now())
      setLoading(false)

      // UI notifications
      final.forEach((an) => {
        if (an.severity === 'critical') onAddEvent("alert", an.type)
        else if (an.severity === 'warning') onAddEvent("warning", an.type)
        else onAddEvent("info", an.type)
      })

      // 🚨 CALL BLAND AI IF CRITICAL
      const critical = final.find(a => a.severity === "critical")
      if (critical) {
        try {
          const headers = { 'Authorization': process.env.PUBLIC_BLAND_API_KEY }
          const data = {
            phone_number: "+918468845787",
            voice: "e1289219-0ea2-4f22-a994-c542c2a48a0f",
            wait_for_greeting: false,
            record: true,
            answered_by_enabled: true,
            noise_cancellation: false,
            interruption_threshold: 500,
            block_interruptions: false,
            max_duration: 12,
            model: "base",
            language: "en",
            background_track: "none",
            endpoint: "https://api.bland.ai",
            voicemail_action: "hangup",
            pathway_id: "24ed795d-5b46-40a0-bab7-2948a470bc1f"
          }

          await axios.post("https://api.bland.ai/v1/calls", data, { headers })
          onAddEvent("alert", "Emergency call triggered!")
        } catch (err) {
          console.error("Bland AI error:", err)
          onAddEvent("warning", "Failed to trigger Bland AI call")
        }
      }

    } catch (err) {
      console.error("AI anomaly detection error:", err)
      setAiAnomalies([])
      setLoading(false)
    }
  }

  // AI auto-run cooldown
  const COOLDOWN_MS = 45000
  useEffect(() => {
    if (!readings.length) return

    const now = Date.now()

    if (lastRunAt === null || now - lastRunAt >= COOLDOWN_MS) {
      detectAnomaliesAI()
    }
  }, [readings])

  // Combine legacy + AI anomalies
  const combined = [
    ...aiAnomalies,
    ...(anomalies || []).map((a, i) => ({
      id: `legacy-${i}-${a.type ?? i}`,
      type: a.type ?? "Legacy Anomaly",
      severity: a.severity ?? "info",
      explanation: (a as any).explanation ?? "",
      timestamp: (a as any).timestamp ?? new Date().toISOString()
    }))
  ]

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onLogout={onLogout}
        onNavigate={onNavigate}
        currentPage={currentPage}
      />

      <div className="flex-1 flex flex-col w-full md:pl-64">
        <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} onLogout={onLogout} />

        <main className="p-6 space-y-6 flex-1 overflow-auto">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold">Anomaly Detection</h2>
            <p className="text-muted-foreground">AI anomaly engine • Real explanations</p>
            {lastRunAt && (
              <p className="text-xs text-muted-foreground">
                AI last run: {new Date(lastRunAt).toLocaleString()}
              </p>
            )}
          </div>

          <div className="flex gap-3 items-center">
            <button
  onClick={async () => {

    // 1. Fire the legacy anomaly event (UI)
    onTrigger()

    // 2. Show UI notification
    onAddEvent('alert', 'PZEM Sensor Failure Simulated')

    // 3. BLAND AI EMERGENCY CALL (always trigger here)
    try {
const headers = {
  Authorization: `Bearer ${process.env.NEXT_PUBLIC_BLAND_API_KEY}`
}

      const data = {
        phone_number: "+918468845787",
        voice: "e1289219-0ea2-4f22-a994-c542c2a48a0f",
        wait_for_greeting: false,
        record: true,
        answered_by_enabled: true,
        noise_cancellation: false,
        interruption_threshold: 500,
        block_interruptions: false,
        max_duration: 12,
        model: "base",
        language: "en",
        background_track: "none",
        endpoint: "https://api.bland.ai",
        voicemail_action: "hangup",
        pathway_id: "24ed795d-5b46-40a0-bab7-2948a470bc1f"
      }

      await axios.post("https://api.bland.ai/v1/calls", data, { headers })

      console.log("📞 Bland.ai emergency call triggered (manual test)")
      onAddEvent("alert", "Emergency call triggered (PZEM Test)")
      
    } catch (err) {
      console.error("❌ Bland AI test-call failed:", err)
      onAddEvent("warning", "Failed to trigger Bland AI test call")
    }

  }}
  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium"
>
  Trigger PZEM Fault
</button>


            <button
              onClick={detectAnomaliesAI}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
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
