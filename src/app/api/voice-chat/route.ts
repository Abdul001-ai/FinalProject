import { NextRequest } from "next/server"

export const runtime = "nodejs"

export async function POST(req: NextRequest) {
  try {
    const { input, systemPrompt } = await req.json()
    if (!input || typeof input !== "string") {
      return new Response(JSON.stringify({ error: "Missing input" }), { status: 400 })
    }

    const VAPI_API_URL = process.env.VAPI_API_URL || process.env.VAPI_BASE_URL
    const VAPI_API_KEY = process.env.VAPI_API_KEY
    const MODEL = process.env.MODEL_NAME || process.env.VAPI_MODEL || "gpt-4o-mini"
    const TTS_ENABLED = (process.env.VAPI_TTS_ENABLED || "true").toLowerCase() === "true"
    // OpenAI-compatible TTS defaults; many providers, including Vapi, proxy these
    const TTS_MODEL = process.env.VAPI_TTS_MODEL || "tts-1"
    const TTS_VOICE = process.env.VAPI_TTS_VOICE || "alloy"

    if (!VAPI_API_URL || !VAPI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "Server not configured. Set VAPI_API_URL and VAPI_API_KEY in .env" }),
        { status: 500 }
      )
    }

    // Guard: prevent posting to non-API/script URLs
    const lowerUrl = VAPI_API_URL.toLowerCase()
    if (lowerUrl.includes("unpkg.com") || lowerUrl.endsWith(".js") || lowerUrl.includes("widget.umd")) {
      return new Response(
        JSON.stringify({
          error:
            "VAPI_API_URL points to a script/widget. Set it to an OpenAI-compatible REST base, e.g. https://api.openai.com or https://api.vapi.ai",
        }),
        { status: 500 }
      )
    }

    // Many providers (including Vapi) are OpenAI-compatible.
    const payload = {
      model: MODEL,
      messages: [
        ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
        { role: "user", content: input },
      ],
      temperature: 0.3,
    }

    const res = await fetch(`${VAPI_API_URL.replace(/\/$/, "")}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${VAPI_API_KEY}`,
      },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const errText = await res.text()
      return new Response(JSON.stringify({ error: errText || `Upstream HTTP ${res.status}` }), { status: 502 })
    }

    const data: any = await res.json()

    // OpenAI-style response parsing
    const reply: string = data?.choices?.[0]?.message?.content || ""

    // Optionally synthesize speech via OpenAI-compatible TTS endpoint
    let ttsAudioBase64: string | undefined
    if (TTS_ENABLED && reply) {
      try {
        const ttsRes = await fetch(`${VAPI_API_URL.replace(/\/$/, "")}/v1/audio/speech`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${VAPI_API_KEY}`,
          },
          body: JSON.stringify({
            model: TTS_MODEL,
            voice: TTS_VOICE,
            input: reply,
            format: "mp3",
          }),
        })
        if (ttsRes.ok) {
          // Some providers return binary; others base64. Try to detect.
          const ct = ttsRes.headers.get("content-type") || ""
          if (ct.includes("application/json")) {
            const j: any = await ttsRes.json()
            ttsAudioBase64 = j?.audio?.data || j?.data || j?.audio || undefined
          } else {
            const arrBuf = await ttsRes.arrayBuffer()
            const bytes = Buffer.from(arrBuf)
            ttsAudioBase64 = bytes.toString("base64")
          }
        }
      } catch {
        // TTS optional; ignore failures
      }
    }

    return new Response(
      JSON.stringify({ reply, ...(ttsAudioBase64 ? { ttsAudio: ttsAudioBase64 } : {}) }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    )
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err?.message || "Unexpected error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
}
