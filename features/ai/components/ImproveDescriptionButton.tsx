'use client';

import React, { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/features/shadcn/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ImproveDescriptionButtonProps {
    currentDescription: string;
    onImproved: (newDescription: string) => void;
    className?: string;
    mode?: 'gaming' | 'professional';
    locale?: string;
    context?: 'project' | 'experience';
}

export function ImproveDescriptionButton({
    currentDescription,
    onImproved,
    className,
    mode = 'professional',
    locale = 'en',
    context = 'project'
}: ImproveDescriptionButtonProps) {
    const [isImproving, setIsImproving] = useState(false);
    const [showNotes, setShowNotes] = useState(false);
    const [additionalNotes, setAdditionalNotes] = useState('');

    const handleImprove = async () => {
        if (!currentDescription?.trim()) {
            toast.error(locale === 'es'
                ? 'Escribe una descripción primero'
                : 'Please write a description first'
            );
            return;
        }

        setIsImproving(true);

        try {
            const res = await fetch('/api/ai/improve-description', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    description: currentDescription,
                    mode,
                    locale,
                    context,
                    additionalNotes: additionalNotes.trim() || undefined
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to improve description');
            }

            if (data.improvedDescription) {
                onImproved(data.improvedDescription);
                toast.success('✨ Description improved successfully!', {
                    description: 'You can edit it further if needed.'
                });
            }
        } catch (error: any) {
            console.error('IMPROVE_DESCRIPTION_ERROR:', error);
            toast.error('Failed to improve description', {
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
                    disabled={isImproving || !currentDescription?.trim()}
                    className={cn(
                        "gap-2 text-xs",
                        mode === 'gaming' && "border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10",
                        className
                    )}
                >
                    {isImproving ? (
                        <>
                            <Loader2 className="w-3 h-3 animate-spin" />
                            {locale === 'es' ? 'Mejorando...' : 'Improving...'}
                        </>
                    ) : (
                        <>
                            <Sparkles className="w-3 h-3" />
                            {locale === 'es' ? 'Mejorar con IA' : 'Improve with AI'}
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
                    {showNotes
                        ? (locale === 'es' ? '− Ocultar notas' : '− Hide notes')
                        : (locale === 'es' ? '+ Agregar detalles' : '+ Add details')
                    }
                </button>
            </div>

            {showNotes && (
                <textarea
                    value={additionalNotes}
                    onChange={(e) => setAdditionalNotes(e.target.value)}
                    rows={2}
                    maxLength={200}
                    placeholder={locale === 'es'
                        ? "Ej: Este proyecto me ayudó a aprender microservicios, trabajé en equipo..."
                        : "E.g: This project helped me learn microservices, worked in a team..."
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
