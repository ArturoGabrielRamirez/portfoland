'use client';

import { NextIntlClientProvider } from 'next-intl';

interface Props {
    locale: string;
    messages: any;
    children: React.ReactNode;
}

export function SkillsIntlProvider({ locale, messages, children }: Props) {
    return (
        <NextIntlClientProvider locale={locale} messages={messages}>
            {children}
        </NextIntlClientProvider>
    );
}
