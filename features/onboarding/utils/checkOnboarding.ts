import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { getLocale } from 'next-intl/server';

export async function checkOnboarding(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { onboardingCompleted: true },
  });
  if (user && !user.onboardingCompleted) {
    const locale = await getLocale();
    redirect(`/${locale}/onboarding`);
  }
}
