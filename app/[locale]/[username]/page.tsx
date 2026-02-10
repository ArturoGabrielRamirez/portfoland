/**
 * Public Portfolio Page
 *
 * Displays a user's public portfolio with panel-based navigation.
 * Fetches all portfolio data and passes it to the client layout component.
 */

import { notFound } from 'next/navigation';
import { getPortfolioByUsername } from '@/features/portfolio/data';
import { PortfolioLayout } from '@/features/portfolio/components/PortfolioLayout';

interface PortfolioPageProps {
  params: Promise<{
    locale: string;
    username: string;
  }>;
}

export default async function PortfolioPage({ params }: PortfolioPageProps) {
  const { username } = await params;

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

/**
 * Generate metadata for SEO
 */
export async function generateMetadata({ params }: PortfolioPageProps) {
  const { username } = await params;
  const portfolioData = await getPortfolioByUsername(username);

  if (!portfolioData) {
    return {
      title: 'Portfolio Not Found',
    };
  }

  return {
    title: `${portfolioData.user.name}'s Portfolio | Portfoland`,
    description: `View ${portfolioData.user.name}'s professional portfolio on Portfoland.`,
  };
}
