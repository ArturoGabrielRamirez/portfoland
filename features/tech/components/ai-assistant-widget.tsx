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
    idle: { border: "hsl(174,100%,50%)", fill: "hsl(174,100%,50%,0.1)", glow: "none" },
    thinking: { border: "hsl(174,100%,50%)", fill: "hsl(174,100%,50%,0.2)", glow: "0 0 12px hsl(174,100%,50%)" },
    ready: { border: "hsl(150,100%,45%)", fill: "hsl(150,100%,45%,0.2)", glow: "0 0 12px hsl(150,100%,45%)" },
  }

  const colors = statusColors[status]

  return (
    <div className={cn("relative", className)}>
      {/* Widget Header - Always Visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-3 w-full border border-[hsl(174,100%,50%,0.2)] bg-[hsl(200,30%,8%)] p-3 hover:border-[hsl(174,100%,50%,0.4)] transition-colors"
      >
        {/* Hex Status Indicator */}
        <div className="relative flex-shrink-0">
          <svg width="40" height="40" viewBox="0 0 100 100" className="drop-shadow-lg">
            <path
              d="M50 5 L90 27.5 L90 72.5 L50 95 L10 72.5 L10 27.5 Z"
              fill="none"
              stroke={colors.border}
              strokeWidth="3"
              opacity={status === "idle" ? 0.5 : 1}
              className={cn("transition-all duration-300", status === "thinking" && "animate-pulse")}
              style={{ filter: colors.glow !== "none" ? colors.glow : undefined }}
            />
            <path
              d="M50 15 L80 32.5 L80 67.5 L50 85 L20 67.5 L20 32.5 Z"
              fill={colors.fill}
              stroke={colors.border}
              strokeWidth="2"
            />
            {status === "thinking" ? (
              <Loader2 
                x="35" y="35" 
                width="30" height="30" 
                className="animate-spin text-[hsl(174,100%,50%)]"
                style={{ animationDuration: "1s" }}
              />
            ) : status === "ready" ? (
              <Sparkles x="38" y="38" width="24" height="24" className="text-[hsl(150,100%,45%)]" />
            ) : (
              <MessageSquare x="38" y="38" width="24" height="24" className="text-[hsl(174,100%,50%)]" />
            )}
          </svg>
          {status === "thinking" && (
            <div className="absolute inset-0 w-10 h-10 animate-ping bg-[hsl(174,100%,50%,0.3)] rounded-full" />
          )}
        </div>

        <div className="flex-1 text-left">
          <h3 className="font-mono font-bold text-sm text-foreground">AI Assistant</h3>
          <p className="text-[10px] font-mono text-muted-foreground">
            {status === "thinking" ? "Thinking..." : status === "ready" ? "Ready" : "Ask me anything"}
          </p>
        </div>

        <X className={cn(
          "w-4 h-4 text-muted-foreground transition-transform",
          isExpanded ? "rotate-0" : "rotate-180"
        )} />
      </button>

      {/* Expanded Chat Panel */}
      {isExpanded && (
        <div className="mt-2 border border-[hsl(174,100%,50%,0.2)] bg-[hsl(200,30%,8%)]">
          {/* Messages */}
          <div className="p-3 min-h-[150px] max-h-[200px] overflow-y-auto space-y-2">
            {messages.length === 0 ? (
              <div className="text-center py-4">
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
                    {msg.role === "ai" ? "AI: " : "You: "}
                  </span>
                  {msg.content}
                </div>
              ))
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
