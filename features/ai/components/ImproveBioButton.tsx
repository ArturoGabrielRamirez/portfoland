'use client';

import React, { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/features/shadcn/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ImproveBioButtonProps {
    currentBio: string;
    onImproved: (newBio: string) => void;
    className?: string;
    mode?: 'gaming' | 'professional';
    locale?: string;
}

export function ImproveBioButton({
    currentBio,
    onImproved,
    className,
    mode = 'professional',
    locale = 'en'
}: ImproveBioButtonProps) {
    const [isImproving, setIsImproving] = useState(false);
    const [showNotes, setShowNotes] = useState(false);
    const [additionalNotes, setAdditionalNotes] = useState('');

    const handleImprove = async () => {
        if (!currentBio?.trim()) {
            toast.error('Please write a bio first before improving it.');
            return;
        }

        setIsImproving(true);

        try {
            const res = await fetch('/api/ai/improve-bio', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    bio: currentBio,
                    mode,
                    locale,
                    additionalNotes: additionalNotes.trim() || undefined
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to improve bio');
            }

            if (data.improvedBio) {
                onImproved(data.improvedBio);
                toast.success('✨ Bio improved successfully!', {
                    description: 'You can edit it further if needed.'
                });
            }
        } catch (error: any) {
            console.error('IMPROVE_BIO_ERROR:', error);
            toast.error('Failed to improve bio', {
                description: error.message || 'Please try again later.'
            });
        } finally {
            setIsImproving(false);
        }
    };

    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleImprove}
                    disabled={isImproving || !currentBio?.trim()}
                    className={cn(
                        "gap-2 text-xs",
                        mode === 'gaming' && "border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10",
                        className
                    )}
                >
                    {isImproving ? (
                        <>
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Improving...
                        </>
                    ) : (
                        <>
                            <Sparkles className="w-3 h-3" />
                            Improve with AI
                        </>
                    )}
                </Button>

                <button
                    type="button"
                    onClick={() => setShowNotes(!showNotes)}
                    className={cn(
                        "text-[9px] font-mono uppercase tracking-wider transition-colors",
                        mode === 'gaming' ? "text-cyan-500/60 hover:text-cyan-400" : "text-gray-500 hover:text-gray-400"
                    )}
                >
                    {showNotes ? '− Hide notes' : '+ Add details'}
                </button>
            </div>

            {showNotes && (
                <textarea
                    value={additionalNotes}
                    onChange={(e) => setAdditionalNotes(e.target.value)}
                    rows={2}
                    maxLength={200}
                    placeholder={locale === 'es'
                        ? "Ej: Me encanta desarrollar y jugar videojuegos, soy muy creativo..."
                        : "E.g: I love both developing and playing games, very creative..."
                    }
                    className={cn(
                        "w-full px-3 py-2 text-xs font-mono rounded border resize-none transition-all",
                        mode === 'gaming'
                            ? "bg-[#0D1421] border-cyan-500/20 text-gray-200 placeholder:text-gray-600 focus:border-cyan-500/50"
                            : "bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-gray-400"
                    )}
                />
            )}
        </div>
    );
}
