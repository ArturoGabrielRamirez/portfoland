import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { getPortfolioByUsername } from '@/features/portfolio/data/getPortfolio.data';
import { PortfolioLayout } from '@/features/portfolio/components/PortfolioLayout';
import { JsonLd } from '@/features/portfolio/components/JsonLd';
import { generatePortfolioMetadata } from '@/features/portfolio/utils/seo';

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
    <>
      <JsonLd data={portfolioData} />
      <PortfolioLayout
        data={portfolioData}
        mode={portfolioData.user.portfolioMode}
      />
    </>
  );
}

/**
 * Generate metadata for SEO
 */
export async function generateMetadata({ params }: PortfolioPageProps) {
  const { username, locale } = await params;
  const portfolioData = await getPortfolioByUsername(username);

  if (!portfolioData) {
    return {
      title: 'Portfolio Not Found',
    };
  }

  const t = await getTranslations({ locale, namespace: 'Seo' }); // Assumes 'Seo' namespace is available

  return generatePortfolioMetadata(portfolioData, t, locale);
}
