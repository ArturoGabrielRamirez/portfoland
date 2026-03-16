"use client"

import { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from "react"
import { Send } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { processDataStream } from "@ai-sdk/ui-utils"
import { useAIContext } from '@/features/ai/context/AIContext'
import type { PageContext } from "../types/page-context"

// =============================================================================
// Types
// =============================================================================

type AIState =
    | "sleeping"
    | "waking"
    | "drowsy"
    | "awake"
    | "listening"
    | "thinking"
    | "ready"
    | "success"
    | "xp_gain"
    | "life_loss"
    | "searching"

export type { AIState }

interface BootStats {
    totalXP: number
    level: number
    activeSkillsCount: number
    currentStreak: number
    achievements: { current: number; total: number }
}

interface CRTWithAIProps {
    userName: string
    className?: string
    idleTimeout?: number
    onAIStateChange?: (state: AIState) => void
    xpGainTrigger?: number
    lifeLossTrigger?: number
    searchingTrigger?: number
    bootStats?: BootStats
    pageContext?: PageContext
    locale?: string
}

export interface CRTWithAIHandle {
    insertPrompt: (text: string) => void
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

interface APIChatMessage {
    role: "user" | "assistant" | "system"
    content: string
}

// =============================================================================
// Constants
// =============================================================================

const IDLE_TIMEOUT_MS = 60 * 1000
const INACTIVITY_RETURN_MS = 45_000
const AUTONOMOUS_IDLE_MS = 3000
const POST_SYNC_CURIOUS_MS = 28_000
const AI_INTERACTED_KEY = "portfoland_ai_interacted"
const CHAT_HISTORY_KEY = "crt-chat-history"

const TRANSIENT_STATES: AIState[] = ["xp_gain", "life_loss"]
const NON_PREV_STATES: AIState[] = [...TRANSIENT_STATES, "searching"]

function makeBootLines(stats?: BootStats): ConsoleLine[] {
    if (!stats) {
        return [
            { text: "session_stats --display --verbose", color: "white", prefix: "$ " },
            { text: "Loading profile... [OK]", color: "green", prefix: "> " },
            { text: "Initializing neural link...", color: "cyan", prefix: "> " },
            { text: "Awaiting data sync...", color: "yellow", prefix: "> " },
            { text: "Neural link optimal. Awaiting input...", color: "green", prefix: "> " },
        ]
    }
    const pct = stats.achievements.total > 0
        ? Math.round((stats.achievements.current / stats.achievements.total) * 100)
        : 0
    return [
        { text: "session_stats --display --verbose", color: "white", prefix: "$ " },
        { text: "Loading profile... [OK]", color: "green", prefix: "> " },
        { text: `XP: ${stats.totalXP.toLocaleString()} | Level: ${stats.level}`, color: "cyan", prefix: "> " },
        { text: `Achievements: ${stats.achievements.current}/${stats.achievements.total} unlocked [${pct}%]`, color: "yellow", prefix: "> " },
        { text: `Streak: ${stats.currentStreak} days | Skills: ${stats.activeSkillsCount} active`, color: "magenta", prefix: "> " },
        { text: "Neural link optimal. Awaiting input...", color: "green", prefix: "> " },
    ]
}

const colorClass: Record<string, string> = {
    cyan: "text-[hsl(174,100%,50%)]",
    green: "text-[hsl(150,100%,45%)]",
    yellow: "text-[hsl(52,100%,50%)]",
    magenta: "text-[hsl(330,100%,65%)]",
    white: "text-foreground",
    red: "text-[hsl(0,80%,55%)]",
    purple: "text-[hsl(260,80%,65%)]",
}

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

export function AIEye({
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
    const isListening = state === "listening"
    const isReady = state === "ready"
    const isXPGain = state === "xp_gain"
    const isLifeLoss = state === "life_loss"
    const isSearching = state === "searching"

    const isAsleepLike = isSleeping

    const mainColor = isXPGain
        ? "hsl(150,100%,45%)"
        : isLifeLoss
            ? "hsl(0,80%,55%)"
            : isSearching
                ? "hsl(38,100%,55%)"
                : isSuccess
                    ? "hsl(150,100%,45%)"
                    : isReady
                        ? "hsl(150,100%,50%)"
                        : isThinking
                            ? "hsl(330,100%,65%)"
                            : isListening
                                ? "hsl(200,100%,60%)"
                                : (isSleeping || isDrowsy)
                                    ? "hsl(0,80%,55%)"
                                    : isWaking
                                        ? "hsl(30,100%,50%)"
                                        : "hsl(174,100%,50%)"

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

    const [listenOrbit, setListenOrbit] = useState({ x: 0, y: 0 })
    useEffect(() => {
        if (!isListening) {
            setListenOrbit({ x: 0, y: 0 })
            return
        }
        let angle = 0
        const interval = setInterval(() => {
            angle += 0.05
            setListenOrbit({ x: Math.sin(angle) * 0.4, y: Math.cos(angle) * 0.2 })
        }, 50)
        return () => clearInterval(interval)
    }, [isListening])

    const [scanPupilX, setScanPupilX] = useState(0)
    useEffect(() => {
        if (!isSearching) {
            setScanPupilX(0)
            return
        }
        let direction = 1
        const scanInterval = setInterval(() => {
            setScanPupilX(prev => {
                const next = prev + direction * 4
                if (next >= 8 || next <= -8) direction *= -1
                return next
            })
        }, 400)
        return () => clearInterval(scanInterval)
    }, [isSearching])

    const basePupilX = isAsleepLike ? 0
        : isWaking ? 0
            : isDrowsy ? 0
                : isSearching ? scanPupilX
                    : isListening ? listenOrbit.x * 6
                        : Math.max(-6, Math.min(6, mouseOffset.x * 6)) + jitter.x

    const basePupilY = isAsleepLike ? 0
        : isWaking ? 1
            : isDrowsy ? 3
                : isListening ? listenOrbit.y * 6
                    : Math.max(-6, Math.min(6, mouseOffset.y * 6)) + jitter.y

    const irisRY = isSleeping ? 0
        : isWaking ? 7
            : isDrowsy ? 4
                : 13
    const irisStrokeOpacity = 0.6
    const pupilRadius = isReady ? 9 : isListening ? 7 : isSuccess ? 9 : isXPGain ? 10 : 8;

    const showPupil = !isSleeping && !isBlinking
    const showClosedLine = isSleeping || (isBlinking && !isDrowsy)
    const drowsyBlinkDim = false

    return (
        <svg
            width="90"
            height="90"
            viewBox="0 0 100 100"
            className="transition-all duration-700 flex-shrink-0"
        >
            <motion.circle
                cx="50" cy="50" r="46"
                fill="none"
                stroke={mainColor}
                strokeWidth={isListening ? 1.5 : 0.8}
                initial={{ opacity: 0.2, r: 46 }}
                animate={{
                    opacity: isListening ? [0.3, 0.7, 0.3] : isSuccess ? 0.6 : isXPGain ? [0.4, 0.9, 0.4] : 0.2,
                    r: isListening ? [44, 46, 44] : 46,
                }}
                transition={isListening
                    ? { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
                    : isXPGain
                        ? { duration: 0.6, repeat: 1, ease: "easeInOut" }
                        : { duration: 0.7 }
                }
                className={!isBlinking && !isListening ? (isSuccess ? "animate-pulse" : "animate-hex-idle-breathe") : ""}
            />

            {isListening && (
                <>
                    <motion.circle
                        cx="50" cy="50" fill="none" stroke={mainColor} strokeWidth="0.5"
                        initial={{ r: 46, opacity: 0.4 }}
                        animate={{ r: [46, 50], opacity: [0.4, 0] }}
                        transition={{ duration: 1.2, repeat: Infinity, ease: "easeOut" }}
                    />
                    <motion.circle
                        cx="50" cy="50" fill="none" stroke={mainColor} strokeWidth="0.3"
                        initial={{ r: 46, opacity: 0.2 }}
                        animate={{ r: [46, 52], opacity: [0.2, 0] }}
                        transition={{ duration: 1.2, repeat: Infinity, ease: "easeOut", delay: 0.4 }}
                    />
                </>
            )}

            <motion.path
                d="M50 5 L90 27.5 L90 72.5 L50 95 L10 72.5 L10 27.5 Z"
                fill="none"
                stroke={mainColor}
                initial={{ opacity: 0.6, strokeWidth: 2 }}
                animate={{
                    opacity: isAsleepLike ? 0.4 : isWaking ? 0.6 : 0.8,
                    strokeWidth: isLifeLoss ? [2, 4, 2] : 2,
                }}
                transition={isLifeLoss ? { duration: 1, repeat: 0, ease: "easeInOut" } : { duration: 0.7 }}
                className={cn("transition-all duration-700", isThinking ? "animate-hex-active-pulse" : "")}
                style={{ filter: !isSleeping ? `drop-shadow(0 0 4px ${mainColor})` : "none" }}
            />

            {isThinking && (
                <g className="animate-spin-slow" style={{ transformOrigin: '50% 50%' }}>
                    <path d="M50 15 L80 32.5" stroke={mainColor} strokeWidth="2" opacity="0.6" strokeLinecap="round" />
                    <path d="M50 85 L20 67.5" stroke={mainColor} strokeWidth="2" opacity="0.6" strokeLinecap="round" />
                </g>
            )}

            {isReady && (
                <motion.circle
                    cx="50" cy="50" r="38" fill="none" stroke={mainColor} strokeWidth="1"
                    initial={{ opacity: 0.3 }}
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
            )}

            {isSearching && (
                <motion.circle
                    cx="50" cy="50" r="38"
                    fill="none"
                    stroke={mainColor}
                    strokeWidth="1"
                    strokeOpacity="0.5"
                    strokeDasharray="6 12"
                    initial={{ rotate: 0 }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    style={{ transformOrigin: '50% 50%' }}
                />
            )}

            <motion.path
                d="M50 15 L80 32.5 L80 67.5 L50 85 L20 67.5 L20 32.5 Z"
                fill={mainColor}
                initial={{ fillOpacity: 0.05, opacity: 0.3 }}
                animate={{
                    fillOpacity: isSuccess ? 0.15 : isReady ? 0.08 : isXPGain ? 0.12 : 0.05,
                    opacity: isAsleepLike ? 0.1 : isWaking ? 0.2 : 0.3,
                }}
                transition={{ duration: 0.7 }}
                stroke={mainColor}
                strokeWidth="1"
            />

            {showClosedLine && (
                <motion.path
                    d="M35 50 Q50 42 65 50"
                    fill="none"
                    stroke={mainColor}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    initial={false}
                    animate={{ opacity: 0.9 }}
                    className={isSleeping ? "animate-hex-idle-breathe" : ""}
                />
            )}

            {showPupil && (
                <motion.g initial={{ opacity: 1 }} animate={{ opacity: drowsyBlinkDim ? 0.15 : 1 }} transition={{ duration: 0.15 }}>
                    <motion.ellipse
                        cx="50" cy="50" rx="20"
                        initial={{ ry: 13, opacity: 0.1 }}
                        animate={{ ry: irisRY, opacity: irisStrokeOpacity }}
                        transition={isDrowsy
                            ? { type: "tween", duration: 3, ease: "easeInOut" }
                            : { type: "spring", stiffness: 80, damping: 15 }
                        }
                        fill={mainColor}
                        fillOpacity="0.1"
                        stroke={mainColor}
                        strokeWidth="1"
                    />

                    <motion.g
                        initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                        animate={{
                            x: basePupilX,
                            y: basePupilY,
                            scale: 1,
                            opacity: isDrowsy ? 0 : 1,
                        }}
                        transition={isThinking
                            ? { duration: 0 }
                            : isDrowsy
                                ? {
                                    x: { type: "spring", stiffness: 200, damping: 20 },
                                    y: { type: "spring", stiffness: 200, damping: 20 },
                                    opacity: { type: "tween", duration: 2.5, ease: "easeInOut" },
                                }
                                : isSearching
                                    ? { type: "tween", duration: 0.35, ease: "easeInOut" }
                                    : { type: "spring", stiffness: 200, damping: 20 }
                        }
                    >
                        <circle
                            cx="50" cy="50" r={pupilRadius}
                            fill={mainColor}
                            style={{ filter: `drop-shadow(0 0 8px ${mainColor})` }}
                            className={isSuccess ? "animate-pulse" : ""}
                        />
                        <circle cx="50" cy="50" r="4" fill="hsl(200,30%,5%)" />
                        <circle cx="47.5" cy="47.5" r="1.8" fill="white" opacity="0.75" />
                    </motion.g>
                </motion.g>
            )}

            {isThinking && (
                <circle cx="50" cy="50" r="33" fill="none" stroke={mainColor} strokeWidth="0.8" strokeOpacity="0.4" className="animate-spin-slower" strokeDasharray="10 20" />
            )}

            {isListening && (
                <motion.circle
                    cx="50" cy="50" r="30" fill="none" stroke={mainColor} strokeWidth="0.6"
                    strokeDasharray="4 8"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                    style={{ transformOrigin: '50% 50%' }}
                />
            )}

            {isSleeping && (
                <text x="53" y="38" fill={mainColor} fontSize="13" fontFamily="monospace" textAnchor="middle" opacity="0.6" className="animate-sleep-float">Z</text>
            )}

            {isWaking && (
                <>
                    <motion.circle cx="35" cy="50" r="1.5" fill={mainColor}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 0.6, 0] }}
                        transition={{ duration: 1, repeat: Infinity }}
                    />
                    <motion.circle cx="65" cy="50" r="1.5" fill={mainColor}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 0.6, 0] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0.3 }}
                    />
                </>
            )}
        </svg>
    )
}

