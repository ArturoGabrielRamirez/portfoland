/**
 * Username Route
 *
 * Two behaviors depending on how the page is accessed:
 *
 * 1. Via subdomain proxy rewrite (e.g., gabo.localhost:3000 → /en/gabo):
 *    Detected by checking the `host` header — if it contains a subdomain,
 *    fetch and render the full portfolio.
 *
 * 2. Direct path access (e.g., localhost:3000/en/gabo):
 *    Redirect to the canonical subdomain URL.
 */

import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { redirect, notFound } from 'next/navigation';
import { getPortfolioByUsername } from '@/features/portfolio/data';
import { PortfolioLayout } from '@/features/portfolio/components/PortfolioLayout';
import { generatePortfolioMeta } from '@/features/portfolio/utils/generatePortfolioMeta';

interface UsernamePageProps {
  params: Promise<{ locale: string; username: string }>;
}

/**
 * Build the canonical subdomain URL for the given username.
 */
function buildCanonicalUrl(username: string): string {
  const isDev = process.env.NODE_ENV !== 'production';
  const protocol = isDev ? 'http' : 'https';
  const domain = process.env.NEXT_PUBLIC_APP_DOMAIN || 'localhost';
  const port = isDev ? `:${process.env.PORT || 3000}` : '';
  return `${protocol}://${username}.${domain}${port}`;
}

/**
 * Generate SEO metadata for the public portfolio page.
 *
 * Next.js deduplicates the getPortfolioByUsername fetch so the data layer
 * is only called once even though the page component also calls it.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string; locale: string }>;
}): Promise<Metadata> {
  const { username, locale } = await params;
  const portfolioData = await getPortfolioByUsername(username);

  if (!portfolioData) {
    return {
      title: 'Portfolio | Portfoland',
      description: 'Portfolio not found on Portfoland.',
    };
  }

  const meta = generatePortfolioMeta(portfolioData, locale);
  const canonicalUrl = buildCanonicalUrl(username);

  // Use the user's avatar as OG image if available, otherwise fall back to
  // the dynamic OG image endpoint.
  const ogImageUrl = portfolioData.user.image
    ? portfolioData.user.image
    : `/api/og?username=${username}&mode=${portfolioData.user.portfolioMode}&locale=${locale}`;

  return {
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        en: `${canonicalUrl}/en`,
        es: `${canonicalUrl}/es`,
      },
    },
    openGraph: {
      title: meta.ogTitle,
      description: meta.ogDescription,
      url: canonicalUrl,
      siteName: 'Portfoland',
      locale: locale,
      type: 'profile',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: meta.ogTitle,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.ogTitle,
      description: meta.ogDescription,
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

export default async function UsernamePage({ params }: UsernamePageProps) {
  const { username, locale } = await params;
  const domain = process.env.NEXT_PUBLIC_APP_DOMAIN || 'localhost';

  // Detect if request came through the subdomain proxy rewrite
  // by checking whether the host header contains the username as a subdomain.
  const headersList = await headers();
  const host = headersList.get('host') || '';
  const hostWithoutPort = host.split(':')[0];
  const isSubdomainAccess = hostWithoutPort === `${username}.${domain}`;

  if (!isSubdomainAccess) {
    // Direct path access — redirect to canonical subdomain URL
    const isDev = process.env.NODE_ENV !== 'production';
    const protocol = isDev ? 'http' : 'https';
    const port = isDev ? `:${process.env.PORT || 3000}` : '';
    redirect(`${protocol}://${username}.${domain}${port}`);
  }

  // Subdomain access via proxy rewrite — render the portfolio
  const portfolioData = await getPortfolioByUsername(username);
  if (!portfolioData) {
    notFound();
  }

  return (
    <PortfolioLayout
      data={portfolioData}
      mode={portfolioData.user.portfolioMode}
    />
  );
}
