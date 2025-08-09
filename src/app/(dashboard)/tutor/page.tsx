"use client"

import React, { useEffect, useMemo, useState } from "react"
import Vapi from "@vapi-ai/web"
import { useRouter } from "next/navigation"

// Inline icons (avoid external icon deps)
const IconBook = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={"h-5 w-5 "+(props.className??"")}> 
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M20 22H6.5A2.5 2.5 0 0 1 4 19.5V5a2 2 0 0 1 2-2h14z" />
  </svg>
)
const IconMessage = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={"h-4 w-4 "+(props.className??"")}> 
    <path d="M21 15a4 4 0 0 1-4 4H7l-4 4V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
  </svg>
)
const IconCheck = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={"h-4 w-4 "+(props.className??"")}> 
    <path d="M20 6 9 17l-5-5" />
  </svg>
)
const IconClock = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={"h-4 w-4 "+(props.className??"")}> 
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v6l4 2" />
  </svg>
)
const IconMic = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={"h-5 w-5 "+(props.className??"")}> 
    <rect x="9" y="2" width="6" height="11" rx="3" />
    <path d="M5 10a7 7 0 0 0 14 0" />
    <path d="M12 19v3" />
  </svg>
)
const IconMicOff = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={"h-5 w-5 "+(props.className??"")}> 
    <path d="M9 9v3a3 3 0 0 0 5.12 2.12" />
    <path d="M15 9V5a3 3 0 0 0-6 0v1" />
    <path d="M5 10a7 7 0 0 0 10.59 5" />
    <line x1="2" y1="2" x2="22" y2="22" />
  </svg>
)
const IconVideo = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={"h-5 w-5 "+(props.className??"")}> 
    <path d="M23 7l-7 5 7 5V7z" />
    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
  </svg>
)
const IconVideoOff = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={"h-5 w-5 "+(props.className??"")}> 
    <path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h9" />
    <path d="M22 8l-6 4 6 4V8z" />
    <line x1="2" y1="2" x2="22" y2="22" />
  </svg>
)

const TUTOR_CONFIG = {
  name: "AI Tutor",
  voice: { provider: "playht", voiceId: "jennifer" },
  model: { provider: "openai", model: "gpt-4o-mini" },
  transcriber: { provider: "deepgram", model: "nova-2", language: "en-US" },
}

