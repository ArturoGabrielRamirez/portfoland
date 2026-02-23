"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { Send } from "lucide-react"
import { cn } from "@/lib/utils"

// =============================================================================
// Types
// =============================================================================

type AIState = "sleeping" | "waking" | "drowsy" | "awake" | "listening" | "thinking" | "ready" | "success"

interface CRTWithAIProps {
    userName: string
    className?: string
    /** Milliseconds of inactivity before sleep. Default: 45 seconds */
    idleTimeout?: number
}

interface ConsoleLine {
    text: string
    color: string
    prefix: string
}

interface ChatMessage {
    role: "user" | "ai" | "system"
    content: string
}

// =============================================================================
// Constants
// =============================================================================

const IDLE_TIMEOUT_MS = 60 * 1000
const INACTIVITY_RETURN_MS = 5000 // 5 seconds for testing views
const AUTONOMOUS_IDLE_MS = 3000

const BOOT_LINES: ConsoleLine[] = [
    { text: "session_stats --display --verbose", color: "white", prefix: "$ " },
    { text: "Loading profile... [OK]", color: "green", prefix: "> " },
    { text: "XP: 1,900 | Level: 18 | Rank: Explorer", color: "cyan", prefix: "> " },
    { text: "Achievements: 18/42 unlocked [43%]", color: "yellow", prefix: "> " },
    { text: "Streak: 12 days | Skills: 24 active", color: "magenta", prefix: "> " },
    { text: "Neural link optimal. Awaiting input...", color: "green", prefix: "> " },
]

const colorClass: Record<string, string> = {
    cyan: "text-[hsl(174,100%,50%)]",
    green: "text-[hsl(150,100%,45%)]",
    yellow: "text-[hsl(52,100%,50%)]",
    magenta: "text-[hsl(330,100%,65%)]",
    white: "text-foreground",
    red: "text-[hsl(0,80%,55%)]",
    purple: "text-[hsl(260,80%,65%)]",
}

// =============================================================================
// Helper Components
// =============================================================================

function DecipherText({ text, active, onComplete }: { text: string; active: boolean; onComplete?: () => void }) {
    const [display, setDisplay] = useState("")
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*+=-"
    const timer = useRef<NodeJS.Timeout | null>(null)

    useEffect(() => {
        if (!active) {
            setDisplay("")
            return
        }

        let iteration = 0
        const maxIterations = text.length * 3

        timer.current = setInterval(() => {
            setDisplay(
                text.split("").map((char, index) => {
                    if (char === " ") return " "
                    if (index < iteration / 3) return text[index]
                    return chars[Math.floor(Math.random() * chars.length)]
                }).join("")
            )

            if (iteration >= maxIterations) {
                if (timer.current) clearInterval(timer.current)
                onComplete?.()
            }
            iteration++
        }, 30)

        return () => { if (timer.current) clearInterval(timer.current) }
    }, [text, active, onComplete])

    return <span>{display}</span>
}

// =============================================================================
// AI Eye SVG — Success Flash, Advanced Thinking, Selective Blink
// =============================================================================

