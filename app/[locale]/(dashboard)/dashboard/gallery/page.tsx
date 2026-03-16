import { redirect } from 'next/navigation';

export default async function DashboardGalleryPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  redirect(`/${locale}/dashboard/portfolio`);
}
