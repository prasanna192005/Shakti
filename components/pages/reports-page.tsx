'use client'

import { useState } from 'react'

// Simple markdown-ish -> HTML converter for small structured AI output.
function escapeHtml(unsafe: string) {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function markdownToHtml(md: string) {
  if (!md) return ''
  const lines = md.split(/\r?\n/)
  let html = ''
  let inUl = false
  let inOl = false

  const flushLists = () => {
    let out = ''
    if (inUl) out += '</ul>'
    if (inOl) out += '</ol>'
    inUl = false
    inOl = false
    return out
  }

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i]
    const line = raw.trim()
    if (!line) {
      html += flushLists() + '<div style="height: 1rem;"></div>'
      continue
    }

    // headings - HIGH CONTRAST BLACK TEXT
    const hMatch = line.match(/^(#{1,6})\s+(.*)$/)
    if (hMatch) {
      html += flushLists()
      const level = Math.min(6, hMatch[1].length)
      const content = escapeHtml(hMatch[2])
      let styles = ''
      
      if (level === 2) {
        styles = 'style="font-size: 1.5rem; font-weight: 900; margin-top: 1.5rem; margin-bottom: 1rem; color: #000000; border-bottom: 3px solid #059669; padding-bottom: 0.75rem;"'
      } else if (level === 3) {
        styles = 'style="font-size: 1.25rem; font-weight: 800; margin-top: 1rem; margin-bottom: 0.75rem; color: #000000;"'
      } else {
        styles = 'style="font-size: 1.1rem; font-weight: 700; margin-top: 0.75rem; margin-bottom: 0.5rem; color: #000000;"'
      }
      html += `<h${level} ${styles}>${content}</h${level}>`
      continue
    }

    // ordered list - BLACK TEXT, HIGH VISIBILITY
    const olMatch = line.match(/^\d+\.\s+(.*)$/)
    if (olMatch) {
      if (!inOl) {
        html += flushLists()
        html += '<ol style="margin-left: 1.75rem; margin-bottom: 1rem; list-style-type: decimal;">'
        inOl = true
      }
      html += `<li style="margin-bottom: 0.75rem; line-height: 1.8; color: #000000; font-size: 0.95rem;">${escapeHtml(olMatch[1])}</li>`
      continue
    }

    // unordered list - BLACK TEXT, HIGH VISIBILITY
    const ulMatch = line.match(/^[\-*]\s+(.*)$/)
    if (ulMatch) {
      if (!inUl) {
        html += flushLists()
        html += '<ul style="margin-left: 1.75rem; margin-bottom: 1rem; list-style-type: disc;">'
        inUl = true
      }
      html += `<li style="margin-bottom: 0.75rem; line-height: 1.8; color: #000000; font-size: 0.95rem;">${escapeHtml(ulMatch[1])}</li>`
      continue
    }

    // paragraph - HIGH CONTRAST BLACK TEXT
    html += flushLists()
    let content = escapeHtml(line)
    // bold **text** - PURE BLACK
    content = content.replace(/\*\*(.+?)\*\*/g, '<strong style="font-weight: 900; color: #000000;">$1</strong>')
    // italics *text* - DARK BLUE
    content = content.replace(/\*(.+?)\*/g, '<em style="color: #1e40af; font-style: italic; font-weight: 600;">$1</em>')
    // ₹ amounts - HIGHLY VISIBLE GREEN BOX WITH WHITE TEXT
    content = content.replace(/₹\s?(\d+(?:,\d{3})*(?:\.\d{2})?)/g, '<span style="font-weight: 900; color: #ffffff; background-color: #059669; padding: 0.35rem 0.6rem; border-radius: 0.3rem; display: inline-block;">₹$1</span>')
    html += `<p style="margin-bottom: 1.2rem; line-height: 1.8; color: #000000; font-size: 0.95rem;">${content}</p>`
  }

  html += flushLists()
  return html
}
import { Sidebar } from '@/components/sidebar'
import { Navbar } from '@/components/navbar'
import { useToast } from '@/hooks/use-toast'

export function ReportsPage({ onNavigate, onLogout, currentPage }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { toast } = useToast()

  const [aiLoading, setAiLoading] = useState(false)
  const [aiReport, setAiReport] = useState<string | null>(null)
  const [audience, setAudience] = useState<'consumer' | 'operator'>('consumer')
  const [verbosity, setVerbosity] = useState<number>(2)

  const reports = [
    { name: 'Monthly Energy Report', date: 'Nov 2025', size: '2.4 MB' },
    { name: 'Grid Performance Analysis', date: 'Nov 15, 2025', size: '1.8 MB' },
    { name: 'Anomaly Detection Report', date: 'Nov 20, 2025', size: '890 KB' },
    { name: 'Load Forecasting Study', date: 'Nov 2025', size: '3.1 MB' },
  ]

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} onLogout={onLogout} onNavigate={onNavigate} currentPage={currentPage} />

      <div className="flex-1 flex flex-col w-full md:pl-64">
        <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} onLogout={onLogout} />

        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="px-6 pt-6 pb-2">
            <h2 className="text-3xl font-bold tracking-tight">Reports</h2>
            <p className="text-muted-foreground">Generate and view system reports</p>
          </div>

          {/* AI Report Section - Takes all available height minus bottom controls */}
          <div className="flex flex-col flex-1 overflow-hidden px-6 pb-6 pt-4">
            <h3 className="text-lg font-semibold mb-2">AI Generated Report</h3>
            <p className="text-sm text-muted-foreground mb-3">Get an AI summary of your recent usage with actionable recommendations.</p>
            
            {/* Controls */}
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              <button
                className={`px-4 py-2 rounded bg-emerald-600 text-white hover:opacity-90 ${aiLoading ? 'opacity-60 cursor-wait' : ''}`}
                onClick={async () => {
                  try {
                    setAiLoading(true)
                    setAiReport(null)

                    // Build a short synthetic summary from the available reports as an example.
                    const summary = `You have ${reports.length} reports available. Recent items include: ${reports.map(r => r.name + ' (' + r.date + ')').join('; ')}. There were recent anomalies and spikes detected.`

                    const res = await fetch('/api/generate-report', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ summary, audience, verbosity }),
                    })

                    const json = await res.json()
                    console.log('Report response:', { ok: res.ok, reportLength: json.report?.length, error: json.error })
                    if (!res.ok) {
                      toast({ title: 'AI report failed', description: json?.error || 'Unknown error' })
                      setAiLoading(false)
                      return
                    }
                    if (!json.report || json.report.trim().length === 0) {
                      toast({ title: 'Empty report', description: 'The AI generated an empty report. Check server logs.' })
                      setAiLoading(false)
                      return
                    }
                    setAiReport(json.report)
                    toast({ title: 'Report generated', description: `Generated ${json.report.length} characters` })
                  } catch (err: any) {
                    toast({ title: 'AI report error', description: err?.message || String(err) })
                  } finally {
                    setAiLoading(false)
                  }
                }}
                disabled={aiLoading}
              >
                {aiLoading ? 'Generating…' : 'Generate AI Report'}
              </button>

              <a
                className="px-4 py-2 rounded border border-border text-sm hover:bg-muted"
                href="#ai-report"
                onClick={(e) => {
                  if (!aiReport) {
                    e.preventDefault(); toast({ title: 'No report yet', description: 'Generate the AI report first' })
                  }
                }}
              >
                View on Website
              </a>

              <label className="text-sm">Audience:</label>
              <select value={audience} onChange={(e) => setAudience(e.target.value as any)} className="px-3 py-1 rounded border">
                <option value="consumer">Consumer (household)</option>
                <option value="operator">Operator (technical)</option>
              </select>

              <label className="text-sm">Detail:</label>
              <select value={verbosity} onChange={(e) => setVerbosity(Number(e.target.value))} className="px-2 py-1 rounded border">
                <option value={1}>Brief</option>
                <option value={2}>Detailed</option>
                <option value={3}>Very Detailed</option>
              </select>
            </div>

            {/* Report Display - Scrollable - WHITE BG FOR MAXIMUM VISIBILITY */}
            {aiReport ? (
              <div id="ai-report" className="flex-1 bg-white border border-border rounded-lg p-8 overflow-y-auto min-h-0">
                <h4 className="font-bold text-2xl mb-6 text-black">AI Insights & Recommendations</h4>
                <div className="max-w-none">
                  <div
                    className="text-base leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: markdownToHtml(aiReport) }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex-1 bg-white border border-border rounded-lg p-6 flex items-center justify-center min-h-0">
                <p className="text-black font-semibold">Generate a report to see insights and recommendations here</p>
              </div>
            )}
          </div>

          {/* Available Reports - Fixed height at bottom */}
          <div className="border-t border-border px-6 py-4 overflow-auto max-h-48">
            <h3 className="text-lg font-semibold mb-3">Available Reports</h3>
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
          </div>
        </main>
      </div>
    </div>
  )
}
