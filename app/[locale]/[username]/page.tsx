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

import { headers } from 'next/headers';
import { redirect, notFound } from 'next/navigation';
import { getPortfolioByUsername } from '@/features/portfolio/data';
import { PortfolioLayout } from '@/features/portfolio/components/PortfolioLayout';

interface UsernamePageProps {
  params: Promise<{ locale: string; username: string }>;
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