export const CRTWithAI = forwardRef<CRTWithAIHandle, CRTWithAIProps>(function CRTWithAI({
    userName,
    className,
    idleTimeout = IDLE_TIMEOUT_MS,
    onAIStateChange,
    xpGainTrigger,
    lifeLossTrigger,
    searchingTrigger,
    bootStats,
    pageContext,
    locale,
}: CRTWithAIProps, ref) {
    const { setHighlightedSkills } = useAIContext()
    const bootLines = makeBootLines(bootStats)
    const [aiState, setAIState] = useState<AIState>("sleeping")
    const [visibleLines, setVisibleLines] = useState(0)
    const [cursorVisible, setCursorVisible] = useState(true)
    const [message, setMessage] = useState("")
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
    const apiMessagesRef = useRef<APIChatMessage[]>([])
    const [isStreaming, setIsStreaming] = useState(false)
    const [showingChat, setShowingChat] = useState(false)
    const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 })
    const [isBlinking, setIsBlinking] = useState(false)
    const [isAutonomous, setIsAutonomous] = useState(false)
    const abortControllerRef = useRef<AbortController | null>(null)

    const autonomousTimer = useRef<NodeJS.Timeout | null>(null)
    const inactivityTimer = useRef<NodeJS.Timeout | null>(null)
    const blinkTimer = useRef<NodeJS.Timeout | null>(null)
    const scanningInterval = useRef<NodeJS.Timeout | null>(null)
    const scrollRef = useRef<HTMLDivElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const eyeRef = useRef<HTMLDivElement>(null)

    const prevStateRef = useRef<AIState>("awake")
    const postSyncRef = useRef(false)
    const postSyncTimer = useRef<NodeJS.Timeout | null>(null)
    const startScanningRef = useRef<() => void>(() => { })

    useImperativeHandle(ref, () => ({
        insertPrompt(text: string) {
            if (aiState === "sleeping" || aiState === "drowsy") {
                setAIState("waking")
                setTimeout(() => setAIState("awake"), 800)
            }
            setMessage(text)
            inputRef.current?.focus()
        },
    }), [aiState])

    useEffect(() => {
        onAIStateChange?.(aiState)
    }, [aiState, onAIStateChange])

    useEffect(() => {
        if (!NON_PREV_STATES.includes(aiState)) {
            prevStateRef.current = aiState
        }
    }, [aiState])

    useEffect(() => {
        if (!xpGainTrigger) return
        setAIState("xp_gain")
        setIsBlinking(true)
        const t1 = setTimeout(() => setIsBlinking(false), 80)
        const t2 = setTimeout(() => setIsBlinking(true), 200)
        const t3 = setTimeout(() => setIsBlinking(false), 280)
        const ret = setTimeout(() => {
            setAIState("awake")
            startScanningRef.current()
            postSyncRef.current = true
            if (postSyncTimer.current) clearTimeout(postSyncTimer.current)
            postSyncTimer.current = setTimeout(() => {
                postSyncRef.current = false
            }, POST_SYNC_CURIOUS_MS)
        }, 1200)

        return () => {
            clearTimeout(t1)
            clearTimeout(t2)
            clearTimeout(t3)
            clearTimeout(ret)
        }
    }, [xpGainTrigger])

    useEffect(() => {
        if (!lifeLossTrigger) return
        setAIState("life_loss")
        setIsBlinking(true)
        const tOpen = setTimeout(() => setIsBlinking(false), 700)
        const ret = setTimeout(() => {
            setAIState(prevStateRef.current)
        }, 2000)

        return () => {
            clearTimeout(tOpen)
            clearTimeout(ret)
        }
    }, [lifeLossTrigger])

    useEffect(() => {
        if (!searchingTrigger) return
        setAIState("searching")
        localStorage.setItem(AI_INTERACTED_KEY, "1")
    }, [searchingTrigger])

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [chatMessages, visibleLines, showingChat])

    useEffect(() => {
        try {
            const saved = localStorage.getItem(CHAT_HISTORY_KEY)
            if (saved) {
                const parsed = JSON.parse(saved) as {
                    chatMessages?: ChatMessage[]
                    apiMessages?: APIChatMessage[]
                }
                if (parsed.chatMessages && Array.isArray(parsed.chatMessages)) {
                    setChatMessages(parsed.chatMessages)
                }
                if (parsed.apiMessages && Array.isArray(parsed.apiMessages)) {
                    // Only keep user/assistant messages — tool/system roles confuse Gemini
                    apiMessagesRef.current = parsed.apiMessages.filter(
                        (m: APIChatMessage) => m.role === "user" || m.role === "assistant"
                    )
                }
                return // localStorage has history, skip DB fetch
            }
        } catch { }

        // No localStorage history — load from DB for cross-device persistence
        fetch("/api/chat/history")
            .then(r => r.ok ? r.json() : null)
            .then((data: { messages?: Array<{ role: string; content: string }> } | null) => {
                if (!data?.messages?.length) return
                const dbMsgs = data.messages as APIChatMessage[]
                const uiMsgs: ChatMessage[] = dbMsgs
                    .filter(m => m.role === "user" || m.role === "assistant")
                    .map(m => ({ role: m.role === "user" ? "user" : "ai", content: m.content }))
                if (uiMsgs.length > 0) {
                    setChatMessages(uiMsgs)
                    // Only keep user/assistant messages — tool/system roles confuse Gemini
                    apiMessagesRef.current = dbMsgs.filter(m => m.role === "user" || m.role === "assistant")
                }
            })
            .catch(() => { })
    }, [])

    useEffect(() => {
        if (localStorage.getItem(AI_INTERACTED_KEY)) {
            setAIState("awake")
        }
    }, [])

    useEffect(() => {
        if (chatMessages.length > 0) {
            try {
                localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify({
                    chatMessages,
                    apiMessages: apiMessagesRef.current,
                }))
            } catch { }
        }
    }, [chatMessages])

    const resetInactivity = useCallback(() => {
        if (inactivityTimer.current) clearTimeout(inactivityTimer.current)
        if (aiState === "sleeping") return
        const delay = postSyncRef.current ? POST_SYNC_CURIOUS_MS : INACTIVITY_RETURN_MS
        inactivityTimer.current = setTimeout(() => {
            postSyncRef.current = false
            setShowingChat(false)
            setAIState("drowsy")
            setTimeout(() => {
                setAIState("sleeping")
            }, 4000)
        }, delay)
    }, [aiState])

    useEffect(() => {
        if (
            aiState !== "sleeping" &&
            aiState !== "thinking" &&
            aiState !== "listening" &&
            aiState !== "success" &&
            aiState !== "searching" &&
            !isStreaming
        ) {
            resetInactivity()
        }
        if ((aiState === "searching" || aiState === "thinking" || aiState === "listening" || isStreaming) && inactivityTimer.current) {
            clearTimeout(inactivityTimer.current)
        }
        return () => { if (inactivityTimer.current) clearTimeout(inactivityTimer.current) }
    }, [resetInactivity, message, aiState, isStreaming])

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
    startScanningRef.current = startScanning

    const stopScanning = useCallback(() => {
        setIsAutonomous(false)
        if (scanningInterval.current) clearInterval(scanningInterval.current)
    }, [])

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!eyeRef.current) return
            if (isAutonomous) stopScanning()
            if (autonomousTimer.current) clearTimeout(autonomousTimer.current)
            autonomousTimer.current = setTimeout(() => {
                if (!["sleeping", "thinking", "listening", "success", "drowsy", "searching"].includes(aiState)) startScanning()
            }, AUTONOMOUS_IDLE_MS)

            const rect = eyeRef.current.getBoundingClientRect()
            const dx = (e.clientX - (rect.left + rect.width / 2)) / (window.innerWidth / 2)
            const dy = (e.clientY - (rect.top + rect.height / 2)) / (window.innerHeight / 2)
            if (!isAutonomous) setMouseOffset({ x: Math.max(-1, Math.min(1, dx)), y: Math.max(-1, Math.min(1, dy)) })
        }
        window.addEventListener("mousemove", handleMouseMove)
        return () => window.removeEventListener("mousemove", handleMouseMove)
    }, [aiState, isAutonomous, startScanning, stopScanning])

    useEffect(() => {
        setVisibleLines(0)
        const bootTimer = setTimeout(() => {
            bootLines.forEach((_, i) => {
                setTimeout(() => setVisibleLines(i + 1), i * 300)
            })
        }, 1500)
        return () => clearTimeout(bootTimer)
    }, [])

    useEffect(() => {
        const triggerBlink = () => {
            if (aiState === "sleeping" || aiState === "drowsy") return
            setIsBlinking(true)
            setTimeout(() => setIsBlinking(false), 200)
            blinkTimer.current = setTimeout(triggerBlink, Math.random() * 4000 + 2000)
        }
        if (aiState !== "sleeping" && aiState !== "drowsy") blinkTimer.current = setTimeout(triggerBlink, 3000)
        return () => { if (blinkTimer.current) clearTimeout(blinkTimer.current) }
    }, [aiState])

    useEffect(() => {
        const interval = setInterval(() => setCursorVisible(v => !v), 530)
        return () => clearInterval(interval)
    }, [])

    const wakeAI = () => {
        if (aiState === "sleeping" || aiState === "drowsy") {
            setAIState("waking")
            setTimeout(() => {
                setAIState("awake")
                if (chatMessages.length > 0) setShowingChat(true)
            }, 800)
            resetInactivity()
        }
    }

    const handleSend = useCallback(async () => {
        if (!message.trim() || isStreaming) return

        const userText = message.trim()
        setMessage("")
        setShowingChat(true)
        setAIState("listening")
        localStorage.setItem(AI_INTERACTED_KEY, "1")

        setChatMessages(prev => [...prev, { role: "user", content: userText }])

        const userApiMsg: APIChatMessage = { role: "user", content: userText }
        apiMessagesRef.current = [...apiMessagesRef.current, userApiMsg]

        setIsStreaming(true)

        if (abortControllerRef.current) abortControllerRef.current.abort()
        const abortController = new AbortController()
        abortControllerRef.current = abortController

        let streamedText = ""
        let toolResultText = "" // fallback if Gemini doesn't generate text after tool

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: apiMessagesRef.current,
                    locale: locale || "es",
                    pageContext,
                }),
                signal: abortController.signal,
            })

            if (!response.ok) {
                const isRateLimit = response.status === 429
                const errorMsg = isRateLimit ? "ENERGY DEPLETED. Recharge tomorrow." : "ERROR: AI system unavailable."
                setChatMessages(prev => [...prev, { role: "system", content: errorMsg }])
                setAIState("life_loss")
                setIsStreaming(false)
                return
            }

            if (!response.body) {
                setChatMessages(prev => [...prev, { role: "system", content: "ERROR: Empty response." }])
                setAIState("life_loss")
                setIsStreaming(false)
                return
            }

            setAIState("thinking")

            const handleToolCall = (toolName: string, args: any) => {
                let statusMsg = locale === 'es'
                    ? `> EJECUTANDO ENLACE: ${toolName.toUpperCase()}... [OK]`
                    : `> EXECUTING DATA LINK: ${toolName.toUpperCase()}... [OK]`

                const aiExplanation = args?.reasoning || args?.reason
                if (aiExplanation) statusMsg += `\n\n> INFO: ${aiExplanation}`

                setChatMessages(prev => {
                    const updated = [...prev]
                    const lastIdx = updated.length - 1
                    if (lastIdx >= 0 && updated[lastIdx].content === statusMsg) return prev
                    if (!streamedText) {
                        if (lastIdx >= 0 && updated[lastIdx].role === "ai" && (!updated[lastIdx].content || updated[lastIdx].content?.startsWith(">"))) {
                            updated[lastIdx] = { ...updated[lastIdx], content: statusMsg }
                            return updated
                        }
                        updated.push({ role: "ai", content: statusMsg })
                        return updated
                    }
                    return prev
                })

                const isSkillSuggestion = ["suggest_skill_path", "suggest_learning_path", "suggestLearningPath"].includes(toolName)
                if (isSkillSuggestion && args) {
                    const skills = args?.skillsToLearn || args?.skillsToHighlight
                    if (Array.isArray(skills)) setHighlightedSkills(skills)
                }
            }

            await processDataStream({
                stream: response.body,
                onTextPart(text) {
                    streamedText += text
                    setChatMessages(prev => {
                        const updated = [...prev]
                        const lastIdx = updated.length - 1
                        if (lastIdx >= 0 && updated[lastIdx].role === "ai") {
                            const prevContent = updated[lastIdx].content || ""
                            if (prevContent.startsWith(">") && !prevContent.includes("\n\n")) {
                                updated[lastIdx] = { ...updated[lastIdx], content: prevContent + "\n\n" + text }
                            } else {
                                updated[lastIdx] = { ...updated[lastIdx], content: prevContent + text }
                            }
                        } else {
                            updated.push({ role: "ai", content: text })
                        }
                        return updated
                    })
                },
                onToolCallPart(toolCall) {
                    handleToolCall(toolCall.toolName, toolCall.args)
                },
                onToolCallStreamingStartPart(part) {
                    handleToolCall(part.toolName, undefined)
                },
                onToolResultPart(toolResult) {
                    const r = toolResult.result as any
                    if (!r || typeof r !== 'object') return

                    // Highlight skills from tool result (more reliable than from call args)
                    if (r.skillsToLearn && Array.isArray(r.skillsToLearn) && r.skillsToLearn.length > 0) {
                        setHighlightedSkills(r.skillsToLearn)
                    }

                    let resMsg = ""
                    if (r.skillsToLearn && Array.isArray(r.skillsToLearn) && r.skillsToLearn.length > 0) {
                        resMsg += `\n\n> TARGET NODES: ${r.skillsToLearn.join(', ')}`
                    }
                    if (r.nextLevelFocus) resMsg += `\n> FOCUS: ${r.nextLevelFocus}`
                    if (r.resources && Array.isArray(r.resources) && r.resources.length > 0) {
                        resMsg += `\n> DATA LINKS: ${r.resources.map((res: any) => res.title).join(' | ')}`
                    }
                    if (r.message) resMsg += `\n> SYSTEM: ${r.message}`

                    if (resMsg) {
                        toolResultText += resMsg
                        setChatMessages(prev => {
                            const updated = [...prev]
                            const lastIdx = updated.length - 1
                            if (lastIdx >= 0 && updated[lastIdx].role === "ai") {
                                updated[lastIdx] = { ...updated[lastIdx], content: (updated[lastIdx].content || "") + resMsg }
                            } else {
                                updated.push({ role: "ai", content: resMsg.trim() })
                            }
                            return updated
                        })
                    }
                },
                onErrorPart(error) {
                    setChatMessages(prev => [...prev, { role: "system", content: `ERR: ${error}` }])
                    setAIState("life_loss")
                },
            })

            // Use streamed text; fall back to tool result summary so apiMessagesRef
            // is always updated and AI has context for the next turn
            const finalAssistantText = streamedText || toolResultText.trim()
            if (finalAssistantText) {
                apiMessagesRef.current = [...apiMessagesRef.current, { role: "assistant", content: finalAssistantText }]
            }
            setAIState("success")
            setTimeout(() => setAIState("awake"), 2000)
        } catch (err: any) {
            if (err.name === "AbortError") return
            console.error("[CRT-AI] Fatal Stream Error:", err)
            setChatMessages(prev => [...prev, { role: "system", content: "ERROR: Connection lost." }])
            setAIState("life_loss")
        } finally {
            setIsStreaming(false)
            resetInactivity()
        }
    }, [message, isStreaming, locale, pageContext, resetInactivity])

    const borderColor = (aiState === "sleeping" || aiState === "drowsy" || aiState === "life_loss")
        ? "hsl(0,80%,55%,0.2)"
        : (aiState === "success" || aiState === "xp_gain")
            ? "hsl(150,100%,45%,0.3)"
            : aiState === "searching"
                ? "hsl(38,100%,55%,0.2)"
                : "hsl(174,100%,50%,0.2)"

    return (
        <div
            ref={containerRef}
            onClick={wakeAI}
            className={cn("relative border bg-[hsl(200,30%,6%)] overflow-hidden flex flex-col transition-all duration-700 h-[320px] min-h-[320px] cursor-pointer", className)}
            style={{ borderColor }}
        >
            <style jsx global>{`
                .crt-scrollbar::-webkit-scrollbar { width: 3px; }
                .crt-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .crt-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(0, 255, 230, 0.2);
                    border-radius: 10px;
                }
                .crt-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(0, 255, 230, 0.4); }
            `}</style>

            <div className="crt-scanner" />

            <div className="flex items-center justify-between px-3 py-2 border-b bg-[hsl(200,30%,8%)]" style={{ borderColor }}>
                <div className="flex items-center gap-2">
                    <div className={cn(
                        "w-1.5 h-1.5 rounded-full shadow-[0_0_4px]",
                        aiState === "success" || aiState === "xp_gain"
                            ? "bg-green-500 shadow-green-500"
                            : (aiState === "sleeping" || aiState === "drowsy" || aiState === "life_loss")
                                ? "bg-red-500 shadow-red-500"
                                : aiState === "searching"
                                    ? "bg-[hsl(38,100%,55%)] shadow-[hsl(38,100%,55%)]"
                                    : "bg-cyan-500 shadow-cyan-500"
                    )} />
                    <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/60">SYS_CONSOLE v3.10_AI</span>
                </div>
                <div className="flex gap-3 text-[9px] font-mono">
                    <span className={cn(
                        aiState === "sleeping" || aiState === "drowsy" || aiState === "life_loss"
                            ? "text-red-500"
                            : aiState === "xp_gain"
                                ? "text-[hsl(150,100%,45%)]"
                                : aiState === "searching"
                                    ? "text-[hsl(38,100%,55%)]"
                                    : "text-cyan-400"
                    )}>
                        STATUS: {aiState.toUpperCase()}
                    </span>
                </div>
            </div>

            <div className="flex-1 flex min-h-0">
                <div className="flex-1 p-4 font-mono text-[11px] leading-relaxed overflow-hidden flex flex-col">
                    <div ref={scrollRef} className="flex-1 overflow-y-auto crt-scrollbar py-1">
                        <div className="text-[hsl(174,100%,50%)] mb-1">
                            <span className="text-muted-foreground">$ </span>
                            <DecipherText text={`BIENVENIDO, ${userName.toUpperCase()}`} active={true} />
                        </div>
                        {bootLines.slice(0, visibleLines).map((line, i) => (
                            <div key={i} className={colorClass[line.color]}>
                                <span className="text-muted-foreground">{line.prefix}</span>{line.text}
                            </div>
                        ))}

                        <AnimatePresence>
                            {showingChat && chatMessages.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 30, filter: "blur(3px)" }}
                                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                                    exit={{
                                        opacity: 0,
                                        x: 200,
                                        scale: 0.2,
                                        filter: "blur(4px)",
                                        transition: { duration: 0.8, ease: "backIn" }
                                    }}
                                    transition={{ type: "spring", stiffness: 120, damping: 20 }}
                                    className="mt-4 pt-4 border-t border-white/5 space-y-3 origin-right"
                                >
                                    <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.1 }}
                                        className="text-[9px] font-mono text-muted-foreground/40 uppercase tracking-widest mb-2"
                                    >
                                        {">"} accessing_memory_buffer... [{chatMessages.length} records]
                                    </motion.div>
                                    {chatMessages.map((msg, idx) => (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, x: -8 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.05 * Math.min(idx, 10) }}
                                            className={cn(
                                                "flex flex-col",
                                                msg.role === "user"
                                                    ? "text-foreground"
                                                    : msg.role === "system"
                                                        ? "text-[hsl(0,80%,55%)]"
                                                        : "text-[hsl(174,100%,50%)]"
                                            )}
                                        >
                                            <div className="flex gap-1">
                                                <span className="text-muted-foreground">
                                                    {msg.role === "user" ? "$ query" : msg.role === "system" ? "> sys_err" : "> ai_resp"}:
                                                </span>
                                                <span className={msg.role === "ai" ? "animate-console-type-in" : ""}>{msg.content}</span>
                                            </div>
                                        </motion.div>
                                    ))}
                                    {(aiState === "thinking" || aiState === "listening") && !chatMessages.some(m => m.role === "ai" && m.content === "") && (
                                        <div className="text-purple-400 animate-pulse">
                                            <span className="text-muted-foreground">&gt; ai_resp:</span>
                                            {aiState === "listening" ? " Escuchando input neural..." : " Procesando respuesta neural..."}
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="mt-4 flex items-start gap-1 relative opacity-80">
                            <span className="text-muted-foreground">&gt;_</span>
                            <div className="flex-1 relative">
                                <input
                                    ref={inputRef}
                                    value={message}
                                    onChange={(e) => {
                                        if (aiState === 'sleeping' || aiState === 'drowsy') wakeAI()
                                        setMessage(e.target.value)
                                        resetInactivity()
                                    }}
                                    onKeyDown={e => {
                                        if (e.key === "Enter") {
                                            e.preventDefault()
                                            handleSend()
                                        }
                                    }}
                                    className="w-full bg-transparent border-none outline-none text-foreground p-0 m-0 caret-transparent"
                                    placeholder={(aiState === "sleeping" || aiState === "drowsy") ? "SISTEMA_DORMIDO..." : "Introducir comando neural..."}
                                    autoFocus
                                />
                                <div
                                    className={cn("absolute top-0 w-2 h-4 transition-colors", cursorVisible ? "opacity-100" : "opacity-0")}
                                    style={{
                                        left: `${(message.length || 0) * 7.5}px`,
                                        background: (aiState === "sleeping" || aiState === "drowsy") ? "hsl(0,80%,55%)" : "hsl(174,100%,50%)",
                                        boxShadow: `0 0 5px ${(aiState === "sleeping" || aiState === "drowsy") ? "hsl(0,80%,55%)" : "hsl(174,100%,50%)"}`
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div ref={eyeRef} className="w-[120px] flex flex-col items-center justify-center border-l bg-[hsl(200,30%,4%)]" style={{ borderColor }}>
                    <AIEye state={aiState} mouseOffset={mouseOffset} isBlinking={isBlinking} />
                    <span
                        className="text-[8px] font-mono mt-2 opacity-50 uppercase tracking-[0.2em]"
                        style={{
                            color: aiState === "success" || aiState === "xp_gain"
                                ? "hsl(150,100%,45%)"
                                : aiState === "thinking"
                                    ? "hsl(330,100%,65%)"
                                    : aiState === "searching"
                                        ? "hsl(38,100%,55%)"
                                        : (aiState === "sleeping" || aiState === "drowsy" || aiState === "life_loss")
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
                <span>History_Buffer: {chatMessages.length}</span>
            </div>
        </div>
    )
})
