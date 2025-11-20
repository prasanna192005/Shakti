// app/api/generate-report/route.ts
import type { NextRequest } from 'next/server'

console.log('generate-report: module loaded')

export async function GET() {
  console.log('generate-report: GET called')
  return Response.json({ ok: true, route: '/api/generate-report' })
}

export async function POST(request: NextRequest) {
  console.log('generate-report: POST called')

  try {
    const body = await request.json().catch(() => ({}))
    const userSummary = (body.summary || '').trim()

    if (!userSummary) {
      return Response.json(
        { error: 'Missing "summary" in request body' },
        { status: 400 }
      )
    }

// 1. specific pool variable
    const keyPool = process.env.GEMINI_KEYS_POOL;

    // 2. Fallback logic: Check pool first, then individual keys if pool fails
    let apiKey = null;

    if (keyPool) {
        // Split the string by comma, remove whitespace, and filter out empty entries
        const keys = keyPool.split(',').map(k => k.trim()).filter(k => k);
        
        // Pick a random key from the array
        if (keys.length > 0) {
            apiKey = keys[Math.floor(Math.random() * keys.length)];
        }
    }

    // 3. Final validation (checking if we successfully got a key)
    // Use existing fallbacks if the pool didn't work
    if (!apiKey) {
        apiKey = process.env.GENERATIVE_API_KEY || process.env.GEN_API_KEY || process.env.GEMINI_API_KEY;
    }

    if (!apiKey) {
      return Response.json(
        { error: 'Missing API key (set GEMINI_KEYS_POOL in .env)' },
        { status: 500 }
      )
    }

    const audience = (body.audience || 'consumer').toString()
    const verbosity = Number(body.verbosity || 2)

    console.log('generate-report: audience =', audience, 'verbosity =', verbosity)

    // SIMPLIFIED PROMPT - minimal overhead, max output space
    const prompt = audience === 'operator'
      ? `Energy Report for Operator (Technical)
${userSummary}

Provide:
1. Executive Summary
2. Root Cause Analysis  
3. Diagnostics & Metrics
4. Remediation Steps (prioritized)
5. Resources`
      : `Energy Report: Indian Household
${userSummary}

Provide ONLY:
1. Summary (1 para, plain English)
2. Consumption (appliances, patterns)
3. Cost Breakdown (₹ amounts, %)
4. Insights (3-6 numbered)
5. Recommendations (numbered, format: Problem | Solution | Monthly Savings ₹X | Cost ₹X | ROI):
6. Resources (Indian products/services)`

    console.log('generate-report: prompt (first 500 chars):', prompt.slice(0, 500))

    // Modern Gemini 1.5 Flash endpoint (fast, cheap, reliable)
    const endpoint = `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${process.env.GENERATIVE_API_KEY}`

    // Increase token budget to absolute max for output, disable thinking
    const maxTokens = 8000

    const generationConfig = {
      temperature: 0.7,
      maxOutputTokens: maxTokens,
      candidateCount: 1,
      // DO NOT use extended thinking - it wastes tokens
    }

    console.log('generate-report: sending request to Gemini with generationConfig', generationConfig)

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig,
      }),
    })

    if (!res.ok) {
      const errorText = await res.text()
      console.error('Gemini API error:', res.status, errorText)
      return Response.json(
        { error: 'Failed to generate report', details: errorText },
        { status: res.status }
      )
    }

    const data = await res.json()

      // Diagnostic: log the raw model response (trimmed) so we can inspect shape
      try {
        const raw = JSON.stringify(data)
        console.log('generate-report: model response (truncated):', raw.slice(0, 2000))
      } catch (e) {
        console.log('generate-report: could not stringify model response', e)
      }

    // Correct way to extract text from Gemini response
      // Try to extract text from several common response shapes (recursive)
      const extractText = (node: any, depth = 0): string => {
        if (!node || depth > 10) return ''
        if (typeof node === 'string') return node.trim()
        if (Array.isArray(node)) {
          // prefer longest non-empty string found
          let best = ''
          for (const item of node) {
            const t = extractText(item, depth + 1)
            if (t && t.length > best.length) best = t
          }
          return best
        }
        if (typeof node === 'object') {
          // Common shapes: { content: { parts: [{ text }] } } or { content: [{ type, text }] }
          // Check known keys first - prioritize text extraction
          for (const key of ['text', 'output_text', 'content', 'parts', 'output', 'candidates', 'result', 'choices']) {
            if (node[key]) {
              const t = extractText(node[key], depth + 1)
              if (t && t.length > 50) return t // Found substantial text, return immediately
            }
          }
          // Otherwise search all properties
          for (const k of Object.keys(node)) {
            const t = extractText(node[k], depth + 1)
            if (t && t.length > 50) return t // Found substantial text
          }
        }
        return ''
      }

      let report = extractText(data) || ''
      
      console.log('generate-report: extracted report length:', report.length)
      
      // If the extractor yields a JSON string (from fallback), try to clean it
      if (report && report.startsWith('{') && report.indexOf('"') >= 0) {
        try {
          // attempt to parse and pull textual fields
          const parsed = JSON.parse(report)
          report = extractText(parsed) || report
        } catch (_) {
          // keep original
        }
      }
      
      // Additional fallback: if report is still short, try to find it in data.candidates
      if (!report || report.length < 100) {
        console.log('generate-report: report too short, trying fallback extraction')
        if (data.candidates && Array.isArray(data.candidates) && data.candidates.length > 0) {
          const candidate = data.candidates[0]
          if (candidate.content && candidate.content.parts && Array.isArray(candidate.content.parts)) {
            report = candidate.content.parts.map((p: any) => p.text || '').join('')
            console.log('generate-report: fallback extraction got', report.length, 'chars')
          }
        }
      }

    if (!report) {
      console.warn('generate-report: empty report extracted, returning debug info')
      return new Response(JSON.stringify({ report: '', error: 'Empty model response', raw: data }), { status: 502 })
    }

    return new Response(JSON.stringify({ report }), { status: 200 })
  } catch (err: any) {
    console.error('generate-report error:', err)
    return Response.json(
      { error: 'Internal server error', message: err?.message },
      { status: 500 }
    )
  }
}