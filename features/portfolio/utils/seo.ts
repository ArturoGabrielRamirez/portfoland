
import type { Metadata } from 'next';
import type { PortfolioData } from '../types/portfolio';

export function generatePortfolioMetadata(
    data: PortfolioData,
    t: (key: string, params?: any) => string,
    locale: string
): Metadata {
    const { user } = data;
    const username = user.username;
    const isDev = process.env.NODE_ENV === 'development';
    const protocol = isDev ? 'http' : 'https';
    const domain = process.env.NEXT_PUBLIC_APP_DOMAIN || 'portfoland.com';
    const port = isDev ? ':3000' : ''; // Default to 3000 in dev if not in domain

    // Construct canonical subdomain URL
    // Supports username.localhost:3000 in dev and username.portfoland.com in prod
    const canonicalUrl = `${protocol}://${username}.${domain}${port}`;

    const baseUrl = `${protocol}://${username}.${domain}${port}`;

    const role = t('defaultRole');

    const title = t('titleTemplate', { name: user.name, role });
    const description = user.bio
        ? user.bio.substring(0, 160)
        : t('descriptionTemplate', { name: user.name });

    const ogImageUrl = `/api/og?username=${username}&mode=${user.portfolioMode}&locale=${locale}`;

    return {
        title,
        description,
        alternates: {
            canonical: canonicalUrl,
            languages: {
                'en': `${baseUrl}/en`,
                'es': `${baseUrl}/es`,
            }
        },
        openGraph: {
            title,
            description,
            url: canonicalUrl,
            siteName: 'Portfoland',
            locale: locale,
            type: 'profile',
            images: [
                {
                    url: ogImageUrl,
                    width: 1200,
                    height: 630,
                    alt: title,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [ogImageUrl],
        },
        robots: {
            index: true,
            follow: true,
            googleBot: {
                index: true,
                follow: true,
                'max-video-preview': -1,
                'max-image-preview': 'large',
                'max-snippet': -1,
            },
        },
    };
}
