/**
 * Public Timeline Route — Redirect to Subdomain
 *
 * This path (/[locale]/timeline/[username]) is kept only as a redirect.
 * All timeline traffic is served via subdomains: username.portfoland.com/timeline
 */

import { redirect } from 'next/navigation';

interface TimelineRedirectProps {
  params: Promise<{ username: string }>;
}

export default async function TimelineRedirect({ params }: TimelineRedirectProps) {
  const { username } = await params;
  const domain = process.env.NEXT_PUBLIC_APP_DOMAIN || 'portfoland.com';
  redirect(`https://${username}.${domain}/timeline`);
}
