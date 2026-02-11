/**
 * Public Portfolio Layout
 *
 * Minimal layout for public portfolio pages.
 * Desktop: flex column with h-screen so the header + portfolio fill one viewport.
 * Mobile: natural document flow with scroll.
 * Visual theming is handled by the PortfolioLayout client component.
 *
 * When served via subdomain, header links point to the root domain so that
 * navigation away from the portfolio lands on portfoland.com rather than
 * staying on the username subdomain.
 */

import Link from 'next/link';
import { headers } from 'next/headers';
import { setRequestLocale } from 'next-intl/server';
import { getPortfolioByUsername } from '@/features/portfolio/data';
import { cn } from '@/lib/utils';

interface PublicPortfolioLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    locale: string;
    username: string;
  }>;
}

export default async function PublicPortfolioLayout({
  children,
  params,
}: PublicPortfolioLayoutProps) {
  const { locale, username } = await params;

  setRequestLocale(locale);

  const portfolioData = await getPortfolioByUsername(username);
  const isProfessional = portfolioData?.user.portfolioMode === 'professional';

  // Detect subdomain context via header set by the proxy during rewrites
  const requestHeaders = await headers();
  const subdomain = requestHeaders.get('x-subdomain');
  const isSubdomain = Boolean(subdomain);

  const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN;
  const homeHref = isSubdomain
    ? `https://${appDomain}/${locale}`
    : `/${locale}`;
  const ctaHref = isSubdomain
    ? `https://${appDomain}/${locale}/register`
    : `/${locale}/register`;

  return (
    <div
      className={cn(
        // Desktop: full viewport height, flex column so children fill remaining space
        'md:flex md:h-screen md:flex-col md:overflow-hidden',
        // Mobile: natural document flow
        'min-h-screen',
        isProfessional ? 'bg-white text-gray-900' : 'bg-[#0A0E1A] text-white'
      )}
    >
      {/* Minimal header */}
      <header
        className={cn(
          'shrink-0 border-b backdrop-blur-lg',
          // Mobile: sticky top header
          'sticky top-0 z-50 md:static',
          isProfessional
            ? 'bg-white/95 border-gray-200'
            : 'bg-[#0A0E1A]/95 border-[#334155]/50'
        )}
      >
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link
            href={homeHref}
            className={cn(
              'flex items-center gap-2 text-lg font-bold tracking-tight transition-opacity hover:opacity-80',
              isProfessional ? 'text-gray-900' : 'text-white'
            )}
          >
            <div
              className={cn(
                'flex h-7 w-7 items-center justify-center rounded-lg',
                isProfessional
                  ? 'bg-blue-600'
                  : 'bg-gradient-to-br from-[#00D4FF] to-[#8B5CF6]'
              )}
            >
              <svg
                className="h-4 w-4 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="hidden sm:inline">Portfoland</span>
          </Link>

          {/* CTA */}
          <Link
            href={ctaHref}
            className={cn(
              'rounded-lg px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90',
              isProfessional
                ? 'bg-blue-600 text-white'
                : 'bg-gradient-to-r from-[#00D4FF] to-[#8B5CF6] text-white'
            )}
          >
            Create Your Portfolio
          </Link>
        </div>
      </header>

      {/* Portfolio content fills remaining space on desktop */}
      <div className="md:flex-1 md:min-h-0">
        {children}
      </div>
    </div>
  );
}
