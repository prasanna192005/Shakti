// app/api/generate-report/route.ts
import type { NextRequest } from 'next/server'

console.log("generate-report: module loaded")

export async function GET() {
  return Response.json({ ok: true, route: "/api/generate-report" })
}

export async function POST(request: NextRequest) {
  console.log("generate-report: POST called")

  try {
    console.log("STEP 1: Reading request body…")

    let body: any = {}
    try {
      body = await request.json()
      console.log("STEP 1.1: Body =", body)
    } catch (err) {
      console.error("STEP 1 ERROR: Invalid JSON:", err)
      return Response.json(
        { error: "Invalid JSON body", details: String(err) },
        { status: 400 }
      )
    }

    console.log("STEP 2: Extracting summary…")
    const userSummary = (body.summary || "").trim()

    if (!userSummary) {
      return Response.json(
        { error: 'Missing "summary" in request body' },
        { status: 400 }
      )
    }

    // -----------------------------------------------------
    // 🔥 USE NEXT_PUBLIC_OPENROUTER_API_KEY EXACTLY AS YOU SAID
    // -----------------------------------------------------
    console.log("STEP 3: Reading NEXT_PUBLIC_OPENROUTER_API_KEY…")
    const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY

    console.log("STEP 3.1: Key exists =", apiKey ? "YES" : "NO")

    if (!apiKey) {
      return Response.json(
        { error: "Missing NEXT_PUBLIC_OPENROUTER_API_KEY" },
        { status: 500 }
      )
    }

    console.log("STEP 4: Building prompt…")

    const audience = (body.audience || "consumer").toString()

    const prompt =
      audience === "operator"
        ? `Energy Report for Operator
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
1. Summary (1 para)
2. Consumption (patterns + appliances)
3. Cost Breakdown (₹ amounts)
4. Insights (3–6)
5. Recommendations (Problem | Solution | Savings ₹X | Cost ₹X | ROI)
6. Indian Resources/Products`

    const maxTokens = 800 // prevents 402 cost errors

    console.log("STEP 5: Sending request to OpenRouter…")

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": "http://localhost:3000", // required
        "X-Title": "Smart Energy Report"
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-chat",
        max_tokens: maxTokens,
        temperature: 0.7,
        messages: [
          { role: "system", content: "You generate structured energy reports." },
          { role: "user", content: prompt }
        ]
      })
    })

    console.log("STEP 5.1: Response status =", response.status)

    if (!response.ok) {
      const errText = await response.text()
      console.error("STEP 5 ERROR:", errText)
      return Response.json(
        { error: "Model error", details: errText },
        { status: response.status }
      )
    }

    console.log("STEP 6: Parsing model response…")
    const data = await response.json()

    const content = data?.choices?.[0]?.message?.content || ""

    console.log("STEP 7: Final report length =", content.length)

    if (!content) {
      return Response.json(
        { error: "Empty model response", raw: data },
        { status: 500 }
      )
    }

    console.log("STEP 8: Returning report")

    return Response.json({ report: content }, { status: 200 })
  }

  catch (err: any) {
    console.error("🔥 generate-report FATAL ERROR:", err)
    return Response.json(
      { error: "Internal error", message: err?.message, stack: err?.stack },
      { status: 500 }
    )
  }
}
