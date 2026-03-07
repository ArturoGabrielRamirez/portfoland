"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { Send } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import type { PageContext } from "../types/page-context"

// =============================================================================
// Types
// =============================================================================

// TG1-A: Extended AIState union with xp_gain and life_loss transient states
// TG6: Added "searching" sustained state for GitHub sync scanning animation
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
    /** Milliseconds of inactivity before sleep. Default: 45 seconds */
    idleTimeout?: number
    /** Callback fired when AI state changes */
    onAIStateChange?: (state: AIState) => void
    /**
     * TG1-A: Increment this counter to trigger the XP gain eye animation.
     * The component fires the animation when this value changes.
     */
    xpGainTrigger?: number
    /**
     * TG1-A: Increment this counter to trigger the life loss eye animation.
     * The component fires the animation when this value changes.
     */
    lifeLossTrigger?: number
    /**
     * TG6: Increment this counter to trigger the sustained `searching` eye state.
     * The parent component (GitHubSyncPanel) drives the return transition by firing
     * `xpGainTrigger` or `lifeLossTrigger` after the action resolves.
     */
    searchingTrigger?: number
    /** Real DB stats for the boot sequence. Falls back to placeholder lines when absent. */
    bootStats?: BootStats
    /** Identifies which dashboard page is active (used for context-aware AI) */
    pageContext?: PageContext
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
const INACTIVITY_RETURN_MS = 8000  // Normal inactivity before drowsy
const AUTONOMOUS_IDLE_MS = 3000
// After a sync completes (xp_gain), eye stays in curious/awake mode this long
// before the inactivity sequence kicks in
const POST_SYNC_CURIOUS_MS = 28_000
const AI_INTERACTED_KEY = "portfoland_ai_interacted"

// Transient states that auto-return via a timer and do NOT update prevStateRef
// TG6: "searching" is parent-driven (sustained), so it is NOT in this list;
// prevStateRef exclusion is handled separately in the effect below
const TRANSIENT_STATES: AIState[] = ["xp_gain", "life_loss"]

