"use client"

import { useState } from "react"
import { Sparkles, Loader2, Send, X, MessageSquare } from "lucide-react"
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
    const userMsg = message
    setMessage("")
    setStatus("thinking")

    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: "ai", 
        content: "Preview mode - connect to Opus for real responses!" 
      }])
      setStatus("ready")
    }, 2000)
  }

  const statusColors = {
    idle: { main: "hsl(174,100%,50%)", glow: "none" },
    thinking: { main: "hsl(174,100%,50%)", glow: "0 0 15px hsl(174,100%,50%)" },
    ready: { main: "hsl(150,100%,45%)", glow: "0 0 15px hsl(150,100%,45%)" },
  }

  const colors = statusColors[status]

  return (
    <div className={cn("relative", className)}>
      {/* Compact Widget - Hex + Expand Button */}
      <div className="flex items-start gap-2">
        {/* Hex Eye Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="relative group"
        >
          <svg 
            width="56" 
            height="56" 
            viewBox="0 0 100 100" 
            className="drop-shadow-lg transition-transform group-hover:scale-105"
          >
            {/* Outer hex */}
            <path
              d="M50 5 L90 27.5 L90 72.5 L50 95 L10 72.5 L10 27.5 Z"
              fill="none"
              stroke={colors.main}
              strokeWidth="3"
              opacity={status === "idle" ? 0.4 : 0.8}
              className="transition-all duration-300"
              style={{ filter: colors.glow !== "none" ? colors.glow : undefined }}
            />
            
            {/* Inner hex fill */}
            <path
              d="M50 15 L80 32.5 L80 67.5 L50 85 L20 67.5 L20 32.5 Z"
              fill={status === "idle" ? "hsl(200,30%,8%)" : colors.main}
              fillOpacity={status === "idle" ? 0.3 : 0.15}
              stroke={colors.main}
              strokeWidth="2"
              className="transition-all duration-300"
            />

            {/* Eye - different positions based on status */}
            <g className={cn(
              "transition-all duration-500",
              status === "thinking" && "animate-eye-look"
            )}>
              {/* Eye white */}
              <ellipse
                cx="50" cy="50" rx="18" ry="12"
                fill="hsl(200,30%,15%)"
                stroke={colors.main}
                strokeWidth="1"
              />
              
              {/* Iris */}
              <circle
                cx={status === "thinking" ? "55" : status === "ready" ? "45" : "50"}
                cy="50"
                r="8"
                fill={colors.main}
                className="transition-all duration-300"
                style={{ filter: colors.glow }}
              />
              
              {/* Pupil */}
              <circle
                cx={status === "thinking" ? "55" : status === "ready" ? "45" : "50"}
                cy="50"
                r="4"
                fill="hsl(200,30%,5%)"
              />
              
              {/* Eye shine */}
              <circle cx="46" cy="46" r="2" fill="white" opacity="0.8" />
            </g>

            {/* Thinking animation - spinning rings */}
            {status === "thinking" && (
              <>
                <circle
                  cx="50" cy="50" r="25"
                  fill="none"
                  stroke={colors.main}
                  strokeWidth="1"
                  strokeDasharray="4 4"
                  className="animate-spin"
                  style={{ animationDuration: "2s" }}
                />
                <circle
                  cx="50" cy="50" r="30"
                  fill="none"
                  stroke={colors.main}
                  strokeWidth="0.5"
                  strokeDasharray="2 6"
                  className="animate-spin"
                  style={{ animationDuration: "3s", animationDirection: "reverse" }}
                />
              </>
            )}

            {/* Ready checkmark effect */}
            {status === "ready" && (
              <path
                d="M42 50 L48 56 L58 44"
                fill="none"
                stroke={colors.main}
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="animate-draw-check"
              />
            )}
          </svg>
          
          {/* Status label */}
          <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[8px] font-mono text-muted-foreground whitespace-nowrap">
            {status === "thinking" ? "..." : status === "ready" ? "!" : "AI"}
          </span>
        </button>

        {/* Expanded Panel */}
        {isExpanded && (
          <div className="flex-1 border border-[hsl(174,100%,50%,0.2)] bg-[hsl(200,30%,8%)] min-w-[280px]">
            {/* Header */}
            <div className="flex items-center justify-between p-2 border-b border-[hsl(174,100%,50%,0.1)]">
              <span className="text-xs font-mono text-foreground">AI Assistant</span>
              <button onClick={() => setIsExpanded(false)}>
                <X className="w-3 h-3 text-muted-foreground" />
              </button>
            </div>

            {/* Messages */}
            <div className="p-2 min-h-[100px] max-h-[150px] overflow-y-auto text-[10px] font-mono">
              {messages.length === 0 ? (
                <div className="text-muted-foreground text-center py-2">
                  Ask me anything...
                </div>
              ) : (
                messages.map((msg, i) => (
                  <div 
                    key={i}
                    className={cn(
                      "mb-1 p-1",
                      msg.role === "ai" 
                        ? "text-[hsl(174,100%,50%)]" 
                        : "text-muted-foreground"
                    )}
                  >
                    &gt; {msg.content}
                  </div>
                ))
              )}
              {status === "thinking" && (
                <div className="text-[hsl(174,100%,50%)] animate-pulse">&gt; Thinking...</div>
              )}
            </div>

            {/* Input */}
            <div className="flex gap-1 p-2 border-t border-[hsl(174,100%,50%,0.1)]">
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="..."
                className="flex-1 bg-[hsl(200,20%,13%)] border border-[hsl(174,100%,50%,0.2)] text-xs font-mono text-foreground px-2 py-1 focus:outline-none"
              />
              <button
                onClick={handleSend}
                disabled={!message.trim() || status === "thinking"}
                className="text-[hsl(174,100%,50%)] p-1 disabled:opacity-50"
              >
                <Send className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
