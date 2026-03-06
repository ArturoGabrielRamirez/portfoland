'use client';

import { ImproveWithAIButton } from './ImproveWithAIButton';

interface ImproveDescriptionButtonProps {
    currentDescription: string;
    onImproved: (newDescription: string) => void;
    className?: string;
    mode?: 'tech' | 'classic';
    locale?: string;
    context?: 'project' | 'experience';
}

export function ImproveDescriptionButton({
    currentDescription,
    onImproved,
    className,
    mode,
    locale,
    context = 'project',
}: ImproveDescriptionButtonProps) {
    return (
        <ImproveWithAIButton
            currentText={currentDescription}
            onImproved={onImproved}
            endpoint="/api/ai/improve-description"
            bodyKey="description"
            responseKey="improvedDescription"
            className={className}
            mode={mode}
            locale={locale}
            successMessage="✨ Description improved successfully!"
            placeholder={locale === 'es'
                ? 'Ej: Este proyecto me ayudó a aprender microservicios, trabajé en equipo...'
                : 'E.g: This project helped me learn microservices, worked in a team...'
            }
            extraBody={{ context }}
        />
    );
}
