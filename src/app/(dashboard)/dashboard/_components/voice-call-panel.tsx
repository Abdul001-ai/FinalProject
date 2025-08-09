"use client"

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Mic, MicOff, Phone, PhoneOff, Volume2, VolumeX, Settings, Play, Pause } from "lucide-react"

// System prompt configuration
const DEFAULT_SYSTEM_PROMPT = "You are a helpful AI assistant. Answer concisely and clearly."
const SYSTEM_PROMPT =
  process.env.NEXT_PUBLIC_CLINIC_SYSTEM_PROMPT ||
  process.env.NEXT_PUBLIC_SYSTEM_PROMPT ||
  DEFAULT_SYSTEM_PROMPT

type ChatResponse = {
  reply: string
  ttsAudio?: string // base64 audio (audio/mpeg)
}

type RecognitionConstructor = new () => any

export default function VoiceCallPanel() {
  // Core state
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [aiResponse, setAiResponse] = useState("")
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [systemPrompt, setSystemPrompt] = useState<string>(SYSTEM_PROMPT)
  
  // Voice settings
  const [liveMode, setLiveMode] = useState<boolean>(true)
  const [echoUser, setEchoUser] = useState<boolean>(false)
  const [voiceVolume, setVoiceVolume] = useState<number>(1)
  const [voiceRate, setVoiceRate] = useState<number>(1)
  const [voicePitch, setVoicePitch] = useState<number>(1)
  const [selectedVoice, setSelectedVoice] = useState<string>("")
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([])
  
  // Microphone state
  const [micStatus, setMicStatus] = useState<"unknown" | "ready" | "blocked" | "error">("unknown")
  const [micError, setMicError] = useState<string>("")
  const [micLevel, setMicLevel] = useState<number>(0)
  const [isRecording, setIsRecording] = useState(false)
  
  // Vapi state
  const [vapiError, setVapiError] = useState<string>("")
  const [isCalling, setIsCalling] = useState(false)
  const [callDuration, setCallDuration] = useState<number>(0)
  const [vapiStatus, setVapiStatus] = useState<string>("idle")
  
  // Settings
  const [showSettings, setShowSettings] = useState(false)
  const [autoSend, setAutoSend] = useState(true)
  const [silenceThreshold, setSilenceThreshold] = useState<number>(2000)
  
  // Refs
  const recognitionRef = useRef<any | null>(null)
  const liveTimerRef = useRef<NodeJS.Timeout | null>(null)
  const lastSentTextRef = useRef<string>("")
  const transcriptBoxRef = useRef<HTMLTextAreaElement | null>(null)
  const transcriptSectionRef = useRef<HTMLDivElement | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const micStreamRef = useRef<MediaStream | null>(null)
  const callTimerRef = useRef<NodeJS.Timeout | null>(null)
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const vapiRef = useRef<any | null>(null)

  // Vapi configuration
  const VAPI_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || "ae3afd7e-ff6f-47dd-aba6-98be6b5f8f0a"
  const VAPI_ASSISTANT_ID = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID || "f7d66d75-8fa7-4168-9aef-4f70f6fb60e3"

  // Helper functions
  const toDetail = useCallback((err: any): string => {
    try {
      if (!err) return "Unknown error"
      if (typeof err === "string") return err
      if (err.message) return String(err.message)
      const keys = Object.keys(err || {})
      if (keys.length) {
        return keys.map((k) => `${k}=${String((err as any)[k])}`).join(", ")
      }
      return JSON.stringify(err)
    } catch {
      return "Unknown error"
    }
  }, [])

  const hasSpeechRecognition = useMemo(() => {
    if (typeof window === "undefined") return false
    const w = window as any
    return (
      typeof w.SpeechRecognition !== "undefined" ||
      typeof w.webkitSpeechRecognition !== "undefined"
    )
  }, [])

  // Load available voices
  useEffect(() => {
    if (typeof window === "undefined") return
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices()
      setAvailableVoices(voices)
      if (!selectedVoice && voices.length > 0) {
        // Prefer English voices
        const englishVoice = voices.find(v => v.lang.startsWith('en'))
        setSelectedVoice(englishVoice?.name || voices[0]?.name || "")
      }
    }
    loadVoices()
    window.speechSynthesis.onvoiceschanged = loadVoices
  }, [selectedVoice])

  // Microphone permission and audio level monitoring
  const setupMicMonitoring = useCallback(async (): Promise<boolean> => {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setMicStatus("error")
      setMicError("MediaDevices API unavailable")
      return false
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      })
      
      micStreamRef.current = stream
      
      // Setup audio level monitoring
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const analyser = audioContext.createAnalyser()
      const microphone = audioContext.createMediaStreamSource(stream)
      
      analyser.fftSize = 512
      analyser.minDecibels = -90
      analyser.maxDecibels = -10
      analyser.smoothingTimeConstant = 0.85
      
      microphone.connect(analyser)
      
      audioContextRef.current = audioContext
      analyserRef.current = analyser
      
      // Monitor audio levels
      const dataArray = new Uint8Array(analyser.frequencyBinCount)
      const updateLevel = () => {
        if (!analyserRef.current) return
        analyser.getByteFrequencyData(dataArray)
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length
        const normalizedLevel = Math.min(100, (average / 128) * 100)
        setMicLevel(normalizedLevel)
        
        if (isListening || isCalling) {
          requestAnimationFrame(updateLevel)
        }
      }
      
      if (isListening || isCalling) {
        updateLevel()
      }
      
      setMicStatus("ready")
      setMicError("")
      return true
    } catch (e: any) {
      const msg = e?.message || "Microphone access denied"
      setMicStatus(e?.name === "NotAllowedError" ? "blocked" : "error")
      setMicError(msg)
      return false
    }
  }, [isListening, isCalling])

  // Enhanced speech recognition setup
  const ensureRecognition = useCallback(() => {
    if (!hasSpeechRecognition || recognitionRef.current) return
    
    const w = window as any
    const SpeechRecognitionImpl: RecognitionConstructor =
      w.SpeechRecognition || w.webkitSpeechRecognition
    const rec = new SpeechRecognitionImpl()
    
    rec.lang = "en-US"
    rec.interimResults = true
    rec.continuous = true
    rec.maxAlternatives = 1

    let finalTranscript = ""
    let interimTranscript = ""

    rec.onresult = (event: any) => {
      interimTranscript = ""
      let sawFinal = false
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          sawFinal = true
          finalTranscript += result[0].transcript + " "
        } else {
          interimTranscript += result[0].transcript
        }
      }
      
      const fullTranscript = (finalTranscript + interimTranscript).trim()
      setTranscript(fullTranscript)

      // Auto-send on silence in live mode
      if (liveMode && autoSend && sawFinal) {
        const trimmed = fullTranscript.trim()
        if (trimmed && trimmed !== lastSentTextRef.current) {
          // Reset silence timer
          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current)
          silenceTimerRef.current = setTimeout(() => {
            if (trimmed === transcript.trim()) {
              lastSentTextRef.current = trimmed
              void sendToLLM(trimmed)
            }
          }, silenceThreshold)
        }
      }

      // Real-time mode with debouncing
      if (liveMode && !autoSend) {
        if (liveTimerRef.current) clearTimeout(liveTimerRef.current)
        liveTimerRef.current = setTimeout(() => {
          const trimmed = fullTranscript.trim()
          if (!trimmed || trimmed === lastSentTextRef.current) return
          lastSentTextRef.current = trimmed
          void sendToLLM(trimmed)
        }, 600)
      }
    }

    rec.onstart = () => {
      setIsListening(true)
      setIsRecording(true)
      finalTranscript = ""
      interimTranscript = ""
    }

    rec.onend = () => {
      setIsListening(false)
      setIsRecording(false)
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current)
    }

    rec.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error)
      setIsListening(false)
      setIsRecording(false)
      if (event.error === "no-speech") {
        // Auto-restart on no speech if still supposed to be listening
        setTimeout(() => {
          if (isListening) {
            try { rec.start() } catch {}
          }
        }, 1000)
      }
    }

    recognitionRef.current = rec
  }, [hasSpeechRecognition, liveMode, autoSend, silenceThreshold, transcript, isListening])

  // Enhanced TTS with voice selection
  const speak = useCallback((text: string) => {
    if (typeof window === "undefined" || !text.trim()) return
    
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    
    // Apply voice settings
    if (selectedVoice) {
      const voice = availableVoices.find(v => v.name === selectedVoice)
      if (voice) utterance.voice = voice
    }
    
    utterance.volume = voiceVolume
    utterance.rate = voiceRate
    utterance.pitch = voicePitch
    
    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)
    
    window.speechSynthesis.speak(utterance)
  }, [selectedVoice, availableVoices, voiceVolume, voiceRate, voicePitch])

  const playAudioBase64 = useCallback(async (base64: string) => {
    try {
      const audio = new Audio(`data:audio/mpeg;base64,${base64}`)
      audio.volume = voiceVolume
      setIsSpeaking(true)
      await audio.play()
      audio.onended = () => setIsSpeaking(false)
      audio.onerror = () => setIsSpeaking(false)
    } catch (error) {
      console.error("Audio playback error:", error)
      setIsSpeaking(false)
    }
  }, [voiceVolume])

  // Enhanced Vapi integration
  useEffect(() => {
    let mounted = true
    let callTimer: NodeJS.Timeout | null = null
    
    const initializeVapi = async () => {
      try {
        if (typeof window === "undefined" || !VAPI_PUBLIC_KEY || vapiRef.current) return
        
        const mod: any = await import("@vapi-ai/web").catch(() => null)
        if (!mod?.default || !mounted) return
        
        const vapi = new mod.default(VAPI_PUBLIC_KEY)
        vapiRef.current = vapi
        
        // Enhanced event listeners
        const setupVapiEvents = () => {
          try {
            vapi.on("call-start", () => {
              if (!mounted) return
              setIsCalling(true)
              setVapiStatus("connected")
              setCallDuration(0)
              
              // Start call timer
              callTimer = setInterval(() => {
                setCallDuration(prev => prev + 1)
              }, 1000)
            })
            
            vapi.on("call-end", () => {
              if (!mounted) return
              setIsCalling(false)
              setVapiStatus("idle")
              if (callTimer) {
                clearInterval(callTimer)
                callTimer = null
              }
            })
            
            vapi.on("speech-start", () => {
              if (!mounted) return
              setVapiStatus("user-speaking")
            })
            
            vapi.on("speech-end", () => {
              if (!mounted) return
              setVapiStatus("processing")
            })
            
            vapi.on("transcript", (evt: any) => {
              if (!mounted) return
              const text = evt?.text || evt?.transcript || ""
              if (text) {
                setTranscript(text)
                setVapiStatus("listening")
              }
            })
            
            vapi.on("message", (evt: any) => {
              if (!mounted) return
              const msg = evt?.text || evt?.message || evt?.content || ""
              if (msg) {
                setAiResponse(msg)
                setVapiStatus("assistant-speaking")
              }
            })
            
            vapi.on("error", (err: any) => {
              if (!mounted) return
              const detail = toDetail(err)
              setVapiError(detail)
              setVapiStatus("error")
              console.error("Vapi error:", err)
            })
            
            vapi.on("volume-level", (evt: any) => {
              if (!mounted) return
              const level = evt?.level || 0
              setMicLevel(level * 100)
            })
            
          } catch (error) {
            console.error("Error setting up Vapi events:", error)
          }
        }
        
        setupVapiEvents()
        
      } catch (error) {
        console.error("Error initializing Vapi:", error)
        if (mounted) {
          setVapiError("Failed to initialize Vapi SDK")
        }
      }
    }
    
    initializeVapi()
    
    return () => {
      mounted = false
      if (callTimer) clearInterval(callTimer)
      try { recognitionRef.current?.abort?.() } catch {}
      try { recognitionRef.current?.stop?.() } catch {}
      try { window?.speechSynthesis?.cancel?.() } catch {}
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach(track => track.stop())
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [VAPI_PUBLIC_KEY, toDetail])

  // Call duration formatting
  const formatCallDuration = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }, [])

  // Enhanced listening controls
  const startListening = useCallback(async () => {
    if (!hasSpeechRecognition) {
      alert("Speech Recognition not supported in this browser.")
      return
    }
    
    const micReady = await setupMicMonitoring()
    if (!micReady) return
    
    ensureRecognition()
    try {
      recognitionRef.current?.start()
      setTranscript("")
      setAiResponse("")
      setIsListening(true)
      setIsRecording(true)
      
      // Scroll to transcript
      try { 
        transcriptSectionRef.current?.scrollIntoView({ 
          behavior: "smooth", 
          block: "center" 
        }) 
      } catch {}
      try { transcriptBoxRef.current?.focus() } catch {}
    } catch (e) {
      console.error("Error starting recognition:", e)
    }
  }, [ensureRecognition, hasSpeechRecognition, setupMicMonitoring])

  const stopListening = useCallback(() => {
    try {
      recognitionRef.current?.stop()
      setIsRecording(false)
      if (liveTimerRef.current) clearTimeout(liveTimerRef.current)
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current)
    } catch (e) {
      console.error("Error stopping recognition:", e)
    }
  }, [])

  // Enhanced Vapi call controls
  const startCall = useCallback(async () => {
    try {
      if (!vapiRef.current) {
        setVapiError("Voice SDK is not ready yet. Please try again in a moment.")
        return
      }
      
      const micReady = await setupMicMonitoring()
      if (!micReady) {
        setVapiError("Microphone permission is required to start a call.")
        return
      }
      
      setVapiStatus("connecting")
      const response = await vapiRef.current.start({
        assistantId: VAPI_ASSISTANT_ID,
        metadata: { systemPrompt },
      })
      
      console.log("Call started", response)
      setVapiError("")
      
    } catch (err: any) {
      console.error("Vapi start error:", err)
      let errorMsg = "Failed to start call"
      
      if (err instanceof Response) {
        try {
          const text = await err.text()
          errorMsg = text || `HTTP ${err.status}`
        } catch {
          errorMsg = `HTTP ${err.status}`
        }
      } else {
        errorMsg = toDetail(err)
      }
      
      setVapiError(errorMsg)
      setVapiStatus("error")
    }
  }, [systemPrompt, VAPI_ASSISTANT_ID, setupMicMonitoring, toDetail])

  const endCall = useCallback(async () => {
    if (!vapiRef.current) return
    try {
      setVapiStatus("disconnecting")
      await vapiRef.current.stop()
      setIsCalling(false)
      setVapiStatus("idle")
      setCallDuration(0)
    } catch (error) {
      console.error("Error ending call:", error)
      setVapiError("Error ending call")
    }
  }, [])

  // Enhanced LLM communication
  const sendToLLM = useCallback(async (input: string) => {
    if (!input.trim()) return
    
    setAiResponse("Processing...")
    try {
      const res = await fetch("/api/voice-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input, systemPrompt }),
      })
      
      if (!res.ok) {
        const errText = await res.text()
        throw new Error(errText || `HTTP ${res.status}`)
      }
      
      const data: ChatResponse = await res.json()
      setAiResponse(data.reply)
      
      // Play response audio (avoid double audio during Vapi calls)
      if (!isCalling) {
        if (data.ttsAudio) {
          await playAudioBase64(data.ttsAudio)
        } else {
          speak(data.reply)
        }
      }
    } catch (err: any) {
      const errorMsg = err?.message || "Request failed"
      setAiResponse(`Error: ${errorMsg}`)
      console.error("LLM error:", err)
    }
  }, [systemPrompt, isCalling, playAudioBase64, speak])

  const handleSend = useCallback(async () => {
    const input = transcript.trim()
    if (!input) return
    await sendToLLM(input)
  }, [sendToLLM, transcript])

  // Unified call/stop handlers
  const onCallClick = useCallback(async () => {
    const preferVapi = Boolean(vapiRef.current && VAPI_ASSISTANT_ID)
    
    if (preferVapi) {
      await startCall()
      // Stop STT if running
      try { recognitionRef.current?.stop?.() } catch {}
      setIsListening(false)
    } else {
      await startListening()
    }
    
    // Focus transcript area
    try { 
      transcriptSectionRef.current?.scrollIntoView({ 
        behavior: "smooth", 
        block: "center" 
      }) 
    } catch {}
    try { transcriptBoxRef.current?.focus() } catch {}
  }, [VAPI_ASSISTANT_ID, startCall, startListening])

  const onStopClick = useCallback(async () => {
    if (isCalling) {
      await endCall()
    }
    if (isListening) {
      stopListening()
    }
    window.speechSynthesis.cancel()
    setIsSpeaking(false)
  }, [endCall, isCalling, isListening, stopListening])

  // Stop speaking
  const stopSpeaking = useCallback(() => {
    window.speechSynthesis.cancel()
    setIsSpeaking(false)
  }, [])

  // Clear transcript
  const clearTranscript = useCallback(() => {
    setTranscript("")
    setAiResponse("")
    lastSentTextRef.current = ""
  }, [])

  // Echo user speech (sidetone)
  useEffect(() => {
    if (!echoUser || !isListening || !transcript.trim()) return
    
    const timeoutId = setTimeout(() => {
      if (transcript.trim()) {
        speak(transcript.trim())
      }
    }, 500)
    
    return () => clearTimeout(timeoutId)
  }, [echoUser, isListening, transcript, speak])

  // Global voice trigger
  useEffect(() => {
    const handler = () => {
      void onCallClick()
    }
    window.addEventListener("voice:talk", handler)
    return () => window.removeEventListener("voice:talk", handler)
  }, [onCallClick])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (liveTimerRef.current) clearTimeout(liveTimerRef.current)
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current)
      if (callTimerRef.current) clearTimeout(callTimerRef.current)
    }
  }, [])

  const isActive = isListening || isCalling

  return (
    <div id="voice-assistant" className="rounded-2xl border bg-white p-6 shadow-sm dark:bg-gray-900">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold">Voice Assistant</h3>
          {isActive && (
            <div className="flex items-center gap-2">
              <div 
                className={`h-3 w-3 rounded-full ${
                  micLevel > 20 ? 'bg-green-500' : 
                  micLevel > 5 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ 
                  transform: `scale(${Math.max(0.5, micLevel / 50)})`,
                  transition: 'transform 0.1s ease'
                }}
              />
              <span className="text-sm text-muted-foreground">
                {isCalling ? `Call ${formatCallDuration(callDuration)}` : 
                 isRecording ? 'Recording' : 'Listening'}
              </span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded-md border hover:bg-gray-50 dark:hover:bg-gray-800"
            title="Settings"
          >
            <Settings className="h-4 w-4" />
          </button>
          
          {!isActive ? (
            <button
              onClick={onCallClick}
              className="flex items-center gap-2 px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 transition-colors"
              disabled={micStatus === "blocked"}
            >
              {vapiRef.current && VAPI_ASSISTANT_ID ? <Phone className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              {vapiRef.current && VAPI_ASSISTANT_ID ? "Start Call" : "Start Listening"}
            </button>
          ) : (
            <button
              onClick={onStopClick}
              className="flex items-center gap-2 px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors"
            >
              {isCalling ? <PhoneOff className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
              {isCalling ? "End Call" : "Stop Listening"}
            </button>
          )}
          
          {isSpeaking ? (
            <button
              onClick={stopSpeaking}
              className="flex items-center gap-2 px-3 py-2 rounded-md bg-orange-600 text-white hover:bg-orange-700"
            >
              <VolumeX className="h-4 w-4" />
              Stop
            </button>
          ) : null}
        </div>
      </div>

      {/* Status Messages */}
      {micStatus !== "ready" && micStatus !== "unknown" && (
        <div className="mb-4 rounded-md border border-yellow-300 bg-yellow-50 p-3 text-sm text-yellow-900 dark:bg-yellow-900/20 dark:text-yellow-200">
          <div className="flex items-center gap-2">
            <Mic className="h-4 w-4" />
            <b>Microphone:</b> {micStatus.toUpperCase()}
          </div>
          <div className="mt-1 text-xs">
            {micError || (micStatus === "blocked" ? "Please allow microphone access and reload." : "Check device settings.")}
          </div>
        </div>
      )}

      {vapiError && (
        <div className="mb-4 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-900 dark:bg-red-900/20 dark:text-red-200">
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            <b>Vapi Error:</b>
          </div>
          <div className="mt-1">{vapiError}</div>
          <div className="mt-2 text-xs">
            Checklist: Ensure Assistant ID and Public Key are valid, Allowed Origins include your domain, and you're using HTTPS/localhost.
          </div>
        </div>
      )}

      {/* Settings Panel */}
      {showSettings && (
        <div className="mb-6 rounded-lg border bg-gray-50 p-4 dark:bg-gray-800">
          <h4 className="mb-3 font-medium">Voice Settings</h4>
          
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Voice Selection */}
            <div>
              <label className="block text-sm font-medium mb-1">Voice</label>
              <select
                value={selectedVoice}
                onChange={(e) => setSelectedVoice(e.target.value)}
                className="w-full rounded-md border bg-background p-2 text-sm"
              >
                {availableVoices.map((voice) => (
                  <option key={voice.name} value={voice.name}>
                    {voice.name} ({voice.lang})
                  </option>
                ))}
              </select>
            </div>
            
            {/* Volume */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Volume: {Math.round(voiceVolume * 100)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={voiceVolume}
                onChange={(e) => setVoiceVolume(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
            
            {/* Rate */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Rate: {voiceRate}x
              </label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={voiceRate}
                onChange={(e) => setVoiceRate(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
            
            {/* Pitch */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Pitch: {voicePitch}x
              </label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={voicePitch}
                onChange={(e) => setVoicePitch(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
            
            {/* Auto Send Delay */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Silence Delay: {silenceThreshold}ms
              </label>
              <input
                type="range"
                min="500"
                max="5000"
                step="500"
                value={silenceThreshold}
                onChange={(e) => setSilenceThreshold(parseInt(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
          
          {/* Toggle Options */}
          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            <label className="flex items-center gap-2">
              <input 
                type="checkbox" 
                checked={liveMode} 
                onChange={(e) => setLiveMode(e.target.checked)} 
              />
              Live Mode
            </label>
            <label className="flex items-center gap-2">
              <input 
                type="checkbox" 
                checked={autoSend} 
                onChange={(e) => setAutoSend(e.target.checked)} 
              />
              Auto Send
            </label>
            <label className="flex items-center gap-2">
              <input 
                type="checkbox" 
                checked={echoUser} 
                onChange={(e) => setEchoUser(e.target.checked)} 
              />
              Echo User Voice
            </label>
          </div>
          
          {/* Test Voice Button */}
          <div className="mt-4">
            <button
              onClick={() => speak("This is a test of the voice settings.")}
              className="px-3 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 text-sm"
            >
              Test Voice
            </button>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left Column: Controls & Status */}
        <div className="space-y-4">
          {/* Vapi Call Status */}
          <div className="rounded-lg border p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-medium text-muted-foreground">Vapi Call Status</div>
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${
                  vapiStatus === "connected" || vapiStatus === "listening" ? "bg-green-500" :
                  vapiStatus === "connecting" || vapiStatus === "processing" ? "bg-yellow-500" :
                  vapiStatus === "error" ? "bg-red-500" : "bg-gray-400"
                }`} />
                <span className="text-xs capitalize">{vapiStatus}</span>
              </div>
            </div>
            
            {isCalling && (
              <div className="mb-3 text-lg font-mono text-center py-2 bg-green-50 dark:bg-green-900/20 rounded-md">
                {formatCallDuration(callDuration)}
              </div>
            )}
            
            <div className="flex gap-2">
              {!isCalling ? (
                <button
                  onClick={startCall}
                  disabled={!vapiRef.current || !VAPI_ASSISTANT_ID}
                  className="flex items-center gap-2 px-4 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Phone className="h-4 w-4" />
                  Start Call
                </button>
              ) : (
                <button
                  onClick={endCall}
                  className="flex items-center gap-2 px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors"
                >
                  <PhoneOff className="h-4 w-4" />
                  End Call
                </button>
              )}
            </div>
            
            {(!VAPI_PUBLIC_KEY || !VAPI_ASSISTANT_ID) && (
              <div className="mt-3 text-xs text-muted-foreground">
                Configure VAPI environment variables for full call functionality.
              </div>
            )}
          </div>

          {/* Microphone Status */}
          <div className="rounded-lg border p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-medium text-muted-foreground">Microphone</div>
              <div className="flex items-center gap-2">
                {isActive ? (
                  <Mic className={`h-4 w-4 ${micLevel > 20 ? 'text-green-500' : 'text-gray-400'}`} />
                ) : (
                  <MicOff className="h-4 w-4 text-gray-400" />
                )}
                <span className="text-xs">
                  {micStatus === "ready" ? "Ready" : 
                   micStatus === "blocked" ? "Blocked" : 
                   micStatus === "error" ? "Error" : "Unknown"}
                </span>
              </div>
            </div>
            
            {/* Audio Level Visualization */}
            {isActive && (
              <div className="mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs">Level:</span>
                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-100"
                      style={{ width: `${Math.min(100, micLevel)}%` }}
                    />
                  </div>
                  <span className="text-xs w-8">{Math.round(micLevel)}%</span>
                </div>
              </div>
            )}
            
            <div className="flex gap-2">
              {!isListening ? (
                <button
                  onClick={startListening}
                  disabled={micStatus === "blocked"}
                  className="flex items-center gap-2 px-3 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Mic className="h-4 w-4" />
                  Listen
                </button>
              ) : (
                <button
                  onClick={stopListening}
                  className="flex items-center gap-2 px-3 py-2 rounded-md bg-gray-600 text-white hover:bg-gray-700 transition-colors"
                >
                  <MicOff className="h-4 w-4" />
                  Stop
                </button>
              )}
              
              <button
                onClick={clearTranscript}
                className="px-3 py-2 rounded-md border hover:bg-gray-50 dark:hover:bg-gray-800 text-sm"
              >
                Clear
              </button>
            </div>
          </div>

          {/* System Prompt */}
          <div className="rounded-lg border p-4">
            <div className="text-sm font-medium text-muted-foreground mb-2">System Prompt</div>
            <textarea
              className="w-full rounded-md border bg-background p-3 text-sm resize-none"
              rows={4}
              placeholder="Configure your AI assistant's behavior..."
              value={systemPrompt}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setSystemPrompt(e.target.value)}
            />
          </div>
        </div>

        {/* Right Column: Transcript and AI Response */}
        <div className="space-y-4" ref={transcriptSectionRef}>
          {/* User Transcript */}
          <div className="rounded-lg border p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-medium text-muted-foreground">Your Speech</div>
              <div className="flex items-center gap-3 text-xs">
                {isActive && (
                  <span className={`px-2 py-1 rounded-full ${
                    isRecording ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300' :
                    'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300'
                  }`}>
                    {isRecording ? "Recording" : "Listening"}
                  </span>
                )}
                <button
                  onClick={handleSend}
                  disabled={!transcript.trim()}
                  className="px-3 py-1 rounded-md bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                >
                  Send
                </button>
              </div>
            </div>
            
            <textarea
              className="w-full rounded-md border bg-background p-3 text-sm resize-none"
              rows={6}
              placeholder={isActive ? "Speak now..." : "Click 'Start Listening' or type here..."}
              value={transcript}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setTranscript(e.target.value)}
              ref={transcriptBoxRef}
            />
            
            {transcript.trim() && (
              <div className="mt-2 text-xs text-muted-foreground">
                {transcript.trim().split(' ').length} words
              </div>
            )}
          </div>

          {/* AI Response */}
          <div className="rounded-lg border p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-medium text-muted-foreground">AI Response</div>
              <div className="flex items-center gap-2">
                {isSpeaking && (
                  <div className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400">
                    <Volume2 className="h-3 w-3" />
                    Speaking...
                  </div>
                )}
                {aiResponse && !isSpeaking && (
                  <button
                    onClick={() => speak(aiResponse)}
                    className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                    title="Replay response"
                  >
                    <Play className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>
            
            <div className="min-h-24 whitespace-pre-wrap rounded-md border bg-muted/30 p-3 text-sm dark:bg-gray-800/50">
              {aiResponse || (
                <span className="text-muted-foreground italic">
                  AI response will appear here...
                </span>
              )}
            </div>
            
            {aiResponse && (
              <div className="mt-2 text-xs text-muted-foreground">
                {aiResponse.length} characters
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="rounded-lg border p-4">
            <div className="text-sm font-medium text-muted-foreground mb-3">Quick Actions</div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setTranscript("How are you today?")}
                className="px-3 py-2 rounded-md border text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Greeting
              </button>
              <button
                onClick={() => setTranscript("What can you help me with?")}
                className="px-3 py-2 rounded-md border text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Capabilities
              </button>
              <button
                onClick={() => setTranscript("Tell me a joke")}
                className="px-3 py-2 rounded-md border text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Joke
              </button>
              <button
                onClick={() => setTranscript("What's the weather like?")}
                className="px-3 py-2 rounded-md border text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Weather
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Debug Info (Development Only) */}
      {process.env.NODE_ENV === "development" && (
        <div className="mt-6 rounded-lg border bg-gray-50 p-4 dark:bg-gray-800">
          <details>
            <summary className="text-sm font-medium cursor-pointer">Debug Info</summary>
            <div className="mt-2 text-xs space-y-1">
              <div>Speech Recognition: {hasSpeechRecognition ? "✓" : "✗"}</div>
              <div>Mic Status: {micStatus}</div>
              <div>Mic Level: {Math.round(micLevel)}%</div>
              <div>Is Listening: {isListening ? "✓" : "✗"}</div>
              <div>Is Recording: {isRecording ? "✓" : "✗"}</div>
              <div>Is Speaking: {isSpeaking ? "✓" : "✗"}</div>
              <div>Is Calling: {isCalling ? "✓" : "✗"}</div>
              <div>Vapi Status: {vapiStatus}</div>
              <div>Vapi SDK Ready: {vapiRef.current ? "✓" : "✗"}</div>
              <div>Secure Context: {typeof window !== "undefined" ? (window.isSecureContext ? "✓" : "✗") : "?"}</div>
              <div>Available Voices: {availableVoices.length}</div>
            </div>
          </details>
        </div>
      )}
    </div>
  )
}