/**
 * Username Route — Redirect to Subdomain
 *
 * This path (/[locale]/[username]) is kept only as a redirect.
 * All portfolio traffic is served via subdomains: username.portfoland.com
 */

import { redirect } from 'next/navigation';

interface UsernameRedirectProps {
  params: Promise<{ username: string }>;
}

export default async function UsernameRedirect({ params }: UsernameRedirectProps) {
  const { username } = await params;
  const domain = process.env.NEXT_PUBLIC_APP_DOMAIN || 'portfoland.com';
  redirect(`https://${username}.${domain}`);
}
