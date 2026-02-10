/**
 * Public Portfolio Layout
 *
 * Minimal layout for public portfolio pages.
 * Visual theming is handled by the PortfolioLayout client component
 * which receives portfolioMode from the page data.
 */

import Link from 'next/link';
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

  // Fetch portfolio data to determine mode for header styling
  const portfolioData = await getPortfolioByUsername(username);
  const isProfessional = portfolioData?.user.portfolioMode === 'professional';

  return (
    <div
      className={cn(
        'min-h-screen',
        isProfessional ? 'bg-white text-gray-900' : 'bg-[#0A0E1A] text-white'
      )}
    >
      {/* Minimal header */}
      <header
        className={cn(
          'sticky top-0 z-50 border-b backdrop-blur-lg',
          isProfessional
            ? 'bg-white/95 border-gray-200'
            : 'bg-[#0A0E1A]/95 border-[#334155]/50'
        )}
      >
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link
            href={`/${locale}`}
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
            href={`/${locale}/register`}
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

      {children}
    </div>
  );
}
