"use client"

import * as React from "react"
import { Check, ChevronDown } from "lucide-react"
import { cn } from "@/utils/cn"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const ACCENTS = ["default", "blue", "green", "amber", "mono"] as const
export type Accent = typeof ACCENTS[number]

function setAccent(accent: Accent) {
  const root = document.documentElement
  // enable smooth color transition for a moment
  root.classList.add("accent-transition")
  if (accent === "default") {
    root.removeAttribute("data-accent")
  } else {
    root.setAttribute("data-accent", accent)
  }
  try {
    localStorage.setItem("accent-theme", accent)
  } catch {}
  // remove transition class after animation
  window.setTimeout(() => root.classList.remove("accent-transition"), 350)
}

function getAccent(): Accent {
  try {
    const v = localStorage.getItem("accent-theme") as Accent | null
    if (v && ACCENTS.includes(v)) return v
  } catch {}
  const attr = document.documentElement.getAttribute("data-accent") as Accent | null
  return (attr && ACCENTS.includes(attr) ? attr : "default")
}

export default function AccentSwitch() {
  const [accent, setAccentState] = React.useState<Accent>("default")
  const index = React.useMemo(() => ACCENTS.indexOf(accent), [accent])

  React.useEffect(() => {
    const stored = getAccent()
    setAccentState(stored)
    // apply to document on mount so theme persists on reload
    setAccent(stored)
  }, [])

  const onSelect = (value: Accent) => {
    setAccent(value)
    setAccentState(value)
  }

  const onToggleClick = () => {
    const next = ACCENTS[(index + 1) % ACCENTS.length]
    onSelect(next)
  }

  const label = accent === "default" ? "Default" : accent.charAt(0).toUpperCase() + accent.slice(1)

  return (
    <div className="flex items-center gap-2">
      {/* Sliding toggle that cycles accents */}
      <button
        type="button"
        onClick={onToggleClick}
        aria-label="Toggle accent theme"
        className="relative h-8 w-48 select-none overflow-hidden rounded-full border bg-muted/60 shadow-inner"
      >
        <div className="pointer-events-none absolute inset-0 grid grid-cols-5 text-[10px] font-medium">
          <div className="flex items-center justify-center text-foreground/60">Def</div>
          <div className="flex items-center justify-center text-blue-600">Blue</div>
          <div className="flex items-center justify-center text-green-600">Green</div>
          <div className="flex items-center justify-center text-amber-600">Amber</div>
          <div className="flex items-center justify-center text-foreground/60">Mono</div>
        </div>
        <span
          className="pointer-events-none absolute top-0 h-full w-[20%] rounded-full bg-background shadow transition-all duration-300"
          style={{ left: `${index * 20}%` }}
        />
      </button>

      {/* Dropdown for direct pick */}
      <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="min-w-[150px] justify-between">
          <span>Select a theme: {label}</span>
          <ChevronDown className="ml-2 h-4 w-4 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Default</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => onSelect("default")}>
          <Check className={cn("mr-2 h-4 w-4", accent === "default" ? "opacity-100" : "opacity-0")} />
          Default
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Scaled</DropdownMenuLabel>
        {(["blue","green","amber"] as Accent[]).map(opt => (
          <DropdownMenuItem key={opt} onClick={() => onSelect(opt)}>
            <Check className={cn("mr-2 h-4 w-4", accent === opt ? "opacity-100" : "opacity-0")} />
            {opt.charAt(0).toUpperCase()+opt.slice(1)}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Monospaced</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => onSelect("mono")}>
          <Check className={cn("mr-2 h-4 w-4", accent === "mono" ? "opacity-100" : "opacity-0")} />
          Mono
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
    </div>
  )
}
