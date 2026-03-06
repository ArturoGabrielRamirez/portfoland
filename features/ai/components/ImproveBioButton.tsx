'use client';

import { ImproveWithAIButton } from './ImproveWithAIButton';

interface ImproveBioButtonProps {
    currentBio: string;
    onImproved: (newBio: string) => void;
    className?: string;
    mode?: 'tech' | 'classic';
    locale?: string;
}

export function ImproveBioButton({
    currentBio,
    onImproved,
    className,
    mode,
    locale,
}: ImproveBioButtonProps) {
    return (
        <ImproveWithAIButton
            currentText={currentBio}
            onImproved={onImproved}
            endpoint="/api/ai/improve-bio"
            bodyKey="bio"
            responseKey="improvedBio"
            className={className}
            mode={mode}
            locale={locale}
            emptyErrorMessage="Please write a bio first before improving it."
            successMessage="✨ Bio improved successfully!"
            placeholder={locale === 'es'
                ? 'Ej: Me encanta desarrollar y jugar videojuegos, soy muy creativo...'
                : 'E.g: I love both developing and playing games, very creative...'
            }
        />
    );
}
