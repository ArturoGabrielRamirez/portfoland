'use client';

/**
 * ImproveWithAIButton — Shared base component
 *
 * Generic AI content improvement button used by ImproveBioButton and
 * ImproveDescriptionButton. Parameterized by endpoint, body/response keys,
 * and optional extra body fields so each consumer stays as a thin wrapper.
 */

import React, { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/features/shadcn/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export interface ImproveWithAIButtonProps {
    /** The current text to be improved */
    currentText: string;
    /** Called with the improved text on success */
    onImproved: (newText: string) => void;
    /** API route to POST to (e.g. /api/ai/improve-bio) */
    endpoint: string;
    /** Key used for the text value in the request body */
    bodyKey: string;
    /** Key used to read the improved text from the response */
    responseKey: string;
    className?: string;
    mode?: 'tech' | 'classic';
    locale?: string;
    /** Toast message on empty input */
    emptyErrorMessage?: string;
    /** Toast message on success */
    successMessage?: string;
    /** Textarea placeholder for the additional notes field */
    placeholder?: string;
    /** Additional fields merged into the request body (e.g. { context: 'project' }) */
    extraBody?: Record<string, unknown>;
}

export function ImproveWithAIButton({
    currentText,
    onImproved,
    endpoint,
    bodyKey,
    responseKey,
    className,
    mode = 'classic',
    locale = 'en',
    emptyErrorMessage,
    successMessage,
    placeholder,
    extraBody,
}: ImproveWithAIButtonProps) {
    const [isImproving, setIsImproving] = useState(false);
    const [showNotes, setShowNotes] = useState(false);
    const [additionalNotes, setAdditionalNotes] = useState('');

    const handleImprove = async () => {
        if (!currentText?.trim()) {
            toast.error(
                emptyErrorMessage ??
                (locale === 'es' ? 'Escribe contenido primero' : 'Please write content first'),
            );
            return;
        }

        setIsImproving(true);

        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    [bodyKey]: currentText,
                    mode,
                    locale,
                    additionalNotes: additionalNotes.trim() || undefined,
                    ...extraBody,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to improve content');
            }

            if (data[responseKey]) {
                onImproved(data[responseKey]);
                toast.success(successMessage ?? '✨ Improved successfully!', {
                    description: locale === 'es'
                        ? 'Podés editarlo si querés.'
                        : 'You can edit it further if needed.',
                });
            }
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Please try again later.';
            toast.error(locale === 'es' ? 'Error al mejorar' : 'Failed to improve', {
                description: message,
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
                    disabled={isImproving || !currentText?.trim()}
                    className={cn(
                        'gap-2 text-xs',
                        mode === 'tech' && 'border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10',
                        className,
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
                        'text-[9px] font-mono uppercase tracking-wider transition-colors',
                        mode === 'tech'
                            ? 'text-cyan-500/60 hover:text-cyan-400'
                            : 'text-gray-500 hover:text-gray-400',
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
                    placeholder={placeholder ?? (locale === 'es'
                        ? 'Añadir contexto adicional...'
                        : 'Add additional context...'
                    )}
                    className={cn(
                        'w-full px-3 py-2 text-xs font-mono rounded border resize-none transition-all',
                        mode === 'tech'
                            ? 'bg-[#0D1421] border-cyan-500/20 text-gray-200 placeholder:text-gray-600 focus:border-cyan-500/50'
                            : 'bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-gray-400',
                    )}
                />
            )}
        </div>
    );
}
