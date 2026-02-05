/**
 * Skills Dashboard Layout
 *
 * Layout component for the skills dashboard pages.
 * Consistent with the main dashboard layout with gaming theme styling.
 */

import { setRequestLocale } from 'next-intl/server';

interface SkillsLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    locale: string;
  }>;
}

export default async function SkillsLayout({
  children,
  params,
}: SkillsLayoutProps) {
  const { locale } = await params;

  // Enable static rendering
  setRequestLocale(locale);

  return (
    <div className="min-h-screen bg-[#0A0E1A]">
      {children}
    </div>
  );
}
