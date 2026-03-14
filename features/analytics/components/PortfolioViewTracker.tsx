'use client';

import { useEffect } from 'react';

export function PortfolioViewTracker({ username }: { username: string }) {
    useEffect(() => {
        fetch('/api/portfolio/view', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username }),
        }).catch(() => {});
    }, [username]);

    return null;
}
