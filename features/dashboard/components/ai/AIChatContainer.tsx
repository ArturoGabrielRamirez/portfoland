'use client';

import React, { useRef, useEffect } from 'react';
import { useChat } from 'ai/react';
import { Bot, User, Send, Zap, AlertCircle, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/features/shadcn/ui/button';
import { useLocale } from 'next-intl';
import { useAIContext } from '@/features/ai/context/AIContext';

interface AIChatContainerProps {
    className?: string;
}

export function AIChatContainer({ className }: AIChatContainerProps) {
    const locale = useLocale();
    const { setHighlightedSkills } = useAIContext();
    const [mounted, setMounted] = React.useState(false);
    const [lives, setLives] = React.useState<number>(3);
    const [isLoadingLives, setIsLoadingLives] = React.useState(true);
    const [isLoadingHistory, setIsLoadingHistory] = React.useState(true);
    const [historyMessages, setHistoryMessages] = React.useState<any[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);
    const previousMessagesLength = useRef<number>(0);

    // Load chat history before rendering chat
    useEffect(() => {
        async function loadHistory() {
            try {
                const res = await fetch('/api/chat/history');
                const data = await res.json();

                if (data.messages && data.messages.length > 0) {
                    console.log(`HISTORY_LOADED: ${data.messages.length} messages`);
                    setHistoryMessages(data.messages);
                } else {
                    console.log('NO_HISTORY_FOUND: Using welcome message');
                    setHistoryMessages([{
                        id: 'welcome',
                        role: 'assistant',
                        content: locale === 'es'
                            ? 'Saludos, Jugador. Soy el RPG Master. Veo que tu viaje de portfolio ha comenzado. ¿Subimos de nivel tu personaje de carrera hoy?'
                            : 'Greetings, Player. I am the RPG Master. I see your portfolio journey has begun. Shall we level up your career character today?',
                    }]);
                }
            } catch (err) {
                console.error('FAILED_TO_LOAD_HISTORY:', err);
                setHistoryMessages([{
                    id: 'welcome',
                    role: 'assistant',
                    content: locale === 'es'
                        ? 'Saludos, Jugador. Soy el RPG Master. Veo que tu viaje de portfolio ha comenzado. ¿Subimos de nivel tu personaje de carrera hoy?'
                        : 'Greetings, Player. I am the RPG Master. I see your portfolio journey has begun. Shall we level up your career character today?',
                }]);
            } finally {
                setIsLoadingHistory(false);
            }
        }

        if (mounted) {
            loadHistory();
        }
    }, [mounted, locale]);

    const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
        api: '/api/chat',
        body: {
            locale,
        },
        initialMessages: historyMessages,
        onResponse(response) {
            console.log('CLIENT_CHAT_RESPONSE_STATUS:', response.status);

            // If 429 error, set lives to 0
            if (response.status === 429) {
                setLives(0);
            }
        },
        onError(error) {
            console.error('CLIENT_CHAT_ERROR:', error);
        },
    });

    useEffect(() => {
        setMounted(true);
    }, []);

    // Intercept tool calls to apply visual highlights
    useEffect(() => {
        if (!messages.length) return;
        
        const lastMessage = messages[messages.length - 1];
        if (lastMessage.role === 'assistant' && lastMessage.toolInvocations) {
            lastMessage.toolInvocations.forEach(invoc => {
                if (invoc.toolName === 'suggestLearningPath' && invoc.args?.skillsToLearn) {
                    setHighlightedSkills(invoc.args.skillsToLearn as string[]);
                }
            });
        }
    }, [messages, setHighlightedSkills]);

    // Fetch initial lives on mount
    useEffect(() => {
        async function fetchLives() {
            try {
                const res = await fetch('/api/ai/lives');
                const data = await res.json();
                setLives(data.remainingLives || 0);
            } catch (err) {
                console.error('Failed to fetch lives:', err);
                setLives(0);
            } finally {
                setIsLoadingLives(false);
            }
        }
        fetchLives();
    }, []);

    // Initialize previousMessagesLength when history loads
    useEffect(() => {
        if (!isLoadingHistory && messages.length > 0) {
            previousMessagesLength.current = messages.length;
        }
    }, [isLoadingHistory, messages.length]);

    // Refetch lives after AI response completes
    useEffect(() => {
        // When loading finishes and we have more messages than before, refetch lives
        if (!isLoading && messages.length > previousMessagesLength.current) {
            console.log(`REFETCHING_LIVES: prev=${previousMessagesLength.current}, current=${messages.length}`);

            // Refetch lives from server after AI response completes
            fetch('/api/ai/lives')
                .then(res => res.json())
                .then(data => {
                    console.log(`LIVES_UPDATED: ${data.remainingLives}`);
                    setLives(data.remainingLives || 0);
                })
                .catch(err => console.error('Failed to refetch lives:', err));

            previousMessagesLength.current = messages.length;
        }
    }, [isLoading, messages.length]);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    if (!mounted || isLoadingHistory) {
        return (
            <div className={cn(
                "flex flex-col h-[400px] border border-[hsl(174,100%,50%,0.2)] rounded bg-[rgba(13,25,48,0.95)] animate-pulse",
                className
            )} />
        );
    }

    return (
        <div className={cn(
            "flex flex-col h-[400px] border border-[hsl(174,100%,50%,0.2)] rounded bg-[rgba(13,25,48,0.95)] backdrop-blur-md overflow-hidden",
            className
        )}>
            {/* HUD Header Sub-bar */}
            <div className="px-3 py-1.5 border-b border-[hsl(174,100%,50%,0.15)] bg-[rgba(0,212,255,0.03)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Zap className="w-3 h-3 text-[#00D4FF]" />
                    <span className="text-[9px] font-mono font-bold text-[#00D4FF] tracking-[0.1em] uppercase">
                        AI OVERSEER v0.4
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex gap-0.5">
                        {[1, 2, 3].map(i => (
                            <div
                                key={i}
                                className={cn(
                                    "w-1.5 h-1.5 rounded-full border transition-all duration-300",
                                    i <= lives
                                        ? "bg-[#00D4FF] border-[#00D4FF] shadow-[0_0_4px_rgba(0,212,255,0.5)]" // Active life
                                        : "bg-gray-800 border-gray-700" // Depleted life
                                )}
                            />
                        ))}
                    </div>
                    <span className={cn(
                        "text-[8px] font-mono uppercase transition-colors",
                        lives === 0 ? "text-red-500" : "text-gray-500"
                    )}>
                        {isLoadingLives ? 'Loading...' : `Energy: ${lives}/3`}
                    </span>
                </div>
            </div>

            {/* Messages Area */}
            <div
                className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
                ref={scrollRef}
                style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(0, 212, 255, 0.2) transparent' }}
            >
                {messages.map((m) => (
                    <div
                        key={m.id}
                        className={cn(
                            "flex gap-3 max-w-[90%]",
                            m.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
                        )}
                    >
                        <div className={cn(
                            "w-7 h-7 rounded shrink-0 flex items-center justify-center border",
                            m.role === 'user'
                                ? "bg-purple-500/10 border-purple-500/30 text-purple-400"
                                : "bg-cyan-500/10 border-cyan-500/30 text-cyan-400"
                        )}>
                            {m.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                        </div>

                        <div className={cn(
                            "p-3 rounded text-[13px] font-mono leading-relaxed relative",
                            m.role === 'user'
                                ? "bg-purple-900/10 border border-purple-500/10 text-gray-300"
                                : "bg-cyan-900/15 border border-cyan-500/15 text-cyan-50/90 shadow-[0_0_10px_rgba(0,212,255,0.02)]"
                        )}>
                            {m.content}

                            {/* Mission Log Status for tool calls */}
                            {m.role === 'assistant' && (m as any).toolInvocations?.length > 0 && (
                                <div className="mt-2 pt-2 border-t border-cyan-500/10 flex items-center gap-2 text-[9px] text-[#00D4FF] font-black uppercase tracking-tighter">
                                    <Sparkles size={10} className="animate-spin" style={{ animationDuration: '3s' }} />
                                    Mission Log Updated
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="flex gap-3">
                        <div className="w-7 h-7 rounded bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                            <Bot size={14} className="animate-pulse" />
                        </div>
                        <div className="flex items-center gap-1 opacity-50">
                            <span className="w-1 h-1 bg-cyan-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                            <span className="w-1 h-1 bg-cyan-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                            <span className="w-1 h-1 bg-cyan-500 rounded-full animate-bounce" />
                        </div>
                    </div>
                )}

                {error && (
                    <div className="flex items-center gap-2 p-2 rounded bg-red-500/5 border border-red-500/20 text-red-500/80 text-[10px] font-mono">
                        <AlertCircle size={12} />
                        <span>CRITICAL_FAIL: {error.message}</span>
                    </div>
                )}

                {/* Out of Lives Warning */}
                {lives === 0 && !isLoadingLives && (
                    <div className="p-3 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono space-y-2">
                        <div className="flex items-center gap-2">
                            <AlertCircle size={14} />
                            <span className="font-bold">⚠️ ENERGY DEPLETED</span>
                        </div>
                        <p className="text-[11px] leading-relaxed">
                            Your AI assistant energy has been exhausted. Recharge in 24 hours to continue your quest.
                        </p>
                        <div className="text-[10px] text-red-300/70">
                            🔋 Lives reset daily at midnight
                        </div>
                    </div>
                )}
            </div>

            {/* Input Area */}
            <form onSubmit={handleSubmit} className="p-3 border-t border-[hsl(174,100%,50%,0.1)] bg-[rgba(0,0,0,0.5)]">
                <div className="relative group">
                    <input
                        value={input}
                        onChange={handleInputChange}
                        placeholder={lives === 0 ? "ENERGY DEPLETED - RECHARGE REQUIRED..." : "ACCESS TERMINAL..."}
                        disabled={lives === 0 || isLoading}
                        className={cn(
                            "w-full bg-[#070b14] border rounded px-3 py-2 text-xs font-mono placeholder:text-gray-700 focus:outline-none transition-all pr-10",
                            lives === 0
                                ? "border-red-900/40 text-red-400/50 cursor-not-allowed"
                                : "border-cyan-900/40 text-cyan-50 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20"
                        )}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !input?.trim() || lives === 0}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-cyan-500 hover:text-cyan-400 disabled:text-gray-800 transition-colors"
                    >
                        <Send size={14} />
                    </button>
                </div>
            </form>
        </div>
    );
}