function AIEye({
    state,
    mouseOffset,
    isBlinking
}: {
    state: AIState;
    mouseOffset: { x: number; y: number };
    isBlinking: boolean;
}) {
    const isSleeping = state === "sleeping"
    const isWaking = state === "waking"
    const isThinking = state === "thinking"
    const isSuccess = state === "success"
    const isDrowsy = state === "drowsy"
    const isAsleepLike = isSleeping || isWaking

    const mainColor = isSuccess
        ? "hsl(150,100%,45%)"
        : isThinking
            ? "hsl(330,100%,65%)"
            : (isSleeping || isDrowsy)
                ? "hsl(0,80%,55%)"
                : "hsl(174,100%,50%)"

    // Pupil Jitter for Thinking
    const [jitter, setJitter] = useState({ x: 0, y: 0 })
    useEffect(() => {
        if (!isThinking) {
            setJitter({ x: 0, y: 0 })
            return
        }
        const interval = setInterval(() => {
            setJitter({ x: (Math.random() - 0.5) * 4, y: (Math.random() - 0.5) * 4 })
        }, 80)
        return () => clearInterval(interval)
    }, [isThinking])

    const pupilX = isAsleepLike || isDrowsy ? 0 : Math.max(-6, Math.min(6, mouseOffset.x * 6)) + jitter.x
    const pupilY = isAsleepLike || isDrowsy ? 0 : Math.max(-6, Math.min(6, mouseOffset.y * 6)) + jitter.y

    return (
        <svg
            width="90"
            height="90"
            viewBox="0 0 100 100"
            className="transition-all duration-700 flex-shrink-0"
        >
            {/* Outer glow ring */}
            <circle
                cx="50" cy="50" r="46"
                fill="none"
                stroke={mainColor}
                strokeWidth="0.8"
                opacity={isSuccess ? 0.6 : 0.2}
                className={!isSleeping && !isBlinking ? (isSuccess ? "animate-pulse" : "animate-hex-idle-breathe") : ""}
            />

            {/* Outer hex border — ALWAYS VISIBLE */}
            <path
                d="M50 5 L90 27.5 L90 72.5 L50 95 L10 72.5 L10 27.5 Z"
                fill="none"
                stroke={mainColor}
                strokeWidth="2"
                opacity={isAsleepLike ? 0.4 : 0.8}
                className={cn("transition-all duration-700", isThinking ? "animate-hex-active-pulse" : "")}
                style={{ filter: !isSleeping ? `drop-shadow(0 0 4px ${mainColor})` : "none" }}
            />

            {/* Inner rotating segments for THINKING */}
            {isThinking && (
                <g className="animate-spin-slow" style={{ transformOrigin: '50% 50%' }}>
                    <path d="M50 15 L80 32.5" stroke={mainColor} strokeWidth="2" opacity="0.6" strokeLinecap="round" />
                    <path d="M50 85 L20 67.5" stroke={mainColor} strokeWidth="2" opacity="0.6" strokeLinecap="round" />
                </g>
            )}

            {/* Inner hex area background */}
            <path
                d="M50 15 L80 32.5 L80 67.5 L50 85 L20 67.5 L20 32.5 Z"
                fill={mainColor}
                fillOpacity={isSuccess ? 0.15 : 0.05}
                stroke={mainColor}
                strokeWidth="1"
                opacity={isAsleepLike ? 0.1 : 0.3}
                className="transition-all duration-700"
            />

            {/* === SLEEPING or BLINKING (Selective) === */}
            {(isSleeping || isBlinking) && (
                <path
                    d="M35 50 Q50 42 65 50"
                    fill="none"
                    stroke={mainColor}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    opacity="0.9"
                    className={isSleeping ? "animate-hex-idle-breathe" : ""}
                />
            )}

            {/* === AWAKE / THINKING / SUCCESS — Iris area === */}
            {!isSleeping && !isBlinking && (
                <>
                    {/* Iris Ellipse */}
                    <ellipse
                        cx="50" cy="50" rx="20" ry="13"
                        fill={mainColor}
                        fillOpacity="0.1"
                        stroke={mainColor}
                        strokeWidth="1"
                        opacity={isDrowsy ? 0.3 : 0.6}
                    />

                    {/* Pupil group — follows mouse + jitter */}
                    <g
                        style={{
                            transform: `translate(${pupilX}px, ${pupilY}px)`,
                            transition: isThinking ? "none" : "transform 0.15s ease-out",
                        }}
                    >
                        <circle
                            cx="50" cy="50" r={isDrowsy ? 5 : 8}
                            fill={mainColor}
                            style={{ filter: `drop-shadow(0 0 8px ${mainColor})` }}
                            className={isSuccess ? "animate-pulse" : ""}
                        />
                        <circle cx="50" cy="50" r={isDrowsy ? 2 : 4} fill="hsl(200,30%,5%)" />
                        <circle cx="47.5" cy="47.5" r="1.8" fill="white" opacity="0.75" />
                    </g>
                </>
            )}

            {/* Thinking / Scanning Orbit */}
            {isThinking && (
                <circle cx="50" cy="50" r="33" fill="none" stroke={mainColor} strokeWidth="0.8" strokeOpacity="0.4" className="animate-spin-slower" strokeDasharray="10 20" />
            )}

            {/* Zzz for sleep */}
            {isSleeping && (
                <text x="53" y="38" fill={mainColor} fontSize="13" fontFamily="monospace" textAnchor="middle" opacity="0.6" className="animate-sleep-float">Z</text>
            )}
        </svg>
    )
}

