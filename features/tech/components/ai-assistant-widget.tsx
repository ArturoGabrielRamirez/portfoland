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

  const statusColors = {
    idle: { main: "hsl(174,100%,50%)", glow: "none", bg: "hsl(200,30%,8%)" },
    thinking: { main: "hsl(174,100%,50%)", glow: "0 0 20px hsl(174,100%,50%)", bg: "hsl(200,30%,10%)" },
    ready: { main: "hsl(150,100%,45%)", glow: "0 0 20px hsl(150,100%,45%)", bg: "hsl(200,30%,8%)" },
  }

  const colors = statusColors[status]

  return (
    <div className={cn("h-full", className)}>
      {/* Widget Header - Always Visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-3 w-full border border-[hsl(174,100%,50%,0.2)] bg-[hsl(200,30%,8%)] p-3 hover:border-[hsl(174,100%,50%,0.4)] transition-colors"
        style={{ backgroundColor: colors.bg }}
      >
        {/* Animated Hex Eye */}
        <div className="relative flex-shrink-0">
          <svg width="48" height="48" viewBox="0 0 100 100" className="drop-shadow-lg">
            {/* Outer hex */}
            <path
              d="M50 5 L90 27.5 L90 72.5 L50 95 L10 72.5 L10 27.5 Z"
              fill="none"
              stroke={colors.main}
              strokeWidth="2.5"
              opacity={status === "idle" ? 0.4 : 0.9}
              style={{ filter: colors.glow !== "none" ? colors.glow : undefined }}
              className="transition-all duration-300"
            />
            
            {/* Inner hex */}
            <path
              d="M50 15 L80 32.5 L80 67.5 L50 85 L20 67.5 L20 32.5 Z"
              fill="transparent"
              stroke={colors.main}
              strokeWidth="1.5"
              opacity={0.3}
            />

            {/* Eye container with animation */}
            <g className="transition-transform duration-300">
              {/* Eye white */}
              <ellipse
                cx="50" cy="50" rx="20" ry="14"
                fill={colors.main}
                fillOpacity="0.1"
                stroke={colors.main}
                strokeWidth="1"
                opacity="0.5"
              />
              
              {/* Animated pupil */}
              {status === "thinking" ? (
                <>
                  {/* Looking around - multiple positions */}
                  <circle cx="50" cy="50" r="6" fill={colors.main} className="animate-eye-search-1" />
                  <circle cx="58" cy="46" r="4" fill={colors.main} className="animate-eye-search-2" style={{ animationDelay: "0.3s" }} />
                  <circle cx="42" cy="54" r="5" fill={colors.main} className="animate-eye-search-3" style={{ animationDelay: "0.6s" }} />
                </>
              ) : status === "ready" ? (
                <>
                  {/* Looking right with satisfied expression */}
                  <ellipse cx="52" cy="50" rx="8" ry="7" fill={colors.main}>
                    <animate attributeName="ry" values="7;8;7" dur="2s" repeatCount="indefinite" />
                  </ellipse>
                  <circle cx="52" cy="50" r="3" fill="hsl(200,30%,5%)" />
                  {/* Happy shine */}
                  <circle cx="49" cy="47" r="2" fill="white" opacity="0.7" />
                </>
              ) : (
                <>
                  {/* Normal idle eye - blinking */}
                  <circle cx="50" cy="50" r="7" fill={colors.main} className="animate-eye-idle" />
                  <circle cx="50" cy="50" r="3" fill="hsl(200,30%,5%)" />
                  <circle cx="48" cy="48" r="1.5" fill="white" opacity="0.8" />
                </>
              )}
            </g>

            {/* Thinking: orbital rings */}
            {status === "thinking" && (
              <>
                <circle cx="50" cy="50" r="28" fill="none" stroke={colors.main} strokeWidth="1" strokeDasharray="4 6" opacity="0.4" className="animate-spin-slow" />
                <circle cx="50" cy="50" r="35" fill="none" stroke={colors.main} strokeWidth="0.5" strokeDasharray="2 8" opacity="0.3" className="animate-spin-slower" style={{ animationDirection: "reverse" }} />
              </>
            )}

            {/* Ready: success pulse */}
            {status === "ready" && (
              <circle cx="50" cy="50" r="40" fill="none" stroke={colors.main} strokeWidth="1" opacity="0.2" className="animate-ping" />
            )}
          </svg>
        </div>

        <div className="flex-1 text-left min-w-0">
          <h3 className="font-mono font-bold text-sm text-foreground truncate">AI Assistant</h3>
          <p className="text-[10px] font-mono text-muted-foreground truncate">
            {status === "thinking" ? "Processing..." : status === "ready" ? "Ready!" : "Ask me anything"}
          </p>
        </div>

        <X className={cn(
          "w-4 h-4 text-muted-foreground transition-transform duration-300",
          isExpanded ? "rotate-90" : "-rotate-90"
        )} />
      </button>

      {/* Expanded Chat Panel */}
      {isExpanded && (
        <div className="mt-2 border border-[hsl(174,100%,50%,0.2)] bg-[hsl(200,30%,8%)]" style={{ backgroundColor: colors.bg }}>
          {/* Messages */}
          <div className="p-3 min-h-[140px] max-h-[180px] overflow-y-auto space-y-2">
            {messages.length === 0 ? (
              <div className="text-center py-3">
                <p className="text-[10px] font-mono text-muted-foreground mb-2">Try asking:</p>
                <div className="flex flex-wrap gap-1 justify-center">
                  {suggestions.map((sug, i) => (
                    <button
                      key={i}
                      onClick={() => setMessage(sug)}
                      className="text-[9px] font-mono px-2 py-1 bg-[hsl(200,30%,12%)] border border-[hsl(174,100%,50%,0.2)] text-foreground hover:border-[hsl(174,100%,50%,0.5)] transition-colors"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg, i) => (
                <div 
                  key={i}
                  className={cn(
                    "text-[10px] font-mono p-2",
                    msg.role === "ai" 
                      ? "bg-[hsl(174,100%,50%,0.05)] border border-[hsl(174,100%,50%,0.1)]" 
                      : "bg-[hsl(200,30%,12%)] ml-4"
                  )}
                >
                  <span className={msg.role === "ai" ? "text-[hsl(174,100%,50%)]" : "text-muted-foreground"}>
                    &gt; 
                  </span>
                  {msg.content}
                </div>
              ))
            )}
            {status === "thinking" && (
              <div className="text-[hsl(174,100%,50%)] text-[10px] font-mono animate-pulse">&gt; Analyzing...</div>
            )}
          </div>

          {/* Input */}
          <div className="flex gap-2 p-3 border-t border-[hsl(174,100%,50%,0.1)]">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask something..."
              className="flex-1 bg-[hsl(200,20%,13%)] border border-[hsl(174,100%,50%,0.2)] text-xs font-mono text-foreground px-3 py-2 focus:outline-none focus:border-[hsl(174,100%,50%,0.5)]"
            />
            <button
              onClick={handleSend}
              disabled={!message.trim() || status === "thinking"}
              className="bg-[hsl(174,100%,50%,0.2)] border border-[hsl(174,100%,50%,0.4)] text-[hsl(174,100%,50%)] p-2 hover:bg-[hsl(174,100%,50%,0.3)] transition-colors disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