// States that do not constitute a "meaningful previous state" for auto-return
// Includes the auto-returning transient states AND the sustained searching state
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
    // TG1-A: new state flags
    const isXPGain = state === "xp_gain"
    const isLifeLoss = state === "life_loss"
    // TG6: searching state flag — amber/orange iris, left-right scan animation
    const isSearching = state === "searching"

    const isAsleepLike = isSleeping

    // TG6: searching amber/orange inserted before the default awake cyan
    // TG1-A: mainColor switch — new states have highest specificity before default cyan
    const mainColor = isXPGain
        ? "hsl(150,100%,45%)"   // green — XP gain
        : isLifeLoss
            ? "hsl(0,80%,55%)"  // red — life loss
            : isSearching
                ? "hsl(38,100%,55%)"    // amber/orange — external data wait / GitHub sync
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

    // Listening: slow orbital movement
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

    // TG6: Searching — oscillate pupil x position left → right → left rhythmically
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

    // Pupil position: drowsy stays heavy/low, waking slowly centers
    // TG6: searching uses scanPupilX for horizontal scan, no vertical movement
    const basePupilX = isAsleepLike ? 0
        : isWaking ? 0
        : isDrowsy ? 0
        : isSearching ? scanPupilX
        : isListening ? listenOrbit.x * 6
        : Math.max(-6, Math.min(6, mouseOffset.x * 6)) + jitter.x

    const basePupilY = isAsleepLike ? 0
        : isWaking ? 1
        : isDrowsy ? 3 // heavy, drooping position
        : isListening ? listenOrbit.y * 6
        : Math.max(-6, Math.min(6, mouseOffset.y * 6)) + jitter.y

    // TG1-B: iris ry — isDrowsy now animates to 4 (fully closed), handled by Framer Motion tween
    // TG1-A: xp_gain and life_loss keep iris fully open (ry=13) for visibility
    const irisRY = isSleeping ? 0
        : isWaking ? 7
        : isDrowsy ? 4  // TG1-B: was 10, now 4 so Framer Motion drives it closed over 3s
        : 13
    const irisStrokeOpacity = 0.6

    // Pupil size varies by state
    const pupilRadius = isReady ? 9 : isListening ? 7 : isSuccess ? 9 : isXPGain ? 10 : 8

    // Show iris+pupil group: hide only during sleeping or standard blinks
    // Drowsy keeps the group visible so the iris closing tween plays
    const showPupil = !isSleeping && !isBlinking
    // Show closed-eye line: sleeping OR standard (non-drowsy) blinks
    const showClosedLine = isSleeping || (isBlinking && !isDrowsy)
    const drowsyBlinkDim = false

    return (
        <svg
            width="90"
            height="90"
            viewBox="0 0 100 100"
            className="transition-all duration-700 flex-shrink-0"
        >
            {/* Outer glow ring */}
            <motion.circle
                cx="50" cy="50" r="46"
                fill="none"
                stroke={mainColor}
                strokeWidth={isListening ? 1.5 : 0.8}
                animate={{
                    opacity: isListening
                        ? [0.3, 0.7, 0.3]
                        : isSuccess
                            ? 0.6
                            : isXPGain
                                ? [0.4, 0.9, 0.4]  // TG1-A: green glow pulse for xp_gain
                                : 0.2,
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

            {/* Listening pulse rings */}
            {isListening && (
                <>
                    <motion.circle
                        cx="50" cy="50" r="46" fill="none" stroke={mainColor} strokeWidth="0.5"
                        animate={{ r: [46, 50], opacity: [0.4, 0] }}
                        transition={{ duration: 1.2, repeat: Infinity, ease: "easeOut" }}
                    />
                    <motion.circle
                        cx="50" cy="50" r="46" fill="none" stroke={mainColor} strokeWidth="0.3"
                        animate={{ r: [46, 52], opacity: [0.2, 0] }}
                        transition={{ duration: 1.2, repeat: Infinity, ease: "easeOut", delay: 0.4 }}
                    />
                </>
            )}

            {/* Outer hex border — ALWAYS VISIBLE */}
            {/* TG1-A: life_loss pulses strokeWidth 2→4→2 once (red pulse) */}
            <motion.path
                d="M50 5 L90 27.5 L90 72.5 L50 95 L10 72.5 L10 27.5 Z"
                fill="none"
                stroke={mainColor}
                animate={{
                    opacity: isAsleepLike ? 0.4 : isWaking ? 0.6 : 0.8,
                    strokeWidth: isLifeLoss ? [2, 4, 2] : 2,
                }}
                transition={isLifeLoss
                    ? { duration: 1, repeat: 0, ease: "easeInOut" }
                    : { duration: 0.7 }
                }
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

            {/* Ready state: steady glow ring */}
            {isReady && (
                <motion.circle
                    cx="50" cy="50" r="38" fill="none" stroke={mainColor} strokeWidth="1"
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
            )}

            {/* TG6: Searching — wider dashed orbit ring (r=38 vs thinking's r=33) communicating
                external data wait. Rotates continuously until GitHubSyncPanel fires the exit trigger. */}
            {isSearching && (
                <motion.circle
                    cx="50" cy="50" r="38"
                    fill="none"
                    stroke={mainColor}
                    strokeWidth="1"
                    strokeOpacity="0.5"
                    strokeDasharray="6 12"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    style={{ transformOrigin: '50% 50%' }}
                />
            )}

            {/* Inner hex area background */}
            <motion.path
                d="M50 15 L80 32.5 L80 67.5 L50 85 L20 67.5 L20 32.5 Z"
                fill={mainColor}
                animate={{
                    fillOpacity: isSuccess ? 0.15 : isReady ? 0.08 : isXPGain ? 0.12 : 0.05,
                    opacity: isAsleepLike ? 0.1 : isWaking ? 0.2 : 0.3,
                }}
                transition={{ duration: 0.7 }}
                stroke={mainColor}
                strokeWidth="1"
            />

            {/* === SLEEPING or STANDARD BLINK (not drowsy) === */}
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

            {/* === PUPIL + IRIS — Shown in awake states, AND during drowsy blinks (dimmed) === */}
            {showPupil && (
                <motion.g animate={{ opacity: drowsyBlinkDim ? 0.15 : 1 }} transition={{ duration: 0.15 }}>
                    {/* Iris Ellipse — Animated ry for smooth open/close
                        TG1-B: when isDrowsy, use a 3s tween (not spring) to smoothly close iris to ry=4 */}
                    <motion.ellipse
                        cx="50" cy="50" rx="20"
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

                    {/* Pupil group — fades out as iris closes during drowsy state */}
                    <motion.g
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
                                    // TG6: smooth tween for horizontal scan, no spring bounce
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

            {/* Thinking / Scanning Orbit */}
            {isThinking && (
                <circle cx="50" cy="50" r="33" fill="none" stroke={mainColor} strokeWidth="0.8" strokeOpacity="0.4" className="animate-spin-slower" strokeDasharray="10 20" />
            )}

            {/* Listening: dashed orbit ring */}
            {isListening && (
                <motion.circle
                    cx="50" cy="50" r="30" fill="none" stroke={mainColor} strokeWidth="0.6"
                    strokeDasharray="4 8"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                    style={{ transformOrigin: '50% 50%' }}
                />
            )}

            {/* Zzz for sleep */}
            {isSleeping && (
                <text x="53" y="38" fill={mainColor} fontSize="13" fontFamily="monospace" textAnchor="middle" opacity="0.6" className="animate-sleep-float">Z</text>
            )}

            {/* Waking: small indicator dots appearing */}
            {isWaking && (
                <>
                    <motion.circle cx="35" cy="50" r="1.5" fill={mainColor}
                        animate={{ opacity: [0, 0.6, 0] }}
                        transition={{ duration: 1, repeat: Infinity }}
                    />
                    <motion.circle cx="65" cy="50" r="1.5" fill={mainColor}
                        animate={{ opacity: [0, 0.6, 0] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0.3 }}
                    />
                </>
            )}
        </svg>
    )
}

// =============================================================================
// Main Component
// =============================================================================

export function CRTWithAI({
    userName,
    className,
    idleTimeout = IDLE_TIMEOUT_MS,
    onAIStateChange,
    xpGainTrigger,
    lifeLossTrigger,
    searchingTrigger,
    bootStats,
    pageContext,
}: CRTWithAIProps) {
    const bootLines = makeBootLines(bootStats)
    const [aiState, setAIState] = useState<AIState>("sleeping")
    const [visibleLines, setVisibleLines] = useState(0)
    const [cursorVisible, setCursorVisible] = useState(true)
    const [message, setMessage] = useState("")
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [showingChat, setShowingChat] = useState(false)
    const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 })
    const [isBlinking, setIsBlinking] = useState(false)
    const [isAutonomous, setIsAutonomous] = useState(false)

    const autonomousTimer = useRef<NodeJS.Timeout | null>(null)
    const inactivityTimer = useRef<NodeJS.Timeout | null>(null)
    const blinkTimer = useRef<NodeJS.Timeout | null>(null)
    // TG1-B: drowsyBlinkInterval ref removed — replaced by Framer Motion tween on the iris ellipse
    const scanningInterval = useRef<NodeJS.Timeout | null>(null)
    const scrollRef = useRef<HTMLDivElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const eyeRef = useRef<HTMLDivElement>(null)

    // TG1-A: Track previous (non-transient) state for auto-return after xp_gain / life_loss
    const prevStateRef = useRef<AIState>("awake")
    // Post-sync: true while the eye is in the 28s "curious" window after a successful sync.
    // During this window, inactivity uses POST_SYNC_CURIOUS_MS instead of INACTIVITY_RETURN_MS.
    const postSyncRef = useRef(false)
    const postSyncTimer = useRef<NodeJS.Timeout | null>(null)
    // Stable ref to startScanning — allows xpGainTrigger effect to call it before
    // the useCallback declaration (hooks can't be forward-referenced).
    const startScanningRef = useRef<() => void>(() => {})

    // --- Notify parent of AI state changes ---
    useEffect(() => {
        onAIStateChange?.(aiState)
    }, [aiState, onAIStateChange])

    // TG1-A: Keep prevStateRef updated to the last non-transient state
    // TG6: "searching" is also excluded — it's a sustained external-data-wait state,
    // not a permanent baseline. The previous meaningful state is preserved for the return transition.
    useEffect(() => {
        if (!NON_PREV_STATES.includes(aiState)) {
            prevStateRef.current = aiState
        }
    }, [aiState])

    // TG1-A: xp_gain trigger — fires double-blink + green iris, then enters 28s curious mode.
    // After the flash, the eye wakes up fully (awake) and starts autonomous scanning to
    // "review" the data it fetched. It stays in this curious mode for POST_SYNC_CURIOUS_MS
    // before the normal inactivity sequence (drowsy → sleeping) can begin.
    useEffect(() => {
        if (!xpGainTrigger) return
        setAIState("xp_gain")

        // Double-blink: t=0ms close, t=80ms open, t=200ms close, t=280ms open
        setIsBlinking(true)
        const t1 = setTimeout(() => setIsBlinking(false), 80)
        const t2 = setTimeout(() => setIsBlinking(true), 200)
        const t3 = setTimeout(() => setIsBlinking(false), 280)

        // After flash: wake up in curious mode and start scanning the data
        const ret = setTimeout(() => {
            setAIState("awake")
            startScanningRef.current()
            // Enter post-sync curious window — inactivity timer will use the long delay
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

    // TG1-A: life_loss trigger — fires slow single blink + red hex pulse, auto-returns after 2000ms
    useEffect(() => {
        if (!lifeLossTrigger) return
        setAIState("life_loss")

        // Single slow blink: close over ~300ms (done by marking blinking=true),
        // hold for 400ms, open over ~300ms
        setIsBlinking(true)
        const tHold = setTimeout(() => {
            // Still blinking at 300ms (hold phase)
        }, 300)
        const tOpen = setTimeout(() => setIsBlinking(false), 700)

        // Auto-return to previous state after 2000ms
        const ret = setTimeout(() => {
            setAIState(prevStateRef.current)
        }, 2000)

        return () => {
            clearTimeout(tHold)
            clearTimeout(tOpen)
            clearTimeout(ret)
        }
    }, [lifeLossTrigger])

    // TG6: searching trigger — sets the AIEye into the sustained amber/orange scanning state.
    // No auto-return: the caller (GitHubSyncPanel) drives exit via xpGainTrigger or lifeLossTrigger
    // once the sync action resolves.
    // Also marks the user as having interacted so the eye starts awake on future visits.
    useEffect(() => {
        if (!searchingTrigger) return
        setAIState("searching")
        localStorage.setItem(AI_INTERACTED_KEY, "1")
    }, [searchingTrigger])

    // --- Auto-scroll to bottom ---
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages, visibleLines, showingChat])

    // --- Persistence ---
    useEffect(() => {
        const saved = localStorage.getItem("ai_chat_history")
        if (saved) {
            const parsed = JSON.parse(saved)
            setMessages(parsed.messages)
        }
    }, [])

    // If the user has interacted before, start awake instead of in eternal sleep.
    // "Eternal sleep" is reserved for first-time users who've never triggered the eye.
    useEffect(() => {
        if (localStorage.getItem(AI_INTERACTED_KEY)) {
            setAIState("awake")
        }
    }, [])

    useEffect(() => {
        if (messages.length > 0) {
            localStorage.setItem("ai_chat_history", JSON.stringify({ messages }))
        }
    }, [messages])

    // --- Inactivity Logic (Inactivity -> Drowsy -> Sleeping) ---
    const resetInactivity = useCallback(() => {
        if (inactivityTimer.current) clearTimeout(inactivityTimer.current)
        if (aiState === "sleeping") return

        // During the post-sync curious window, use the extended delay so the eye
        // stays awake long enough to "review" the data it fetched.
        const delay = postSyncRef.current ? POST_SYNC_CURIOUS_MS : INACTIVITY_RETURN_MS

        inactivityTimer.current = setTimeout(() => {
            // When inactivity hits: return to info + start drowsy sequence
            postSyncRef.current = false
            setShowingChat(false)
            setAIState("drowsy")

            // Drowsy lasts 4 seconds before sleeping
            setTimeout(() => {
                setAIState("sleeping")
            }, 4000)
        }, delay)
    }, [aiState])

    useEffect(() => {
        // Don't start inactivity timer while the eye is busy:
        // - "searching": parent-driven state (GitHub sync in progress), must not sleep mid-scan
        // - "thinking" / "success": active AI response cycle
        if (
            aiState !== "sleeping" &&
            aiState !== "thinking" &&
            aiState !== "success" &&
            aiState !== "searching"
        ) {
            resetInactivity()
        }
        // Clear any running inactivity timer when entering searching so the eye
        // won't go drowsy while a sync is in progress.
        if (aiState === "searching" && inactivityTimer.current) {
            clearTimeout(inactivityTimer.current)
        }
        return () => { if (inactivityTimer.current) clearTimeout(inactivityTimer.current) }
    }, [resetInactivity, message, aiState])

    // TG1-B: drowsyBlinkInterval useEffect REMOVED.
    // The drowsy state animation is now handled by the Framer Motion tween on the iris ellipse
    // (transition changes to { type: "tween", duration: 3, ease: "easeInOut" } when isDrowsy=true)
    // and the half-lid motion.rect is a static opacity=0.4 bar.

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
    // Keep the ref in sync so effects defined before this useCallback can call it
    startScanningRef.current = startScanning

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
                // TG6: "searching" added to exclusion list — autonomous scanning must not
                // override the left-right scan animation driven by the searching state
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

    // --- Boot Link (Mount only) ---
    useEffect(() => {
        setVisibleLines(0)
        const bootTimer = setTimeout(() => {
            bootLines.forEach((_, i) => {
                setTimeout(() => setVisibleLines(i + 1), i * 300)
            })
        }, 1500)
        return () => clearTimeout(bootTimer)
    }, [])

    // --- Standard Blink Interval ---
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

    // --- Cursor blink ---
    useEffect(() => {
        const interval = setInterval(() => setCursorVisible(v => !v), 530)
        return () => clearInterval(interval)
    }, [])

    const wakeAI = () => {
        if (aiState === "sleeping" || aiState === "drowsy") {
            // Progressive wake: sleeping → waking → awake
            setAIState("waking")
            setTimeout(() => {
                setAIState("awake")
                if (messages.length > 0) setShowingChat(true)
            }, 800)
            resetInactivity()
        }
    }

    const handleSend = () => {
        if (!message.trim()) return
        const userMsg = message
        setMessages(prev => [...prev, { role: "user", content: userMsg }])
        setMessage("")
        setShowingChat(true)

        // Simulated AI response: listening → thinking → ready → success → awake
        setAIState("listening")
        setTimeout(() => {
            setAIState("thinking")
            setTimeout(() => {
                const aiReply = `He procesado tu comando "${userMsg}". Analizando resultados... Red neuronal optimizada para Arturo.`
                setMessages(prev => [...prev, { role: "ai", content: aiReply }])
                setAIState("ready")
                setTimeout(() => {
                    setAIState("success")
                    setTimeout(() => setAIState("awake"), 2500)
                }, 600)
            }, 1500)
        }, 800)
    }

    // TG6: searching gets its own amber border color
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

            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2 border-b bg-[hsl(200,30%,8%)]" style={{ borderColor }}>
                <div className="flex items-center gap-2">
                    {/* TG6: searching gets amber status dot */}
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
                    {/* TG6: searching gets amber STATUS label */}
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
                {/* Console */}
                <div className="flex-1 p-4 font-mono text-[11px] leading-relaxed overflow-hidden flex flex-col">
                    <div ref={scrollRef} className="flex-1 overflow-y-auto crt-scrollbar py-1">

                        {/* 1. INITIAL SYSTEM INFO */}
                        <div className="text-[hsl(174,100%,50%)] mb-1">
                            <span className="text-muted-foreground">$ </span>
                            <DecipherText text={`BIENVENIDO, ${userName.toUpperCase()}`} active={true} />
                        </div>
                        {bootLines.slice(0, visibleLines).map((line, i) => (
                            <div key={i} className={colorClass[line.color]}>
                                <span className="text-muted-foreground">{line.prefix}</span>{line.text}
                            </div>
                        ))}

                        {/* 2. CHAT HISTORY with Exit Animation towards AI */}
                        <AnimatePresence>
                            {showingChat && messages.length > 0 && (
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
                                    {/* Archive access header */}
                                    <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.1 }}
                                        className="text-[9px] font-mono text-muted-foreground/40 uppercase tracking-widest mb-2"
                                    >
                                        {">"} accessing_memory_buffer... [{messages.length} records]
                                    </motion.div>
                                    {messages.map((msg, idx) => (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, x: -8 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.05 * Math.min(idx, 10) }}
                                            className={cn("flex flex-col", msg.role === 'user' ? "text-foreground" : "text-[hsl(174,100%,50%)]")}
                                        >
                                            <div className="flex gap-1">
                                                <span className="text-muted-foreground">{msg.role === 'user' ? "$ query" : "> ai_resp"}:</span>
                                                <span className={msg.role === 'ai' ? "animate-console-type-in" : ""}>{msg.content}</span>
                                            </div>
                                        </motion.div>
                                    ))}
                                    {(aiState === "thinking" || aiState === "listening") && (
                                        <div className="text-purple-400 animate-pulse">
                                            <span className="text-muted-foreground">&gt; ai_resp:</span>
                                            {aiState === "listening" ? " Escuchando input neural..." : " Procesando respuesta neural..."}
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* 3. PROMPT Area */}
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
                                    onKeyDown={e => e.key === "Enter" && handleSend()}
                                    className="w-full bg-transparent border-none outline-none text-foreground p-0 m-0 caret-transparent"
                                    placeholder={(aiState === "sleeping" || aiState === "drowsy") ? "SISTEMA_DORMIDO (Click para activar)..." : "Introducir comando neural..."}
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

                {/* Eye Side */}
                <div ref={eyeRef} className="w-[120px] flex flex-col items-center justify-center border-l bg-[hsl(200,30%,4%)]" style={{ borderColor }}>
                    <AIEye state={aiState} mouseOffset={mouseOffset} isBlinking={isBlinking} />
                    {/* TG6: searching state label renders in amber */}
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
                <span>History_Buffer: {messages.length}</span>
            </div>
        </div>
    )
}