// =============================================================================
// Main Component
// =============================================================================

export function CRTWithAI({ userName, className, idleTimeout = IDLE_TIMEOUT_MS }: CRTWithAIProps) {
    const [aiState, setAIState] = useState<AIState>("sleeping")
    const [visibleLines, setVisibleLines] = useState(0)
    const [cursorVisible, setCursorVisible] = useState(true)
    const [message, setMessage] = useState("")
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [showingChat, setShowingChat] = useState(false)
    const [chatDisplayLines, setChatDisplayLines] = useState<ConsoleLine[]>([])
    const [chatLinesVisible, setChatLinesVisible] = useState(0)
    const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 })
    const [isBlinking, setIsBlinking] = useState(false)
    const [isAutonomous, setIsAutonomous] = useState(false)

    const idleTimer = useRef<NodeJS.Timeout | null>(null)
    const autonomousTimer = useRef<NodeJS.Timeout | null>(null)
    const inactivityTimer = useRef<NodeJS.Timeout | null>(null)
    const blinkTimer = useRef<NodeJS.Timeout | null>(null)
    const scanningInterval = useRef<NodeJS.Timeout | null>(null)

    const containerRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const eyeRef = useRef<HTMLDivElement>(null)

    // --- Persistence Simulation ---
    useEffect(() => {
        const saved = localStorage.getItem("ai_chat_history")
        if (saved) {
            const parsed = JSON.parse(saved)
            setMessages(parsed.messages)
            if (parsed.messages.length > 0) {
                // Recover chat display lines from last message
                const last = parsed.messages[parsed.messages.length - 1]
                if (last.role === "ai") {
                    setChatDisplayLines([
                        { text: "Recovering session history...", color: "purple", prefix: "> " },
                        { text: `AI: ${last.content}`, color: "cyan", prefix: "> " }
                    ])
                    setChatLinesVisible(2)
                }
            }
        }
    }, [])

    useEffect(() => {
        if (messages.length > 0) {
            localStorage.setItem("ai_chat_history", JSON.stringify({ messages }))
        }
    }, [messages])

    // --- Inactivity Logic (Return to user info) ---
    const resetInactivity = useCallback(() => {
        if (inactivityTimer.current) clearTimeout(inactivityTimer.current)
        inactivityTimer.current = setTimeout(() => {
            if (showingChat && aiState !== "thinking") {
                // Transition back: Stats -> Drowsy -> Sleeping
                setShowingChat(false)
                setAIState("drowsy")
                setTimeout(() => setAIState("sleeping"), 3000)
            }
        }, INACTIVITY_RETURN_MS)
    }, [showingChat, aiState])

    useEffect(() => {
        resetInactivity()
        return () => { if (inactivityTimer.current) clearTimeout(inactivityTimer.current) }
    }, [resetInactivity, message, aiState])

    // --- Autonomous scanning ---
    const startScanning = useCallback(() => {
        setIsAutonomous(true)
        if (scanningInterval.current) clearInterval(scanningInterval.current)
        scanningInterval.current = setInterval(() => {
            setMouseOffset({
                x: (Math.random() - 0.5) * 1.5,
                y: (Math.random() - 0.5) * 1.5
            })
        }, 1500)
    }, [])

    const stopScanning = useCallback(() => {
        setIsAutonomous(false)
        if (scanningInterval.current) clearInterval(scanningInterval.current)
    }, [])

    // --- Mouse follow ---
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!eyeRef.current) return
            if (isAutonomous) stopScanning()
            if (autonomousTimer.current) clearTimeout(autonomousTimer.current)
            autonomousTimer.current = setTimeout(() => {
                if (!["sleeping", "thinking", "listening", "success", "drowsy"].includes(aiState)) startScanning()
            }, AUTONOMOUS_IDLE_MS)

            const rect = eyeRef.current.getBoundingClientRect()
            const dx = (e.clientX - (rect.left + rect.width / 2)) / (window.innerWidth / 2)
            const dy = (e.clientY - (rect.top + rect.height / 2)) / (window.innerHeight / 2)
            if (!isAutonomous) setMouseOffset({ x: Math.max(-1, Math.min(1, dx)), y: Math.max(-1, Math.min(1, dy)) })
        }
        window.addEventListener("mousemove", handleMouseMove)
        return () => window.removeEventListener("mousemove", handleMouseMove)
    }, [aiState, isAutonomous, startScanning, stopScanning])

    // --- Boot Link (Mount only) ---
    useEffect(() => {
        setVisibleLines(0)
        const bootTimer = setTimeout(() => {
            BOOT_LINES.forEach((_, i) => {
                setTimeout(() => setVisibleLines(i + 1), i * 300)
            })
        }, 1500)
        return () => clearTimeout(bootTimer)
    }, [])

    // --- Blink Interval ---
    useEffect(() => {
        const triggerBlink = () => {
            if (aiState === "sleeping") return
            setIsBlinking(true)
            setTimeout(() => setIsBlinking(false), 200)
            blinkTimer.current = setTimeout(triggerBlink, Math.random() * 4000 + 2000)
        }
        if (aiState !== "sleeping") blinkTimer.current = setTimeout(triggerBlink, 3000)
        return () => { if (blinkTimer.current) clearTimeout(blinkTimer.current) }
    }, [aiState])

    // --- Cursor blink ---
    useEffect(() => {
        const interval = setInterval(() => setCursorVisible(v => !v), 530)
        return () => clearInterval(interval)
    }, [])

    const wakeAI = () => {
        if (aiState === "sleeping" || aiState === "drowsy") {
            setAIState("awake")
            resetInactivity()
        }
    }

    const handleSend = () => {
        if (!message.trim()) return
        const userMsg = message
        setMessages(prev => [...prev, { role: "user", content: userMsg }])
        setMessage("")
        setAIState("thinking")
        setShowingChat(true)

        setChatDisplayLines([
            { text: `query --user "${userMsg}"`, color: "white", prefix: "$ " },
            { text: "Searching core modules...", color: "purple", prefix: "> " },
        ])
        setChatLinesVisible(2)

        setTimeout(() => {
            const aiReply = `He procesado "${userMsg}". Red estable.`
            const aiLines: ConsoleLine[] = [
                { text: `query --user "${userMsg}"`, color: "white", prefix: "$ " },
                { text: "Data sync complete [OK]", color: "green", prefix: "> " },
                { text: `AI: ${aiReply}`, color: "cyan", prefix: "> " },
            ]
            setChatDisplayLines(aiLines)
            setChatLinesVisible(aiLines.length)
            setMessages(prev => [...prev, { role: "ai", content: aiReply }])
            setAIState("success")
            setTimeout(() => setAIState("awake"), 2500)
        }, 2500)
    }

    const borderColor = aiState === "sleeping" ? "hsl(0,80%,55%,0.2)" : (aiState === "success" ? "hsl(150,100%,45%,0.3)" : "hsl(174,100%,50%,0.2)")

    return (
        <div
            ref={containerRef}
            onClick={wakeAI}
            className={cn("relative border bg-[hsl(200,30%,6%)] overflow-hidden flex flex-col transition-all duration-700 h-[320px] min-h-[320px] cursor-pointer", className)}
            style={{ borderColor }}
        >
            <div className="crt-scanner" />

            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2 border-b bg-[hsl(200,30%,8%)]" style={{ borderColor }}>
                <div className="flex items-center gap-2">
                    <div className={cn("w-1.5 h-1.5 rounded-full shadow-[0_0_4px]", aiState === "success" ? "bg-green-500 shadow-green-500" : (aiState === "sleeping" || aiState === "drowsy" ? "bg-red-500 shadow-red-500" : "bg-cyan-500 shadow-cyan-500"))} />
                    <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/60">SYS_CONSOLE v3.6_AI</span>
                </div>
                <div className="flex gap-3 text-[9px] font-mono">
                    <span className={cn(aiState === "sleeping" || aiState === "drowsy" ? "text-red-500" : "text-cyan-400")}>
                        STATUS: {aiState.toUpperCase()}
                    </span>
                </div>
            </div>

            <div className="flex-1 flex min-h-0">
                {/* Console */}
                <div className="flex-1 p-4 font-mono text-[11px] leading-relaxed overflow-hidden flex flex-col">
                    <div className="flex-1 overflow-y-auto scrollbar-hide">
                        {!showingChat ? (
                            <>
                                <div className="text-[hsl(174,100%,50%)] mb-1">
                                    <span className="text-muted-foreground">$ </span>
                                    <DecipherText text={`BIENVENIDO, ${userName.toUpperCase()}`} active={true} />
                                </div>
                                {BOOT_LINES.slice(0, visibleLines).map((line, i) => (
                                    <div key={i} className={colorClass[line.color]}>
                                        <span className="text-muted-foreground">{line.prefix}</span>{line.text}
                                    </div>
                                ))}
                            </>
                        ) : (
                            chatDisplayLines.slice(0, chatLinesVisible).map((line, i) => (
                                <div key={i} className={cn(colorClass[line.color], "animate-console-type-in")}>
                                    <span className="text-muted-foreground">{line.prefix}</span>{line.text}
                                </div>
                            ))
                        )}

                        {/* Prompt */}
                        <div className="mt-2 flex items-start gap-1 relative">
                            <span className="text-muted-foreground">&gt;_</span>
                            <div className="flex-1 relative">
                                <input
                                    ref={inputRef}
                                    value={message}
                                    onChange={(e) => {
                                        setMessage(e.target.value)
                                        resetInactivity()
                                        if (aiState === "sleeping" || aiState === "drowsy") wakeAI()
                                    }}
                                    onKeyDown={e => e.key === "Enter" && handleSend()}
                                    className="w-full bg-transparent border-none outline-none text-foreground p-0 m-0 caret-transparent"
                                    placeholder={aiState === "sleeping" ? "IA_HIBER (Click to wake)..." : "Neural Command..."}
                                    autoFocus
                                />
                                <div
                                    className={cn("absolute top-0 w-2 h-4 transition-colors", cursorVisible ? "opacity-100" : "opacity-0")}
                                    style={{
                                        left: `${(message.length || 0) * 7.5}px`,
                                        background: aiState === "sleeping" || aiState === "drowsy" ? "hsl(0,80%,55%)" : "hsl(174,100%,50%)",
                                        boxShadow: `0 0 5px ${aiState === "sleeping" || aiState === "drowsy" ? "hsl(0,80%,55%)" : "hsl(174,100%,50%)"}`
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Eye Side */}
                <div ref={eyeRef} className="w-[120px] flex flex-col items-center justify-center border-l bg-[hsl(200,30%,4%)]" style={{ borderColor }}>
                    <AIEye state={aiState} mouseOffset={mouseOffset} isBlinking={isBlinking} />
                    <span
                        className="text-[8px] font-mono mt-2 opacity-50 uppercase tracking-[0.2em]"
                        style={{
                            color: aiState === "success"
                                ? "hsl(150,100%,45%)"
                                : aiState === "thinking"
                                    ? "hsl(330,100%,65%)"
                                    : (aiState === "sleeping" || aiState === "drowsy")
                                        ? "hsl(0,80%,55%)"
                                        : "hsl(174,100%,50%)"
                        }}
                    >
                        {aiState}
                    </span>
                </div>
            </div>

            <div className="px-4 py-2 text-[8px] font-mono opacity-20 flex justify-between uppercase">
                <span>Core.Neural_Process.Active</span>
                <span>Buffer_Overflow_Guard: OK</span>
            </div>
        </div>
    )
}
