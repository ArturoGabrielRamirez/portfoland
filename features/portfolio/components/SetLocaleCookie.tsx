'use client';

import { useEffect } from 'react';
import { setLocaleCookie } from '../actions/setLocaleCookie';

interface SetLocaleCookieProps {
  locale: string;
}

export function SetLocaleCookie({ locale }: SetLocaleCookieProps) {
  useEffect(() => {
    setLocaleCookie(locale);
  }, [locale]);

  return null;
}
