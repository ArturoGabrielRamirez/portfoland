'use client';

import React from 'react';
import { ChevronUp, ChevronDown, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HUDPanelProps {
    title: string;
    children: React.ReactNode;
    icon?: React.ReactNode;
    isVisible?: boolean;
    onToggleVisibility?: () => void;
    onMoveUp?: () => void;
    onMoveDown?: () => void;
    className?: string;
}

export function HUDPanel({
    title,
    children,
    icon,
    isVisible = true,
    onToggleVisibility,
    onMoveUp,
    onMoveDown,
    className,
}: HUDPanelProps) {
    return (
        <div className={cn(
            "bg-[#131B2E] border border-[hsl(174,100%,50%,0.25)] rounded-lg overflow-hidden transition-all duration-300 shadow-[0_0_15px_rgba(0,212,255,0.05)]",
            !isVisible && "opacity-60 grayscale-[0.8]",
            className
        )}>
            {/* HUD Header */}
            <div className="px-4 py-3 flex items-center justify-between border-b border-[hsl(174,100%,50%,0.2)] bg-[rgba(0,212,255,0.05)] relative overflow-hidden">
                {/* Background accent */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-[radial-gradient(circle_at_top_right,rgba(0,212,255,0.1),transparent)] pointer-events-none" />

                <div className="flex items-center gap-2 relative z-10">
                    {icon && <div className="text-[#00D4FF] drop-shadow-[0_0_8px_rgba(0,212,255,0.4)]">{icon}</div>}
                    <h3 className="text-[11px] font-mono font-black text-gray-100 uppercase tracking-widest flex items-center gap-2">
                        <span className="w-1 h-3 bg-[#00D4FF] inline-block" />
                        {title}
                    </h3>
                </div>

                <div className="flex items-center gap-1 relative z-10">
                    {/* Reordering Controls */}
                    <div className="flex items-center gap-0.5 mr-3 pr-3 border-r border-[hsl(174,100%,50%,0.15)]">
                        <button
                            type="button"
                            onClick={onMoveUp}
                            className="p-1 hover:bg-[rgba(0,212,255,0.15)] text-gray-400 hover:text-[#00D4FF] rounded transition-colors"
                            title="Move Up"
                        >
                            <ChevronUp className="w-4 h-4" />
                        </button>
                        <button
                            type="button"
                            onClick={onMoveDown}
                            className="p-1 hover:bg-[rgba(0,212,255,0.15)] text-gray-400 hover:text-[#00D4FF] rounded transition-colors"
                            title="Move Down"
                        >
                            <ChevronDown className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Visibility Toggle */}
                    <button
                        type="button"
                        onClick={onToggleVisibility}
                        className={cn(
                            "p-1.5 rounded transition-all flex items-center gap-2 text-[10px] font-mono font-black",
                            isVisible
                                ? "text-[#00D4FF] bg-[rgba(0,212,255,0.05)] hover:bg-[rgba(0,212,255,0.1)] border border-[rgba(0,212,255,0.2)]"
                                : "text-gray-500 bg-gray-800/20 hover:bg-gray-800/40 border border-gray-700/30"
                        )}
                        title={isVisible ? "Hide Section" : "Show Section"}
                    >
                        {isVisible ? (
                            <>
                                <Eye className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">ONLINE</span>
                            </>
                        ) : (
                            <>
                                <EyeOff className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">OFFLINE</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="p-6 bg-gradient-to-b from-transparent to-[rgba(0,212,255,0.01)]">
                {children}
            </div>

            {/* Bottom accent bar */}
            <div className="h-[1px] bg-gradient-to-r from-transparent via-[hsl(174,100%,50%,0.4)] to-transparent opacity-50" />
        </div>
    );
}
