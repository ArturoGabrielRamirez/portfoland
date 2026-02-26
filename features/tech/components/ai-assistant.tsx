"use client"

import { useState } from "react"
import { Sparkles, Loader2, Send, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface AIAssistantProps {
  className?: string
}

const suggestions = [
  "How can I improve my bio?",
  "What skills should I add?",
  "Generate a summary of my profile",
  "Suggest a project to showcase",
]

export function AIAssistant({ className }: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<{ role: "user" | "ai"; content: string }[]>([
    { role: "ai", content: "Hi! I'm your AI assistant. Ask me anything about improving your portfolio!" },
  ])

  const handleSend = async () => {
    if (!message.trim()) return
    
    setMessages(prev => [...prev, { role: "user", content: message }])
    const userMsg = message
    setMessage("")
    setIsLoading(true)

    // Simulate AI response (will connect to Opus later)
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: "ai", 
        content: "I'm analyzing your portfolio... This is a preview. Connect me to Opus to get real recommendations!" 
      }])
      setIsLoading(false)
    }, 2000)
  }

  return (
    <div className={cn("border border-[hsl(174,100%,50%,0.12)] bg-[hsl(200,30%,8%)]", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[hsl(174,100%,50%,0.1)]">
        <div className="flex items-center gap-3">
          {/* AI Hex "Eye" Icon */}
          <div className="relative">
            <div className="w-10 h-10 clip-hexagon bg-[hsl(174,100%,50%,0.15)] border border-[hsl(174,100%,50%,0.4)] flex items-center justify-center">
              {isLoading ? (
                <Loader2 className="w-5 h-5 text-[hsl(174,100%,50%)] animate-spin" />
              ) : (
                <Sparkles className="w-5 h-5 text-[hsl(174,100%,50%)]" />
              )}
            </div>
            {/* Pulsing ring when thinking */}
            {isLoading && (
              <div className="absolute inset-0 w-10 h-10 clip-hexagon animate-ping bg-[hsl(174,100%,50%,0.3)]" />
            )}
          </div>
          <div>
            <h3 className="font-mono font-bold text-sm text-foreground">AI Assistant</h3>
            <p className="text-[10px] font-mono text-muted-foreground">
              {isLoading ? "Thinking..." : "Ask me anything"}
            </p>
          </div>
        </div>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="text-[10px] font-mono text-[hsl(174,100%,50%)] hover:underline"
        >
          {isOpen ? "Close" : "Expand"}
        </button>
      </div>

      {/* Expanded Content */}
      {isOpen && (
        <div className="p-4">
          {/* Messages */}
          <div className="space-y-3 mb-4 max-h-[200px] overflow-y-auto">
            {messages.map((msg, i) => (
              <div 
                key={i} 
                className={cn(
                  "text-xs font-mono p-3",
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
            ))}
            {isLoading && (
              <div className="flex items-center gap-2 text-[hsl(174,100%,50%)]">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span className="text-[10px] font-mono">AI is thinking...</span>
              </div>
            )}
          </div>

          {/* Quick Suggestions */}
          {!messages.length && (
            <div className="mb-4">
              <p className="text-[10px] font-mono text-muted-foreground mb-2">Try asking:</p>
              <div className="flex flex-wrap gap-2">
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
          )}

          {/* Input */}
          <div className="flex gap-2">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask something..."
              className="flex-1 bg-[hsl(200,20%,13%)] border border-[hsl(174,100%,50%,0.2)] text-xs font-mono text-foreground px-3 py-2 focus:outline-none focus:border-[hsl(174,100%,50%,0.5)]"
            />
            <button
              onClick={handleSend}
              disabled={!message.trim() || isLoading}
              className="bg-[hsl(174,100%,50%,0.2)] border border-[hsl(174,100%,50%,0.4)] text-[hsl(174,100%,50%)] p-2 hover:bg-[hsl(174,100%,50%,0.3)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
