/**
 * Reserved Subdomains
 *
 * Subdomains that cannot be used as usernames. Shared by both
 * the proxy (subdomain detection) and username validation schemas.
 */

export const RESERVED_SUBDOMAINS = [
  'www',
  'app',
  'api',
  'admin',
  'mail',
  'staging',
  'dev',
  'test',
  'beta',
  'status',
  'docs',
  'help',
  'support',
  'blog',
  'cdn',
  'static',
  'assets',
  'media',
] as const;

/** Checks whether a name matches a reserved subdomain (case-insensitive). */
export function isReservedSubdomain(name: string): boolean {
  return (RESERVED_SUBDOMAINS as readonly string[]).includes(
    name.toLowerCase()
  );
}
