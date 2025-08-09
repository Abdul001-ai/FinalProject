"use client"

import React from "react"

export function TalkWithMeButton() {
  const onClick = React.useCallback(() => {
    try {
      const el = document.getElementById("voice-assistant")
      el?.scrollIntoView({ behavior: "smooth", block: "center" })
      window.dispatchEvent(new Event("voice:talk"))
    } catch {}
  }, [])

  return (
    <button
      onClick={onClick}
      className="px-3 py-2 rounded-md bg-primary text-primary-foreground hover:opacity-90"
    >
      Talk with Me
    </button>
  )
}
