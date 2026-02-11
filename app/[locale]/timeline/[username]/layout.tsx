/**
 * Public Timeline Layout
 *
 * Minimal layout for public timeline pages.
 * No dashboard sidebar - clean view for sharing.
 */

import Link from 'next/link';
import { setRequestLocale } from 'next-intl/server';

interface PublicTimelineLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    locale: string;
    username: string;
  }>;
}

export default async function PublicTimelineLayout({
  children,
  params,
}: PublicTimelineLayoutProps) {
  const { locale } = await params;

  // Enable static rendering
  setRequestLocale(locale);

  return (
    <div className="min-h-screen bg-[#0A0E1A] text-white">
      {/* Minimal header */}
      <header className="sticky top-0 z-50 border-b border-[#334155]/50 bg-[#0A0E1A]/95 backdrop-blur-lg">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link
            href={`/${locale}`}
            className="flex items-center gap-2 text-lg font-bold tracking-tight text-white transition-opacity hover:opacity-80"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#00D4FF] to-[#8B5CF6]">
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
            className="rounded-lg bg-gradient-to-r from-[#00D4FF] to-[#8B5CF6] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            Create Your Timeline
          </Link>
        </div>
      </header>

      {/* Content */}
      <main>{children}</main>
    </div>
  );
}
