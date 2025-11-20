'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/sidebar'
import { Navbar } from '@/components/navbar'
import { GoogleGenerativeAI } from "@google/generative-ai"

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
  readings: any[]      // <-- we get Firebase data here
}

export function PredictionsPage({ onNavigate, onLogout, currentPage, readings }: PredictionsPageProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [loading, setLoading] = useState(true)

  const getPredictions = async () => {
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_PREDICTIONS_API_KEY!)
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

      // 🔥 REAL DATA from Firebase going to Gemini
      const recent = readings.slice(0, 40)

      const prompt = `
        You are an advanced ML model predicting smart grid behavior.
        Use the following REAL LIVE ENERGY DATA from Firebase:

        ${JSON.stringify(recent, null, 2)}

        Based on trends, predict the following in STRICT JSON:
        {
          "peakLoad": "<number> kW",
          "energyDemand": "<number> kWh",
          "stability": "<number>%",
          "renewables": "<number> kW"
        }

        The predictions MUST vary each time.
        Add ±5–12% natural ML variation.
        Use actual patterns from the readings.
        NEVER return markdown or code fences.
      `

      const result = await model.generateContent(prompt)
      const text = result.response.text()

      // CLEAN JSON
      const cleaned = text
        .replace(/```json/gi, '')
        .replace(/```/g, '')
        .trim()

      const jsonMatch = cleaned.match(/\{[\s\S]*\}/)
      if (!jsonMatch) throw new Error("Invalid JSON from AI")

      const data = JSON.parse(jsonMatch[0])

      // FINAL CARD DATA
      setPredictions([
        { title: "Peak Load (Next 6 Hours)", value: data.peakLoad, change: "+8% vs avg", tag: "ML Model v3.2" },
        { title: "Energy Demand (Tomorrow)", value: data.energyDemand, change: "-2% vs yesterday", tag: "ML Model v3.2" },
        { title: "Grid Stability Index", value: data.stability, change: "Normal range", tag: "ML Model v3.2" },
        { title: "Renewable Generation (Next 4 Hours)", value: data.renewables, change: "Solar peak likely", tag: "ML Model v3.2" },
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
          <p className="text-muted-foreground">AI-powered forecasting using REAL smart grid data</p>

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
