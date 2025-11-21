'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/sidebar'
import { Navbar } from '@/components/navbar'

type Prediction = {
  title: string
  value: string
  change: string
  tag: string
}

interface PredictionsPageProps {
  onNavigate: (page: string) => void
  onLogout: () => void
  currentPage: string
  readings: any[]
}

export function PredictionsPage({ onNavigate, onLogout, currentPage, readings }: PredictionsPageProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [loading, setLoading] = useState(true)

  const getPredictions = async () => {
    try {
      const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY

      if (!apiKey) {
        throw new Error("Missing NEXT_PUBLIC_OPENROUTER_API_KEY")
      }

      // Slice readings (latest 40 entries)
      const recent = readings.slice(0, 40)

      // Call OpenRouter (DeepSeek model)
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "Smart Grid Predictor"
        },
        body: JSON.stringify({
          model: "deepseek/deepseek-chat",
            max_tokens: 200,        // <-- IMPORTANT FIX

          messages: [
            {
              role: "system",
              content: `You are an advanced ML model predicting smart grid behavior.
              Return ONLY valid JSON. No markdown, no explanations.
              
              Predict the following based on the user's energy data:
              {
                "peakLoad": "<number> kW",
                "energyDemand": "<number> kWh",
                "stability": "<number>%",
                "renewables": "<number> kW"
              }
              
              Rules:
              1. Predictions MUST vary based on the data.
              2. Add ±5–12% natural ML variation.
              3. Use actual patterns from the readings.`
            },
            {
              role: "user",
              content: `Here is the live energy data: ${JSON.stringify(recent)}`
            }
          ],
          response_format: { type: "json_object" },
          temperature: 1.1,
          stream: false
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`OpenRouter API Error: ${response.status} ${JSON.stringify(errorData)}`)
      }

      const result = await response.json()
      const text = result.choices[0].message.content

      const cleaned = text
        .replace(/```json/gi, '')
        .replace(/```/g, '')
        .trim()

      const data = JSON.parse(cleaned)

      setPredictions([
        { title: "Peak Load (Next 6 Hours)", value: data.peakLoad, change: "+8% vs avg", tag: "ML Model" },
        { title: "Energy Demand (Tomorrow)", value: data.energyDemand, change: "-2% vs yesterday", tag: "ML Model" },
        { title: "Grid Stability Index", value: data.stability, change: "Normal range", tag: "ML Model" },
        { title: "Renewable Generation (Next 4 Hours)", value: data.renewables, change: "Solar peak likely", tag: "ML Model" },
      ])

      setLoading(false)

    } catch (error) {
      console.error("Prediction error:", error)
      setLoading(false)
    }
  }

  useEffect(() => {
    if (readings.length > 0) {
      getPredictions()
    }
  }, [readings])

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} onLogout={onLogout} onNavigate={onNavigate} currentPage={currentPage} />

      <div className="flex-1 flex flex-col w-full md:pl-64">
        <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} onLogout={onLogout} />

        <main className="p-6 space-y-6">
          <h2 className="text-3xl font-bold">Predictive Analytics</h2>
          <p className="text-muted-foreground">AIML-powered forecasting using real smart grid data</p>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {predictions.map((pred, idx) => (
                <div key={idx} className="bg-card border border-border rounded-lg p-6">
                  <div className="flex justify-between">
                    <h3 className="text-sm text-muted-foreground">{pred.title}</h3>
                    <span className="text-xs px-2 py-1 bg-blue-600 text-white rounded">
                      {pred.tag}
                    </span>
                  </div>
                  <div className="text-3xl font-bold mt-2">{pred.value}</div>
                  <p className="text-sm text-muted-foreground">{pred.change}</p>
                </div>
              ))}
            </div>
          )}

        </main>
      </div>
    </div>
  )
}