export default function TutorSession() {
  // state
  const [isMicOn, setIsMicOn] = useState(true)
  const [isCameraOn, setIsCameraOn] = useState(true)
  const [sessionTime, setSessionTime] = useState(0)
  const [sessionProgress, setSessionProgress] = useState(0)
  const [isUnderstandingChecked, setIsUnderstandingChecked] = useState(false)
  const router = useRouter()

  // Important: use the correct env key name we already use elsewhere
  const publicKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || ""
  const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID || ""
  const systemPrompt =
    process.env.NEXT_PUBLIC_SYSTEM_PROMPT ||
    "You are a helpful AI assistant. Answer any user query clearly, accurately, and concisely. If clarification is needed, ask a brief follow-up question."

  // init vapi once
  const vapi = useMemo(() => new Vapi(publicKey), [publicKey])

  // core logic
  const startTutoring = async () => {
    try {
      if (!publicKey || !assistantId) {
        alert("Missing NEXT_PUBLIC_VAPI_PUBLIC_KEY or NEXT_PUBLIC_VAPI_ASSISTANT_ID in .env")
        return
      }
      // Ensure mic permission upfront for a smoother UX
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true })
      } catch (err) {
        console.error("Microphone permission denied:", err)
        alert(
          "Microphone access is required. Please allow mic permissions in your browser and try again."
        )
        return
      }

      // Start voice session with explicit STT, TTS, model and system prompt (instructions)
      await vapi.start({
        assistant: assistantId,
        firstMessage: undefined,
        model: { ...TUTOR_CONFIG.model },
        transcriber: { ...TUTOR_CONFIG.transcriber },
        voice: { ...TUTOR_CONFIG.voice },
        instructions: systemPrompt,
      })
    } catch (e) {
      console.error("Failed to start tutoring:", e)
      alert("Failed to start tutoring session. Check console for details.")
    }
  }

  const endSession = async () => {
    try {
      await vapi.stop()
      router.push("/dashboard")
    } catch (e) {
      console.error(e)
    }
  }

  const toggleMic = async () => {
    try {
      if (isMicOn) await vapi.mute(); else await vapi.unmute()
      setIsMicOn(!isMicOn)
    } catch (e) { console.error(e) }
  }

  useEffect(() => {
    const timer = setInterval(() => setSessionTime((s) => s + 1), 1000)
    // Basic logging to verify speech pipeline
    vapi.on("call-start", () => console.log("Vapi call started"))
    vapi.on("call-end", () => console.log("Vapi call ended"))
    vapi.on("message", (m: any) => {
      if (m?.type === "transcript") {
        // m.role is usually "user" or "assistant"; helpful for debugging mic/STT
        console.log(`${m.role}: ${m.transcript}`)
      }
    })
    return () => { clearInterval(timer); vapi.stop().catch(() => {}) }
  }, [vapi])

  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-white shadow-sm">
        <div className="flex items-center gap-3">
          <IconBook className="text-indigo-500" />
          <span className="text-xl font-bold text-gray-800">AI Tutor Session</span>
        </div>
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full text-sm">
            <IconClock className="text-indigo-500" />
            <span className="font-mono">{formatTime(sessionTime)}</span>
          </div>
          <div className="w-40">
            <div className="h-1.5 w-full overflow-hidden rounded bg-gray-200">
              <div className="h-full bg-indigo-500 transition-all" style={{ width: `${sessionProgress}%` }} />
            </div>
            <p className="text-xs text-gray-500 text-right mt-1">{sessionProgress}% Complete</p>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <main className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 h-[calc(100vh-140px)]">
        {/* Tutor Video */}
        <section className="lg:col-span-2 bg-white rounded-2xl shadow-md flex flex-col items-center justify-center relative">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-5xl shadow-lg">
            👩‍🏫
          </div>
          <h2 className="mt-4 text-2xl font-semibold text-gray-800">Your AI Tutor</h2>
          <p className="text-gray-500 mt-1">Teaching: </p>

          {isUnderstandingChecked && (
            <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200 flex flex-col items-center gap-3">
              <div className="flex items-center gap-2 text-indigo-500">
                <IconCheck />
                <span>Does that make sense?</span>
              </div>
              <div className="flex gap-3">
                <button className="rounded border border-green-300 bg-green-100 px-3 py-1.5 text-sm text-green-700 hover:bg-green-200">Yes</button>
                <button className="rounded border border-red-300 bg-red-100 px-3 py-1.5 text-sm text-red-700 hover:bg-red-200">Explain again</button>
              </div>
            </div>
          )}
        </section>

        {/* Student & Notes */}
        <section className="flex flex-col gap-6">
          {/* Student Preview */}
          <div className="flex-1 bg-white rounded-2xl shadow-md flex flex-col items-center justify-center">
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-5xl shadow-lg">
              👨‍🎓
            </div>
            <p className="text-gray-500 mt-2">Your Camera</p>
          </div>

          {/* Session Notes */}
          <div className="h-60 bg-white rounded-2xl shadow-md p-4 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-gray-700">Session Notes</h3>
              <IconMessage className="text-indigo-500" />
            </div>
            <div className="flex-1 overflow-y-auto text-sm text-gray-600 space-y-2">
              <p>Welcome! Your tutor will help you with .</p>
              <p className="text-indigo-500">Tip: Ask questions any time!</p>
            </div>
          </div>
        </section>
      </main>

      {/* Controls */}
      <footer className="fixed bottom-0 w-full flex justify-center items-center pb-6">
        <div className="flex items-center gap-5 bg-white shadow-lg border border-gray-200 px-5 py-3 rounded-full">
          <button
            onClick={toggleMic}
            className={`rounded-full h-12 w-12 inline-flex items-center justify-center ${isMicOn ? "hover:bg-gray-200" : "bg-red-100 hover:bg-red-200 text-red-600"}`}
            aria-label="Toggle microphone"
          >
            {isMicOn ? <IconMic /> : <IconMicOff />}
          </button>

          <button
            onClick={() => setIsCameraOn(!isCameraOn)}
            className={`rounded-full h-12 w-12 inline-flex items-center justify-center ${isCameraOn ? "bg-indigo-100 hover:bg-indigo-200 text-indigo-600" : "hover:bg-gray-200"}`}
            aria-label="Toggle camera"
          >
            {isCameraOn ? <IconVideo /> : <IconVideoOff />}
          </button>

          <button onClick={startTutoring} className="rounded-full h-12 px-6 bg-primary text-primary-foreground hover:opacity-90">Start Session</button>
          <button onClick={endSession} className="rounded-full h-12 px-6 bg-destructive text-destructive-foreground hover:opacity-90">End Session</button>
        </div>
      </footer>
    </div>
  )
}
