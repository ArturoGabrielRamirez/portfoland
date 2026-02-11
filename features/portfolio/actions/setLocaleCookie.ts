'use server';

import { cookies } from 'next/headers';

export async function setLocaleCookie(locale: string) {
  const cookieStore = await cookies();
  const existing = cookieStore.get('NEXT_LOCALE');

  if (!existing) {
    cookieStore.set('NEXT_LOCALE', locale, { path: '/' });
  }
}
