"use client"

import React, { useEffect, useMemo } from "react"

// Renders the Vapi voice widget using public env vars
// Required envs:
// - NEXT_PUBLIC_VAPI_PUBLIC_KEY
// - NEXT_PUBLIC_VAPI_ASSISTANT_ID
// Optional: NEXT_PUBLIC_VAPI_WIDGET_SRC (defaults to Vapi CDN)

const WIDGET_SRC_DEFAULT =
  "https://unpkg.com/@vapi-ai/client-sdk-react/dist/embed/widget.umd.js"

export function VapiWidget() {
  const publicKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY
  const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID
  const scriptSrc = process.env.NEXT_PUBLIC_VAPI_WIDGET_SRC || WIDGET_SRC_DEFAULT

  const valid = useMemo(() => Boolean(publicKey && assistantId), [publicKey, assistantId])

  useEffect(() => {
    if (!valid) return
    // Inject the widget script once
    const existing = document.querySelector(`script[src="${scriptSrc}"]`)
    if (existing) return
    const s = document.createElement("script")
    s.src = scriptSrc
    s.async = true
    s.type = "text/javascript"
    document.body.appendChild(s)
    return () => {
      // keep script for reuse between navigations
    }
  }, [scriptSrc, valid])

  if (!valid) {
    return (
      <div className="rounded-xl border p-4 text-sm">
        <div className="font-semibold">Vapi Widget</div>
        <div className="mt-1 text-muted-foreground">
          Set NEXT_PUBLIC_VAPI_PUBLIC_KEY and NEXT_PUBLIC_VAPI_ASSISTANT_ID in your .env.local to enable the widget.
        </div>
      </div>
    )
  }

  // Custom element provided by the Vapi script
  // eslint-disable-next-line @next/next/no-img-element
  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm dark:bg-gray-900">
      <h3 className="text-lg font-semibold mb-2">Vapi Voice Widget</h3>
      {/* @ts-expect-error - custom element injected by script */}
      <vapi-widget assistant-id={assistantId} public-key={publicKey}></vapi-widget>
      <div className="mt-2 text-xs text-muted-foreground">
        This widget is powered directly by Vapi. It operates independently of the custom VoiceCallPanel.
      </div>
    </div>
  )
}
