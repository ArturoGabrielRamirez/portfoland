'use server';

import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { actionWrapper } from '@/features/core';
import { completeOnboardingSchema } from '../schemas/onboarding.schema';
import { ONBOARDING_MESSAGES } from '../constants/messages';
import { TECH_DEFAULT_SECTIONS, CLASSIC_DEFAULT_SECTIONS } from '@/features/portfolio/constants/sections';

export async function completeOnboarding(input: Record<string, unknown>) {
  return actionWrapper(async () => {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      throw new Error(ONBOARDING_MESSAGES.LOGIN_REQUIRED);
    }

    const data = await completeOnboardingSchema.validate(input);

    const sections = data.mode === 'tech'
      ? [...TECH_DEFAULT_SECTIONS]
      : [...CLASSIC_DEFAULT_SECTIONS];
    const sectionVisibility = Object.fromEntries(sections.map(s => [s, true]));

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        portfolioMode: data.mode,
        sectionOrder: sections,
        sectionVisibility,
        onboardingCompleted: true,
      },
    });

    revalidatePath('/', 'layout');

    return {
      payload: updatedUser,
      message: ONBOARDING_MESSAGES.COMPLETED,
    };
  });
}
