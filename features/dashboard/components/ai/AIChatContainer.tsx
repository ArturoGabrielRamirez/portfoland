'use client';

import React, { useRef, useEffect } from 'react';
import { useChat } from 'ai/react';
import { Bot, User, Send, Zap, AlertCircle, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/features/shadcn/ui/button';

interface AIChatContainerProps {
    className?: string;
}

export function AIChatContainer({ className }: AIChatContainerProps) {
    const [mounted, setMounted] = React.useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
        api: '/api/chat',
        initialMessages: [
            {
                id: 'welcome',
                role: 'assistant',
                content: 'Greetings, Player. I am the RPG Master. I see your portfolio journey has begun. Shall we level up your career character today?',
            },
        ],
        onResponse(response) {
            console.log('CLIENT_CHAT_RESPONSE_STATUS:', response.status);
        },
        onError(error) {
            console.error('CLIENT_CHAT_ERROR:', error);
        },
    });

    useEffect(() => {
        setMounted(true);
    }, []);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    if (!mounted) {
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
                            <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#00D4FF]/40 border border-[#00D4FF]/20" />
                        ))}
                    </div>
                    <span className="text-[8px] font-mono text-gray-500 uppercase">Energy: Recharging</span>
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
            </div>

            {/* Input Area */}
            <form onSubmit={handleSubmit} className="p-3 border-t border-[hsl(174,100%,50%,0.1)] bg-[rgba(0,0,0,0.5)]">
                <div className="relative group">
                    <input
                        value={input}
                        onChange={handleInputChange}
                        placeholder="ACCESS TERMINAL..."
                        className="w-full bg-[#070b14] border border-cyan-900/40 rounded px-3 py-2 text-xs font-mono text-cyan-50 placeholder:text-gray-700 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all pr-10"
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !input?.trim()}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-cyan-500 hover:text-cyan-400 disabled:text-gray-800 transition-colors"
                    >
                        <Send size={14} />
                    </button>
                </div>
            </form>
        </div>
    );
}
