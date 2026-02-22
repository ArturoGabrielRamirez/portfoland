"use client"

import { useState } from "react"
import { Send, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface AIAssistantWidgetProps {
  className?: string
}

const suggestions = [
  "Improve my bio",
  "What skills to add?",
  "Generate summary",
]

type AIStatus = "idle" | "thinking" | "ready"

export function AIAssistantWidget({ className }: AIAssistantWidgetProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [status, setStatus] = useState<AIStatus>("idle")
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<{ role: "user" | "ai"; content: string }[]>([])

  const handleSend = () => {
    if (!message.trim()) return
    
    setMessages(prev => [...prev, { role: "user", content: message }])
    setMessage("")
    setStatus("thinking")

    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: "ai", 
        content: "Preview mode - connect to Opus for real responses!" 
      }])
      setStatus("ready")
    }, 2500)
  }

  // Colors based on state
  const colors = isExpanded
    ? status === "ready"
      ? { // Green when ready/done
          main: "hsl(150,100%,45%)",
          secondary: "hsl(150,100%,45%,0.5)",
          glow: "0 0 20px hsl(150,100%,45%)",
          bg: "hsl(200,30%,8%)",
          border: "hsl(150,100%,45%,0.2)",
          text: "text-foreground",
        }
      : status === "thinking"
        ? { // Bright cyan when thinking
            main: "hsl(174,100%,50%)",
            secondary: "hsl(174,100%,50%,0.5)",
            glow: "0 0 25px hsl(174,100%,50%)",
            bg: "hsl(200,30%,10%)",
            border: "hsl(174,100%,50%,0.3)",
            text: "text-foreground",
          }
        : { // Normal cyan when awake
            main: "hsl(174,100%,50%)",
            secondary: "hsl(174,100%,50%,0.5)",
            glow: "0 0 15px hsl(174,100%,50%)",
            bg: "hsl(200,30%,8%)",
            border: "hsl(174,100%,50%,0.2)",
            text: "text-foreground",
          }
    : { // Dormant - dim red/magenta (asleep)
        main: "hsl(0,60%,40%)",
        secondary: "hsl(0,60%,30%,0.5)",
        glow: "none",
        bg: "hsl(200,20%,5%)",
        border: "hsl(0,60%,30%,0.15)",
        text: "text-muted-foreground",
      }

  return (
    <div className={cn("h-full", className)}>
      {/* Widget Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-3 w-full border p-3 transition-all duration-500"
        style={{ 
          backgroundColor: colors.bg,
          borderColor: colors.border
        }}
      >
        {/* Hex Eye */}
        <div className="relative flex-shrink-0">
          <svg width="56" height="56" viewBox="0 0 100 100" className="transition-all duration-500">
            {/* Outer glow ring - only when awake */}
            <circle
              cx="50" cy="50" r="46"
              fill="none"
              stroke={isExpanded ? colors.main : "transparent"}
              strokeWidth="1"
              opacity={isExpanded ? 0.3 : 0}
              className={isExpanded && status !== "thinking" ? "animate-pulse" : ""}
            />
            
            {/* Outer hex */}
            <path
              d="M50 5 L90 27.5 L90 72.5 L50 95 L10 72.5 L10 27.5 Z"
              fill="none"
              stroke={colors.main}
              strokeWidth="2.5"
              opacity={isExpanded ? 0.8 : 0.35}
              className="transition-all duration-500"
              style={{ filter: isExpanded ? `drop-shadow(0 0 3px ${colors.main})` : "none" }}
            />
            
            {/* Inner hex */}
            <path
              d="M50 15 L80 32.5 L80 67.5 L50 85 L20 67.5 L20 32.5 Z"
              fill={isExpanded ? "transparent" : colors.secondary}
              stroke={colors.main}
              strokeWidth="1.5"
              opacity={isExpanded ? 0.3 : 0.5}
              className="transition-all duration-500"
            />

            {/* Eye */}
            <g>
              {isExpanded ? (
                <>
                  {status === "thinking" ? (
                    <>
                      {/* Thinking - SEARCHING EYES - natural eye looking around */}
                      <ellipse cx="50" cy="50" rx="22" ry="16" fill={colors.secondary} stroke={colors.main} strokeWidth="1" opacity="0.5" />
                      
                      {/* Eyebrow */}
                      <path d="M38 38 Q50 32 62 38" fill="none" stroke={colors.main} strokeWidth="2" strokeLinecap="round" className="animate-smile" />
                      
                      {/* Single searching pupil with blink */}
                      <g className="animate-eye-searching">
                        <circle cx="50" cy="50" r="8" fill={colors.main} style={{ filter: `drop-shadow(0 0 6px ${colors.main})` }} className="animate-happy-blink" />
                        <circle cx="50" cy="50" r="4" fill="hsl(200,30%,5%)" />
                        <circle cx="48" cy="48" r="2" fill="white" opacity="0.8" />
                      </g>
                      
                      {/* Subtle processing rings */}
                      <circle cx="50" cy="50" r="32" fill="none" stroke={colors.main} strokeWidth="0.5" opacity="0.3" className="animate-spin-think" />
                    </>
                  ) : status === "ready" ? (
                    <>
                      {/* Ready - happy and satisfied - GREEN */}
                      <ellipse cx="50" cy="50" rx="20" ry="14" fill={colors.secondary} stroke={colors.main} strokeWidth="1" opacity="0.5" />
                      {/* Smile above the eye */}
                      <path d="M38 42 Q50 35 62 42" fill="none" stroke={colors.main} strokeWidth="2" strokeLinecap="round" className="animate-smile" />
                      {/* Eye with pupil + iris like others */}
                      <g className="animate-ready-happy">
                        <circle cx="50" cy="50" r="7" fill={colors.main} style={{ filter: `drop-shadow(0 0 6px ${colors.main})` }} className="animate-happy-blink" />
                        <circle cx="50" cy="50" r="3" fill="hsl(200,30%,5%)" />
                        <circle cx="48" cy="48" r="1.5" fill="white" opacity="0.8" />
                      </g>
                    </>
                  ) : (
                    <>
                      {/* Normal awake - looking around + blinking */}
                      <ellipse cx="50" cy="50" rx="20" ry="14" fill={colors.secondary} stroke={colors.main} strokeWidth="1" opacity="0.4" />
                      
                      {/* Eyebrow */}
                      <path d="M38 38 Q50 32 62 38" fill="none" stroke={colors.main} strokeWidth="2" strokeLinecap="round" className="animate-smile" />
                      
                      {/* Blinking + looking */}
                      <g className="animate-eye-awake-blink-look">
                        <circle cx="50" cy="50" r="7" fill={colors.main} style={{ filter: `drop-shadow(0 0 4px ${colors.main})` }} className="animate-happy-blink" />
                        <circle cx="50" cy="50" r="3" fill="hsl(200,30%,5%)" />
                        <circle cx="48" cy="48" r="1.5" fill="white" opacity="0.8" />
                      </g>
                    </>
                  )}
                </>
              ) : (
                <>
                  {/* Dormant - sleeping with closed eye + Zzz */}
                  {/* Closed eye line */}
                  <path d="M30 50 Q50 42 70 50" fill="none" stroke={colors.main} strokeWidth="2" strokeLinecap="round" opacity="0.6" className="transition-all duration-500 animate-sleep-eye" />
                  {/* Zzz animation */}
                  <g className="animate-sleep-z">
                    <text x="50" y="35" fill={colors.main} fontSize="14" fontFamily="monospace" textAnchor="middle" opacity="0.7">Z</text>
                    <text x="62" y="28" fill={colors.main} fontSize="10" fontFamily="monospace" textAnchor="middle" opacity="0.6">z</text>
                    <text x="70" y="22" fill={colors.main} fontSize="7" fontFamily="monospace" textAnchor="middle" opacity="0.5">z</text>
                  </g>
                  <circle cx="50" cy="50" r="35" fill={colors.main} fillOpacity="0.05" className="animate-hex-idle-breathe" />
                </>
              )}
            </g>
          </svg>
        </div>

        {/* Text */}
        <div className="flex-1 text-left min-w-0 transition-all duration-500">
          <h3 className={cn("font-mono font-bold text-sm", colors.text)}>
            AI Assistant
          </h3>
          <p className={cn("text-[10px] font-mono", isExpanded ? "text-muted-foreground" : "text-muted-foreground/60")}>
            {isExpanded 
              ? status === "thinking" ? "Thinking..." : status === "ready" ? "Done!" : "Ask me"
              : "Click to wake"
            }
          </p>
        </div>

        {/* Expand/Collapse icon */}
        <X className={cn("w-4 h-4 transition-all duration-500", isExpanded ? "rotate-0 text-foreground" : "-rotate-90 text-muted-foreground/50")} />
      </button>

      {/* Expanded Panel */}
      {isExpanded && (
        <div className="mt-2 border animate-expand-in" style={{ borderColor: colors.border }}>
          <div className="p-3 min-h-[140px] max-h-[180px] overflow-y-auto space-y-2">
            {messages.length === 0 ? (
              <div className="text-center py-3">
                <p className="text-[10px] font-mono text-muted-foreground mb-2">Try asking:</p>
                <div className="flex flex-wrap gap-1 justify-center">
                  {suggestions.map((sug, i) => (
                    <button key={i} onClick={() => setMessage(sug)} className="text-[9px] font-mono px-2 py-1 bg-[hsl(200,30%,12%)] border border-[hsl(174,100%,50%,0.2)] hover:border-[hsl(174,100%,50%,0.5)]">
                      {sug}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg, i) => (
                <div key={i} className={cn("text-[10px] font-mono p-2", msg.role === "ai" ? "bg-[hsl(174,100%,50%,0.05)] border border-[hsl(174,100%,50%,0.1)]" : "bg-[hsl(200,30%,12%)] ml-4")}>
                  <span className={msg.role === "ai" ? "text-[hsl(174,100%,50%)]" : "text-muted-foreground"}>&gt; </span>
                  {msg.content}
                </div>
              ))
            )}
            {status === "thinking" && <div className="text-[hsl(174,100%,50%)] text-[10px] font-mono animate-pulse">&gt; Thinking...</div>}
          </div>

          <div className="flex gap-2 p-3 border-t" style={{ borderColor: "hsl(174,100%,50%,0.1)" }}>
            <input value={message} onChange={(e) => setMessage(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSend()} placeholder="Ask something..." className="flex-1 bg-[hsl(200,20%,13%)] border border-[hsl(174,100%,50%,0.2)] text-xs font-mono text-foreground px-3 py-2 focus:outline-none focus:border-[hsl(174,100%,50%,0.5)]" />
            <button onClick={handleSend} disabled={!message.trim() || status === "thinking"} className="bg-[hsl(174,100%,50%,0.2)] border border-[hsl(174,100%,50%,0.4)] text-[hsl(174,100%,50%)] p-2 hover:bg-[hsl(174,100%,50%,0.3)] disabled:opacity-50">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
